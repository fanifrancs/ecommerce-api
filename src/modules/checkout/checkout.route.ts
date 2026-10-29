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
/* 
  This route configuration sets up an HTTP POST endpoint at '/webhook' to 
  handle automated event notifications sent from external payment services 
  like Stripe when important actions occur, such as a successful payment.

  It uses a crucial middleware, express.raw({ type: 'application/json' }), 
  which parses the incoming request body as raw binary data or a Buffer 
  instead of automatically converting it into a standard JavaScript object 
  via express.json(). This is essential because Stripe attaches a security 
  signature header (Stripe-Signature) to verify the payload's authenticity. 
  To prevent cryptographic hash verification from failing, your backend 
  needs the exact, unformatted raw bytes as Stripe sent them; parsing 
  or reformatting the body beforehand would break the signature check.

  Finally, once the raw body has been safely captured, it passes control 
  to the custom controller function handleStripeWebhook, which verifies 
  the signature using Stripe's SDK and updates the database accordingly.
*/
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;