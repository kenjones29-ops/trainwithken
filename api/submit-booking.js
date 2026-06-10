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

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // Insert directly via Supabase REST API — no SDK, no imports
    const insert = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        service,
        preferred_date: date || null,
        preferred_time: time || null,
        goal: goal || null,
        source: source || null
      })
    });

    if (!insert.ok) {
      const err = await insert.text();
      console.error('Supabase error:', err);
      return res.status(500).json({ error: 'Failed to save booking' });
    }

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'TrainWithKen Bookings <onboarding@resend.dev>',
          to: process.env.NOTIFY_EMAIL || 'kenjones29@gmail.com',
          subject: `New Booking - ${service} - ${firstName} ${lastName}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;background:#0f0f0f;color:#f2f2f2;padding:40px;"><div style="border-top:3px solid #C9A84C;margin-bottom:24px;"></div><h2 style="color:#C9A84C;letter-spacing:2px;">NEW BOOKING REQUEST</h2><table style="width:100%;border-collapse:collapse;margin-top:16px;"><tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;width:120px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #222;">${firstName} ${lastName}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;">Email</td><td style="padding:10px 0;border-bottom:1px solid #222;"><a href="mailto:${email}" style="color:#C9A84C;">${email}</a></td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #222;">${phone || 'N/A'}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;">Service</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#C9A84C;font-weight:bold;">${service}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;">Date</td><td style="padding:10px 0;border-bottom:1px solid #222;">${date || 'N/A'}</td></tr><tr><td style="padding:10px 0;color:#777;">Goal</td><td style="padding:10px 0;">${goal || 'N/A'}</td></tr></table></div>`
        })
      });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
