import db from '../config/db.js';
import { seedODD17Events } from '../scripts/seed_odd17.js';

/** GET /api/stats */
export function stats(req, res) {
  seedODD17Events();
  const eventsCount = db.prepare("SELECT COUNT(*) as cnt FROM events WHERE status = 'published'").get().cnt;
  const associationsCount = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'association' AND status = 'active'").get().cnt;
  const enterprisesCount = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'enterprise' AND status = 'active'").get().cnt;
  const volunteersCount = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'volunteer' AND status = 'active'").get().cnt;
  const participationsCount = db.prepare("SELECT COUNT(*) as cnt FROM participation_requests WHERE status = 'accepted'").get().cnt;
  const partnershipsCount = db.prepare("SELECT COUNT(*) as cnt FROM partnership_requests WHERE status = 'accepted'").get().cnt;
  const totalFundsCollected = parseFloat(
    db.prepare("SELECT COALESCE(SUM(proposed_value), 0) as total FROM partnership_requests WHERE status = 'accepted' AND type = 'financial'").get().total
  );

  res.json({
    events_count: eventsCount,
    associations_count: associationsCount,
    enterprises_count: enterprisesCount,
    volunteers_count: volunteersCount,
    participations_count: participationsCount,
    partnerships_count: partnershipsCount,
    total_funds_collected: totalFundsCollected,
  });
}

/** GET /api/indicators */
export function indicators(req, res) {
  const totalPublishedEvents = db.prepare("SELECT COUNT(*) as cnt FROM events WHERE status = 'published'").get().cnt;
  const acceptedPartnershipsCount = db.prepare("SELECT COUNT(*) as cnt FROM partnership_requests WHERE status = 'accepted'").get().cnt;

  const eventsWithPartnerCount = db.prepare(`
    SELECT COUNT(DISTINCT e.id) as cnt
    FROM events e
    JOIN partnership_requests pr ON pr.event_id = e.id
    WHERE e.status = 'published' AND pr.status = 'accepted'
  `).get().cnt;

  const partneredPercentage = totalPublishedEvents > 0
    ? Math.round((eventsWithPartnerCount / totalPublishedEvents) * 1000) / 10
    : 0;

  const totalVolunteersMobilized = db.prepare("SELECT COUNT(*) as cnt FROM participation_requests WHERE status = 'accepted'").get().cnt;

  res.json({
    accepted_partnerships_count: acceptedPartnershipsCount,
    events_with_partner_count: eventsWithPartnerCount,
    total_published_events: totalPublishedEvents,
    partnered_events_percentage: partneredPercentage,
    total_volunteers_mobilized: totalVolunteersMobilized,
  });
}
