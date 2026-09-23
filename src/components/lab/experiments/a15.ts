import type { MountFn } from './index';
import { disposeP5, fitStage, loadP5, trackP5, watchSize } from './shared';
import './a15.css';

const poem = `The heart that beats within our chest,
A tireless muscle, never at rest,
Pumping blood throughout our frame,
Keeping us alive, its eternal aim.

But sometimes, things can go astray,
And the heart may falter, in dismay,
A pain so sharp, it takes our breath,
A heart attack, a brush with death.

The world seems to blur and spin,
As the heart fights to win,
Against the blockage that threatens life,
A race against time, to end the strife.

The paramedics come with skill and care,
To bring the heart back from despair,
Rushing to the hospital with flashing light,
To save the heart, with all their might.

The doctors work with deft precision,
To heal the heart, without condition,
To bring it back to a steady beat,
A triumph over the heart's defeat.

So cherish every moment of your days,
And take care of your heart in every way,
For it beats within your chest, so true,
A precious gift, given just to you.`;

const phrases = ['your heart', 'is beating', 'really fast'].map((p) => p.split(''));

const a15: MountFn = async (stage, opts) => {
  const [P5, { default: gsap }, { ScrollTrigger }] = await Promise.all([loadP5(), import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);

  // SF Pro is a swap webfont: wait for it before the first measure+draw so text never
  // lays out with fallback metrics (which overflowed the stage width on refresh).
  await Promise.all([
    document.fonts.load('900 1em "SF Pro Text"'),
    document.fonts.load('700 1em "SF Pro Text"'),
    document.fonts.ready,
  ]);

  let p5Instance: InstanceType<typeof P5> | null = null;
  const root = document.createElement('div');
  root.className = 'lab-a15';
  stage.appendChild(root);

  const container = document.createElement('div');
  container.className = 'lab-p5';
  root.appendChild(container);

  const wordsEls = phrases.map((p, i) => {
    const div = document.createElement('div');
    div.className = `lab-words lab-words--${i + 1}`;
    p.forEach((l) => {
      const span = document.createElement('span');
      span.textContent = l;
      div.appendChild(span);
    });
    root.appendChild(div);
    return div;
  });

  const poemEl = document.createElement('div');
  poemEl.className = 'lab-poem-text';
  poem.split('\n\n').forEach((para) => {
    const stanza = document.createElement('div');
    stanza.className = 'lab-poem-paragraph';
    para.split('\n').forEach((line) => {
      const lineEl = document.createElement('div');
      lineEl.setAttribute('data-p', '');
      line.split(' ').forEach((word) => {
        const wordEl = document.createElement('div');
        wordEl.textContent = word;
        lineEl.appendChild(wordEl);
        // Real whitespace between word boxes lets long lines wrap within the stage width.
        lineEl.appendChild(document.createTextNode(' '));
      });
      stanza.appendChild(lineEl);
    });
    poemEl.appendChild(stanza);
  });
  root.appendChild(poemEl);

  const PARAMS = { size: 0.2, opacity: 0 };
  const animations: Array<{ kill: () => void }> = [];
  let scrollBox: HTMLElement;

  const sketch = (p5: InstanceType<typeof P5>) => {
    let size = 100;
    p5.setup = () => {
      const { width: w, height: h } = fitStage(stage);
      size = Math.max(w, h);
      p5.createCanvas(w, h, p5.WEBGL);
      p5.stroke('red');
      if (opts.reducedMotion) {
        p5.noLoop();
        p5.redraw();
      }
    };

    p5.draw = () => {
      p5.fill(0, 0, 0, 255 * PARAMS.opacity);
      p5.rotateX(p5.frameCount * 0.01);
      p5.rotateY(p5.frameCount * 0.01);
      p5.box(size * PARAMS.size);
    };

    p5.windowResized = () => {
      const { width: w, height: h } = fitStage(stage);
      p5.resizeCanvas(w, h);
      size = Math.max(w, h);
    };
  };

  p5Instance = trackP5(new P5(sketch, container));

  if (opts.reducedMotion) {
    // Static frame of the piece: the first phrase risen, every poem line revealed.
    gsap.set(wordsEls[0].children, { y: 0 });
    poemEl.querySelectorAll('[data-p]').forEach((lineEl) => gsap.set(lineEl.children, { y: 0 }));
  } else {
    const pulseTween = gsap.fromTo(PARAMS, { size: 0 }, { size: 0.3, repeat: -1, yoyo: true, ease: 'elastic.out(1.5, .5)', duration: 2, repeatDelay: 0.5 });
    animations.push(pulseTween);
    const wordsTimeline = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    animations.push(wordsTimeline);
    wordsEls.forEach((words) => {
      wordsTimeline.fromTo(words.children, { y: '100%' }, { y: 0, stagger: 0.1, ease: 'power1.out' });
      wordsTimeline.to(words.children, { opacity: 0, stagger: 0.05, ease: 'linear' });
    });
  }

  scrollBox = stage.closest('.lab-card__stage') as HTMLElement;
  const onScroll = () => {
    if (!scrollBox) return;
    const sh = scrollBox.scrollHeight - scrollBox.clientHeight;
    const st = scrollBox.scrollTop;
    PARAMS.opacity = sh > 0 ? st / sh : 0;
    // The original .p5 canvas is position: fixed; pin it to the stage viewport here.
    container.style.transform = `translateY(${st}px)`;
  };
  scrollBox?.addEventListener('scroll', onScroll);

  if (!opts.reducedMotion) {
    // Per-line word reveal (A15.astro:85-107), scoped to the scrollable stage.
    poemEl.querySelectorAll('[data-p]').forEach((lineEl) => {
      const reveal = gsap.fromTo(
        lineEl.children,
        { y: '100%' },
        {
          y: 0,
          stagger: 0.1,
          duration: 1,
          scrollTrigger: {
            trigger: lineEl,
            scroller: scrollBox,
            toggleActions: 'restart reverse restart reverse',
          },
        },
      );
      animations.push(reveal);
    });
  }

  const unwatch = watchSize(stage, () => {
    if (p5Instance) p5Instance.windowResized();
  });

  return () => {
    animations.forEach((animation) => animation.kill());
    unwatch();
    scrollBox?.removeEventListener('scroll', onScroll);
    disposeP5(p5Instance); p5Instance = null;
    root.remove();
  };
};

export default a15;
