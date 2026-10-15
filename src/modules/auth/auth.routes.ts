import { Router } from 'express';
import { registerHandler, loginHandler } from './auth.controller.js';
import { authenticateToken, AuthenticatedRequest } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);

router.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({
    message: 'Protected profile retrieved successfully',
    user: req.user,
  });
});

export default router;