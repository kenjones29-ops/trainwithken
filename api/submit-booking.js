const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firstName, lastName, email, phone, service, date, time, goal, source } = req.body;
  if (!firstName || !lastName || !email || !service) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { error: dbError } = await supabase.from('bookings').insert({
    first_name: firstName, last_name: lastName, email,
    phone: phone || null, service,
    preferred_date: date || null, preferred_time: time || null,
    goal: goal || null, source: source || null
  });

  if (dbError) {
    console.error('Supabase error:', dbError);
    return res.status(500).json({ error: 'Failed to save booking' });
  }

  if (process.env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'TrainWithKen Bookings <onboarding@resend.dev>',
        to: 'Trainwithken@outlook.com',
        subject: `New Booking â€” ${service} â€” ${firstName} ${lastName}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;background:#0f0f0f;color:#f2f2f2;padding:40px;"><div style="border-top:3px solid #C9A84C;margin-bottom:24px;"></div><h2 style="color:#C9A84C;letter-spacing:2px;">NEW BOOKING REQUEST</h2><table style="width:100%;border-collapse:collapse;margin-top:16px;"><tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;width:120px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #222;">${firstName} ${lastName}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;">Email</td><td style="padding:10px 0;border-bottom:1px solid #222;"><a href="mailto:${email}" style="color:#C9A84C;">${email}</a></td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #222;">${phone || 'â€”'}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;">Service</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#C9A84C;font-weight:bold;">${service}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;">Date</td><td style="padding:10px 0;border-bottom:1px solid #222;">${date || 'â€”'}</td></tr><tr><td style="padding:10px 0;color:#777;">Goal</td><td style="padding:10px 0;">${goal || 'â€”'}</td></tr></table></div>`
      })
    });
  }

  return res.status(200).json({ success: true });
};
