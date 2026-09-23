const MAX_SKIPS = 3;

function initTeamword() {
  const root = document.querySelector<HTMLElement>('.teamword');
  if (!root || root.dataset.teamwordBound) return;
  root.dataset.teamwordBound = 'true';

  function $(selector: string) {
    const el = root.querySelector(selector);
    if (!el) throw new Error(`Missing Teamword element ${selector}`);
    return el as HTMLElement;
  }

  const play = $('.play') as HTMLButtonElement;
  const right = $('.right') as HTMLButtonElement;
  const wrong = $('.wrong') as HTMLButtonElement;
  const skip = $('.skip') as HTMLButtonElement;
  const reset = $('.reset') as HTMLButtonElement;
  const timer = $('.timer');
  const point = $('.point');
  const word = $('.word');
  const list = $('.list') as HTMLSelectElement;
  // The status element lives in the game header (above the description), outside the .teamword root.
  const status = document.querySelector<HTMLElement>('.teamword__status');
  if (!status) throw new Error('Missing Teamword element .teamword__status');
  const skipCount = $('[data-skip-count]');

  const announce = (message: string) => {
    status.textContent = message;
  };
  const renderSkips = () => {
    skipCount.textContent = '·'.repeat(Math.max(0, skips)) || '—';
    skip.setAttribute('aria-label', `Skip word, ${skips} ${skips === 1 ? 'skip' : 'skips'} remaining`);
  };
  let interval: number | undefined;
  let disposed = false;
  const sec = 60;
  let startSec = 0;
  let pausedSec = 0;
  let points = 0;
  let skips = MAX_SKIPS;
  let words: string[] = [];
  let fullwords: string[] = [];
  let listReady = false;
  let listRequestId = 0;
  const resetWord = word.textContent ?? '????????';
  const events = new AbortController();

  const audio = {
    right: new Audio('/audio/right.mp3'),
    wrong: new Audio('/audio/wrong.mp3'),
    start: new Audio('/audio/start.mp3'),
    end: new Audio('/audio/end.mp3'),
    press: new Audio('/audio/press.mp3'),
  };
  for (const key in audio) audio[key as keyof typeof audio].currentTime = 0.01;

  async function loadList(url: string) {
    const requestId = ++listRequestId;
    listReady = false;
    play.disabled = true;
    announce('Loading word list.');

    try {
      const req = await fetch(url);
      if (!req.ok) throw new Error(`Could not load ${url}`);
      const text = await req.text();
      if (disposed || requestId !== listRequestId) return false;
      const nextFullwords = [...new Set(text.split('\n').map((entry) => entry.trim()).filter(Boolean))];
      if (!nextFullwords.length) throw new Error('The selected list is empty');
      fullwords = nextFullwords;
      words = [...fullwords];
      listReady = true;
      play.disabled = false;
      announce('Word list ready.');
      return true;
    } catch (error) {
      if (disposed || requestId !== listRequestId) return false;
      console.error('Teamword list failed:', error);
      fullwords = [];
      words = [];
      listReady = false;
      play.disabled = true;
      announce('The word list is unavailable. Choose another list or try again.');
      return false;
    }
  }

  function generateWord() {
    if (words.length === 0) words = [...fullwords];
    const random = Math.floor(Math.random() * words.length);
    const nextWord = words[random];
    if (!nextWord) {
      listReady = false;
      play.disabled = true;
      announce('The word list is unavailable. Choose another list or try again.');
      return false;
    }
    word.textContent = nextWord;
    words = words.filter((el) => el !== nextWord);
    return true;
  }

  function setRoundControls(isRunning: boolean) {
    right.disabled = !isRunning;
    wrong.disabled = !isRunning;
    skip.disabled = !isRunning || skips < 1;
    play.disabled = isRunning || !listReady;
    reset.disabled = false;
  }

  function startTimer() {
    setRoundControls(true);
    startSec = performance.now() - pausedSec;
    interval = window.setInterval(tick, 10);
  }

  function tick() {
    const elapsedTime = performance.now() - startSec;
    const seconds = sec - Math.floor(elapsedTime / 1000);
    timer.textContent = seconds.toString().padStart(2, '0');
    timer.setAttribute('aria-label', `${Math.max(0, seconds)} seconds remaining`);
    if (seconds < 1) endGame();
  }

  function stopTimer() {
    if (interval !== undefined) clearInterval(interval);
    interval = undefined;
    pausedSec = performance.now() - startSec;
    setRoundControls(false);
  }

  function resetEverything() {
    stopTimer();
    pausedSec = 0;
    points = 0;
    skips = MAX_SKIPS;
    words = fullwords;
    timer.textContent = String(sec);
    point.textContent = '0';
    word.textContent = resetWord;
    right.disabled = true;
    wrong.disabled = true;
    skip.disabled = true;
    play.disabled = !listReady;
    reset.disabled = true;
    renderSkips();
    announce('Round reset.');
  }

  function endGame() {
    stopTimer();
    right.disabled = true;
    wrong.disabled = true;
    skip.disabled = true;
    play.disabled = true;
    reset.disabled = false;
    playAudio('end');
    announce('Round ended. Reset to play again.');
  }

  function playAudio(type: keyof typeof audio) {
    audio[type].currentTime = 0.01;
    audio[type].play().catch(() => {});
  }

  renderSkips();

  play.addEventListener(
    'click',
    () => {
      if (!listReady || !generateWord()) return;
      startTimer();
      playAudio('start');
      announce('Round started.');
    },
    { signal: events.signal },
  );

  right.addEventListener(
    'click',
    () => {
      points++;
      point.textContent = String(points);
      stopTimer();
      playAudio('right');
      announce('Guessed. Start the next word.');
    },
    { signal: events.signal },
  );

  wrong.addEventListener(
    'click',
    () => {
      if (points > 0) points--;
      point.textContent = String(points);
      stopTimer();
      playAudio('wrong');
      announce('Missed. Start the next word.');
    },
    { signal: events.signal },
  );

  skip.addEventListener(
    'click',
    () => {
      if (skips < 1) return;
      skips--;
      renderSkips();
      stopTimer();
      playAudio('press');
      announce(`Skipped. ${skips} ${skips === 1 ? 'skip' : 'skips'} remaining.`);
    },
    { signal: events.signal },
  );

  reset.addEventListener('click', resetEverything, { signal: events.signal });

  list.addEventListener(
    'change',
    async () => {
      const loaded = await loadList(list.value);
      if (!disposed && loaded) resetEverything();
    },
    { signal: events.signal },
  );

  void loadList(list.value);

  document.addEventListener(
    'astro:before-swap',
    () => {
      disposed = true;
      if (interval !== undefined) clearInterval(interval);
      events.abort();
      Object.values(audio).forEach((track) => {
        track.pause();
        track.currentTime = 0;
      });
      delete root.dataset.teamwordBound;
    },
    { once: true },
  );
}

document.addEventListener('astro:page-load', initTeamword);
if (document.readyState !== 'loading') initTeamword();
