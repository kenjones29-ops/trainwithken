// Nav scroll effect
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.style.borderBottomColor = window.scrollY > 40
    ? 'rgba(201,168,76,0.25)'
    : 'rgba(201,168,76,0.12)';
});

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Active nav link
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href').split('/').pop();
  if (href === currentPath) link.classList.add('active');
});

// Booking form handler — POSTs JSON to /api/submit-booking
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = bookingForm.querySelector('button[type="submit"]');
    btn.textContent = 'SENDING…';
    btn.disabled = true;
    try {
      const res = await fetch('/api/submit-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: bookingForm.firstName.value,
          lastName:  bookingForm.lastName.value,
          email:     bookingForm.email.value,
          phone:     bookingForm.phone.value,
          service:   bookingForm.service.value,
          date:      bookingForm.date.value,
          time:      bookingForm.time.value,
          goal:      bookingForm.goal.value,
          source:    bookingForm.source.value
        })
      });
      if (res.ok) {
        bookingForm.style.display = 'none';
        document.getElementById('bookingSuccess').style.display = 'block';
      } else {
        btn.textContent = 'ERROR — TRY AGAIN';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'ERROR — TRY AGAIN';
      btn.disabled = false;
    }
  });
}

// Simulated IG feed
const igGrid = document.getElementById('igGrid');
if (igGrid) {
  const captions = [
    'CHEST DAY 💪 full protocol in bio',
    'IFBB PRO MINDSET — no days off',
    'BACK & BICEPS — heavy pull session',
    'MORNING CARDIO — fasted, focused',
    'NUTRITION PREP — ounce-based macros',
    'POSING PRACTICE — 2026 Olympia prep',
    'LEG DAY — quad focused superset',
    'CLIENT CHECK-IN — results don\'t lie',
    'RECOVERY — Kure Wellness protocol',
    'SHOULDER CIRCUIT — complete 3D delt',
    'MEAL PREP SUNDAY — staying on track',
    'H-TWN BRED — @trainwithken'
  ];
  captions.forEach((cap, i) => {
    const cell = document.createElement('a');
    cell.href = 'https://www.instagram.com/trainwithken';
    cell.target = '_blank';
    cell.rel = 'noopener';
    cell.className = 'ig-cell';
    cell.innerHTML = `
      <div class="ig-placeholder">
        <span class="ig-num">${String(i + 1).padStart(2, '0')}</span>
        <div class="ig-cap">${cap}</div>
        <div class="ig-overlay"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></div>
      </div>`;
    igGrid.appendChild(cell);
  });
}

// Intersection observer fade-in
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
