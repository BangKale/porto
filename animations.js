/* GSAP 3.13 + Lenis: premium scroll motion, progressive enhancement with scoped cleanup. */
(() => {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  let media = null, generation = 0;

  function dispose() { generation++; if (media) media.revert(); media = null; }

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
      const d = ctx.conditions.desktop;
      const dist = d ? 40 : 20;
      const cleanups = [];
      const on = (el, type, fn) => { el.addEventListener(type, fn); cleanups.push(() => el.removeEventListener(type, fn)); };
      const st = (trigger, extra = {}) => ({ trigger, start: 'top 90%', once: true, ...extra });
      const $ = s => gsap.utils.toArray(s);
      document.documentElement.classList.add('motion-on');

      /* 1. Smooth scroll (Lenis) synced to ScrollTrigger */
      let lenis = null;
      if (window.Lenis) {
        lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
        lenis.on('scroll', ScrollTrigger.update);
        const tick = t => lenis.raf(t * 1000);
        gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
        $('a[href^="#"]').forEach(a => on(a, 'click', e => {
          const id = a.getAttribute('href');
          const target = id.length > 1 ? document.querySelector(id) : document.body;
          if (!target) return;
          e.preventDefault();
          lenis.scrollTo(id.length > 1 ? target : 0, { offset: -80, duration: 1.4 });
        }));
        const dlg = document.getElementById('contact-dialog');
        if (dlg) { dlg.setAttribute('data-lenis-prevent', ''); on(dlg, 'close', () => lenis.start()); on(document.getElementById('contact-button'), 'click', () => lenis.stop()); }
        cleanups.push(() => { gsap.ticker.remove(tick); lenis.destroy(); });
      }

      /* 2. Scroll progress bar */
      gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

      /* 3. Hero entrance (letters) + scrubbed exit */
      const split = SplitText.create('.hero h1', { type: 'words,chars', wordsClass: 'split-word', charsClass: 'split-char', aria: 'auto' });
      const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });
      hero.from(split.chars, { yPercent: 110, rotate: 6, opacity: 0, duration: 1, stagger: 0.025, ease: 'expo.out' })
        .from(['.hero .eyebrow', '.hero .intro', '.hero-art', '.hero-bottom'], { y: dist, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.25)
        .from('.portrait-main', { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.inOut' }, 0.1);
      on(document.querySelector('.hero'), 'focusin', () => hero.progress(1));
      const exit = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero-introduction', { yPercent: -14, opacity: 0.15, ease: 'none', scrollTrigger: exit });
      gsap.to('.portrait-main', { yPercent: d ? 10 : 4, scale: 0.94, ease: 'none', scrollTrigger: exit });
      gsap.to('.hero-art', { yPercent: -30, ease: 'none', scrollTrigger: exit });

      /* 4. Headlines: masked line reveal */
      const heads = [];
      $('main > section:not(.hero) h2, dialog h2').forEach(h => {
        if (h.closest('dialog')) return;
        heads.push(SplitText.create(h, {
          type: 'lines', mask: 'lines', aria: 'auto', autoSplit: true,
          onSplit: self => gsap.from(self.lines, { yPercent: 115, duration: 1.1, stagger: 0.12, ease: 'expo.out', scrollTrigger: st(h, { start: 'top 88%' }) })
        }));
      });

      /* 5. About: image curtain + inner parallax, text rise */
      const pa = document.querySelector('.portrait-about');
      if (pa) {
        gsap.from(pa, { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: st(pa, { start: 'top 85%' }) });
        gsap.fromTo('.portrait-about img', { scale: 1.3, yPercent: -6 }, { scale: 1, yPercent: 6, ease: 'none', scrollTrigger: { trigger: pa, start: 'top bottom', end: 'bottom top', scrub: true } });
      }
      $('.education > :not(.portrait-about), .about-copy p').forEach((el, i) =>
        gsap.from(el, { y: dist, opacity: 0, duration: 1, ease: 'power3.out', delay: (i % 2) * 0.08, scrollTrigger: st(el) }));

      /* 6. Experience: line draw + staggered bullets + date slide */
      $('.experience').forEach(row => {
        gsap.from(row, { '--l': 0, duration: 1.3, ease: 'expo.out', scrollTrigger: st(row, { start: 'top 88%' }) });
        gsap.from(row.querySelector('.experience-date'), { x: -dist, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: st(row) });
        gsap.from(row.querySelectorAll('h3, .company, li'), { y: 28, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: st(row, { start: 'top 82%' }) });
      });

      /* 7. Skills: staggered cards with large numbers sliding up */
      $('.step').forEach((s, i) => {
        gsap.from(s, { y: 60, opacity: 0, duration: 1, delay: i * 0.12, ease: 'power3.out', scrollTrigger: st(s, { start: 'top 92%' }) });
        gsap.fromTo(s.querySelector('.step-number'), { yPercent: 25 }, { yPercent: -25, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      gsap.from('.process-grid', { borderTopColor: 'transparent', duration: 1, scrollTrigger: st('.process-grid') });

      /* 8. Works: clip reveal + image parallax + copy rise */
      $('.featured-work').forEach(work => {
        const prev = work.querySelector('.work-preview'), img = prev.querySelector('img'), copy = work.querySelector('.featured-copy');
        gsap.from(prev, { clipPath: 'inset(12% 8% 12% 8%)', opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: st(prev, { start: 'top 88%' }) });
        gsap.fromTo(img, { scale: 1.22, yPercent: -7 }, { scale: 1.02, yPercent: 7, ease: 'none', scrollTrigger: { trigger: prev, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.from(copy.children, { y: 36, opacity: 0, duration: 0.95, stagger: 0.09, ease: 'power3.out', scrollTrigger: st(copy, { start: 'top 85%' }) });
      });

      /* 9. Contact: rise + footer */
      gsap.from('.contact > .wrap > p, .contact .button, .footer', { y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', scrollTrigger: st('.contact', { start: 'top 55%' }) });

      /* 10. Pointer: magnetic buttons + preview hover */
      if (ctx.conditions.pointer) {
        $('.button, .nav-contact, .music').forEach(el => {
          const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
          const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
          on(el, 'pointermove', e => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.28); yTo((e.clientY - r.top - r.height / 2) * 0.35); });
          on(el, 'pointerleave', () => { xTo(0); yTo(0); });
        });
      }
      $('img').forEach(img => { if (!img.complete) on(img, 'load', () => ScrollTrigger.refresh()); });
      ScrollTrigger.refresh();

      return () => {
        cleanups.forEach(fn => fn());
        split.revert(); heads.forEach(h => h.revert());
        document.documentElement.classList.remove('motion-on');
      };
    });
  }
  window.addEventListener('pagehide', dispose);
  window.addEventListener('pageshow', e => { if (e.persisted) mount(); });
  mount();
})();
