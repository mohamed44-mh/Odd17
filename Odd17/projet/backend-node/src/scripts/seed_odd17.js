import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export function seedODD17Events() {
  try {
    const now = new Date().toISOString();

    // 1. Assurer que les catégories clés ODD 17 existent
    const existingCats = db.prepare('SELECT id, slug FROM categories').all();
    const catMap = {};
    for (const c of existingCats) {
      catMap[c.slug] = c.id;
    }

    const defaultCategories = [
      { name: 'Éducation & Formation', slug: 'education-formation', icon: 'GraduationCap', description: 'Formation, compétences numériques et éducation de qualité (ODD 4).' },
      { name: 'Environnement & Climat', slug: 'environnement-climat', icon: 'Leaf', description: 'Actions pour le climat, reboisement et biodiversité (ODD 13, 14, 15).' },
      { name: 'Partenariats ODD 17', slug: 'partenariats-odd17', icon: 'Handshake', description: 'Alliances multi-acteurs, RSE et mécénat pour le développement durable.' },
      { name: 'Santé & Solidarité', slug: 'sante-solidarite', icon: 'Activity', description: 'Santé pour tous, caravanes médicales et soutien communautaire (ODD 3).' },
      { name: 'Agriculture & Eau Durable', slug: 'agriculture-eau-durable', icon: 'Zap', description: 'Gestion de l\'eau, agroécologie et résilience oasienne (ODD 2, 6).' },
      { name: 'Inclusion & Économie Sociale', slug: 'inclusion-economie-sociale', icon: 'Heart', description: 'Autonomisation des femmes, artisanat et travail décent (ODD 5, 8).' },
      { name: 'Villes Durables & Éco-quartiers', slug: 'villes-durables', icon: 'Building', description: 'Amélioration du cadre de vie et mobilité propre (ODD 11).' }
    ];

    const insertCat = db.prepare(`
      INSERT INTO categories (name, slug, icon, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const dc of defaultCategories) {
      if (!catMap[dc.slug]) {
        try {
          const res = insertCat.run(dc.name, dc.slug, dc.icon, dc.description, now, now);
          catMap[dc.slug] = res.lastInsertRowid;
        } catch (catErr) {
          // ignore if already exists
        }
      }
    }

    // 2. Assurer l'existence de comptes marocains d'association
    let associationUser = db.prepare("SELECT id, name, organization_name FROM users WHERE role = 'association' ORDER BY id ASC LIMIT 1").get();
    if (!associationUser) {
      const hashedPassword = bcrypt.hashSync('password123', 10);
      const resUser = db.prepare(`
        INSERT INTO users (name, email, password, role, organization_name, city, phone, status, created_at, updated_at)
        VALUES ('Fondation Al Jisr Maroc', 'association@eventpartner.ma', ?, 'association', 'Fondation Al Jisr', 'Casablanca', '06 61 22 33 44', 'active', ?, ?)
      `).run(hashedPassword, now, now);
      associationUser = { id: resUser.lastInsertRowid, name: 'Fondation Al Jisr Maroc', organization_name: 'Fondation Al Jisr' };
    }

    // Si d'anciens utilisateurs avaient des villes françaises, les marocaniser
    try {
      db.prepare("UPDATE users SET city = 'Casablanca' WHERE city IN ('Paris', 'Marseille', 'Lyon', 'Bordeaux', 'Biarritz')").run();
    } catch (e) {}

    // 3. Supprimer tout ancien événement français obsolète
    try {
      db.prepare(`
        DELETE FROM events 
        WHERE location IN ('Paris', 'Marseille', 'Lyon', 'Bordeaux', 'Nantes', 'Lille', 'Strasbourg', 'Toulouse', 'Rennes', 'Montpellier', 'Nice')
           OR location LIKE '%France%'
      `).run();
    } catch (e) {}

    // 4. Les 7 Événements ODD 17 Maroc (insérés directement en BDD SQLite)
    const oddMoroccanEvents = [
      {
        slug: "formation-numerique-jeunes-casablanca",
        title: "Caravane Éducative & Formation au Numérique pour les Jeunes",
        category_slug: "education-formation",
        description: "Dans le cadre de l'ODD 4 (Éducation de qualité) et l'ODD 17, formation interactive aux métiers du web, coding et compétences digitales pour les jeunes et étudiants de Sidi Moumen.",
        location: "Casablanca",
        address: "Centre Culturel Sidi Moumen, Casablanca",
        start_date: "2026-11-15 09:30:00",
        end_date: "2026-11-15 18:00:00",
        registration_deadline: "2026-11-14 20:00:00",
        max_volunteers: 25,
        banner_image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
        needs: [
          { type: "volunteer_skill", title: "Formateurs web & développeurs bénévoles", description: "Accompagner les jeunes sur les bases du web et des algorithmes", target_quantity: 10, current_quantity: 6, unit: "bénévoles" },
          { type: "material", title: "PC portables & tablettes reconditionnés", description: "Dons d'ordinateurs par des entreprises pour équiper la salle", target_quantity: 15, current_quantity: 8, unit: "unités" }
        ]
      },
      {
        slug: "reboisement-arganier-souss-agadir",
        title: "Campagne de Reboisement de l'Arganier & Éco-Citoyenneté",
        category_slug: "environnement-climat",
        description: "Agissons pour l'ODD 15 (Vie terrestre) et la protection du patrimoine marocain. Plantation collective de 1000 jeunes arganiers et ateliers de sensibilisation à la gestion de l'eau.",
        location: "Agadir",
        address: "Vallée du Souss, Région Agadir Ida-Outanane",
        start_date: "2026-11-20 09:00:00",
        end_date: "2026-11-20 17:00:00",
        registration_deadline: "2026-11-19 18:00:00",
        max_volunteers: 40,
        banner_image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
        needs: [
          { type: "volunteer_skill", title: "Bénévoles éco-planteurs", description: "Mise en terre des jeunes arganiers et paillage", target_quantity: 30, current_quantity: 14, unit: "bénévoles" },
          { type: "financial", title: "Parrainage d'arganiers & réseau goutte-à-goutte", description: "Mécénat pour l'achat des plants certifiés", target_quantity: 10000, current_quantity: 4000, unit: "MAD" }
        ]
      },
      {
        slug: "nettoyage-plage-mehdia-kenitra",
        title: "Initiative Plages Propres & Protection du Littoral Atlantique",
        category_slug: "environnement-climat",
        description: "Opération citoyenne de dépollution et recyclage des déchets marins (ODD 14 : Vie aquatique). Tri participatif et sensibilisation des enfants des écoles locales.",
        location: "Kénitra",
        address: "Plage Mehdia, Kénitra",
        start_date: "2026-11-22 10:00:00",
        end_date: "2026-11-22 16:00:00",
        registration_deadline: "2026-11-21 18:00:00",
        max_volunteers: 35,
        banner_image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=1200&q=80",
        needs: [
          { type: "volunteer_skill", title: "Bénévoles pour collecte & tri sélectif", description: "Collecte, pesée et tri des plastiques", target_quantity: 25, current_quantity: 18, unit: "personnes" },
          { type: "material", title: "Kits de ramassage (gants, sacs biodégradables, pinces)", description: "Fourniture des équipements par nos partenaires RSE", target_quantity: 40, current_quantity: 25, unit: "lots" }
        ]
      },
      {
        slug: "forum-entreprises-rse-rabat",
        title: "Forum National de la RSE & des Partenariats Durables ODD 17",
        category_slug: "partenariats-odd17",
        description: "Rencontre nationale entre dirigeants d'entreprises marocaines, start-ups à impact social et ONG pour concrétiser des partenariats durables, mécénat financier et de compétences.",
        location: "Rabat",
        address: "Technopolis Rabat-Salé, Rabat",
        start_date: "2026-12-05 09:00:00",
        end_date: "2026-12-05 18:00:00",
        registration_deadline: "2026-12-04 12:00:00",
        max_volunteers: 20,
        banner_image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
        needs: [
          { type: "volunteer_skill", title: "Modérateurs & animateurs d'ateliers", description: "Animation des tables rondes et orientation des participants", target_quantity: 10, current_quantity: 5, unit: "bénévoles" },
          { type: "financial", title: "Frais logistiques & captation vidéo du forum", description: "Mécénat pour la diffusion et les actes du forum", target_quantity: 15000, current_quantity: 7500, unit: "MAD" }
        ]
      },
      {
        slug: "caravane-sante-solidaire-marrakech",
        title: "Caravane Médicale Solidaire & Prévention Santé en Milieu Rural",
        category_slug: "sante-solidarite",
        description: "Dans le cadre de l'ODD 3 (Santé et bien-être pour tous), consultations gratuites, distribution de kits d'hygiène et dépistage en partenariat avec des médecins bénévoles et laboratoires.",
        location: "Marrakech",
        address: "Commune Rurale d'Asni, Région Marrakech-Safi",
        start_date: "2026-12-12 08:30:00",
        end_date: "2026-12-12 17:30:00",
        registration_deadline: "2026-12-11 18:00:00",
        max_volunteers: 30,
        banner_image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
        needs: [
          { type: "volunteer_skill", title: "Médecins & infirmiers bénévoles", description: "Consultations de médecine générale et pédiatrie", target_quantity: 15, current_quantity: 10, unit: "soignants" },
          { type: "material", title: "Kits de médicaments & trousses de premiers secours", description: "Dons de kits médicaux par des pharmacies partenaires", target_quantity: 80, current_quantity: 35, unit: "kits" }
        ]
      },
      {
        slug: "agroecologie-oasis-durable-ouarzazate",
        title: "Atelier Agroécologie & Préservation de l'Eau dans les Oasis",
        category_slug: "agriculture-eau-durable",
        description: "Formation aux techniques d'irrigation goutte-à-goutte, compostage biologique et valorisation des dattes locales pour renforcer la résilience des petits agriculteurs (ODD 2 & ODD 6).",
        location: "Ouarzazate",
        address: "Oasis de Skoura, Province de Ouarzazate",
        start_date: "2026-12-18 09:00:00",
        end_date: "2026-12-18 16:30:00",
        registration_deadline: "2026-12-17 18:00:00",
        max_volunteers: 20,
        banner_image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
        needs: [
          { type: "volunteer_skill", title: "Experts en agroécologie & irrigation", description: "Animation d'ateliers pratiques sur le goutte-à-goutte", target_quantity: 8, current_quantity: 4, unit: "experts" },
          { type: "material", title: "Équipements et tuyaux d'irrigation goutte-à-goutte", description: "Dotation matérielle pour les coopératives oasiennes", target_quantity: 25, current_quantity: 12, unit: "rouleaux" }
        ]
      },
      {
        slug: "artisanat-femmes-autonomie-tanger",
        title: "Programme d'Autonomisation Économique & Artisanat Solidaire",
        category_slug: "inclusion-economie-sociale",
        description: "Formation au design durable, packaging éco-responsable et vente en ligne au profit des coopératives de femmes artisanes du Nord (ODD 5 : Égalité des sexes & ODD 8 : Travail décent).",
        location: "Tanger",
        address: "Espace Médina des Arts, Tanger",
        start_date: "2026-12-22 10:00:00",
        end_date: "2026-12-22 17:00:00",
        registration_deadline: "2026-12-21 18:00:00",
        max_volunteers: 18,
        banner_image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1200&q=80",
        needs: [
          { type: "volunteer_skill", title: "Mentors marketing digital & e-commerce", description: "Accompagner les créatrices dans la création de leurs boutiques", target_quantity: 8, current_quantity: 5, unit: "mentors" },
          { type: "financial", title: "Fonds d'amorçage pour packaging biodégradable", description: "Achat d'emballages éco-responsables pour les coopératives", target_quantity: 8000, current_quantity: 3500, unit: "MAD" }
        ]
      }
    ];

    const insertEvent = db.prepare(`
      INSERT INTO events (
        user_id, category_id, title, slug, description, location, address,
        start_date, end_date, registration_deadline, max_volunteers,
        banner_image, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)
    `);

    for (const ev of oddMoroccanEvents) {
      let catId = catMap[ev.category_slug];
      if (!catId) {
        catId = Object.values(catMap)[0] || 1;
      }

      let existing = db.prepare('SELECT id FROM events WHERE slug = ?').get(ev.slug);
      let eventId;

      if (!existing) {
        const res = insertEvent.run(
          associationUser.id,
          catId,
          ev.title,
          ev.slug,
          ev.description,
          ev.location,
          ev.address,
          ev.start_date,
          ev.end_date,
          ev.registration_deadline,
          ev.max_volunteers,
          ev.banner_image,
          now,
          now
        );
        eventId = res.lastInsertRowid;
      } else {
        eventId = existing.id;
        db.prepare(`
          UPDATE events 
          SET user_id = ?, category_id = ?, title = ?, description = ?, location = ?, address = ?, 
              start_date = ?, end_date = ?, registration_deadline = ?, max_volunteers = ?, 
              banner_image = ?, status = 'published', updated_at = ?
          WHERE id = ?
        `).run(
          associationUser.id,
          catId,
          ev.title,
          ev.description,
          ev.location,
          ev.address,
          ev.start_date,
          ev.end_date,
          ev.registration_deadline,
          ev.max_volunteers,
          ev.banner_image,
          now,
          eventId
        );
      }

      // Besoins (event_needs)
      if (ev.needs && ev.needs.length > 0) {
        const existingNeeds = db.prepare('SELECT id FROM event_needs WHERE event_id = ?').all(eventId);
        if (existingNeeds.length === 0) {
          const insertNeed = db.prepare(`
            INSERT INTO event_needs (
              event_id, type, title, description, target_quantity, current_quantity, unit, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const n of ev.needs) {
            insertNeed.run(
              eventId,
              n.type,
              n.title,
              n.description,
              n.target_quantity,
              n.current_quantity || 0,
              n.unit,
              now,
              now
            );
          }
        }
      }
    }

    console.log('[SEED ODD17] Événements ODD 17 Maroc insérés avec succès en base SQLite pour le compte association.');
    return { success: true };
  } catch (err) {
    console.error('[SEED ODD17 ERROR]:', err);
    return { error: err.message };
  }
}
