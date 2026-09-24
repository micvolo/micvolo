import { navigate } from 'astro:transitions/client';
import { loadJson, saveJson, STORAGE_KEYS } from '@/lib/storage';

const BASE = '/table-games/camaleonte';

interface Player {
  name: string;
  chameleon: boolean;
}

interface Topic {
  title: string;
  words: string[];
}

interface GameState {
  players: Player[];
  topics: Topic[];
  currentTopic: number;
  wordNumber: number;
  isNavigating: boolean;
}

const emptyState = (): GameState => ({ players: [], topics: [], currentTopic: 0, wordNumber: 0, isNavigating: false });

function loadState(): GameState {
  const stored = loadJson(sessionStorage, STORAGE_KEYS.chameleonGame) as Partial<GameState> | undefined;
  return stored && Array.isArray(stored.players) && Array.isArray(stored.topics) ? stored as GameState : emptyState();
}

function saveState(state: GameState) {
  saveJson(sessionStorage, STORAGE_KEYS.chameleonGame, state);
}

/** custom topics the players saved from the New topic form */
function loadCustomTopics(): Topic[] {
  const stored = loadJson(localStorage, STORAGE_KEYS.chameleonTopics);
  return Array.isArray(stored) ? stored as Topic[] : [];
}

const game: GameState = loadState();

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

async function initChameleon() {
  const gameRoot = document.querySelector<HTMLElement>('.game-chameleon');
  if (!gameRoot || gameRoot.dataset.chameleonBound) return;
  gameRoot.dataset.chameleonBound = 'true';

  document.addEventListener('astro:before-swap', () => {
    delete gameRoot.dataset.chameleonBound;
  }, { once: true });

  const topicsHost = document.querySelector('.topics') as HTMLElement | null;
  if (!game.topics.length && topicsHost?.dataset.topics) {
    const builtIn: Topic[] = JSON.parse(topicsHost.dataset.topics);
    const custom = loadCustomTopics();
    game.topics = [...builtIn, ...custom];
    game.currentTopic = Math.floor(Math.random() * game.topics.length);
    saveState(game);
  }

  // Setup: topic select + players + start
  const list = gameRoot.querySelector('.players .list');
  const add = gameRoot.querySelector<HTMLInputElement>('.players .add');
  const addPlayerButton = gameRoot.querySelector<HTMLButtonElement>('.add-player-button');
  const done = gameRoot.querySelector<HTMLButtonElement>('.done');
  const topicSelect = gameRoot.querySelector<HTMLSelectElement>('#topic-select');
  const nextTopicSelect = gameRoot.querySelector<HTMLSelectElement>('[data-next-topic]');

  if (topicSelect && game.topics.length) {
    topicSelect.innerHTML = '';
    for (const [i, topic] of game.topics.entries()) {
      const el = document.createElement('option');
      el.value = String(i);
      el.textContent = topic.title;
      if (i === game.currentTopic) el.selected = true;
      topicSelect.appendChild(el);
    }
  }

  const addPlayer = () => {
    if (!add?.value.trim() || !list) return;
    const label = document.createElement('label');
    label.className = 'player-field';
    const hidden = document.createElement('span');
    hidden.className = 'sr-only';
    hidden.textContent = `Player ${list.querySelectorAll('input').length + 1}`;
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = hidden.textContent;
    input.autocomplete = 'off';
    input.value = add.value.trim();
    label.append(hidden, input);
    list.appendChild(label);
    add.value = '';
    input.focus();
  };
  addPlayerButton?.addEventListener('click', addPlayer);
  add?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addPlayer();
    }
  });

  done?.addEventListener('click', async () => {
    if (!list) return;
    const names = [...list.querySelectorAll('input')]
      .map((el) => (el as HTMLInputElement).value.trim())
      .filter(Boolean);
    if (names.length < 3) {
      list.querySelector('input')?.focus();
      return;
    }
    const shuffled = shuffle(names);
    const chameleonIndex = Math.floor(Math.random() * shuffled.length);
    game.players = shuffled.map((name, i) => ({ name, chameleon: i === chameleonIndex }));
    game.currentTopic = topicSelect ? Number(topicSelect.value) || 0 : 0;
    const words = game.topics[game.currentTopic]?.words ?? [];
    game.wordNumber = words.length ? Math.floor(Math.random() * words.length) : 0;
    game.isNavigating = false;
    saveState(game);
    await navigate(`${BASE}/show`);
  });

  // Topic grid (show page: hidden secret until revealed per player)
  const topicTitle = gameRoot.querySelector('.topicCard .topicTitle') as HTMLElement | null;
  const topicGrid = gameRoot.querySelector('.topicCard .grid') as HTMLElement | null;

  if (topicGrid) {
    if (!game.topics.length) {
      await navigate(BASE);
      return;
    }
    const topic = game.topics[game.currentTopic];
    if (topic) {
      if (topicTitle) topicTitle.textContent = topic.title;
      topicGrid.innerHTML = '';
      for (const word of topic.words) {
        const el = document.createElement('span');
        el.dataset.word = word;
        el.textContent = word;
        topicGrid.appendChild(el);
      }
    }
  }

  const findWordElement = (word: string) =>
    [...(topicGrid?.querySelectorAll<HTMLElement>('[data-word]') ?? [])].find((el) => el.dataset.word === word);

  // Show / hide roles, one player at a time
  const playerName = gameRoot.querySelector('.show .playerName');
  const showButton = gameRoot.querySelector('.show button') as HTMLButtonElement | null;
  const showLabel = showButton?.querySelector('span');
  const chameleonMessage = gameRoot.querySelector('.show .chameleon') as HTMLElement | null;

  if (playerName && showButton && showLabel) {
    if (!game.players.length) {
      await navigate(BASE);
      return;
    }
    // Arrival on /show ends any in-flight navigation (e.g. from the round reset),
    // mirroring what the "Start game" handler does before landing here.
    game.isNavigating = false;
    saveState(game);
    let isShowing = false;
    let playerIndex = 0;
    playerName.textContent = game.players[playerIndex]?.name ?? '';

    showButton.addEventListener('click', async () => {
      if (game.isNavigating) return;
      isShowing = !isShowing;
      if (isShowing) {
        showLabel.textContent = 'Hide and pass on';
        showButton.setAttribute('aria-pressed', 'true');
        const current = game.players[playerIndex];
        if (current && !current.chameleon) {
          const secret = game.topics[game.currentTopic]?.words[game.wordNumber];
          if (secret) findWordElement(secret)?.classList.add('selected');
        } else if (chameleonMessage) {
          chameleonMessage.hidden = false;
          chameleonMessage.textContent = 'You are the Chameleon. Remember the topic, bluff with a vague clue.';
        }
      } else {
        showLabel.textContent = 'Show my role';
        showButton.setAttribute('aria-pressed', 'false');
        topicGrid?.querySelectorAll('[data-word]').forEach((el) => el.classList.remove('selected'));
        if (chameleonMessage) {
          chameleonMessage.hidden = true;
          chameleonMessage.textContent = '';
        }
        playerIndex++;
        if (playerIndex >= game.players.length) {
          game.isNavigating = true;
          saveState(game);
          await navigate(`${BASE}/center`);
          return;
        }
        playerName.textContent = game.players[playerIndex]?.name ?? '';
      }
    });
  }

  // Reveal: chameleon name + secret word, no points
  const revealName = gameRoot.querySelector('[data-round-chameleon]');
  const revealWord = gameRoot.querySelector('[data-round-word]');
  if (revealName || revealWord) {
    if (!game.players.length || !game.topics.length) {
      await navigate(BASE);
      return;
    }
    game.isNavigating = false;
    saveState(game);
    const chameleon = game.players.find((p) => p.chameleon);
    const secret = game.topics[game.currentTopic]?.words[game.wordNumber];
    if (revealName) revealName.textContent = chameleon?.name ?? '—';
    if (revealWord) revealWord.textContent = secret ?? '—';
  }

  gameRoot.querySelector('.play-again')?.addEventListener('click', async () => {
    if (game.isNavigating) return;
    game.isNavigating = true;
    const chameleonIndex = game.players.length ? Math.floor(Math.random() * game.players.length) : 0;
    game.players = game.players.map((p, i) => ({ ...p, chameleon: i === chameleonIndex }));
    const pickedTopic = nextTopicSelect?.value ? Number(nextTopicSelect.value) : NaN;
    game.currentTopic = Number.isInteger(pickedTopic) && game.topics[pickedTopic]
      ? pickedTopic
      : (game.topics.length ? Math.floor(Math.random() * game.topics.length) : 0);
    const words = game.topics[game.currentTopic]?.words ?? [];
    game.wordNumber = words.length ? Math.floor(Math.random() * words.length) : 0;
    saveState(game);
    await navigate(`${BASE}/show`);
  });

  // Custom topic form
  const newTopic = gameRoot.querySelector('.newtopic') as HTMLFormElement | null;
  if (newTopic) {
    newTopic.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleInput = newTopic.querySelector("input[name='title']") as HTMLInputElement | null;
      const words = newTopic.querySelectorAll<HTMLInputElement>(".words input[type='text']");
      if (!titleInput) return;
      const topic: Topic = {
        title: titleInput.value.trim(),
        words: [...words].map((w) => w.value.trim()).filter(Boolean),
      };
      if (topic.words.length < 16 || !topic.title) {
        const error = newTopic.querySelector<HTMLElement>('.form-error');
        if (error) {
          error.hidden = false;
          error.textContent = 'Add a title and all 16 words before saving.';
        }
        return;
      }
      const custom = loadCustomTopics();
      custom.push(topic);
      saveJson(localStorage, STORAGE_KEYS.chameleonTopics, custom);
      game.topics.push(topic);
      saveState(game);
      window.history.back();
    });
  }
}

document.addEventListener('astro:page-load', initChameleon);
if (document.readyState !== 'loading') initChameleon();
