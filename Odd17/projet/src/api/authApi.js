import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Traduction des erreurs Firebase en messages clairs
 */
function mapFirebaseError(err) {
  switch (err.code) {
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
      return "L'authentification Email/Password n'est pas encore activée dans la console Firebase (Authentication > Sign-in method).";
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
 * Inscription avec Firebase Auth + sauvegarde du profil dans Firestore
 */
export const registerApi = async (userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const firebaseUser = userCredential.user;

    // Mise à jour du nom complet dans Firebase Auth
    if (userData.name) {
      await updateProfile(firebaseUser, { displayName: userData.name });
    }

    const token = await firebaseUser.getIdToken();

    // Document de profil utilisateur stocké dans Firestore
    const userDocData = {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || 'volunteer', // 'volunteer' | 'association' | 'enterprise'
      organization_name: userData.organization_name || '',
      city: userData.city || '',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), userDocData);
    } catch (fsErr) {
      console.warn('Firestore setDoc user profile warning:', fsErr);
    }

    return {
      message: 'Compte créé avec succès !',
      token,
      user: userDocData,
    };
  } catch (err) {
    const msg = mapFirebaseError(err);
    const error = new Error(msg);
    error.response = { data: { message: msg } };
    throw error;
  }
};

/**
 * Connexion avec Firebase Auth + récupération du profil et du rôle depuis Firestore
 */
export const loginApi = async (credentials) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    const firebaseUser = userCredential.user;
    const token = await firebaseUser.getIdToken();

    // Récupérer le document utilisateur depuis Firestore pour avoir le rôle exact
    let userProfile = null;
    try {
      const userDocSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDocSnap.exists()) {
        userProfile = { id: firebaseUser.uid, ...userDocSnap.data() };
      }
    } catch (fsErr) {
      console.warn('Firestore getDoc warning:', fsErr);
    }

    // Profil de secours si le doc Firestore n'est pas encore créé
    if (!userProfile) {
      userProfile = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || credentials.email.split('@')[0],
        email: firebaseUser.email,
        role: 'volunteer',
        status: 'active',
      };
    }

    // Vérifier si le compte est suspendu
    if (userProfile.status === 'suspended') {
      await signOut(auth);
      const suspendedError = new Error("Votre compte est suspendu. Veuillez contacter l'administrateur.");
      suspendedError.response = { status: 403, data: { message: suspendedError.message } };
      throw suspendedError;
    }

    return {
      token,
      user: userProfile,
    };
  } catch (err) {
    if (err.response) throw err;
    const msg = mapFirebaseError(err);
    const error = new Error(msg);
    error.response = { status: 401, data: { message: msg } };
    throw error;
  }
};

/**
 * Déconnexion de Firebase Auth
 */
export const logoutApi = async () => {
  try {
    await signOut(auth);
    return { message: 'Déconnexion réussie.' };
  } catch (err) {
    console.error('Logout error:', err);
    return { message: 'Déconnexion effectuée.' };
  }
};

/**
 * Obtenir l'utilisateur connecté actuel
 */
export const getUserApi = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) return { user: JSON.parse(savedUser) };
    throw new Error('Utilisateur non connecté.');
  }

  try {
    const userDocSnap = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDocSnap.exists()) {
      return { user: { id: currentUser.uid, ...userDocSnap.data() } };
    }
  } catch (err) {
    console.warn('Error fetching user doc:', err);
  }

  return {
    user: {
      id: currentUser.uid,
      uid: currentUser.uid,
      name: currentUser.displayName || currentUser.email,
      email: currentUser.email,
      role: 'volunteer',
    },
  };
};

/**
 * Réinitialisation du mot de passe par e-mail
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
