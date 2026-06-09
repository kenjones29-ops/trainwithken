import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(typeof c === 'string' ? Buffer.from(c) : c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const rawBody = await getRawBody(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const session = event.data.object;

  if (event.type === 'checkout.session.completed') {
    const { plan, firstName, lastName } = session.metadata;
    const email = session.customer_email || session.customer_details?.email;
    const customerId = session.customer;

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName }
    });

    if (authError && authError.message !== 'User already registered') {
      console.error('Auth error:', authError);
      return res.status(500).json({ error: authError.message });
    }

    const userId = authData?.user?.id;
    if (!userId) return res.status(200).end();

    // Update profile with plan + Stripe customer
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      stripe_customer_id: customerId,
      plan,
      plan_status: 'active',
      start_date: new Date().toISOString().split('T')[0]
    });

    // Save subscription if recurring
    if (session.subscription) {
      const sub = await stripe.subscriptions.retrieve(session.subscription);
      await supabase.from('subscriptions').insert({
        user_id: userId,
        stripe_subscription_id: sub.id,
        stripe_customer_id: customerId,
        plan,
        status: sub.status,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString()
      });
    }

    // Send welcome email via Resend
    if (process.env.RESEND_API_KEY) {
      const planLabels = { 'self-led': 'Self-Led System', 'online': 'Online Coaching', 'vip': 'VIP Elite Access' };
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'KJ — TrainWithKen <noreply@trainwithken.fit>',
          to: email,
          subject: `Welcome to TrainWithKen — ${planLabels[plan]}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#f2f2f2;padding:40px;">
              <div style="border-top:3px solid #C9A84C;margin-bottom:32px;"></div>
              <h1 style="font-family:sans-serif;font-size:28px;color:#C9A84C;letter-spacing:2px;">WELCOME TO TRAINWITHKEN</h1>
              <p style="color:#aaa;">Hey ${firstName}, you're in. Your <strong style="color:#f2f2f2;">${planLabels[plan]}</strong> is active.</p>
              <p style="color:#aaa;">Set up your password and access your dashboard:</p>
              <a href="https://trainwithken.fit/auth/setup.html" style="display:inline-block;background:#C9A84C;color:#080808;padding:14px 32px;font-weight:bold;letter-spacing:2px;text-decoration:none;margin:16px 0;">SET UP MY ACCOUNT</a>
              <p style="color:#555;font-size:12px;margin-top:32px;">TrainWithKen · trainwithken.fit · Houston TX</p>
            </div>`
        })
      });

      // Notify KJ
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'TrainWithKen Payments <noreply@trainwithken.fit>',
          to: 'Trainwithken@outlook.com',
          subject: `💰 New ${planLabels[plan]} — ${firstName} ${lastName}`,
          html: `<p>New client signed up: <strong>${firstName} ${lastName}</strong> (${email}) — <strong>${planLabels[plan]}</strong></p>`
        })
      });
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = session;
    await supabase.from('subscriptions')
      .update({ status: sub.status, current_period_end: new Date(sub.current_period_end * 1000).toISOString() })
      .eq('stripe_subscription_id', sub.id);

    await supabase.from('profiles')
      .update({ plan_status: sub.status === 'active' ? 'active' : sub.status })
      .eq('stripe_customer_id', sub.customer);
  }

  return res.status(200).json({ received: true });
}
