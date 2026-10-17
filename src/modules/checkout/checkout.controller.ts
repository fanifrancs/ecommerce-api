import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { createCheckoutSession, stripe } from './checkout.service.js';
import { createOrder } from '../orders/order.service.js';
import { getCartByUserId, clearCart } from '../cart/cart.service.js';

export async function handleCreateCheckoutSession(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });

    const sessionUrl = await createCheckoutSession(userId);
    return res.status(200).json({ url: sessionUrl });
  } catch (err: any) {
    console.error('Checkout session error:', err.message);
    return res.status(400).json({ message: err.message || 'Failed to create checkout session' });
  }
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ message: 'Missing stripe-signature header' });
  }

  let event;

  try {
    // Note: req.body must be raw Buffer for signature verification
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    if (userId) {
      try {
        const cartItems = await getCartByUserId(userId);

        if (cartItems.length > 0) {
          const orderItems = cartItems.map((item) => ({
            productId: item.product_id,
            quantity: item.quantity,
          }));

          // Run ACID transaction: create order, order_items, decrement inventory
          await createOrder(userId, orderItems);

          // Clear persistent user cart
          await clearCart(userId);
        }
      } catch (orderErr) {
        console.error('Failed to fulfill order from webhook:', orderErr);
        return res.status(500).json({ message: 'Order fulfillment failed' });
      }
    }
  }

  return res.status(200).json({ received: true });
}