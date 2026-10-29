import Stripe from 'stripe';
import { getCartByUserId } from '../cart/cart.service.js';

/* 
  This module initializes the official Stripe SDK using your secret API key
  and a locked API version to ensure predictable behavior. The function
  createCheckoutSession first queries the user's shopping cart, throwing an
  error if the cart is empty or missing to prevent invalid checkouts.

  Next, it uses the .map() method to transform database cart items into the
  exact nested structure required by Stripe's line_items array. For each
  item, it sets the currency, product name, quantity, and unit_amount.
  Because Stripe expects amounts in the smallest currency unit, it multiplies
  prices by 100 and wraps them in Math.round() to safely convert dollars into
  cents while preventing floating-point precision errors.

  It then calls stripe.checkout.sessions.create to generate a hosted payment
  page, passing in the formatted line items, payment mode, redirection URLs
  with a dynamic session ID placeholder, and metadata containing the userId
  so it can be retrieved later by webhooks.

  Finally, it returns the session.url string, which your backend controller
  sends back to the frontend to seamlessly redirect the user's browser to
  Stripe's secure payment portal.
*/

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-09-30.endive',
});

export async function createCheckoutSession(userId: string) {
  const cartItems = await getCartByUserId(userId);

  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cannot initiate checkout with an empty cart');
  }

  /* 
    The lineItems array transforms database cart items into the structured 
    format required by Stripe's Checkout API. For each product, it maps 
    properties into price_data (specifying currency, product name, and 
    unit_amount in cents) along with the purchased quantity.

    Instead of accepting a pre-calculated lump-sum total from the backend—which 
    could risk security vulnerabilities or price tampering—Stripe calculates 
    the grand total automatically on its servers. It multiplies each item's 
    unit_amount by its quantity and sums them all up. For instance, purchasing 
    multiple items like a mouse, keyboard, and hub results in Stripe 
    computing the exact sum in cents to display a clean receipt breakdown 
    and securely charge the correct grand total.
  */
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