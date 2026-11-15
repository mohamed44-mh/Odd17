import db from '../config/db.js';

const cols = db.prepare('PRAGMA table_info(users)').all().map(c => c.name);

const fieldsToAdd = [
  'phone',
  'city',
  'bio',
  'skills',
  'availability',
  'experience_level',
];

for (const field of fieldsToAdd) {
  if (!cols.includes(field)) {
    db.prepare(`ALTER TABLE users ADD COLUMN ${field} TEXT`).run();
    console.log(`Added column ${field}`);
  } else {
    console.log(`Column ${field} already exists.`);
  }
}

// Add some nice sample profile data for existing sample volunteers (like Sophie Martin) so it looks great immediately!
db.prepare(`
  UPDATE users 
  SET phone = COALESCE(phone, '06 55 44 33 22'),
      city = COALESCE(city, 'Marseille'),
      bio = COALESCE(bio, 'Passionnée par la protection de l''environnement et l''entraide citoyenne. Active dans plusieurs actions associatives locales depuis 3 ans.'),
      skills = COALESCE(skills, 'Animation d''ateliers, Logistique événementielle, Premiers secours (PSC1), Réseaux sociaux'),
      availability = COALESCE(availability, 'Week-ends et vendredis après-midi'),
      experience_level = COALESCE(experience_level, 'Bénévole régulier (2+ ans d''expérience)')
  WHERE email = 'sophie.martin@email.fr'
`).run();

db.prepare(`
  UPDATE users 
  SET phone = COALESCE(phone, '06 44 33 22 11'),
      city = COALESCE(city, 'Biarritz'),
      bio = COALESCE(bio, 'Surfeur et bénévole engagé pour la propreté de nos plages et littoraux. Disponible pour toutes les actions terrain et le transport de matériel.'),
      skills = COALESCE(skills, 'Tri des déchets, Chantiers participatifs, Conduite logistique (Permis B), Travail d''équipe'),
      availability = COALESCE(availability, 'Samedis et dimanches toute la journée'),
      experience_level = COALESCE(experience_level, 'Bénévole expérimenté (5+ ans d''expérience)')
  WHERE email = 'thomas.leroy@email.fr'
`).run();

db.prepare(`
  UPDATE users 
  SET phone = COALESCE(phone, '06 77 88 99 00'),
      city = COALESCE(city, 'Paris'),
      bio = COALESCE(bio, 'Enseignante et formatrice numérique. J''aime transmettre mes compétences pour lutter contre l''isolement et la fracture numérique.'),
      skills = COALESCE(skills, 'Pédagogie, Informatique & Internet, Écoute active, Accueil du public'),
      availability = COALESCE(availability, 'Mercredis et samedis'),
      experience_level = COALESCE(experience_level, 'Bénévole actif')
  WHERE email = 'yasmine.b@email.fr'
`).run();

console.log('Migration & sample profile data successfully updated!');
