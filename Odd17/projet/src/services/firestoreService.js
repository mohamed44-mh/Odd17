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
} from "firebase/firestore";
import { db } from "../config/firebase.js";

// Nom des collections Firestore
export const EVENTS_COLLECTION = "events";
export const PARTICIPATIONS_COLLECTION = "participations";
export const PARTNERSHIPS_COLLECTION = "partnerships";
export const USERS_COLLECTION = "users";

/**
 * ═══════════════════════════════════════════════════════
 *  COMPTES PAR DÉFAUT — Associations, Entreprises, Admin
 *  Organismes & Entreprises RÉELS du Maroc
 * ═══════════════════════════════════════════════════════
 */
export const DEFAULT_ACCOUNTS = [
  // ───────── ADMIN ─────────
  {
    id: "user_admin",
    uid: "user_admin",
    name: "Administrateur EventPartner",
    organization_name: "Administration EventPartner ODD 17",
    email: "admin@eventpartner.ma",
    role: "admin",
    city: "Rabat",
    phone: "0537000000",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_admin_alt",
    uid: "user_admin_alt",
    name: "Administrateur Principal",
    organization_name: "Administration EventPartner ODD 17",
    email: "admin@admin.com",
    role: "admin",
    city: "Rabat",
    phone: "0537000001",
    status: "active",
    created_at: new Date().toISOString(),
  },

  // ───────── ASSOCIATIONS / ONG RÉELLES ─────────
  {
    id: "user_aljisr",
    uid: "user_aljisr",
    name: "Mohamed Amine Sbihi",
    organization_name: "Fondation Al Jisr",
    email: "aljisr@eventpartner.ma",
    role: "association",
    city: "Casablanca",
    phone: "0522112233",
    description: "Fondation nationale pour le rapprochement école-entreprise, partenaire du Ministère de l'Éducation.",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_fmvi",
    uid: "user_fmvi",
    name: "Dr. Rachid Yazami",
    organization_name: "Fondation Mohammed V pour la Solidarité",
    email: "fmv@eventpartner.ma",
    role: "association",
    city: "Rabat",
    phone: "0537778899",
    description: "Fondation royale d'action humanitaire, sociale et de développement au Maroc.",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_fmps",
    uid: "user_fmps",
    name: "Fatima Zahra Ammor",
    organization_name: "Fondation Marocaine pour la Promotion de l'Enseignement Préscolaire (FMPS)",
    email: "fmps@eventpartner.ma",
    role: "association",
    city: "Rabat",
    phone: "0537665544",
    description: "Fondation nationale pour la généralisation de l'enseignement préscolaire au Maroc.",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_enactus",
    uid: "user_enactus",
    name: "Youssef Lahlou",
    organization_name: "Enactus Morocco",
    email: "enactus@eventpartner.ma",
    role: "association",
    city: "Casablanca",
    phone: "0522334455",
    description: "Réseau international d'entrepreneuriat social avec 70+ universités marocaines.",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_amee",
    uid: "user_amee",
    name: "Saïd Mouline",
    organization_name: "Agence Marocaine pour l'Efficacité Énergétique (AMEE)",
    email: "amee@eventpartner.ma",
    role: "association",
    city: "Rabat",
    phone: "0537556677",
    description: "Agence publique chargée de la promotion de l'efficacité énergétique et des énergies renouvelables.",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_alamal",
    uid: "user_alamal",
    name: "Khadija Boujanoui",
    organization_name: "Association Al Amal pour la Femme et le Développement",
    email: "alamal@eventpartner.ma",
    role: "association",
    city: "Agadir",
    phone: "0528445566",
    description: "Association d'autonomisation des femmes rurales dans la région Souss-Massa.",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_hceflcd",
    uid: "user_hceflcd",
    name: "Abderrahim Houmy",
    organization_name: "Haut-Commissariat aux Eaux et Forêts (HCEFLCD)",
    email: "eauxforets@eventpartner.ma",
    role: "association",
    city: "Rabat",
    phone: "0537667788",
    description: "Institution nationale de gestion des forêts, de la faune et de la flore au Maroc.",
    status: "active",
    created_at: new Date().toISOString(),
  },

  // ───────── ENTREPRISES (fictives pour démo) ─────────
  {
    id: "user_greentech",
    uid: "user_greentech",
    name: "Rachid Alaoui",
    organization_name: "GreenTech Solutions Maroc",
    email: "greentech@eventpartner.ma",
    role: "enterprise",
    city: "Casablanca",
    phone: "0522101010",
    description: "Startup marocaine spécialisée dans les solutions technologiques vertes et l'énergie solaire.",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_atlas_dev",
    uid: "user_atlas_dev",
    name: "Samira Bennani",
    organization_name: "Atlas Développement SA",
    email: "atlasdev@eventpartner.ma",
    role: "enterprise",
    city: "Rabat",
    phone: "0537202020",
    description: "Cabinet de conseil en développement durable et accompagnement RSE des PME marocaines.",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_sahara_digital",
    uid: "user_sahara_digital",
    name: "Karim Tazi",
    organization_name: "Sahara Digital",
    email: "saharadigital@eventpartner.ma",
    role: "enterprise",
    city: "Marrakech",
    phone: "0524303030",
    description: "Entreprise d'inclusion numérique, formation digitale et connectivité pour les zones rurales.",
    status: "active",
    created_at: new Date().toISOString(),
  },
];

/**
 * ═══════════════════════════════════════════════════════
 *  7 ÉVÉNEMENTS SOLIDAIRES SIMPLES — ACCESSIBLES À TOUS
 *  Ouverts aux citoyens ordinaires, sans expérience requise
 * ═══════════════════════════════════════════════════════
 */
export const DEFAULT_EVENTS = [
  // 1. Nettoyage de plage
  {
    slug: "nettoyage-plage-mehdia-kenitra",
    title: "Grand Nettoyage Citoyen de la Plage de Mehdia",
    category: "Environnement & Climat",
    category_id: "2",
    user_id: "user_aljisr",
    organization_name: "Fondation Al Jisr",
    description: "Rejoignez notre grande action citoyenne et éco-responsable pour préserver le littoral de Mehdia ! Ouverte à tous les âges (familles, étudiants, voisins), cette matinée a pour mission de débarrasser le sable des déchets plastiques tout en sensibilisant les promeneurs à la protection marine.\n\n📋 Au programme de la matinée :\n• 09h00 : Accueil chaleureux, café de bienvenue et distribution des kits (gants réutilisables, sacs de tri et pinces).\n• 09h30 : Briefing rapide sur les consignes de sécurité et le tri sélectif (plastique, verre, déchets résiduels).\n• 10h00 : Nettoyage collectif du littoral dans une ambiance conviviale et solidaire.\n• 12h30 : Pesée des sacs collectés, photo de groupe et partage d'une collation rafraîchissante offerte à tous.\n\n🎒 Matériel fourni sur place : Gants renforcés, sacs poubelles écologiques, pinces de ramassage, eau minérale et jus frais.\n👟 À prévoir : Chaussures fermées adaptées au sable, casquette et votre sourire !",
    location: "Kénitra",
    address: "Plage de Mehdia, Kénitra",
    start_date: "2026-12-14 09:00:00",
    end_date: "2026-12-14 13:30:00",
    registration_deadline: "2026-12-13 18:00:00",
    max_volunteers: 30,
    banner_image: "https://6afe1de142acc5ca7b2ceae2.imgix.net/sandbox/Plage-Tamaris1-Dar-Bouazza.-.jpg",
    needs: [
      { id: "n1", type: "volunteer_skill", title: "Bénévoles ramassage et tri citoyen (ouvert à tous)", target_quantity: 25, unit: "personnes" },
      { id: "n2", type: "material", title: "Gants de protection et pinces de ramassage", target_quantity: 50, unit: "unités" },
      { id: "n3", type: "material", title: "Packs de sacs poubelles renforcés et eau minérale", target_quantity: 30, unit: "packs" },
    ],
  },

  // 2. Plantation d'arbres
  {
    slug: "plantation-arbres-foret-maamora",
    title: "Plantation d'Arbres & Espaces Verts — Forêt de Maâmora",
    category: "Environnement & Climat",
    category_id: "2",
    user_id: "user_hceflcd",
    organization_name: "Haut-Commissariat aux Eaux et Forêts (HCEFLCD)",
    description: "Participez à une belle matinée d'action écologique au cœur de la forêt de Maâmora, le plus grand massif de chênes-lièges du Maroc. Cette opération de reboisement est accessible à toute personne désirant agir concrètement pour la nature.\n\n📋 Déroulement de la journée :\n• 09h00 : Rassemblement au point de rencontre forestier et mot d'accueil des agents des Eaux et Forêts.\n• 09h20 : Démonstration pratique en 2 minutes : comment creuser la terre, positionner le plant et tasser délicatement.\n• 09h40 : Plantation en binômes et arrosage des jeunes pousses.\n• 13h00 : Pause conviviale autour d'un thé à la menthe marocain et collation partagée.\n\n🎒 Matériel fourni sur place : Jeunes plants d'arbres, pelles légères, arrosoirs et encadrement attentif.\n👟 À prévoir : Vêtements confortables ne craignant pas la terre, chaussures de marche et gourde d'eau.",
    location: "Rabat",
    address: "Forêt de Maâmora, sortie Rabat direction Kénitra",
    start_date: "2026-12-21 09:00:00",
    end_date: "2026-12-21 14:00:00",
    registration_deadline: "2026-12-20 20:00:00",
    max_volunteers: 30,
    banner_image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    needs: [
      { id: "n4", type: "volunteer_skill", title: "Bénévoles plantation et arrosage (ouvert à tous)", target_quantity: 25, unit: "personnes" },
      { id: "n5", type: "material", title: "Pelles légères, arrosoirs et tuteurs", target_quantity: 25, unit: "unités" },
      { id: "n6", type: "material", title: "Paniers repas légers et ravitaillement pour bénévoles", target_quantity: 30, unit: "paniers" },
    ],
  },

  // 3. Paniers alimentaires solidaires
  {
    slug: "paniers-solidaires-familles-casa",
    title: "Préparation de Paniers Alimentaires Solidaires pour Familles Nécessiteuses",
    category: "Santé & Solidarité",
    category_id: "4",
    user_id: "user_fmvi",
    organization_name: "Fondation Mohammed V pour la Solidarité",
    description: "Mobilisons-nous pour soutenir 150 familles en situation de précarité dans les quartiers de Casablanca. Cette action consiste à constituer des cartons de denrées alimentaires de base complètes, prêtes à être distribuées aux foyers bénéficiaires.\n\n📋 Organisation de l'atelier solidaire :\n• 09h30 : Accueil des bénévoles et répartition par postes de travail (pesée, remplissage, fermeture et étiquetage).\n• 10h00 : Montage à la chaîne des colis solidaires : farine, huile de table, sucre, lentilles, thé vert, concentré de tomate et semoule.\n• 13h00 : Pause déjeuner conviviale offerte sur place à toute l'équipe.\n• 14h00 : Palettisation, vérification des cartons et aide au chargement des véhicules.\n\n🎒 Matériel fourni sur place : Cartons renforcés, rubans adhésifs, matériel de manutention et tabliers.\n💪 Profil recherché : Aucune force particulière requise, les tâches sont simples et adaptées à tous.",
    location: "Casablanca",
    address: "Centre Social de Proximité, Sidi Bernoussi, Casablanca",
    start_date: "2027-01-08 09:30:00",
    end_date: "2027-01-08 15:30:00",
    registration_deadline: "2027-01-07 19:00:00",
    max_volunteers: 20,
    banner_image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
    needs: [
      { id: "n7", type: "volunteer_skill", title: "Bénévoles préparation et mise en carton (ouvert à tous)", target_quantity: 18, unit: "personnes" },
      { id: "n8", type: "material", title: "Cartons de conditionnement et rubans d'emballage", target_quantity: 150, unit: "unités" },
      { id: "n9", type: "material", title: "Kits de denrées de base (farine, huile, sucre, thé)", target_quantity: 150, unit: "kits" },
    ],
  },



  // 5. Vêtements chauds & couvertures
  {
    slug: "collecte-tri-vetements-hiver-asni",
    title: "Opération Hiver Solidaire : Tri de Vêtements Chauds & Couvertures",
    category: "Santé & Solidarité",
    category_id: "4",
    user_id: "user_alamal",
    organization_name: "Association Al Amal pour la Femme",
    description: "Face aux vagues de grand froid qui touchent les villages isolés du Haut-Atlas (commune d'Asni et environs), cette opération vise à préparer des lots de vêtements d'hiver chauds et des couvertures pour les familles montagnardes.\n\n📋 Déroulement de la journée solidaire :\n• 10h00 : Arrivée au local associatif et tri des dons reçus par catégorie (bébés, enfants scolarisés, femmes, hommes).\n• 11h00 : Vérification de l'état des vêtements (fermetures éclairs, boutons, propreté).\n• 12h30 : Pliage, étiquetage des tailles et emballage dans de grands sacs étanches protecteurs.\n• 15h00 : Préparation des paquets de couvertures polaires et inventaire précis par douar destinataire.\n\n🎒 Matériel fourni sur place : Sacs de rangement hermétiques renforcés, étiqueteuses, tables de tri et rafraîchissements.\n🧤 Ambiance : Chaleureuse et participative, idéale pour s'engager entre amis ou en famille.",
    location: "Marrakech",
    address: "Local Associatif Al Amal, Bab Doukkala, Marrakech",
    start_date: "2027-01-24 10:00:00",
    end_date: "2027-01-24 16:30:00",
    registration_deadline: "2027-01-23 20:00:00",
    max_volunteers: 15,
    banner_image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80",
    needs: [
      { id: "n13", type: "volunteer_skill", title: "Bénévoles tri, pliage et rangement (ouvert à tous)", target_quantity: 12, unit: "personnes" },
      { id: "n14", type: "material", title: "Grands sacs renforcés étanches et étiquettes", target_quantity: 60, unit: "unités" },
      { id: "n15", type: "material", title: "Lots de couvertures polaires épaisses pour l'hiver", target_quantity: 50, unit: "lots" },
    ],
  },

  // 6. Cartables & fournitures scolaires
  {
    slug: "collecte-fournitures-scolaires-fes",
    title: "Opération Cartable Solidaire : Préparation des Sacs d'École",
    category: "Éducation & Formation",
    category_id: "1",
    user_id: "user_fmps",
    organization_name: "Fondation Marocaine pour le Préscolaire (FMPS)",
    description: "L'éducation pour chaque enfant commence par un cartable bien rempli ! Cette action solidaire consiste à garnir 200 sacs à dos complets pour les élèves d'écoles primaires rurales de la région Fès-Meknès.\n\n📋 Déroulement de l'atelier de préparation :\n• 10h00 : Présentation de l'action par l'équipe FMPS et mise en place de la chaîne d'assemblage.\n• 10h30 : Chaque bénévole prend en charge un poste pour garnir les cartables neufs : trousse garnie, cahiers de cours, règles, gomme et boîte de crayons de couleur.\n• 13h00 : Pause déjeuner conviviale offerte à l'ensemble des bénévoles.\n• 14h00 : Contrôle qualité, étiquetage personnalisé et rangement par niveau scolaire.\n\n🎒 Matériel fourni sur place : Cartables neufs, toutes les fournitures scolaires, étiquettes et rafraîchissements.\n⭐ Pourquoi participer ? C'est une mission rythmée et gratifiante où chaque geste soutient directement la scolarisation d'un enfant.",
    location: "Fès",
    address: "Siège Régional FMPS, Fès Ville Nouvelle",
    start_date: "2027-02-02 10:00:00",
    end_date: "2027-02-02 15:30:00",
    registration_deadline: "2027-02-01 19:00:00",
    max_volunteers: 15,
    banner_image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80",
    needs: [
      { id: "n16", type: "volunteer_skill", title: "Bénévoles assemblage des kits scolaires (ouvert à tous)", target_quantity: 12, unit: "personnes" },
      { id: "n17", type: "material", title: "Cartables neufs renforcés pour écoliers", target_quantity: 200, unit: "unités" },
      { id: "n18", type: "material", title: "Kits complets de fournitures scolaires (cahiers, trousses, stylos)", target_quantity: 200, unit: "kits" },
    ],
  },

  // 7. Don de sang : accueil citoyen
  {
    slug: "campagne-don-sang-casa",
    title: "Journée Don de Sang : Accueil Citoyen & Service Collation",
    category: "Santé & Solidarité",
    category_id: "4",
    user_id: "user_fmvi",
    organization_name: "Fondation Mohammed V pour la Solidarité",
    description: "Donner son sang, c'est sauver des vies ! Le Centre de Transfusion Sanguine et la Fondation Mohammed V organisent cette grande collecte solidaire. Aucune compétence médicale n'est requise pour être bénévole.\n\n📋 Déroulement et missions bénévoles :\n• 09h30 : Accueil des bénévoles par le médecin coordinateur et répartition des rôles.\n• 10h00 : Accueil souriant des citoyens donneurs, distribution des fiches préalables et orientation dans la file.\n• 10h30 - 16h30 (en rotation) : Espace de repos post-don : servir aux donneurs leur collation (jus d'orange frais, dattes, biscuits) et s'assurer de leur bien-être.\n• Distribution de dépliants d'information aux passants sur l'importance du don régulier.\n\n🎒 Matériel fourni sur place : Badges 'Bénévole Accueil', gants légers, plateaux de service et collations complètes.\n🤝 Qualités recherchées : Avoir le sens de l'accueil, de la bienveillance et un grand sourire !",
    location: "Casablanca",
    address: "Esplanade Place des Nations-Unies, Casablanca",
    start_date: "2027-02-12 09:30:00",
    end_date: "2027-02-12 17:00:00",
    registration_deadline: "2027-02-11 20:00:00",
    max_volunteers: 12,
    banner_image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80",
    needs: [
      { id: "n19", type: "volunteer_skill", title: "Bénévoles accueil, orientation et écoute (ouvert à tous)", target_quantity: 10, unit: "personnes" },
      { id: "n20", type: "material", title: "Gobelets recyclables, serviettes et plateaux de service", target_quantity: 150, unit: "unités" },
      { id: "n21", type: "material", title: "Lots de collations post-don (jus frais, gâteaux, dattes)", target_quantity: 120, unit: "lots" },
    ],
  },
];

/**
 * ═══════════════════════════════════════════════════════
 *  SEED AUTOMATIQUE — Comptes + Événements + Participations + Partenariats
 * ═══════════════════════════════════════════════════════
 */
export async function seedFirestoreIfEmpty() {
  try {
    // 0. Si le seed initial a déjà été effectué, ne jamais écraser les modifications des événements
    if (localStorage.getItem("ep_firestore_seeded_v1")) {
      return;
    }

    // 1. Initialisation des comptes utilisateurs si absents
    for (const acc of DEFAULT_ACCOUNTS) {
      try {
        const userRef = doc(db, USERS_COLLECTION, acc.id);
        await setDoc(userRef, acc, { merge: true });
      } catch (_) { }
    }

    // 2. Initialiser les événements uniquement s'ils n'existent pas encore
    for (let i = 0; i < DEFAULT_EVENTS.length; i++) {
      const evt = DEFAULT_EVENTS[i];
      try {
        const evtRef = doc(db, EVENTS_COLLECTION, evt.slug);
        const evtSnap = await getDoc(evtRef);
        if (!evtSnap.exists()) {
          await setDoc(evtRef, {
            ...evt,
            status: "published",
            updated_at: new Date().toISOString(),
          });
        }
      } catch (errEvt) {
        console.warn("Avertissement insertion event:", evt.slug, errEvt);
      }
    }

    // Initialiser le cache local seulement s'il est vide
    try {
      if (!localStorage.getItem("ep_events_cache")) {
        localStorage.setItem("ep_events_cache", JSON.stringify(DEFAULT_EVENTS));
      }
      localStorage.setItem("ep_firestore_seeded_v1", "true");
    } catch (_) { }

    console.log("✅ Seed initial prêt !");
  } catch (err) {
    console.error("Erreur initialisation Firestore seed:", err);
  }
}
