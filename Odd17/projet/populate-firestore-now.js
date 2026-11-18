import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCnqfASIpdjG0OrBcPi9k3WaF04cQuxd2c",
  authDomain: "eventpatner-501dc.firebaseapp.com",
  projectId: "eventpatner-501dc",
  storageBucket: "eventpatner-501dc.firebasestorage.app",
  messagingSenderId: "477776321060",
  appId: "1:477776321060:web:254eb92f6ff80f48b396b1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// COMPTES OFFICIELS (users)
const ACCOUNTS = [
  {
    id: "user_aljisr",
    uid: "user_aljisr",
    email: "aljisr@eventpartner.ma",
    name: "Mohamed Amine Sbihi",
    organization_name: "Fondation Al Jisr",
    role: "association",
    city: "Casablanca",
    phone: "0522112233",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_fmvi",
    uid: "user_fmvi",
    email: "fmv@eventpartner.ma",
    name: "Dr. Rachid Yazami",
    organization_name: "Fondation Mohammed V pour la Solidarité",
    role: "association",
    city: "Rabat",
    phone: "0537778899",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_fmps",
    uid: "user_fmps",
    email: "fmps@eventpartner.ma",
    name: "Fatima Zahra Ammor",
    organization_name: "Fondation Marocaine pour le Préscolaire (FMPS)",
    role: "association",
    city: "Rabat",
    phone: "0537665544",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_enactus",
    uid: "user_enactus",
    email: "enactus@eventpartner.ma",
    name: "Youssef Lahlou",
    organization_name: "Enactus Morocco",
    role: "association",
    city: "Casablanca",
    phone: "0522334455",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_amee",
    uid: "user_amee",
    email: "amee@eventpartner.ma",
    name: "Saïd Mouline",
    organization_name: "Agence Marocaine pour l'Efficacité Énergétique (AMEE)",
    role: "association",
    city: "Rabat",
    phone: "0537556677",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_alamal",
    uid: "user_alamal",
    email: "alamal@eventpartner.ma",
    name: "Khadija Boujanoui",
    organization_name: "Association Al Amal pour la Femme",
    role: "association",
    city: "Marrakech",
    phone: "0528445566",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_hceflcd",
    uid: "user_hceflcd",
    email: "eauxforets@eventpartner.ma",
    name: "Abderrahim Houmy",
    organization_name: "Haut-Commissariat aux Eaux et Forêts (HCEFLCD)",
    role: "association",
    city: "Rabat",
    phone: "0537667788",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_greentech",
    uid: "user_greentech",
    email: "greentech@eventpartner.ma",
    name: "Yassine Mansouri",
    organization_name: "GreenTech Solutions Maroc",
    role: "enterprise",
    city: "Casablanca",
    phone: "0522889900",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_atlas_dev",
    uid: "user_atlas_dev",
    email: "atlasdev@eventpartner.ma",
    name: "Nadia Bennani",
    organization_name: "Atlas Développement RSE",
    role: "enterprise",
    city: "Rabat",
    phone: "0537202020",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_sahara_digital",
    uid: "user_sahara_digital",
    email: "saharadigital@eventpartner.ma",
    name: "Karim Tazi",
    organization_name: "Sahara Digital",
    role: "enterprise",
    city: "Marrakech",
    phone: "0524303030",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_benevole_1",
    uid: "user_benevole_1",
    email: "benevole@eventpartner.ma",
    name: "Yassine El Amrani",
    organization_name: "",
    role: "volunteer",
    city: "Casablanca",
    phone: "0661234567",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "user_admin",
    uid: "user_admin",
    email: "admin@eventpartner.ma",
    name: "Administrateur EventPartner",
    organization_name: "Administration EventPartner ODD 17",
    role: "admin",
    city: "Rabat",
    phone: "0537000000",
    status: "active",
    created_at: new Date().toISOString(),
  }
];

// ANCIENS ÉVÉNEMENTS TROP TECHNIQUES OU COMPLEXES À SUPPRIMER
const OLD_EVENTS_TO_REMOVE = [
  "atelier-coding-jeunes-sidi-moumen",
  "formation-cooperatives-femmes-agadir",
  "atelier-energie-solaire-ouarzazate",
  "journee-portes-ouvertes-entrepreneuriat-social",
  "forum-associations-entreprises-rabat",
  "caravane-medicale-commune-asni"
];

// 7 ÉVÉNEMENTS SOLIDAIRES 100% ACCESSIBLES À TOUT CITOYEN SANS EXPÉRIENCE
const ACCESSIBLE_EVENTS = [
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
    banner_image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=1200&q=80",
    needs: [
      { id: "n1", type: "volunteer_skill", title: "Bénévoles ramassage et tri citoyen (ouvert à tous)", target_quantity: 25, unit: "personnes" },
      { id: "n2", type: "material", title: "Gants de protection et pinces de ramassage", target_quantity: 50, unit: "unités" },
      { id: "n3", type: "material", title: "Packs de sacs poubelles renforcés et eau minérale", target_quantity: 30, unit: "packs" },
    ],
  },
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

async function runSeed() {
  console.log("=== MISE À JOUR FIRESTORE AVEC EXACTEMENT 7 ÉVÉNEMENTS 100% ACCESSIBLES ===");

  // 1. Mise à jour des comptes
  console.log("1. Écriture des comptes dans 'users'...");
  for (const acc of ACCOUNTS) {
    await setDoc(doc(db, "users", acc.id), acc, { merge: true });
    console.log(`  [OK User] -> ${acc.email} (${acc.role})`);
  }

  // 2. Nettoyage des événements hors liste et des anciennes participations de test
  console.log("\n2. Nettoyage de Firestore...");
  const currentEventsSnap = await getDocs(collection(db, "events"));
  const validSlugs = new Set(ACCESSIBLE_EVENTS.map(e => e.slug));
  for (const docSnap of currentEventsSnap.docs) {
    if (!validSlugs.has(docSnap.id)) {
      await deleteDoc(doc(db, "events", docSnap.id));
      console.log(`  [Supprimé de Firestore] -> ${docSnap.id}`);
    }
  }

  // Nettoyage des participations fictives pour partir à 0
  const oldPartsSnap = await getDocs(collection(db, "participations"));
  for (const d of oldPartsSnap.docs) {
    await deleteDoc(doc(db, "participations", d.id));
  }
  console.log(`  [Nettoyé] -> ${oldPartsSnap.size} anciennes participations supprimées.`);

  // 3. Insertion des 7 événements accessibles (Compteurs réels à 0)
  console.log("\n3. Écriture des 7 événements solidaires accessibles...");
  for (const evt of ACCESSIBLE_EVENTS) {
    await setDoc(doc(db, "events", evt.slug), {
      ...evt,
      status: "published",
      accepted_participations_count: 0,
      accepted_partnerships_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { merge: true });
    console.log(`  [OK Event Simple] -> ${evt.slug} : ${evt.title}`);
  }

  // 4. Vérification finale
  console.log("\n4. Vérification finale de Firestore...");
  const finalSnap = await getDocs(collection(db, "events"));
  console.log(`✅ Collection 'events' count EXACTEMENT : ${finalSnap.size}`);
  finalSnap.forEach((d) => {
    console.log(`   - ${d.id} => ${d.data().title} (${d.data().organization_name})`);
  });

  console.log("\n=== OPÉRATION TERMINÉE AVEC SUCCÈS ! ===");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("Erreur:", err);
  process.exit(1);
});
