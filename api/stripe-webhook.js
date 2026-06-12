const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const session = event.data.object;

  if (event.type === 'checkout.session.completed') {
    const { plan, firstName, lastName } = session.metadata;
    const email = session.customer_email || session.customer_details?.email;
    const customerId = session.customer;
    const baseUrl = process.env.SITE_URL || 'https://trainwithken.vercel.app';

    // ── Guide purchase (no subscription, just grant access) ──
    if (plan === 'glute-guide') {
      // Create or find existing user
      const { data: authData } = await supabase.auth.admin.createUser({
        email, email_confirm: true,
        user_metadata: { first_name: firstName || '', last_name: lastName || '' }
      });
      // Also try to find existing user if create failed
      let userId = authData?.user?.id;
      if (!userId) {
        const { data: existing } = await supabase.from('profiles').select('id').eq('email', email).single();
        userId = existing?.id;
      }
      if (userId) {
        await supabase.from('guide_purchases').upsert({
          user_id: userId, guide_slug: 'glute-ham-day', stripe_session_id: session.id
        }, { onConflict: 'user_id,guide_slug' });
        // Send access email
        if (process.env.RESEND_API_KEY) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'KJ — TrainWithKen <onboarding@resend.dev>',
              to: email,
              subject: 'Your Glute & Ham Day Guide — Access Inside',
              html: `<div style="font-family:Arial,sans-serif;max-width:600px;background:#0f0f0f;color:#f2f2f2;padding:40px;"><div style="border-top:3px solid #C9A84C;margin-bottom:28px;"></div><h1 style="color:#C9A84C;font-size:26px;letter-spacing:2px;margin-bottom:12px;">YOUR GUIDE IS READY</h1><p style="color:#aaa;margin-bottom:20px;">Thanks for your purchase. Your Glute & Hamstring Growth Day guide is now in your dashboard.</p><a href="${baseUrl}/auth/login.html" style="display:inline-block;background:#C9A84C;color:#080808;padding:14px 32px;font-weight:bold;letter-spacing:2px;text-decoration:none;margin-bottom:20px;">ACCESS MY DASHBOARD</a><p style="color:#555;font-size:12px;margin-top:24px;">TrainWithKen · trainwithken.fit</p></div>`
            })
          });
        }
      }
      return res.status(200).json({ received: true });
    }

    // ── Coaching plan purchase ──
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

    await supabase.from('profiles').upsert({
      id: userId, email,
      first_name: firstName, last_name: lastName,
      stripe_customer_id: customerId, plan, plan_status: 'active',
      start_date: new Date().toISOString().split('T')[0]
    });

    if (session.subscription) {
      const sub = await stripe.subscriptions.retrieve(session.subscription);
      await supabase.from('subscriptions').insert({
        user_id: userId, stripe_subscription_id: sub.id,
        stripe_customer_id: customerId, plan, status: sub.status,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString()
      });
    }

    const planLabels = { 'self-led': "The Coach's Curriculum", 'online': 'Online Coaching', 'vip': 'Competition Prep Coaching', 'group': 'Small Group Training' };
    if (process.env.RESEND_API_KEY) {
      const baseUrl = process.env.SITE_URL || 'https://trainwithken.vercel.app';
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'KJ — TrainWithKen <onboarding@resend.dev>',
          to: email,
          subject: `Welcome to TrainWithKen — ${planLabels[plan]}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#f2f2f2;padding:40px;"><div style="border-top:3px solid #C9A84C;margin-bottom:32px;"></div><h1 style="font-size:28px;color:#C9A84C;letter-spacing:2px;">WELCOME TO TRAINWITHKEN</h1><p style="color:#aaa;margin-bottom:16px;">Hey ${firstName}, you're in. Your <strong style="color:#f2f2f2;">${planLabels[plan]}</strong> is active.</p><p style="color:#aaa;margin-bottom:24px;">Set up your password to access your coaching dashboard:</p><a href="${baseUrl}/auth/setup.html" style="display:inline-block;background:#C9A84C;color:#080808;padding:14px 32px;font-weight:bold;letter-spacing:2px;text-decoration:none;">SET UP MY ACCOUNT</a><p style="color:#555;font-size:12px;margin-top:32px;">TrainWithKen · trainwithken.fit · Houston TX</p></div>`
        })
      });
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'TrainWithKen Payments <onboarding@resend.dev>',
          to: process.env.NOTIFY_EMAIL || 'kenjones29@gmail.com',
          subject: `New ${planLabels[plan]} — ${firstName} ${lastName}`,
          html: `<p>New client: <strong>${firstName} ${lastName}</strong> (${email}) signed up for <strong>${planLabels[plan]}</strong>.</p>`
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
};
