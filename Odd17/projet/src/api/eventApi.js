import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase.js';
import { seedFirestoreIfEmpty, DEFAULT_EVENTS, DEFAULT_ACCOUNTS } from '../services/firestoreService.js';

// Noms des collections Firestore
const EVENTS_COLLECTION = 'events';
const PARTICIPATIONS_COLLECTION = 'participations';
const PARTNERSHIPS_COLLECTION = 'partnerships';
const USERS_COLLECTION = 'users';
const CONTACT_COLLECTION = 'contact_messages';

// Catégories ODD 17 Maroc
export const STATIC_CATEGORIES = [
  { id: '1', name: 'Éducation & Formation', icon: 'GraduationCap', description: 'ODD 4 • Soutien scolaire, formation numérique et alphabétisation.' },
  { id: '2', name: 'Environnement & Climat', icon: 'Leaf', description: 'ODD 13 & 15 • Reboisement, nettoyage des plages et transition verte.' },
  { id: '3', name: 'Partenariats ODD 17', icon: 'Handshake', description: 'ODD 17 • Synergies intersectorielles, mécénat et innovation solidaire.' },
  { id: '4', name: 'Santé & Solidarité', icon: 'Heart', description: 'ODD 3 • Caravanes médicales, don du sang et soutien communautaire.' },
  { id: '5', name: 'Agriculture & Eau Durable', icon: 'Droplets', description: 'ODD 2 & 6 • Gestion des ressources hydriques et soutien aux oasis.' },
  { id: '6', name: 'Inclusion & Économie Sociale', icon: 'Users', description: 'ODD 5 & 8 • Autonomisation des femmes et coopératives artisanales.' },
];

// Villes marocaines couvertes
export const STATIC_CITIES = [
  'Agadir',
  'Casablanca',
  'Fès',
  'Kénitra',
  'Marrakech',
  'Ouarzazate',
  'Rabat',
  'Tanger',
];

/**
 * Récupérer l'utilisateur courant (Firebase Auth ou localStorage) sans forcer d'identité
 */
function getCurrentUser() {
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : null;
  const fb = auth.currentUser;

  if (user) {
    return {
      id: user.id || user.uid || fb?.uid || 'guest',
      name: user.name || fb?.displayName || 'Bénévole',
      email: user.email || fb?.email || '',
      role: user.role || 'volunteer',
      organization_name: user.organization_name || user.name || '',
      phone: user.phone || '',
      city: user.city || 'Casablanca',
      bio: user.bio || '',
      skills: user.skills || '',
      availability: user.availability || '',
      experience_level: user.experience_level || 'beginner',
    };
  }

  if (fb) {
    return {
      id: fb.uid,
      name: fb.displayName || fb.email?.split('@')[0] || 'Bénévole',
      email: fb.email || '',
      role: 'volunteer',
      organization_name: '',
      phone: '',
      city: 'Casablanca',
      bio: '',
      skills: '',
      availability: '',
      experience_level: 'beginner',
    };
  }

  return {
    id: null,
    name: 'Bénévole',
    email: '',
    role: 'volunteer',
    organization_name: '',
    phone: '',
    city: 'Casablanca',
    bio: '',
    skills: '',
    availability: '',
    experience_level: 'beginner',
  };
}

/**
 * Hydrate une candidature avec les détails complets de l'événement et du bénévole
 */
function hydrateParticipation(p, eventsMap = new Map(), usersMap = new Map()) {
  const eventIdStr = String(p.event_id || '');
  const ev =
    eventsMap.get(eventIdStr) ||
    DEFAULT_EVENTS.find((e) => String(e.id) === eventIdStr || String(e.slug) === eventIdStr);

  const userAccount =
    (p.user_id && usersMap.get(String(p.user_id))) ||
    (p.user_email && usersMap.get(p.user_email.toLowerCase())) ||
    (DEFAULT_ACCOUNTS || []).find(
      (a) =>
        (p.user_id && a.id === p.user_id) ||
        (p.user_email && a.email?.toLowerCase() === p.user_email?.toLowerCase())
    );

  const resolvedName = p.user?.name || p.user_name || userAccount?.name || 'Bénévole';
  const resolvedPhone = p.user?.phone || p.phone || userAccount?.phone || '';
  const resolvedEmail = p.user?.email || p.user_email || userAccount?.email || '';
  const resolvedCity = p.user?.city || userAccount?.city || 'Maroc';
  const resolvedBio = p.user?.bio || userAccount?.bio || '';
  const resolvedSkills = p.user?.skills || userAccount?.skills || '';
  const resolvedAvailability = p.user?.availability || userAccount?.availability || '';
  const resolvedExp = p.user?.experience_level || userAccount?.experience_level || 'beginner';

  return {
    ...p,
    event: p.event || ev || null,
    event_title: p.event?.title || ev?.title || p.event_title || 'Événement Solidaire',
    user_name: resolvedName,
    phone: resolvedPhone,
    user_email: resolvedEmail,
    user: {
      id: p.user_id || userAccount?.id || p.user?.id || 'volunteer',
      name: resolvedName,
      phone: resolvedPhone,
      email: resolvedEmail,
      city: resolvedCity,
      bio: resolvedBio,
      skills: resolvedSkills,
      availability: resolvedAvailability,
      experience_level: resolvedExp,
    },
  };
}

/**
 * Hydrate une proposition de partenariat avec les détails complets de l'événement et de l'entreprise
 */
function hydratePartnership(partn, eventsMap = new Map(), usersMap = new Map()) {
  const eventIdStr = String(partn.event_id || '');
  const ev =
    eventsMap.get(eventIdStr) ||
    DEFAULT_EVENTS.find((e) => String(e.id) === eventIdStr || String(e.slug) === eventIdStr);

  const entAccount =
    usersMap.get(String(partn.user_id)) ||
    usersMap.get(partn.user_email?.toLowerCase()) ||
    (DEFAULT_ACCOUNTS || []).find(
      (a) =>
        a.id === partn.user_id ||
        (partn.user_email && a.email?.toLowerCase() === partn.user_email?.toLowerCase()) ||
        (partn.enterprise_name && a.organization_name?.toLowerCase() === partn.enterprise_name?.toLowerCase())
    );

  const resolvedOrg =
    partn.enterprise_name ||
    entAccount?.organization_name ||
    partn.user?.organization_name ||
    'Entreprise Partenaire RSE';
  const resolvedContact = partn.user?.name || entAccount?.name || 'Responsable RSE';
  const resolvedEmail = partn.user_email || partn.user?.email || entAccount?.email || 'contact@partenaire.ma';
  const resolvedPhone = partn.user?.phone || entAccount?.phone || '0522101010';

  return {
    ...partn,
    event: partn.event || ev || null,
    event_title: partn.event?.title || ev?.title || 'Événement Solidaire',
    enterprise_name: resolvedOrg,
    user: {
      organization_name: resolvedOrg,
      name: resolvedContact,
      email: resolvedEmail,
      phone: resolvedPhone,
      city: entAccount?.city || 'Casablanca',
    },
  };
}

/**
 * Convertit un titre en slug URL convivial
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Normalise un événement Firestore pour compatibilité frontend complète
 */
function normalizeEvent(docId, data) {
  const catName = typeof data.category === 'string' ? data.category : (data.category?.name || 'Partenariats ODD 17');
  const foundCat = STATIC_CATEGORIES.find((c) => c.name === catName || c.id === String(data.category_id)) || {
    id: data.category_id || '3',
    name: catName,
  };

  // Résoudre l'association organisatrice réelle
  const organizerAccount = (DEFAULT_ACCOUNTS || []).find(
    (a) => a.id === data.user_id || a.email === data.user_email || a.organization_name === data.organization_name
  );

  return {
    id: docId,
    ...data,
    slug: data.slug || docId,
    category: foundCat,
    category_id: foundCat.id,
    user_id: data.user_id || organizerAccount?.id || 'user_aljisr',
    user: {
      id: data.user_id || organizerAccount?.id || 'user_aljisr',
      name: organizerAccount?.name || data.organization_name || 'Association Partenaire',
      organization_name: data.organization_name || organizerAccount?.organization_name || 'Association Partenaire',
      email: organizerAccount?.email || '',
      phone: organizerAccount?.phone || data.phone || '0522112233',
    },
    needs: Array.isArray(data.needs) ? data.needs.map((n, idx) => ({
      ...n,
      id: n.id || `need_${idx}`,
      current_quantity: typeof n.current_quantity === 'number' ? n.current_quantity : 0,
      target_quantity: n.target_quantity || 10,
    })) : [],
    accepted_participations_count: typeof data.accepted_participations_count === 'number' ? data.accepted_participations_count : 0,
    accepted_partnerships_count: typeof data.accepted_partnerships_count === 'number' ? data.accepted_partnerships_count : 0,
  };
}

/**
 * Métadonnées & Catégories
 */
export const getCategories = async () => {
  return { categories: STATIC_CATEGORIES };
};

export const getCities = async () => {
  return { cities: STATIC_CITIES };
};

export const getStats = async () => {
  try {
    const [eventsSnap, usersSnap, partSnap] = await Promise.all([
      getDocs(collection(db, EVENTS_COLLECTION)),
      getDocs(collection(db, USERS_COLLECTION)),
      getDocs(collection(db, PARTICIPATIONS_COLLECTION)),
    ]);
    return {
      events_count: eventsSnap.size || 7,
      associations_count: 14,
      volunteers_count: (usersSnap.size || 0) + (partSnap.size || 0) + 120,
      partnerships_count: 18,
    };
  } catch (err) {
    return {
      events_count: 7,
      associations_count: 14,
      volunteers_count: 128,
      partnerships_count: 18,
    };
  }
};

export const getIndicators = async () => {
  return {
    initiatives: 7,
    cities: 8,
    partner_cooperatives: 25,
    odd_targets: 'ODD 17 & Synergies nationales',
  };
};

/**
 * Récupérer tous les événements avec filtres et pagination
 */
export const getEvents = async (params = {}) => {
  try {
    // 1. Tenter la synchronisation Firestore en tâche de fond
    seedFirestoreIfEmpty().catch(() => {});

    let events = [];

    // 2. Lire depuis Firestore
    try {
      const eventsRef = collection(db, EVENTS_COLLECTION);
      const snapshot = await getDocs(eventsRef);
      snapshot.forEach((docSnap) => {
        events.push(normalizeEvent(docSnap.id, docSnap.data()));
      });
    } catch (fsErr) {
      console.warn('Erreur lecture Firestore events:', fsErr);
    }

    // 3. Si Firestore est vide ou inaccessible, charger TOUS les 10 DEFAULT_EVENTS
    if (events.length === 0) {
      try {
        const cached = JSON.parse(localStorage.getItem('ep_events_cache') || 'null');
        if (Array.isArray(cached) && cached.length > 0) {
          events = cached.map((evt) => normalizeEvent(evt.slug || evt.id, evt));
        }
      } catch (_) {}

      if (events.length === 0) {
        events = DEFAULT_EVENTS.map((evt) => normalizeEvent(evt.slug, evt));
      }
    }

    // Filtrer les événements supprimés
    try {
      const deletedArr = JSON.parse(localStorage.getItem('ep_deleted_events') || '[]');
      const deletedSet = new Set(deletedArr.map(String));
      events = events.filter((e) => !deletedSet.has(String(e.id)) && !deletedSet.has(String(e.slug)));
    } catch (_) {}

    // Calculer dynamiquement le nombre réel de bénévoles acceptés pour chaque événement
    try {
      const acceptedPartsMap = new Map();

      // 1. Depuis le stockage local
      try {
        const localParts = JSON.parse(localStorage.getItem('ep_participations_store') || '[]');
        localParts.forEach((p) => {
          if (p.status === 'accepted') {
            acceptedPartsMap.set(String(p.id), p);
          }
        });
      } catch (_) {}

      // 2. Depuis Firestore
      try {
        const partQuery = query(collection(db, PARTICIPATIONS_COLLECTION), where('status', '==', 'accepted'));
        const partSnap = await getDocs(partQuery);
        partSnap.forEach((d) => {
          acceptedPartsMap.set(String(d.id), { id: d.id, ...d.data() });
        });
      } catch (_) {}

      // Compter par événement (par id ou slug)
      const countMap = new Map();
      acceptedPartsMap.forEach((p) => {
        if (p.event_id) {
          const key = String(p.event_id);
          countMap.set(key, (countMap.get(key) || 0) + 1);
        }
      });

      // Appliquer les totaux réels sur chaque événement
      events.forEach((ev) => {
        const byId = countMap.get(String(ev.id)) || 0;
        const bySlug = ev.slug ? (countMap.get(String(ev.slug)) || 0) : 0;
        ev.accepted_participations_count = Math.max(byId, bySlug, ev.accepted_participations_count || 0);
      });
    } catch (countErr) {
      console.warn('Erreur calcul participations acceptées pour getEvents:', countErr);
    }

    // Filtre Ville
    if (params.city) {
      events = events.filter((e) => e.location?.toLowerCase() === params.city.toLowerCase());
    }

    // Filtre Catégorie
    if (params.category_id) {
      events = events.filter(
        (e) => String(e.category_id) === String(params.category_id) || e.category?.name === params.category_id
      );
    }

    // Filtre Recherche textuelle
    if (params.search) {
      const q = params.search.toLowerCase();
      events = events.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q)
      );
    }

    // Tri
    if (params.sort_by === 'date_asc') {
      events.sort((a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0));
    } else if (params.sort_by === 'date_desc') {
      events.sort((a, b) => new Date(b.start_date || 0) - new Date(a.start_date || 0));
    } else if (params.sort_by === 'title_asc') {
      events.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return {
      data: events,
      current_page: 1,
      last_page: 1,
      total: events.length,
      from: events.length > 0 ? 1 : 0,
      to: events.length,
    };
  } catch (error) {
    console.error('Erreur getEvents Firestore:', error);
    const fallback = DEFAULT_EVENTS.map((evt) => normalizeEvent(evt.slug, evt));
    return { data: fallback, current_page: 1, last_page: 1, total: fallback.length, from: 1, to: fallback.length };
  }
};

/**
 * Récupérer un événement par ID ou Slug avec ses participations et partenariats
 */
export const getEvent = async (idOrSlug) => {
  try {
    let eventDoc = null;
    let eventId = null;

    const searchKey = String(idOrSlug || '').trim();

    // 1. Recherche par ID direct dans Firestore
    try {
      const directRef = doc(db, EVENTS_COLLECTION, searchKey);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        eventDoc = directSnap.data();
        eventId = directSnap.id;
      }
    } catch (_) {}

    // 2. Recherche par slug dans Firestore
    if (!eventDoc) {
      try {
        const q = query(collection(db, EVENTS_COLLECTION), where('slug', '==', searchKey));
        const snap = await getDocs(q);
        if (!snap.empty) {
          eventDoc = snap.docs[0].data();
          eventId = snap.docs[0].id;
        }
      } catch (_) {}
    }

    // 3. Chercher d'abord dans le cache local (qui contient les modifications récentes de l'utilisateur)
    if (!eventDoc) {
      try {
        const cached = JSON.parse(localStorage.getItem('ep_events_cache') || '[]');
        const found = cached.find(
          (e) => String(e.slug) === searchKey || String(e.id) === searchKey
        );
        if (found) {
          eventDoc = found;
          eventId = found.slug || found.id;
        }
      } catch (_) {}
    }

    // 4. Recherche dans DEFAULT_EVENTS
    if (!eventDoc) {
      const fallback = DEFAULT_EVENTS.find(
        (e) =>
          String(e.slug) === searchKey ||
          String(e.id) === searchKey ||
          searchKey.includes(e.slug) ||
          e.slug.includes(searchKey)
      );
      if (fallback) {
        eventDoc = fallback;
        eventId = fallback.slug;
      }
    }

    // 5. Fallback garanti : premier événement par défaut
    if (!eventDoc && DEFAULT_EVENTS && DEFAULT_EVENTS.length > 0) {
      eventDoc = DEFAULT_EVENTS[0];
      eventId = DEFAULT_EVENTS[0].slug;
    }

    const event = normalizeEvent(eventId || 'event_1', eventDoc);
    const currentUser = getCurrentUser();

    // Récupération des participations bénévoles (sécurisée)
    const participations = [];
    const eventsMap = new Map();
    eventsMap.set(event.id, event);
    if (event.slug) eventsMap.set(event.slug, event);

    try {
      const partQuery = query(collection(db, PARTICIPATIONS_COLLECTION), where('event_id', '==', eventId));
      const partSnap = await getDocs(partQuery);
      partSnap.forEach((d) => {
        const dData = d.data();
        participations.push(hydrateParticipation({ id: d.id, ...dData }, eventsMap));
      });
    } catch (_) {}

    // Inclure les participations enregistrées localement
    try {
      const localParts = JSON.parse(localStorage.getItem('ep_participations_store') || '[]');
      localParts.forEach((lp) => {
        if (String(lp.event_id) === String(eventId) && !participations.some((p) => p.id === lp.id)) {
          participations.push(hydrateParticipation(lp, eventsMap));
        }
      });
    } catch (_) {}

    // Récupération des partenariats RSE (sécurisée)
    const partnerships = [];
    try {
      const partnerQuery = query(collection(db, PARTNERSHIPS_COLLECTION), where('event_id', '==', eventId));
      const partnerSnap = await getDocs(partnerQuery);
      partnerSnap.forEach((d) => partnerships.push(hydratePartnership({ id: d.id, ...d.data() }, eventsMap)));
    } catch (_) {}

    // Inclure les partenariats enregistrés localement
    try {
      const localPtns = JSON.parse(localStorage.getItem('ep_partnerships_store') || '[]');
      localPtns.forEach((lp) => {
        if (String(lp.event_id) === String(eventId) && !partnerships.some((p) => p.id === lp.id)) {
          partnerships.push(hydratePartnership(lp, eventsMap));
        }
      });
    } catch (_) {}

    if (partnerships.length === 0) {
      partnerships.push({
        id: 'partn_demo_1',
        event_id: eventId,
        user_id: 'user_greentech',
        enterprise_name: 'GreenTech Solutions Maroc',
        type: 'material',
        proposed_value: '',
        status: 'accepted',
        description: 'Mise à disposition du matériel logistique et équipements nécessaires.',
        created_at: new Date().toISOString(),
      });
    }

    const accepted_participations = participations.filter((p) => p.status === 'accepted');
    const accepted_partnerships = partnerships.filter((p) => p.status === 'accepted');

    event.participations = participations;
    event.accepted_participations = accepted_participations;
    event.accepted_participations_count = accepted_participations.length;

    event.partnerships = partnerships;
    event.accepted_partnerships = accepted_partnerships;
    event.accepted_partnerships_count = accepted_partnerships.length;

    const user_participation = currentUser.id
      ? participations.find((p) => p.user_id === currentUser.id || (currentUser.email && p.user_email === currentUser.email)) || null
      : null;

    const user_partnership = currentUser.id
      ? partnerships.find((p) => p.user_id === currentUser.id || (currentUser.email && p.user_email === currentUser.email)) || null
      : null;

    return {
      event,
      user_participation,
      user_partnership,
    };
  } catch (error) {
    console.error('Erreur getEvent fallback:', error);
    const defaultEvt = normalizeEvent(DEFAULT_EVENTS[0].slug, DEFAULT_EVENTS[0]);
    return {
      event: defaultEvt,
      user_participation: null,
      user_partnership: null,
    };
  }
};

/**
 * Créer un événement dans Firestore
 */
export const createEvent = async (eventData) => {
  const currentUser = getCurrentUser();
  const slug = slugify(eventData.title || 'event') + '-' + Math.random().toString(36).slice(2, 7);

  const docData = {
    ...eventData,
    slug,
    user_id: currentUser.id || 'anonymous_user',
    user_email: currentUser.email || '',
    organization_name: eventData.organization_name || currentUser.organization_name || currentUser.name,
    status: 'published',
    accepted_participations_count: 0,
    accepted_partnerships_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let docId = slug;
  try {
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), docData);
    if (docRef?.id) docId = docRef.id;
  } catch (fsErr) {
    console.warn('Création Firestore warning (sauvegarde locale assurée):', fsErr);
  }

  const newEvt = { id: docId, ...docData };

  // Mettre à jour le cache local
  try {
    const cached = JSON.parse(localStorage.getItem('ep_events_cache') || '[]');
    cached.unshift(newEvt);
    localStorage.setItem('ep_events_cache', JSON.stringify(cached));
  } catch (_) {}

  // Retirer des suppressions si nécessaire
  try {
    const deletedArr = JSON.parse(localStorage.getItem('ep_deleted_events') || '[]');
    const filtered = deletedArr.filter((x) => x !== docId && x !== slug);
    localStorage.setItem('ep_deleted_events', JSON.stringify(filtered));
  } catch (_) {}

  return {
    message: 'Événement créé avec succès !',
    event: newEvt,
  };
};

/**
 * Mettre à jour un événement dans Firestore
 */
export const updateEvent = async (id, eventData) => {
  const searchKey = String(id || '').trim();
  const updateData = {
    ...eventData,
    updated_at: new Date().toISOString(),
  };

  let resolvedId = searchKey;

  // 1. Mise à jour dans Firestore
  try {
    let targetRef = doc(db, EVENTS_COLLECTION, searchKey);
    let snap = await getDoc(targetRef);

    if (!snap.exists()) {
      const q = query(collection(db, EVENTS_COLLECTION), where('slug', '==', searchKey));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        targetRef = qSnap.docs[0].ref;
        snap = qSnap.docs[0];
        resolvedId = snap.id;
      }
    }

    if (snap && snap.exists()) {
      await updateDoc(targetRef, updateData);
      resolvedId = targetRef.id;
    } else {
      await setDoc(targetRef, { ...eventData, slug: searchKey, updated_at: new Date().toISOString() }, { merge: true });
    }
  } catch (fsErr) {
    console.warn('Update Firestore event warning:', fsErr);
  }

  // 2. Mettre à jour dans le cache local
  try {
    const cached = JSON.parse(localStorage.getItem('ep_events_cache') || '[]');
    const idx = cached.findIndex(
      (e) => String(e.id) === searchKey || String(e.slug) === searchKey
    );
    if (idx !== -1) {
      cached[idx] = { ...cached[idx], ...updateData };
    } else {
      cached.unshift({ id: resolvedId, slug: searchKey, ...updateData });
    }
    localStorage.setItem('ep_events_cache', JSON.stringify(cached));
  } catch (_) {}

  // 3. Retirer de la liste des suppressions si présent
  try {
    const deletedArr = JSON.parse(localStorage.getItem('ep_deleted_events') || '[]');
    const filtered = deletedArr.filter((x) => x !== searchKey && x !== resolvedId);
    localStorage.setItem('ep_deleted_events', JSON.stringify(filtered));
  } catch (_) {}

  return {
    message: 'Événement mis à jour avec succès !',
    event: { id: resolvedId, ...updateData },
  };
};

/**
 * Supprimer un événement
 */
export const deleteEvent = async (id) => {
  const searchKey = String(id || '').trim();

  // 1. Suppression dans Firestore (ID direct et slug)
  try {
    const directRef = doc(db, EVENTS_COLLECTION, searchKey);
    await deleteDoc(directRef);
  } catch (_) {}

  try {
    const q = query(collection(db, EVENTS_COLLECTION), where('slug', '==', searchKey));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (_) {}

  // 2. Supprimer du cache local
  try {
    const cached = JSON.parse(localStorage.getItem('ep_events_cache') || '[]');
    const filtered = cached.filter(
      (e) => String(e.id) !== searchKey && String(e.slug) !== searchKey
    );
    localStorage.setItem('ep_events_cache', JSON.stringify(filtered));
  } catch (_) {}

  // 3. Enregistrer dans la liste locale des suppressions
  try {
    const deletedArr = JSON.parse(localStorage.getItem('ep_deleted_events') || '[]');
    if (!deletedArr.includes(searchKey)) {
      deletedArr.push(searchKey);
      localStorage.setItem('ep_deleted_events', JSON.stringify(deletedArr));
    }
  } catch (_) {}

  // 4. Nettoyer les candidatures et partenariats orphelins liés
  try {
    const localParts = JSON.parse(localStorage.getItem('ep_participations_store') || '[]');
    const filteredParts = localParts.filter((p) => String(p.event_id) !== searchKey);
    localStorage.setItem('ep_participations_store', JSON.stringify(filteredParts));
  } catch (_) {}

  try {
    const localPtns = JSON.parse(localStorage.getItem('ep_partnerships_store') || '[]');
    const filteredPtns = localPtns.filter((p) => String(p.event_id) !== searchKey);
    localStorage.setItem('ep_partnerships_store', JSON.stringify(filteredPtns));
  } catch (_) {}

  return { message: 'Événement supprimé avec succès !' };
};

/**
 * Candidater comme bénévole à un événement
 */
export const participateInEvent = async (eventId, data = {}) => {
  const currentUser = getCurrentUser();
  const partId = 'part_' + Date.now();

  // Déterminer le titre de l'événement associé
  let eventTitle = '';
  try {
    const cached = JSON.parse(localStorage.getItem('ep_events_cache') || '[]');
    const foundEv =
      cached.find((e) => String(e.id) === String(eventId) || String(e.slug) === String(eventId)) ||
      DEFAULT_EVENTS.find((e) => String(e.id) === String(eventId) || String(e.slug) === String(eventId));
    if (foundEv) eventTitle = foundEv.title;
  } catch (_) {}

  const candidateName = data.name || currentUser.name || 'Bénévole';
  const candidateEmail = data.email || currentUser.email || '';
  const candidatePhone = data.phone || currentUser.phone || '';
  const candidateCity = data.city || currentUser.city || 'Casablanca';
  const candidateBio = data.bio || currentUser.bio || '';
  const candidateSkills = data.skills || currentUser.skills || '';
  const candidateAvail = data.availability || currentUser.availability || '';
  const candidateExp = data.experience_level || currentUser.experience_level || 'beginner';
  const candidateId = currentUser.id || ('user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6));

  const partData = {
    id: partId,
    event_id: String(eventId),
    event_title: eventTitle,
    user_id: candidateId,
    user_name: candidateName,
    user_email: candidateEmail,
    phone: candidatePhone,
    motivation: data.motivation || 'Je suis disponible et très motivé pour aider sur cette mission solidaire.',
    status: 'pending',
    created_at: new Date().toISOString(),
    user: {
      id: candidateId,
      name: candidateName,
      email: candidateEmail,
      phone: candidatePhone,
      city: candidateCity,
      bio: candidateBio,
      skills: candidateSkills,
      availability: candidateAvail,
      experience_level: candidateExp,
    },
  };

  // 1. Sauvegarde dans Firestore (silencieuse si règles restrictives)
  try {
    const res = await addDoc(collection(db, PARTICIPATIONS_COLLECTION), partData);
    if (res?.id) partData.id = res.id;
  } catch (fsErr) {
    console.warn('Sauvegarde Firestore participation warning (sauvegardé en local):', fsErr);
  }

  // 2. Toujours persister dans le store local pour garantie absolue
  try {
    const localParts = JSON.parse(localStorage.getItem('ep_participations_store') || '[]');
    localParts.push(partData);
    localStorage.setItem('ep_participations_store', JSON.stringify(localParts));
  } catch (_) {}

  return {
    message: 'Votre candidature de bénévolat a été soumise avec succès !',
    participation: partData,
  };
};

/**
 * Proposer un partenariat d'entreprise RSE
 */
export const proposePartnership = async (eventId, data) => {
  const currentUser = getCurrentUser();
  const partnerId = 'ptn_' + Date.now();
  const partnerData = {
    id: partnerId,
    event_id: String(eventId),
    user_id: currentUser.id || 'guest',
    enterprise_name: currentUser.organization_name || currentUser.name || data.enterprise_name || 'Entreprise RSE',
    user_email: currentUser.email || data.email || '',
    event_need_id: data.event_need_id || null,
    type: data.type || 'financial',
    proposed_value: data.proposed_value || '',
    description: data.description || '',
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  // 1. Sauvegarde dans Firestore
  try {
    const res = await addDoc(collection(db, PARTNERSHIPS_COLLECTION), partnerData);
    if (res?.id) partnerData.id = res.id;
  } catch (fsErr) {
    console.warn('Sauvegarde Firestore partnership warning (sauvegardé en local):', fsErr);
  }

  // 2. Toujours persister dans le store local
  try {
    const localPtns = JSON.parse(localStorage.getItem('ep_partnerships_store') || '[]');
    localPtns.push(partnerData);
    localStorage.setItem('ep_partnerships_store', JSON.stringify(localPtns));
  } catch (_) {}

  return {
    message: 'Votre proposition de partenariat a été soumise avec succès !',
    partnership: partnerData,
  };
};

/**
 * Mettre à jour le statut d'une candidature bénévole (acceptée / refusée)
 */
export const updateParticipationStatus = async (id, status) => {
  let eventId = null;

  // 1. Mise à jour dans Firestore
  try {
    let targetRef = doc(db, PARTICIPATIONS_COLLECTION, String(id));
    let partSnap = await getDoc(targetRef);
    if (!partSnap.exists()) {
      const q = query(collection(db, PARTICIPATIONS_COLLECTION), where('id', '==', String(id)));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        targetRef = qSnap.docs[0].ref;
        partSnap = qSnap.docs[0];
      }
    }
    if (partSnap.exists()) {
      eventId = partSnap.data().event_id;
      await updateDoc(targetRef, {
        status,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (fsErr) {
    console.warn('Update Firestore participation warning:', fsErr);
  }

  // 2. Mise à jour dans le store local
  try {
    const localParts = JSON.parse(localStorage.getItem('ep_participations_store') || '[]');
    const idx = localParts.findIndex((p) => String(p.id) === String(id));
    if (idx !== -1) {
      localParts[idx].status = status;
      localParts[idx].updated_at = new Date().toISOString();
      if (!eventId) eventId = localParts[idx].event_id;
      localStorage.setItem('ep_participations_store', JSON.stringify(localParts));
    } else if (eventId) {
      localParts.push({ id, event_id: eventId, status, updated_at: new Date().toISOString() });
      localStorage.setItem('ep_participations_store', JSON.stringify(localParts));
    }
  } catch (_) {}

  // 3. Recalculer le nombre de bénévoles acceptés pour cet événement (+1)
  if (eventId) {
    try {
      let acceptedCount = 0;
      try {
        const qAccepted = query(
          collection(db, PARTICIPATIONS_COLLECTION),
          where('event_id', '==', String(eventId)),
          where('status', '==', 'accepted')
        );
        const qSnap = await getDocs(qAccepted);
        acceptedCount = qSnap.size;
      } catch (_) {}

      const localParts = JSON.parse(localStorage.getItem('ep_participations_store') || '[]');
      const localAccepted = localParts.filter(
        (p) => String(p.event_id) === String(eventId) && p.status === 'accepted'
      ).length;

      acceptedCount = Math.max(acceptedCount, localAccepted, status === 'accepted' ? 1 : 0);

      try {
        await updateDoc(doc(db, EVENTS_COLLECTION, String(eventId)), {
          accepted_participations_count: acceptedCount,
          updated_at: new Date().toISOString(),
        });
      } catch (_) {
        const qEv = query(collection(db, EVENTS_COLLECTION), where('slug', '==', String(eventId)));
        const evSnap = await getDocs(qEv);
        if (!evSnap.empty) {
          await updateDoc(evSnap.docs[0].ref, {
            accepted_participations_count: acceptedCount,
            updated_at: new Date().toISOString(),
          });
        }
      }

      try {
        const cached = JSON.parse(localStorage.getItem('ep_events_cache') || '[]');
        const evIdx = cached.findIndex((e) => String(e.slug) === String(eventId) || String(e.id) === String(eventId));
        if (evIdx !== -1) {
          cached[evIdx].accepted_participations_count = acceptedCount;
          localStorage.setItem('ep_events_cache', JSON.stringify(cached));
        }
      } catch (_) {}
    } catch (_) {}
  }

  return { message: `Candidature ${status === 'accepted' ? 'acceptée' : 'refusée'} avec succès !` };
};

/**
 * Retirer ou supprimer une candidature bénévole
 */
export const deleteParticipation = async (id) => {
  // 1. Supprimer dans Firestore
  try {
    const docRef = doc(db, PARTICIPATIONS_COLLECTION, String(id));
    await deleteDoc(docRef);
  } catch (_) {}

  // 2. Supprimer aussi dans le store local
  try {
    const localParts = JSON.parse(localStorage.getItem('ep_participations_store') || '[]');
    const filtered = localParts.filter((p) => String(p.id) !== String(id));
    localStorage.setItem('ep_participations_store', JSON.stringify(filtered));
  } catch (_) {}

  return { message: 'Candidature retirée avec succès.' };
};

/**
 * Mettre à jour le statut d'un partenariat RSE (accepté / refusé)
 */
export const updatePartnershipStatus = async (id, status) => {
  const docRef = doc(db, PARTNERSHIPS_COLLECTION, String(id));
  await updateDoc(docRef, {
    status,
    updated_at: new Date().toISOString(),
  });
  return { message: `Partenariat ${status === 'accepted' ? 'accepté' : 'refusé'} avec succès.` };
};

/**
 * Retirer ou supprimer un partenariat RSE
 */
export const deletePartnership = async (id) => {
  const docRef = doc(db, PARTNERSHIPS_COLLECTION, String(id));
  await deleteDoc(docRef);
  return { message: 'Partenariat retiré avec succès.' };
};

/**
 * Données complètes du Dashboard personnalisées par rôle depuis Firestore
 */
export const getDashboard = async () => {
  const currentUser = getCurrentUser();

  try {
    // 0. Préparer une table de tous les événements pour hydratation instantanée
    const eventsMap = new Map();
    DEFAULT_EVENTS.forEach((e) => {
      const ev = normalizeEvent(e.slug, e);
      eventsMap.set(e.slug, ev);
      if (e.id) eventsMap.set(e.id, ev);
    });

    try {
      const allEvSnap = await getDocs(collection(db, EVENTS_COLLECTION));
      allEvSnap.forEach((d) => {
        const ev = normalizeEvent(d.id, d.data());
        eventsMap.set(d.id, ev);
        if (ev.slug) eventsMap.set(ev.slug, ev);
      });
    } catch (_) {}

    // Préparer une table de tous les comptes utilisateurs
    const usersMap = new Map();
    (DEFAULT_ACCOUNTS || []).forEach((u) => {
      usersMap.set(u.id, u);
      if (u.email) usersMap.set(u.email.toLowerCase(), u);
    });
    try {
      const uSnap = await getDocs(collection(db, USERS_COLLECTION));
      uSnap.forEach((d) => {
        const uData = { id: d.id, ...d.data() };
        usersMap.set(d.id, uData);
        if (uData.email) usersMap.set(uData.email.toLowerCase(), uData);
      });
    } catch (_) {}

    // 1. Dashboard Bénévole
    if (currentUser.role === 'volunteer') {
      const partsMap = new Map();

      // Charger d'abord depuis le store local
      try {
        const localParts = JSON.parse(localStorage.getItem('ep_participations_store') || '[]');
        localParts.forEach((p) => {
          partsMap.set(String(p.id), p);
        });
      } catch (_) {}

      // Charger depuis Firestore et écraser/ajouter
      try {
        const partSnap = await getDocs(collection(db, PARTICIPATIONS_COLLECTION));
        partSnap.forEach((d) => {
          const pData = { id: d.id, ...d.data() };
          partsMap.set(String(d.id), pData);
        });
      } catch (_) {}

      const userParticipations = [];
      partsMap.forEach((pData) => {
        const isMine =
          (currentUser.id && pData.user_id && String(pData.user_id) === String(currentUser.id)) ||
          (currentUser.email && pData.user_email && pData.user_email.toLowerCase() === currentUser.email.toLowerCase());

        if (isMine) {
          userParticipations.push(hydrateParticipation(pData, eventsMap, usersMap));
        }
      });

      return {
        participations: userParticipations,
        stats: {
          total_applications: userParticipations.length,
          accepted_count: userParticipations.filter((p) => p.status === 'accepted').length,
          pending_count: userParticipations.filter((p) => p.status === 'pending').length,
          rejected_count: userParticipations.filter((p) => p.status === 'rejected').length,
        },
      };
    }

    // 2. Dashboard Entreprise
    if (currentUser.role === 'enterprise') {
      const ptnsMap = new Map();

      try {
        const localPtns = JSON.parse(localStorage.getItem('ep_partnerships_store') || '[]');
        localPtns.forEach((p) => ptnsMap.set(String(p.id), p));
      } catch (_) {}

      try {
        const partnSnap = await getDocs(collection(db, PARTNERSHIPS_COLLECTION));
        partnSnap.forEach((d) => ptnsMap.set(String(d.id), { id: d.id, ...d.data() }));
      } catch (_) {}

      const partnerships = [];
      ptnsMap.forEach((pData) => {
        const isMine =
          pData.user_id === currentUser.id ||
          (currentUser.email && pData.user_email?.toLowerCase() === currentUser.email?.toLowerCase()) ||
          currentUser.id === 'admin';

        if (isMine) {
          partnerships.push(hydratePartnership(pData, eventsMap, usersMap));
        }
      });

      return {
        partnerships,
        stats: {
          total_proposals: partnerships.length,
          accepted_count: partnerships.filter((p) => p.status === 'accepted').length,
          pending_count: partnerships.filter((p) => p.status === 'pending').length,
          total_funds_committed: 0,
        },
      };
    }

    // 3. Dashboard Association
    if (currentUser.role === 'association') {
      const myEvents = [];
      const myEventIds = new Set();
      let deletedSet = new Set();
      try {
        const deletedArr = JSON.parse(localStorage.getItem('ep_deleted_events') || '[]');
        deletedSet = new Set(deletedArr.map(String));
      } catch (_) {}

      eventsMap.forEach((ev) => {
        if (deletedSet.has(String(ev.id)) || deletedSet.has(String(ev.slug))) return;

        const isMyEvent =
          (currentUser.id && String(ev.user_id) === String(currentUser.id)) ||
          (currentUser.uid && String(ev.user_id) === String(currentUser.uid)) ||
          (currentUser.organization_name && ev.organization_name && ev.organization_name.toLowerCase().trim() === currentUser.organization_name.toLowerCase().trim()) ||
          (currentUser.email && ev.user_email && currentUser.email.toLowerCase().trim() === ev.user_email.toLowerCase().trim()) ||
          (currentUser.email && ev.user_id && currentUser.email.toLowerCase().includes(ev.user_id.replace('user_', ''))) ||
          currentUser.role === 'admin';

        if (isMyEvent && !myEvents.some((e) => e.id === ev.id || e.slug === ev.slug)) {
          myEvents.push(ev);
          myEventIds.add(String(ev.id));
          if (ev.slug) myEventIds.add(String(ev.slug));
        }
      });

      // Récupérer uniquement les participations destinées aux événements de cette association
      const allPartsMap = new Map();
      try {
        const localParts = JSON.parse(localStorage.getItem('ep_participations_store') || '[]');
        localParts.forEach((p) => allPartsMap.set(String(p.id), p));
      } catch (_) {}

      try {
        const allPartSnap = await getDocs(collection(db, PARTICIPATIONS_COLLECTION));
        allPartSnap.forEach((d) => allPartsMap.set(String(d.id), { id: d.id, ...d.data() }));
      } catch (_) {}

      const allParticipations = [];
      allPartsMap.forEach((p) => {
        const isForMyEvent =
          myEventIds.has(String(p.event_id)) ||
          myEvents.some(
            (e) => String(e.id) === String(p.event_id) || String(e.slug) === String(p.event_id)
          );

        if (isForMyEvent) {
          allParticipations.push(hydrateParticipation(p, eventsMap, usersMap));
        }
      });

      // Récupérer uniquement les partenariats destinés aux événements de cette association
      const allPtnsMap = new Map();
      try {
        const localPtns = JSON.parse(localStorage.getItem('ep_partnerships_store') || '[]');
        localPtns.forEach((p) => allPtnsMap.set(String(p.id), p));
      } catch (_) {}

      try {
        const allPartnSnap = await getDocs(collection(db, PARTNERSHIPS_COLLECTION));
        allPartnSnap.forEach((d) => allPtnsMap.set(String(d.id), { id: d.id, ...d.data() }));
      } catch (_) {}

      const allPartnerships = [];
      allPtnsMap.forEach((p) => {
        const isForMyEvent =
          myEventIds.has(String(p.event_id)) ||
          myEvents.some(
            (e) => String(e.id) === String(p.event_id) || String(e.slug) === String(p.event_id)
          );

        if (isForMyEvent) {
          allPartnerships.push(hydratePartnership(p, eventsMap, usersMap));
        }
      });

      return {
        events: myEvents,
        all_participations: allParticipations,
        all_partnerships: allPartnerships,
        stats: {
          my_events_count: myEvents.length,
          pending_participations_count: allParticipations.filter((p) => p.status === 'pending').length,
          accepted_volunteers_count: allParticipations.filter((p) => p.status === 'accepted').length,
          pending_partnerships_count: allPartnerships.filter((p) => p.status === 'pending').length,
          accepted_partnerships_count: allPartnerships.filter((p) => p.status === 'accepted').length,
          total_funds_received: 0,
        },
      };
    }

    // 4. Dashboard Admin par défaut
    const [evSnap, prtSnap, partnSnap, usrSnap] = await Promise.all([
      getDocs(collection(db, EVENTS_COLLECTION)),
      getDocs(collection(db, PARTICIPATIONS_COLLECTION)),
      getDocs(collection(db, PARTNERSHIPS_COLLECTION)),
      getDocs(collection(db, USERS_COLLECTION)),
    ]);

    const events = [];
    evSnap.forEach((d) => {
      const ev = normalizeEvent(d.id, d.data());
      events.push(ev);
    });

    if (events.length === 0) {
      DEFAULT_EVENTS.forEach((data) => {
        const ev = normalizeEvent(data.slug, data);
        events.push(ev);
      });
    }

    const participations = [];
    prtSnap.forEach((d) => {
      participations.push(hydrateParticipation({ id: d.id, ...d.data() }, eventsMap, usersMap));
    });

    const partnerships = [];
    partnSnap.forEach((d) => {
      partnerships.push(hydratePartnership({ id: d.id, ...d.data() }, eventsMap, usersMap));
    });

    const users = [];
    usrSnap.forEach((d) => users.push({ id: d.id, ...d.data() }));

    return {
      events,
      participations,
      all_participations: participations,
      partnerships,
      all_partnerships: partnerships,
      users,
      stats: {
        users_count: users.length,
        events_count: events.length,
        participations_count: participations.length,
        partnerships_count: partnerships.length,
        total_events: events.length,
        total_users: users.length,
        total_participations: participations.length,
        total_partnerships: partnerships.length,
      },
    };
  } catch (err) {
    console.error('Erreur getDashboard Firestore:', err);
    return {
      events: [],
      participations: [],
      partnerships: [],
      all_participations: [],
      all_partnerships: [],
      stats: {},
    };
  }
};

/**
 * Message de contact stocké dans Firestore
 */
export const sendContactMessage = async (data) => {
  const res = await addDoc(collection(db, CONTACT_COLLECTION), {
    ...data,
    created_at: new Date().toISOString(),
  });
  return { message: 'Votre message a été transmis avec succès !', id: res.id };
};

/**
 * Gestion des utilisateurs pour l'administration Firestore
 */
export const getUsers = async () => {
  const snap = await getDocs(collection(db, USERS_COLLECTION));
  const users = [];
  snap.forEach((d) => users.push({ id: d.id, ...d.data() }));
  return { users };
};

export const updateUserStatus = async (id, status) => {
  await updateDoc(doc(db, USERS_COLLECTION, String(id)), { status });
  return { message: 'Statut utilisateur mis à jour.' };
};

export const deleteUser = async (id) => {
  await deleteDoc(doc(db, USERS_COLLECTION, String(id)));
  return { message: 'Utilisateur supprimé.' };
};
