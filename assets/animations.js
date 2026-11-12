/* GSAP 3.13: progressive enhancement with scoped cleanup. */
(() => {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  let media = null;
  let generation = 0;

  function dispose() {
    generation++;
    if (media) media.revert();
    media = null;
  }

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
    }, context => {
      if (!context.conditions.motion) return;
      const distance = context.conditions.desktop ? 32 : 18;
      const listeners = [];
      const listen = (element, type, handler) => {
        element.addEventListener(type, handler);
        listeners.push(() => element.removeEventListener(type, handler));
      };
      const split = SplitText.create('.hero h1', {
        type: 'words,chars', wordsClass: 'split-word', charsClass: 'split-char', aria: 'auto'
      });
      const hero = gsap.timeline({defaults: {ease: 'power3.out'}});
      hero.from(split.chars, {
        yPercent: 65, opacity: 0, duration: .75, stagger: .022
      }).from(['.hero .eyebrow', '.hero .intro', '.portrait-main', '.hero-art', '.hero-bottom'], {
        y: distance, opacity: 0, duration: .75, stagger: .1
      }, .12);
      // Do not keep a keyboard user's focused content mid-entrance.
      listen(document.querySelector('.hero'), 'focusin', () => hero.progress(1));

      gsap.utils.toArray('main > section:not(.hero)').forEach(section => {
        const elements = [...section.querySelectorAll('h2, .education, .about-copy, .experience, .step, .featured-copy, .work-preview, .contact > .wrap > p')];
        elements.forEach(element => {
          const tween = gsap.from(element, {
            y: distance, opacity: 0, duration: .75, ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {trigger: element, start: 'top 94%', once: true}
          });
          listen(element, 'focusin', () => tween.progress(1));
        });
      });

      if (context.conditions.pointer) {
        gsap.utils.toArray('.button, .nav-contact, .work-preview').forEach(element => {
          const image = element.querySelector('img');
          const hover = gsap.timeline({paused: true, defaults: {duration: .25, ease: 'power2.out'}})
            .to(element, {y: -2});
          if (image) hover.to(image, {scale: 1.02}, 0);
          listen(element, 'pointerenter', () => hover.play());
          listen(element, 'pointerleave', () => hover.reverse());
          listen(element, 'blur', () => hover.reverse());
        });
      }
      const refresh = () => ScrollTrigger.refresh();
      document.querySelectorAll('img').forEach(img => {
        if (!img.complete) listen(img, 'load', refresh);
      });
      ScrollTrigger.refresh();
      return () => {
        listeners.forEach(remove => remove());
        split.revert();
      };
    });
  }
  window.addEventListener('pagehide', dispose);
  window.addEventListener('pageshow', event => {if (event.persisted) mount();});
  mount();
})();
