import Stripe from 'stripe';
import { getCartByUserId } from '../cart/cart.service.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-09-30.endive',
});

export async function createCheckoutSession(userId: string) {
  const cartItems = await getCartByUserId(userId);

  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cannot initiate checkout with an empty cart');
  }

  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.product_name,
      },
      unit_amount: Math.round(parseFloat(item.price) * 100), // convert dollars to cents
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:3000/checkout/cancel`,
    metadata: {
      userId,
    },
  });

  return session.url;
}

export { stripe };