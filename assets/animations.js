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
        const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1 });
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

      /* Progress bar */
      gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

      /* Hero: entrance replays whenever you return to the top, scrubbed exit going down */
      const h1 = SplitText.create('.hero h1', { type: 'words,chars', wordsClass: 'split-word', charsClass: 'split-char', aria: 'auto' });
      splits.push(h1);
      const hero = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from(h1.chars, { yPercent: 130, rotate: 10, opacity: 0, duration: 1.1, stagger: 0.03, ease: 'expo.out' })
        .from(['.hero .eyebrow', '.hero .intro', '.hero-art', '.hero-bottom'], { y: dist, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.25)
        .from('.portrait-main', { clipPath: 'inset(100% 0 0 0)', duration: 1.5, ease: 'expo.inOut' }, 0.1);
      ScrollTrigger.create({ trigger: '.hero', start: 'bottom 75%', onEnterBack: () => hero.restart() });
      const exit = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero h1', { xPercent: -14, scale: 1.12, transformOrigin: 'left center', ease: 'none', scrollTrigger: exit });
      gsap.to('.hero .intro', { yPercent: -60, opacity: 0, ease: 'none', scrollTrigger: exit });
      gsap.to('.portrait-main', { yPercent: d ? 18 : 6, scale: 0.88, ease: 'none', scrollTrigger: exit });
      gsap.to('.hero-art', { yPercent: -50, ease: 'none', scrollTrigger: exit });

      /* Sections: scale-in cards that settle as you arrive (scrubbed, so they replay both ways) */
      $('main > section:not(.hero)').forEach(s => {
        gsap.fromTo(s, { scale: 0.9, borderRadius: d ? 64 : 32, transformOrigin: 'center top' },
          { scale: 1, borderRadius: 0, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'top 25%', scrub: true } });
      });

      /* Headlines: masked line reveal, replays */
      $('main > section:not(.hero) h2').forEach(h => {
        splits.push(SplitText.create(h, {
          type: 'lines', mask: 'lines', aria: 'auto', autoSplit: true,
          onSplit: self => gsap.from(self.lines, { yPercent: 130, rotate: 3, duration: 1.1, stagger: 0.12, ease: 'expo.out', scrollTrigger: st(h, { start: 'top 90%' }) })
        }));
      });

      /* About: curtain, parallax, word-by-word text illumination */
      const pa = document.querySelector('.portrait-about');
      if (pa) {
        gsap.from(pa, { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: st(pa, { start: 'top 85%' }) });
        gsap.fromTo('.portrait-about img', { scale: 1.35, yPercent: -9 }, { scale: 1, yPercent: 9, ease: 'none', scrollTrigger: scrub(pa) });
      }
      $('.education > :not(.portrait-about)').forEach(el => gsap.from(el, { y: dist, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: st(el) }));
      $('.about-copy p').forEach(p => {
        const sp = SplitText.create(p, { type: 'words', aria: 'auto' }); splits.push(sp);
        gsap.from(sp.words, { opacity: 0.1, stagger: 0.06, ease: 'none', scrollTrigger: { trigger: p, start: 'top 82%', end: 'bottom 48%', scrub: true } });
      });

      /* Experience: line draw, date slide, bullets, all replaying */
      $('.experience').forEach(row => {
        gsap.from(row, { '--l': 0, duration: 1.4, ease: 'expo.out', scrollTrigger: st(row) });
        gsap.from(row.querySelector('.experience-date'), { x: -dist * 1.5, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: st(row) });
        gsap.from(row.querySelectorAll('h3, .company, li'), { y: 44, opacity: 0, rotateX: -25, duration: 0.9, stagger: 0.09, ease: 'power3.out', scrollTrigger: st(row, { start: 'top 80%' }) });
      });

      /* Skills */
      $('.step').forEach((s, i) => {
        gsap.from(s, { y: 120, opacity: 0, duration: 1.1, delay: i * 0.1, ease: 'expo.out', scrollTrigger: st(s, { start: 'top 92%' }) });
        gsap.fromTo(s.querySelector('.step-number'), { yPercent: 45 }, { yPercent: -45, ease: 'none', scrollTrigger: scrub(s) });
      });

      /* Works */
      $('.featured-work').forEach(w => {
        const prev = w.querySelector('.work-preview'), img = prev.querySelector('img'), copy = w.querySelector('.featured-copy');
        gsap.from(prev, { clipPath: 'inset(18% 14% 18% 14%)', opacity: 0, duration: 1.5, ease: 'expo.out', scrollTrigger: st(prev, { start: 'top 88%' }) });
        gsap.fromTo(img, { scale: 1.3, yPercent: -10 }, { scale: 1.03, yPercent: 10, ease: 'none', scrollTrigger: scrub(prev) });
        gsap.from(copy.children, { y: 56, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: st(copy, { start: 'top 85%' }) });
      });

      /* Contact */
      gsap.from('.contact > .wrap > p, .contact .button, .footer', { y: 50, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out', scrollTrigger: st('.contact', { start: 'top 60%' }) });

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

      /* Velocity skew: elements lean into the scroll speed */
      const skewTargets = '.work-preview, .portrait-about, .step, .experience, .marquee';
      const proxy = { v: 0 }, setSkew = gsap.quickSetter(skewTargets, 'skewY', 'deg');
      ScrollTrigger.create({ onUpdate: self => {
        const v = gsap.utils.clamp(-7, 7, self.getVelocity() / -220);
        if (Math.abs(v) > Math.abs(proxy.v)) { proxy.v = v; gsap.to(proxy, { v: 0, duration: 0.9, ease: 'power3', overwrite: true, onUpdate: () => setSkew(proxy.v) }); }
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
