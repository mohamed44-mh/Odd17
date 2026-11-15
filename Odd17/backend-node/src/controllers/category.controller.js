import db from '../config/db.js';
import { seedODD17Events } from '../scripts/seed_odd17.js';

/** GET /api/categories */
export function index(req, res) {
  try {
    seedODD17Events();
  } catch (e) {
    console.error('Seed in category failed:', e);
  }
  const dbCategories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
  
  // Garantir les catégories clés ODD 17 Maroc
  const defaultCats = [
    { id: 10, name: "Éducation & Formation", slug: "education-formation" },
    { id: 11, name: "Environnement & Climat", slug: "environnement-climat" },
    { id: 12, name: "Partenariats ODD 17", slug: "partenariats-odd17" },
    { id: 13, name: "Santé & Solidarité", slug: "sante-solidarite" },
    { id: 14, name: "Agriculture & Eau Durable", slug: "agriculture-eau" },
    { id: 15, name: "Inclusion & Économie Sociale", slug: "inclusion-sociale" }
  ];

  const catNames = new Set(dbCategories.map(c => c.name));
  const merged = [...dbCategories];
  for (const dc of defaultCats) {
    if (!catNames.has(dc.name)) {
      merged.push(dc);
    }
  }

  res.json(merged);
}
