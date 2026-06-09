module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { plan } = req.body;
  const PLANS = {
    'self-led': { priceId: process.env.STRIPE_PRICE_SELF_LED, mode: 'payment' },
    'online':   { priceId: process.env.STRIPE_PRICE_ONLINE,   mode: 'subscription' },
    'vip':      { priceId: process.env.STRIPE_PRICE_VIP,      mode: 'subscription' },
    'group':    { priceId: process.env.STRIPE_PRICE_GROUP,     mode: 'subscription' }
  };

  const planConfig = PLANS[plan];
  if (!planConfig) return res.status(400).json({ error: 'Invalid plan' });

  const baseUrl = 'https://trainwithken.vercel.app';
  const key = process.env.STRIPE_SECRET_KEY;

  // Build form-encoded body for Stripe REST API
  const params = new URLSearchParams({
    mode: planConfig.mode,
    success_url: `${baseUrl}/auth/setup.html?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
    cancel_url: `${baseUrl}/pages/programs.html`,
    'line_items[0][price]': planConfig.priceId,
    'line_items[0][quantity]': '1',
    'metadata[plan]': plan
  });

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Stripe API error:', data);
      return res.status(500).json({ error: data.error?.message || 'Stripe error' });
    }

    return res.status(200).json({ url: data.url });
  } catch (err) {
    console.error('Fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
