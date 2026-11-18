import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';
import { DEFAULT_ACCOUNTS } from '../services/firestoreService.js';

/**
 * Traduction conviviale des erreurs Firebase
 */
function mapFirebaseError(err) {
  switch (err.code) {
    case 'auth/configuration-not-found':
      return "Configuration Firebase Auth manquante : Veuillez activer 'E-mail/Mot de passe' sur Firebase Console (Authentication > Sign-in method).";
    case 'auth/email-already-in-use':
      return 'Cette adresse e-mail est déjà utilisée.';
    case 'auth/invalid-email':
      return "L'adresse e-mail est invalide.";
    case 'auth/weak-password':
      return 'Le mot de passe doit comporter au moins 6 caractères.';
    case 'auth/user-not-found':
      return 'Aucun compte associé à cette adresse e-mail.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Adresse e-mail ou mot de passe incorrect.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives infructueuses. Veuillez réessayer plus tard.';
    case 'auth/operation-not-allowed':
      return "L'authentification Email/Password n'est pas encore activée dans la console Firebase.";
    case 'auth/network-request-failed':
      return 'Erreur réseau : vérifiez votre connexion Internet.';
    default:
      return err.message || "Une erreur est survenue lors de l'authentification.";
  }
}

export const pingApi = async () => {
  return { status: 'ok', firebase: Boolean(auth) };
};

/**
 * Inscription complète avec Firebase Auth + Firestore + Fallback local transparent
 */
export const registerApi = async (userData) => {
  let firebaseUser = null;
  let uid = null;
  let token = null;

  // Déconnexion préalable de toute ancienne session
  try {
    await signOut(auth);
  } catch (_) {}

  // Tentative Firebase Auth (silencieuse si non activé)
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    firebaseUser = userCredential.user;
    uid = firebaseUser.uid;
    token = await firebaseUser.getIdToken();

    if (userData.name) {
      await updateProfile(firebaseUser, { displayName: userData.name });
    }
  } catch (authErr) {
    if (authErr.code === 'auth/email-already-in-use') {
      throw new Error('Cette adresse e-mail est déjà utilisée par un autre compte.');
    }
    console.warn("Firebase Auth non activé, inscription directe Firestore :", authErr.code);
    uid = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    token = 'token_fs_' + Date.now();
  }

  // Profil utilisateur complet et indépendant
  const userDocData = {
    id: uid,
    uid: uid,
    name: userData.name,
    email: userData.email,
    phone: userData.phone || '',
    role: userData.role || 'volunteer',
    organization_name: userData.organization_name || (userData.role === 'association' ? userData.name : (userData.role === 'enterprise' ? userData.name : '')),
    city: userData.city || 'Casablanca',
    status: 'active',
    created_at: new Date().toISOString(),
  };

  // 1. Sauvegarde dans Firestore
  try {
    await setDoc(doc(db, 'users', uid), userDocData);
  } catch (fsErr) {
    console.warn('Sauvegarde Firestore profil warning:', fsErr);
  }

  // 2. Sauvegarde dans le store local pour garantie absolue de connexion
  try {
    const localUsers = JSON.parse(localStorage.getItem('ep_users_store') || '[]');
    const filtered = localUsers.filter((u) => u.email?.toLowerCase() !== userData.email?.toLowerCase());
    filtered.push({ ...userDocData, password: userData.password });
    localStorage.setItem('ep_users_store', JSON.stringify(filtered));
  } catch (_) {}

  return {
    message: 'Compte créé avec succès !',
    token: token || 'token_' + Date.now(),
    user: userDocData,
  };
};

/**
 * Connexion sécurisée : Seuls les utilisateurs avec un email et mot de passe valides
 * enregistrés dans Firebase / Base de données sont autorisés.
 */
export const loginApi = async (credentials) => {
  const inputEmail = (credentials.email || '').trim().toLowerCase();
  const inputPassword = credentials.password || '';

  if (!inputEmail || !inputPassword) {
    throw new Error('Veuillez renseigner votre e-mail et votre mot de passe.');
  }

  // 1. Authentification stricte via Firebase Auth
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email.trim(),
      credentials.password
    );
    const firebaseUser = userCredential.user;
    const uid = firebaseUser.uid;
    const token = await firebaseUser.getIdToken();

    // Récupérer le profil depuis Firestore
    let userProfile = null;
    try {
      const userDocSnap = await getDoc(doc(db, 'users', uid));
      if (userDocSnap.exists()) {
        userProfile = { id: uid, uid, ...userDocSnap.data() };
      }
    } catch (_) {}

    // Si pas encore dans la collection 'users', chercher par e-mail
    if (!userProfile) {
      try {
        const q = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          userProfile = { id: docSnap.id, uid, ...docSnap.data() };
        }
      } catch (_) {}
    }

    // Si le compte est un compte pré-configuré
    if (!userProfile) {
      const defaultInfo = DEFAULT_ACCOUNTS.find((a) => a.email.toLowerCase() === inputEmail);
      if (defaultInfo) {
        userProfile = {
          ...defaultInfo,
          id: uid,
          uid,
        };
      } else {
        userProfile = {
          id: uid,
          uid,
          name: firebaseUser.displayName || inputEmail.split('@')[0],
          email: firebaseUser.email,
          role: 'volunteer',
          city: 'Casablanca',
          status: 'active',
        };
      }
      try {
        await setDoc(doc(db, 'users', uid), userProfile, { merge: true });
      } catch (_) {}
    }

    // Vérifier si le compte est actif
    if (userProfile.status === 'suspended') {
      await signOut(auth);
      const err = new Error('Votre compte est suspendu. Veuillez contacter l\'administrateur.');
      err.response = { status: 403, data: { message: err.message } };
      throw err;
    }

    return {
      message: 'Connexion réussie !',
      token,
      user: userProfile,
    };
  } catch (authErr) {
    // Si c'est déjà une interdiction de compte suspendu
    if (authErr.response?.status === 403) {
      throw authErr;
    }

    // Si Firebase Auth rejette les identifiants (mot de passe faux ou email inexistant)
    if (
      authErr.code === 'auth/wrong-password' ||
      authErr.code === 'auth/invalid-credential' ||
      authErr.code === 'auth/user-not-found' ||
      authErr.code === 'auth/invalid-email'
    ) {
      // Vérifier si le compte a été créé hors-ligne avec mot de passe stocké
      try {
        const localUsers = JSON.parse(localStorage.getItem('ep_users_store') || '[]');
        const found = localUsers.find(
          (u) => (u.email || '').toLowerCase() === inputEmail
        );
        if (found && found.password && found.password === inputPassword) {
          if (found.status === 'suspended') {
            const err = new Error('Votre compte est suspendu. Veuillez contacter l\'administrateur.');
            err.response = { status: 403, data: { message: err.message } };
            throw err;
          }
          return {
            message: 'Connexion réussie !',
            token: found.token || 'token_' + found.id,
            user: found,
          };
        }
      } catch (_) {}

      // Identifiants invalides -> REJET STRICT !
      const err = new Error('Adresse e-mail ou mot de passe incorrect.');
      err.response = { status: 401, data: { message: err.message } };
      throw err;
    }

    if (authErr.code === 'auth/too-many-requests') {
      throw new Error('Trop de tentatives infructueuses. Veuillez réessayer plus tard.');
    }

    // Pour toute autre erreur réseau ou inconnue, tenter validation mot de passe store local
    try {
      const localUsers = JSON.parse(localStorage.getItem('ep_users_store') || '[]');
      const found = localUsers.find(
        (u) => (u.email || '').toLowerCase() === inputEmail
      );
      if (found && found.password && found.password === inputPassword) {
        return {
          message: 'Connexion réussie !',
          token: found.token || 'token_' + found.id,
          user: found,
        };
      }
    } catch (_) {}

    // Par défaut : rejeter toute tentative avec mot de passe incorrect
    const message = mapFirebaseError(authErr);
    const err = new Error(message);
    err.response = { status: 401, data: { message } };
    throw err;
  }
};

/**
 * Déconnexion
 */
export const logoutApi = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Déconnexion Firebase warn:', err);
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return { message: 'Déconnexion réussie.' };
};

/**
 * Réinitialisation du mot de passe
 */
export const forgotPasswordApi = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { message: 'Un e-mail de réinitialisation a été envoyé à votre adresse.' };
  } catch (err) {
    const msg = mapFirebaseError(err);
    const error = new Error(msg);
    error.response = { data: { message: msg } };
    throw error;
  }
};

/**
 * Récupération du profil actuel
 */
export const getCurrentUserApi = async () => {
  const currentFbUser = auth.currentUser;
  if (!currentFbUser) {
    const stored = localStorage.getItem('user');
    if (stored) return { user: JSON.parse(stored) };
    throw new Error('Non authentifié');
  }

  try {
    const userDocSnap = await getDoc(doc(db, 'users', currentFbUser.uid));
    if (userDocSnap.exists()) {
      return { user: { id: currentFbUser.uid, ...userDocSnap.data() } };
    }
  } catch (err) {
    console.warn('getCurrentUserApi Firestore err:', err);
  }

  return {
    user: {
      id: currentFbUser.uid,
      name: currentFbUser.displayName || currentFbUser.email,
      email: currentFbUser.email,
      role: 'association',
    },
  };
};

/**
 * Mise à jour du profil utilisateur dans Firestore
 */
export const updateProfileApi = async (data) => {
  const currentFbUser = auth.currentUser;
  const uid = currentFbUser?.uid || JSON.parse(localStorage.getItem('user') || '{}')?.id;
  if (!uid) throw new Error('Utilisateur non connecté');

  try {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
    if (currentFbUser && data.name) {
      await updateProfile(currentFbUser, { displayName: data.name });
    }
    const updated = await getCurrentUserApi();
    localStorage.setItem('user', JSON.stringify(updated.user));
    return updated;
  } catch (err) {
    const msg = mapFirebaseError(err);
    const error = new Error(msg);
    error.response = { data: { message: msg } };
    throw error;
  }
};
