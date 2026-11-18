import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

// Nom des collections Firestore
const EVENTS_COLLECTION = "events";
const PARTICIPATIONS_COLLECTION = "participations";
const PARTNERSHIPS_COLLECTION = "partnerships";
const CATEGORIES_COLLECTION = "categories";

/**
 * Récupérer tous les événements depuis Firestore
 */
export async function getEventsFromFirestore(filters = {}) {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    let q = query(eventsRef, orderBy("start_date", "asc"));

    if (filters.city) {
      q = query(eventsRef, where("location", "==", filters.city), orderBy("start_date", "asc"));
    }

    const querySnapshot = await getDocs(q);
    const events = [];
    querySnapshot.forEach((docSnap) => {
      events.push({ id: docSnap.id, ...docSnap.data() });
    });
    return events;
  } catch (error) {
    console.error("Erreur Firestore getEvents:", error);
    throw error;
  }
}

/**
 * Récupérer un événement par ID ou Slug
 */
export async function getEventFromFirestore(idOrSlug) {
  try {
    // 1. Essai par ID direct
    const docRef = doc(db, EVENTS_COLLECTION, String(idOrSlug));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }

    // 2. Essai par Slug
    const q = query(collection(db, EVENTS_COLLECTION), where("slug", "==", idOrSlug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const match = querySnapshot.docs[0];
      return { id: match.id, ...match.data() };
    }

    return null;
  } catch (error) {
    console.error("Erreur Firestore getEvent:", error);
    throw error;
  }
}

/**
 * Créer un nouvel événement dans Firestore
 */
export async function createEventInFirestore(eventData) {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const docRef = await addDoc(eventsRef, {
      ...eventData,
      status: "published",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return { id: docRef.id, ...eventData };
  } catch (error) {
    console.error("Erreur Firestore createEvent:", error);
    throw error;
  }
}

/**
 * Soumettre une candidature bénévole
 */
export async function submitParticipationToFirestore(eventId, volunteerData) {
  try {
    const partRef = collection(db, PARTICIPATIONS_COLLECTION);
    const res = await addDoc(partRef, {
      event_id: eventId,
      ...volunteerData,
      status: "pending",
      created_at: serverTimestamp(),
    });
    return { id: res.id, ...volunteerData, status: "pending" };
  } catch (error) {
    console.error("Erreur Firestore participation:", error);
    throw error;
  }
}

/**
 * Soumettre une offre de partenariat RSE
 */
export async function submitPartnershipToFirestore(eventId, partnerData) {
  try {
    const partRef = collection(db, PARTNERSHIPS_COLLECTION);
    const res = await addDoc(partRef, {
      event_id: eventId,
      ...partnerData,
      status: "pending",
      created_at: serverTimestamp(),
    });
    return { id: res.id, ...partnerData, status: "pending" };
  } catch (error) {
    console.error("Erreur Firestore partnership:", error);
    throw error;
  }
}

/**
 * Initialiser les 7 événements ODD 17 Maroc dans Firestore si la base est vide
 */
export async function seedFirestoreIfEmpty() {
  try {
    const snapshot = await getDocs(collection(db, EVENTS_COLLECTION));
    if (!snapshot.empty) return; // Déjà initialisé

    const defaultEvents = [
      {
        slug: "formation-numerique-jeunes-casablanca",
        title: "Caravane Éducative & Formation au Numérique pour les Jeunes",
        category: "Éducation & Formation",
        description: "Dans le cadre de l'ODD 4 (Éducation de qualité) et l'ODD 17, formation interactive aux métiers du web, coding et compétences digitales pour les jeunes et étudiants de Sidi Moumen.",
        location: "Casablanca",
        address: "Centre Culturel Sidi Moumen, Casablanca",
        start_date: "2026-11-15 09:30:00",
        end_date: "2026-11-15 18:00:00",
        max_volunteers: 25,
        banner_image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
        organization_name: "Fondation Al Jisr",
      },
      {
        slug: "reboisement-arganier-souss-agadir",
        title: "Campagne de Reboisement de l'Arganier & Éco-Citoyenneté",
        category: "Environnement & Climat",
        description: "Agissons pour l'ODD 15 (Vie terrestre) et la protection du patrimoine marocain. Plantation collective de 1000 jeunes arganiers et ateliers de sensibilisation à la gestion de l'eau.",
        location: "Agadir",
        address: "Vallée du Souss, Région Agadir Ida-Outanane",
        start_date: "2026-11-20 09:00:00",
        end_date: "2026-11-20 17:00:00",
        max_volunteers: 40,
        banner_image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
        organization_name: "Coopérative Féminine Al Amal",
      },
      {
        slug: "nettoyage-plage-mehdia-kenitra",
        title: "Initiative Plages Propres & Protection du Littoral Atlantique",
        category: "Environnement & Climat",
        description: "Opération citoyenne de dépollution et recyclage des déchets marins (ODD 14 : Vie aquatique). Tri participatif et sensibilisation des enfants des écoles locales.",
        location: "Kénitra",
        address: "Plage Mehdia, Kénitra",
        start_date: "2026-11-22 10:00:00",
        end_date: "2026-11-22 16:00:00",
        max_volunteers: 35,
        banner_image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=1200&q=80",
        organization_name: "Collectif Mehdia Écologie",
      },
      {
        slug: "forum-entreprises-rse-rabat",
        title: "Forum National de la RSE & des Partenariats Durables ODD 17",
        category: "Partenariats ODD 17",
        description: "Rencontre nationale entre dirigeants d'entreprises marocaines, start-ups à impact social et ONG pour concrétiser des partenariats durables, mécénat financier et de compétences.",
        location: "Rabat",
        address: "Technopolis Rabat-Salé, Rabat",
        start_date: "2026-12-05 09:00:00",
        end_date: "2026-12-05 18:00:00",
        max_volunteers: 20,
        banner_image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
        organization_name: "Initiative RSE Maroc",
      },
      {
        slug: "caravane-sante-solidaire-marrakech",
        title: "Caravane Médicale Solidaire & Prévention Santé en Milieu Rural",
        category: "Santé & Solidarité",
        description: "Dans le cadre de l'ODD 3 (Santé et bien-être pour tous), consultations gratuites, distribution de kits d'hygiène et dépistage en partenariat avec des médecins bénévoles et laboratoires.",
        location: "Marrakech",
        address: "Commune Rurale d'Asni, Région Marrakech-Safi",
        start_date: "2026-12-12 08:30:00",
        end_date: "2026-12-12 17:30:00",
        max_volunteers: 30,
        banner_image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
        organization_name: "Fondation Santé Pour Tous",
      },
      {
        slug: "agroecologie-oasis-durable-ouarzazate",
        title: "Atelier Agroécologie & Préservation de l'Eau dans les Oasis",
        category: "Agriculture & Eau Durable",
        description: "Formation aux techniques d'irrigation goutte-à-goutte, compostage biologique et valorisation des dattes locales pour renforcer la résilience des petits agriculteurs (ODD 2 & ODD 6).",
        location: "Ouarzazate",
        address: "Oasis de Skoura, Province de Ouarzazate",
        start_date: "2026-12-18 09:00:00",
        end_date: "2026-12-18 16:30:00",
        max_volunteers: 20,
        banner_image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
        organization_name: "Collectif Dattes & Biodiversité",
      },
      {
        slug: "artisanat-femmes-autonomie-tanger",
        title: "Programme d'Autonomisation Économique & Artisanat Solidaire",
        category: "Inclusion & Économie Sociale",
        description: "Formation au design durable, packaging éco-responsable et vente en ligne au profit des coopératives de femmes artisanes du Nord (ODD 5 : Égalité des sexes & ODD 8 : Travail décent).",
        location: "Tanger",
        address: "Espace Médina des Arts, Tanger",
        start_date: "2026-12-22 10:00:00",
        end_date: "2026-12-22 17:00:00",
        max_volunteers: 18,
        banner_image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1200&q=80",
        organization_name: "Union des Coopératives Artisanales",
      },
    ];

    for (const evt of defaultEvents) {
      await addDoc(collection(db, EVENTS_COLLECTION), {
        ...evt,
        status: "published",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    }
    console.log("Événements ODD 17 initialisés avec succès dans Firestore !");
  } catch (err) {
    console.error("Erreur initialisation Firestore seed:", err);
  }
}

