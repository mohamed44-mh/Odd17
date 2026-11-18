import { Router } from 'express';
import { store as participate, myParticipations } from '../controllers/participation.controller.js';
import { store as proposeParnertship, myPartnerships } from '../controllers/partnership.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.post('/:id/participate', protect, participate);
router.post('/:id/partnerships', protect, proposeParnertship);
export default router;
