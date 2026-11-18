import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// --- DB (must be initialised before routes) ---
import './config/db.js';
import { seedODD17Events } from './scripts/seed_odd17.js';
// Run seed on server startup to ensure new events are inserted
seedODD17Events();

// --- Routes ---
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import eventActionRoutes from './routes/eventActions.routes.js';

// --- Controllers for simple routes ---
import { index as categories } from './controllers/category.controller.js';
import { store as contact } from './controllers/contact.controller.js';
import { stats, indicators } from './controllers/stats.controller.js';
import { ping } from './controllers/ping.controller.js';
import { cities } from './controllers/event.controller.js';
import { myParticipations, updateStatus as updateParticipationStatus, destroy as deleteParticipation } from './controllers/participation.controller.js';
import { myPartnerships, updateStatus as updatePartnershipStatus, destroy as deletePartnership } from './controllers/partnership.controller.js';
import * as userController from './controllers/user.controller.js';
import { index as dashboard } from './controllers/dashboard.controller.js';
import { protect } from './middleware/auth.js';
import { AppError, ValidationError } from './utils/errors.js';

const app = express();
const PORT = process.env.PORT || 5000;

// --- Global Middleware ---
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// --- API Routes ---
app.get('/api/ping', ping);
app.get('/api/seed-force', (req, res) => {
  try {
    const r = seedODD17Events();
    res.json({ message: 'Seeding executed', r });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get('/api/stats', stats);
app.get('/api/indicators', indicators);
app.get('/api/categories', categories);
app.get('/api/cities', cities);
app.post('/api/contact', contact);

app.use('/api', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/events', eventActionRoutes);

app.get('/api/my-participations', protect, myParticipations);
app.patch('/api/participations/:id/status', protect, updateParticipationStatus);
app.delete('/api/participations/:id', protect, deleteParticipation);

app.get('/api/my-partnerships', protect, myPartnerships);
app.patch('/api/partnerships/:id/status', protect, updatePartnershipStatus);
app.delete('/api/partnerships/:id', protect, deletePartnership);

app.get('/api/dashboard', protect, dashboard);

// Admin user management
app.get('/api/users', protect, userController.index);
app.patch('/api/users/:id/status', protect, userController.updateStatus);
app.delete('/api/users/:id', protect, userController.destroy);

// --- 404 ---
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// --- Global Error Handler ---
app.use((err, req, res, _next) => {
  if (err instanceof ValidationError) {
    return res.status(422).json({ message: err.message, errors: err.errors });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error('[Error]', err);
  res.status(500).json({ message: 'Erreur serveur interne.' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Node.js API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/ping\n`);
});
