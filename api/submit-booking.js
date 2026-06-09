import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    firstName, lastName, email, phone,
    service, date, time, goal, source
  } = req.body;

  if (!firstName || !lastName || !email || !service) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Save to Supabase
  const { error: dbError } = await supabase.from('bookings').insert({
    first_name: firstName,
    last_name: lastName,
    email,
    phone: phone || null,
    service,
    preferred_date: date || null,
    preferred_time: time || null,
    goal: goal || null,
    source: source || null
  });

  if (dbError) {
    console.error('Supabase error:', dbError);
    return res.status(500).json({ error: 'Failed to save booking' });
  }

  // Send email notification via Resend
  if (process.env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'TrainWithKen Bookings <bookings@trainwithken.fit>',
        to: 'Trainwithken@outlook.com',
        subject: `New Booking Request — ${service} — ${firstName} ${lastName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#f2f2f2;padding:40px;">
            <div style="border-top:3px solid #C9A84C;margin-bottom:32px;"></div>
            <h1 style="font-size:28px;color:#C9A84C;letter-spacing:2px;margin-bottom:8px;">NEW BOOKING REQUEST</h1>
            <p style="color:#aaa;margin-bottom:32px;">Submitted via trainwithken.fit</p>

            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;width:140px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#f2f2f2;">${firstName} ${lastName}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;">Email</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#f2f2f2;"><a href="mailto:${email}" style="color:#C9A84C;">${email}</a></td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#f2f2f2;">${phone || '—'}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;">Service</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#C9A84C;font-weight:bold;">${service}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;">Date</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#f2f2f2;">${date || '—'}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;">Time</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#f2f2f2;">${time || '—'}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #222;color:#777;">Goal</td><td style="padding:10px 0;border-bottom:1px solid #222;color:#f2f2f2;">${goal || '—'}</td></tr>
              <tr><td style="padding:10px 0;color:#777;">Source</td><td style="padding:10px 0;color:#f2f2f2;">${source || '—'}</td></tr>
            </table>

            <div style="margin-top:32px;padding:16px;background:#161616;border-left:3px solid #C9A84C;">
              <p style="margin:0;color:#aaa;font-size:13px;">Reply directly to <a href="mailto:${email}" style="color:#C9A84C;">${email}</a> to respond to this booking.</p>
            </div>
            <div style="border-top:1px solid #222;margin-top:32px;padding-top:16px;">
              <p style="color:#555;font-size:11px;margin:0;">TrainWithKen · trainwithken.fit · Houston TX</p>
            </div>
          </div>
        `
      })
    });
  }

  return res.status(200).json({ success: true });
}
