/* Header: shrink when scrolled, hide on scroll down, show on scroll up, mark the active section. Runs without GSAP. */
(() => {
  const bar = document.querySelector('.site-header'); if (!bar) return;
  let last = window.scrollY;
  const update = () => {
    const y = window.scrollY, dy = y - last;
    bar.classList.toggle('is-scrolled', y > 20);
    if (y < 160 || dy < -6) bar.classList.remove('is-hidden');
    else if (dy > 6) bar.classList.add('is-hidden');
    if (Math.abs(dy) > 6 || y < 160) last = y;
  };
  window.addEventListener('scroll', update, { passive: true }); update();
  const links = [...document.querySelectorAll('.site-header nav a[href^="#"]:not(.nav-contact)')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id)));
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) io.observe(s); });
  }
})();

/* GSAP 3.13 + Lenis: aggressive, replaying scroll motion. Every reveal runs again each time it re-enters the viewport. */
(() => {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  let media = null, generation = 0;
  const dispose = () => { generation++; if (media) media.revert(); media = null; };

  async function mount() {
    dispose();
    const current = generation;
    await document.fonts.ready;
    if (current !== generation) return;
    media = gsap.matchMedia();
    media.add({
      motion: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 901px)',
      pointer: '(hover: hover) and (pointer: fine)'
    }, ctx => {
      if (!ctx.conditions.motion) return;
      const d = ctx.conditions.desktop, dist = d ? 70 : 34;
      const cleanups = [], splits = [];
      const $ = s => gsap.utils.toArray(s);
      const on = (el, t, fn) => { el.addEventListener(t, fn); cleanups.push(() => el.removeEventListener(t, fn)); };
      // Replays: plays on enter, reverses on leave, in both scroll directions.
      const st = (trigger, extra = {}) => ({ trigger, start: 'top 88%', toggleActions: 'play reverse play reverse', ...extra });
      const scrub = (trigger, extra = {}) => ({ trigger, start: 'top bottom', end: 'bottom top', scrub: true, ...extra });
      document.documentElement.classList.add('motion-on');

      /* Smooth scroll */
      if (window.Lenis) {
        const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
        lenis.on('scroll', ScrollTrigger.update);
        const tick = t => lenis.raf(t * 1000);
        gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
        $('a[href^="#"]').forEach(a => on(a, 'click', e => {
          const id = a.getAttribute('href'), target = id.length > 1 ? document.querySelector(id) : 0;
          if (id.length > 1 && !target) return;
          e.preventDefault(); lenis.scrollTo(target || 0, { offset: -80, duration: 1.5 });
        }));
        const dlg = document.getElementById('contact-dialog');
        if (dlg) { dlg.setAttribute('data-lenis-prevent', ''); on(document.getElementById('contact-button'), 'click', () => lenis.stop()); on(dlg, 'close', () => lenis.start()); }
        cleanups.push(() => { gsap.ticker.remove(tick); lenis.destroy(); });
      }

      gsap.from('.site-header .brand, .site-header nav > *', { y: -24, opacity: 0, duration: 0.9, stagger: 0.07, delay: 0.15, ease: 'expo.out' });

      /* Progress bar */
      gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

      /* Hero: entrance replays whenever you return to the top, scrubbed exit going down */
      const h1 = SplitText.create('.hero h1', { type: 'words,chars', wordsClass: 'split-word', charsClass: 'split-char', aria: 'auto' });
      splits.push(h1);
      const hero = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from(h1.chars, { yPercent: 130, rotate: 10, opacity: 0, duration: 1.1, stagger: 0.03, ease: 'expo.out' })
        .from(['.hero .eyebrow', '.hero .intro', '.hero-art', '.hero-bottom'], { y: dist, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.25)
        .from('.portrait-main', { clipPath: 'inset(100% 0 0 0)', duration: 1.5, ease: 'expo.inOut' }, 0.1);
      // Replay only the headline letters when you come back to the very top; the intro text is never touched again.
      ScrollTrigger.create({ trigger: '.hero', start: 'top -80px', onLeaveBack: () => gsap.fromTo(h1.chars, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.02, ease: 'expo.out', overwrite: 'auto' }) });
      const exit = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero h1', { yPercent: -10, ease: 'none', scrollTrigger: exit });
      gsap.to('.portrait-main', { yPercent: d ? 10 : 4, scale: 0.94, ease: 'none', scrollTrigger: exit });
      gsap.to('.hero-art', { yPercent: -20, ease: 'none', scrollTrigger: exit });

      const nine = (n, p) => String(Math.round(n)).padStart(2, '0');

      /* HERO: letters rise in, then the whole hero zooms out and drifts up (set above) */

      /* TENTANG: iris reveal + focus-pull headline + words lighting up */
      const heading = (id, build) => {
        const h = document.querySelector('#' + id + ' h2'); if (!h) return;
        splits.push(SplitText.create(h, { type: 'lines,words,chars', mask: 'lines', aria: 'auto', autoSplit: true,
          onSplit: self => build(self, h) }));
      };
      heading('tentang', (s, h) => gsap.from(s.words, { opacity: 0, filter: 'blur(18px)', scale: 1.35, duration: 1.2, stagger: 0.08, ease: 'power2.out', scrollTrigger: st(h, { start: 'top 90%' }) }));
      const pa = document.querySelector('.portrait-about');
      if (pa) {
        gsap.fromTo(pa, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(80% at 50% 50%)', duration: 1.6, ease: 'expo.out', scrollTrigger: st(pa, { start: 'top 85%' }) });
        gsap.fromTo('.portrait-about img', { scale: 1.4, yPercent: -9 }, { scale: 1, yPercent: 9, ease: 'none', scrollTrigger: scrub(pa) });
      }
      $('.education > :not(.portrait-about)').forEach(el => gsap.from(el, { opacity: 0, filter: 'blur(10px)', y: 24, duration: 1, scrollTrigger: st(el) }));
      $('.about-copy p').forEach(p => {
        const sp = SplitText.create(p, { type: 'words', aria: 'auto' }); splits.push(sp);
        gsap.from(sp.words, { opacity: 0.1, stagger: 0.06, ease: 'none', scrollTrigger: { trigger: p, start: 'top 82%', end: 'bottom 48%', scrub: true } });
      });

      /* PENGALAMAN: 3D card flips up from the floor, one after another */
      heading('pengalaman', (s, h) => gsap.from(s.lines, { yPercent: 130, rotateX: -60, transformOrigin: '50% 100%', duration: 1.2, stagger: 0.14, ease: 'expo.out', scrollTrigger: st(h, { start: 'top 90%' }) }));
      $('.experience').forEach(row => {
        gsap.from(row, { rotateX: -75, y: 110, opacity: 0, transformPerspective: 1100, transformOrigin: '50% 0%', duration: 1.3, ease: 'expo.out', scrollTrigger: st(row, { start: 'top 90%' }) });
        gsap.from(row, { '--l': 0, duration: 1.6, ease: 'expo.out', scrollTrigger: st(row, { start: 'top 90%' }) });
        gsap.from(row.querySelectorAll('li'), { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: st(row, { start: 'top 75%' }) });
      });

      /* KEAHLIAN: flickering headline, cards pop with a bounce, numbers count up */
      heading('keahlian', (s, h) => gsap.from(s.chars, { opacity: 0, duration: 0.05, stagger: { each: 0.03, from: 'random' }, scrollTrigger: st(h, { start: 'top 90%' }) }));
      $('.step').forEach((el, i) => {
        gsap.from(el, { scale: 0.55, opacity: 0, transformOrigin: '50% 100%', duration: 1.1, delay: i * 0.15, ease: 'back.out(2)', scrollTrigger: st(el, { start: 'top 92%' }) });
        const num = el.querySelector('.step-number'), target = parseInt(num.textContent, 10) || i + 1, o = { v: 0 };
        gsap.to(o, { v: target, duration: 1.4, delay: i * 0.15, ease: 'power2.out', onUpdate: () => { num.textContent = nine(o.v); }, scrollTrigger: st(el, { start: 'top 92%', onLeaveBack: () => { o.v = 0; num.textContent = '00'; } }) });
        gsap.fromTo(num, { scale: 1.2 }, { scale: 0.8, ease: 'none', scrollTrigger: scrub(el) });
      });

      /* KARYA: horizontal wipe headline, 3D tilt previews that straighten as they hit centre */
      heading('karya', (s, h) => gsap.from(h, { clipPath: 'inset(0 100% 0 0)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: st(h, { start: 'top 90%' }) }));
      $('.featured-work').forEach(w => {
        const prev = w.querySelector('.work-preview'), img = prev.querySelector('img'), copy = w.querySelector('.featured-copy');
        gsap.fromTo(prev, { rotateX: 22, scale: 0.86, transformPerspective: 1200, transformOrigin: '50% 100%' }, { rotateX: -10, scale: 1, ease: 'none', scrollTrigger: scrub(prev) });
        gsap.fromTo(prev, { clipPath: 'polygon(0 0,0 0,0 100%,0 100%)' }, { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: st(prev, { start: 'top 88%' }) });
        gsap.fromTo(img, { scale: 1.3, yPercent: -10 }, { scale: 1.03, yPercent: 10, ease: 'none', scrollTrigger: scrub(prev) });
        gsap.from(copy.children, { y: 40, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: st(copy, { start: 'top 85%' }) });
      });

      /* KONTAK: letters drop from above with a bounce, button pulses */
      heading('kontak', (s, h) => gsap.from(s.chars, { yPercent: -220, opacity: 0, rotate: () => gsap.utils.random(-25, 25), duration: 1.2, stagger: 0.035, ease: 'bounce.out', scrollTrigger: st(h, { start: 'top 85%' }) }));
      gsap.from('.contact > .wrap > p, .contact .button, .footer', { scale: 0.8, opacity: 0, duration: 1, stagger: 0.12, ease: 'back.out(1.8)', scrollTrigger: st('.contact', { start: 'top 55%' }) });
      gsap.to('.contact .button', { scale: 1.05, duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut' });

      /* Marquees: always running, speed and direction follow your scroll */
      const tws = $('.marquee').map((m, i) => {
        const tr = m.querySelector('.marquee-track');
        return i % 2 ? gsap.fromTo(tr, { xPercent: -50 }, { xPercent: 0, repeat: -1, duration: 28, ease: 'none' })
                     : gsap.to(tr, { xPercent: -50, repeat: -1, duration: 28, ease: 'none' });
      });
      let dir = 1;
      ScrollTrigger.create({ onUpdate: self => {
        dir = self.direction || dir;
        const boost = dir * (1 + Math.min(Math.abs(self.getVelocity()) / 140, 10));
        gsap.to(tws, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: () => gsap.to(tws, { timeScale: dir, duration: 1 }) });
      } });

      /* Pointer: custom cursor + magnetic buttons */
      if (ctx.conditions.pointer) {
        const cur = document.createElement('div'); cur.className = 'cursor'; document.body.appendChild(cur);
        const cx = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
        on(window, 'pointermove', e => { cx(e.clientX); cy(e.clientY); });
        $('a, button, summary, .work-preview').forEach(el => {
          on(el, 'pointerenter', () => gsap.to(cur, { scale: 3.2, duration: 0.3 }));
          on(el, 'pointerleave', () => gsap.to(cur, { scale: 1, duration: 0.3 }));
        });
        $('.button, .nav-contact, .music').forEach(el => {
          const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' }), yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
          on(el, 'pointermove', e => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.32); yTo((e.clientY - r.top - r.height / 2) * 0.4); });
          on(el, 'pointerleave', () => { xTo(0); yTo(0); });
        });
        cleanups.push(() => cur.remove());
      }
      $('img').forEach(img => { if (!img.complete) on(img, 'load', () => ScrollTrigger.refresh()); });
      ScrollTrigger.refresh();
      return () => { cleanups.forEach(f => f()); splits.forEach(s => s.revert()); document.documentElement.classList.remove('motion-on'); };
    });
  }
  window.addEventListener('pagehide', dispose);
  window.addEventListener('pageshow', e => { if (e.persisted) mount(); });
  mount();
})();
