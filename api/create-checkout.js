const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  'self-led': { name: 'Self-Led System', amount: 9700, mode: 'payment', priceId: process.env.STRIPE_PRICE_SELF_LED },
  'online':   { name: 'Online Coaching', amount: 29700, mode: 'subscription', priceId: process.env.STRIPE_PRICE_ONLINE },
  'vip':      { name: 'VIP Elite Access', amount: 59700, mode: 'subscription', priceId: process.env.STRIPE_PRICE_VIP }
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { plan, email, firstName, lastName } = req.body;
  const planConfig = PLANS[plan];
  if (!planConfig) return res.status(400).json({ error: 'Invalid plan' });

  const baseUrl = process.env.SITE_URL || 'https://trainwithken.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: planConfig.mode,
      customer_email: email || undefined,
      metadata: { plan, firstName: firstName || '', lastName: lastName || '' },
      success_url: `${baseUrl}/auth/setup.html?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${baseUrl}/pages/programs.html`,
      line_items: planConfig.priceId
        ? [{ price: planConfig.priceId, quantity: 1 }]
        : [{
            price_data: {
              currency: 'usd',
              product_data: { name: planConfig.name },
              unit_amount: planConfig.amount,
              ...(planConfig.mode === 'subscription' ? { recurring: { interval: 'month' } } : {})
            },
            quantity: 1
          }]
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
