import { Router } from 'express';
import { index, show, store, update, destroy, cities } from '../controllers/event.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', index);
router.get('/cities', cities);
router.get('/:idOrSlug', optionalAuth, show);
router.post('/', protect, store);
router.put('/:id', protect, update);
router.delete('/:id', protect, destroy);
export default router;
