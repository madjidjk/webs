document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const menuToggleButton = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggleButton && navLinks) {
    menuToggleButton.addEventListener('click', () => {
      const willOpen = !navLinks.classList.contains('open');
      navLinks.classList.toggle('open', willOpen);
      menuToggleButton.setAttribute('aria-expanded', String(willOpen));
    });
  }

  // Smooth scroll for in-page links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          navLinks?.classList.remove('open');
          menuToggleButton?.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach((item) => {
    const button = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (button && answer) {
      button.addEventListener('click', () => {
        const isOpen = item.classList.toggle('open');
        button.setAttribute('aria-expanded', String(isOpen));
      });
    }
  });

  // Footer year
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }

  // Success notice after returning from checkout
  const params = new URLSearchParams(location.search);
  if (params.get('thanks') === '1') {
    alert('تم إرسال طلبك بنجاح! سنتواصل معك عبر البريد قريبًا.');
    params.delete('thanks');
    const url = `${location.pathname}${params.toString() ? '?' + params.toString() : ''}${location.hash}`;
    history.replaceState({}, '', url);
  }

  // Promo banner: show once per session
  const banner = document.getElementById('topBanner');
  const bannerClosed = sessionStorage.getItem('bannerClosed') === '1';
  if (banner && !bannerClosed) {
    banner.classList.remove('hidden');
    const closeBtn = document.getElementById('closeBanner');
    closeBtn?.addEventListener('click', () => {
      banner.classList.add('hidden');
      sessionStorage.setItem('bannerClosed', '1');
    });
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealEls.forEach((el) => io.observe(el));

  // Parallax-ish hero background based on mouse
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    const handleMove = (e) => {
      const rect = document.body.getBoundingClientRect();
      const x = (e.clientX - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.height / 2) / rect.height;
      heroBg.style.transform = `translate(${x * 14}px, ${y * 10}px)`;
    };
    window.addEventListener('mousemove', handleMove);
  }

  // Button ripple on click
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const circle = document.createElement('span');
      const diameter = Math.max(this.clientWidth, this.clientHeight);
      const radius = diameter / 2;
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - (this.getBoundingClientRect().left + radius)}px`;
      circle.style.top = `${e.clientY - (this.getBoundingClientRect().top + radius)}px`;
      circle.classList.add('ripple');
      const ripple = this.querySelector('.ripple');
      if (ripple) ripple.remove();
      this.appendChild(circle);
    });
  });
});


