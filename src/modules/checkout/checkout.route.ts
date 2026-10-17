import express, { Router } from 'express';
import {
  handleCreateCheckoutSession,
  handleStripeWebhook,
} from './checkout.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

// Endpoint for authenticated users to generate a Stripe Checkout URL
router.post('/create-session', authenticateToken, handleCreateCheckoutSession);

// Webhook endpoint called directly by Stripe (requires raw body parser)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;