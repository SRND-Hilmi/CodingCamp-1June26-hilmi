/* ─────────────────────────────────────────
   STORAGE HELPERS
───────────────────────────────────────── */
const store = {
  get: (k, def) => {
    try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : def; }
    catch { return def; }
  },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

/* ─────────────────────────────────────────
   LOADING SCREEN
───────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    ls.classList.add('hidden');
  }, 2000);
});

/* ─────────────────────────────────────────
   STAR GENERATOR
───────────────────────────────────────── */
(function generateStars() {
  const container = document.getElementById('starsContainer');
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 130; i++) {
    const s = document.createElement('div');
    const big = Math.random() < 0.15;
    const op = 0.3 + Math.random() * 0.7;
    s.className = 'star';
    s.style.cssText = [
      `left:${Math.random() * 100}%`,
      `top:${Math.random() * 72}%`,
      `width:${big ? 3 : 2}px`,
      `height:${big ? 3 : 2}px`,
      `--star-op:${op}`,
      `opacity:${op}`,
      `animation:starTwinkle ${1.5 + Math.random() * 3}s ease-in-out infinite`,
      `animation-delay:${(Math.random() * 4).toFixed(2)}s`,
    ].join(';');
    frag.appendChild(s);
  }
  container.appendChild(frag);
})();

/* Pixel mountain silhouettes (dark mode ambiance) */
(function buildMountains() {
  const wrap = document.getElementById('bgMountains');
  const peaks = [
    { l: '0%',   w: '220px', h: '120px', col: '#0D0B22' },
    { l: '15%',  w: '300px', h: '160px', col: '#0A0820' },
    { l: '40%',  w: '260px', h: '140px', col: '#0D0B22' },
    { l: '60%',  w: '340px', h: '180px', col: '#0A0820' },
    { l: '80%',  w: '250px', h: '130px', col: '#0D0B22' },
  ];
  peaks.forEach(p => {
    const d = document.createElement('div');
    d.style.cssText = `position:absolute;bottom:0;left:${p.l};width:${p.w};height:${p.h};background:${p.col};clip-path:polygon(0% 100%, 50% 0%, 100% 100%);`;
    wrap.appendChild(d);
  });
})();

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ─────────────────────────────────────────
   ACHIEVEMENT SYSTEM
───────────────────────────────────────── */
const ACHIEVEMENTS = {
  firstTask:    { title: 'FIRST QUEST!',    desc: '⚔ Added your first quest to the log', icon: '⚔️' },
  firstComplete:{ title: 'QUEST COMPLETE!', desc: '✅ Completed your first task',         icon: '✅' },
  fiveComplete: { title: 'WARRIOR!',        desc: '🏆 Completed 5 quests',                icon: '🏆' },
  tenComplete:  { title: 'CHAMPION!',       desc: '⭐ Completed 10 quests',               icon: '⭐' },
  timerFinish:  { title: 'FOCUS MASTER!',   desc: '⚡ Completed a focus session',          icon: '⚡' },
  firstLink:    { title: 'EXPLORER!',       desc: '🌀 Opened your first portal',           icon: '🌀' },
  streak3:      { title: 'ON FIRE!',        desc: '🔥 3-day productivity streak!',         icon: '🔥' },
  streak7:      { title: 'UNSTOPPABLE!',    desc: '🔥 7-day productivity streak!',         icon: '🏆' },
};

const unlockedAch = store.get('unlockedAch', []);
let achTimer;

function triggerAchievement(key) {
  if (unlockedAch.includes(key)) return;
  const ach = ACHIEVEMENTS[key];
  if (!ach) return;
  unlockedAch.push(key);
  store.set('unlockedAch', unlockedAch);

  document.getElementById('achTitle').textContent = ach.title;
  document.getElementById('achDesc').textContent  = `${ach.icon} ${ach.desc}`;
  const popup = document.getElementById('achievement-popup');
  popup.classList.add('show');
  clearTimeout(achTimer);
  achTimer = setTimeout(() => popup.classList.remove('show'), 4200);
}

/* ─────────────────────────────────────────
   THEME TOGGLE
───────────────────────────────────────── */
const themeToggle = document.getElementById('themeToggle');
const themeLabel  = document.getElementById('themeLabel');
const toggleThumb = document.getElementById('toggleThumb');
let isDark = store.get('theme', 'dark') === 'dark';

function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeToggle.checked  = !isDark;
  themeLabel.textContent = isDark ? 'DARK MODE' : 'LIGHT MODE';
  toggleThumb.textContent = isDark ? '🌙' : '☀️';
  document.getElementById('starsContainer').style.display = isDark ? '' : 'none';
  document.getElementById('bgMountains').style.display    = isDark ? '' : 'none';
  document.querySelector('.bg-moon').style.display        = isDark ? '' : 'none';
}

themeToggle.addEventListener('change', () => {
  isDark = !themeToggle.checked;
  store.set('theme', isDark ? 'dark' : 'light');
  applyTheme();
});

applyTheme();

/* ─────────────────────────────────────────
   STREAK COUNTER
───────────────────────────────────────── */
(function updateStreak() {
  const today     = new Date().toDateString();
  const lastVisit = store.get('lastVisit', null);
  let streak      = store.get('streak', 0);

  if (lastVisit !== today) {
    if (lastVisit) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      streak = lastVisit === yesterday.toDateString() ? streak + 1 : 1;
    } else {
      streak = 1;
    }
    store.set('streak', streak);
    store.set('lastVisit', today);
    if (streak >= 7) triggerAchievement('streak7');
    else if (streak >= 3) triggerAchievement('streak3');
  }

  document.getElementById('streakCount').textContent = streak;
})();

/* ─────────────────────────────────────────
   PIXEL AVATAR (CLICK TO CYCLE)
───────────────────────────────────────── */
const AVATARS  = ['🧙', '🧝', '🧚', '🧟', '🐉', '⚔️', '🛡️', '🗡️', '🦸', '🧛'];
let avatarIdx  = store.get('avatarIdx', 0);
const avatarEl = document.getElementById('avatarSprite');

avatarEl.textContent = AVATARS[avatarIdx];

function cycleAvatar() {
  avatarIdx = (avatarIdx + 1) % AVATARS.length;
  store.set('avatarIdx', avatarIdx);
  avatarEl.textContent = AVATARS[avatarIdx];
}
avatarEl.addEventListener('click', cycleAvatar);
avatarEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') cycleAvatar(); });

/* ─────────────────────────────────────────
   CLOCK & GREETING
───────────────────────────────────────── */
const clockEl   = document.getElementById('clock');
const dateEl    = document.getElementById('date');
const greetEl   = document.getElementById('greetText');
const levelEl   = document.getElementById('playerLevel');
const nameInput = document.getElementById('nameInput');
const nameForm  = document.getElementById('nameForm');

let userName = store.get('userName', '');
nameInput.value = userName;

nameForm.addEventListener('submit', e => {
  e.preventDefault();
  userName = nameInput.value.trim();
  store.set('userName', userName);
  updateGreeting();
  showToast(userName ? `⚔ Welcome, ${userName}!` : 'Name cleared.');
});

function getGreetWord(h) {
  if (h <  5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function getLevelText(doneCount) {
  if (doneCount <  5) return 'LEVEL 1 PRODUCTIVITY ADVENTURER';
  if (doneCount < 15) return 'LEVEL 2 QUEST WARRIOR';
  if (doneCount < 30) return 'LEVEL 3 FOCUS CHAMPION';
  if (doneCount < 50) return 'LEVEL 4 PRODUCTIVITY HERO';
  return 'LEVEL 5 LEGENDARY ACHIEVER ★';
}

function updateGreeting() {
  const h    = new Date().getHours();
  const name = userName ? `, ${userName}` : '';
  greetEl.textContent = `${getGreetWord(h)}${name}! ⚔`;
}

function tickClock() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  dateEl.textContent  = now.toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  updateGreeting();
}

tickClock();
setInterval(tickClock, 1000);

/* ─────────────────────────────────────────
   FOCUS TIMER
───────────────────────────────────────── */
const timerDisplay = document.getElementById('timerDisplay');
const timerBar     = document.getElementById('timerBar');
const timerPctEl   = document.getElementById('timerPct');
const timerLabel   = document.getElementById('timerLabel');
const startBtn     = document.getElementById('timerStart');
const stopBtn      = document.getElementById('timerStop');
const resetBtn     = document.getElementById('timerReset');
const minutesInput = document.getElementById('timerMinutes');

let timerInterval = null;
let timerRunning  = false;
let totalSecs     = 0;
let remainSecs    = 0;

function getTimerMins() {
  const v = parseInt(minutesInput.value, 10);
  return (isNaN(v) || v < 1) ? 25 : Math.min(v, 180);
}

function fmtTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
}

function renderTimer() {
  timerDisplay.textContent = fmtTime(remainSecs);
  const pct = totalSecs > 0 ? ((totalSecs - remainSecs) / totalSecs) * 100 : 0;
  timerBar.style.width = `${pct}%`;
  timerPctEl.textContent = `${Math.round(pct)}%`;
  document.querySelector('.energy-bar-track').setAttribute('aria-valuenow', Math.round(pct));
}

function setTimerState(state) {
  timerDisplay.classList.remove('running', 'finished');
  timerBar.classList.remove('running');
  if (state === 'running')  { timerDisplay.classList.add('running');  timerBar.classList.add('running'); }
  if (state === 'finished')   timerDisplay.classList.add('finished');
  startBtn.disabled = state === 'running';
  stopBtn.disabled  = state !== 'running';
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  totalSecs    = getTimerMins() * 60;
  remainSecs   = totalSecs;
  renderTimer();
  setTimerState('idle');
  timerLabel.textContent = `${getTimerMins()} min focus session`;
}

startBtn.addEventListener('click', () => {
  if (timerRunning) return;
  if (remainSecs <= 0) resetTimer();
  timerRunning = true;
  setTimerState('running');
  timerLabel.textContent = '▌ QUEST IN PROGRESS... ▐';
  timerInterval = setInterval(() => {
    remainSecs--;
    renderTimer();
    if (remainSecs <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      setTimerState('finished');
      timerLabel.textContent = '🎉 QUEST COMPLETE! +100 XP!';
      showToast('⚡ Focus session complete! Great work!');
      triggerAchievement('timerFinish');
    }
  }, 1000);
});

stopBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning = false;
  setTimerState('idle');
  timerLabel.textContent = '⏸ Quest paused...';
});

resetBtn.addEventListener('click', resetTimer);
minutesInput.addEventListener('change', () => { if (!timerRunning) resetTimer(); });

resetTimer();

/* ─────────────────────────────────────────
   QUEST LOG (TO-DO LIST)
───────────────────────────────────────── */
const todoInput  = document.getElementById('todoInput');
const todoForm   = document.getElementById('todoForm');
const todoList   = document.getElementById('todoList');
const sortSelect = document.getElementById('todoSort');
const statsEl    = document.getElementById('todoStats');
const xpFill     = document.getElementById('xpFill');

let tasks = store.get('tasks', []);

function saveTasks() { store.set('tasks', tasks); }

function getSorted() {
  const copy = [...tasks];
  const mode = sortSelect.value;
  if (mode === 'alpha')      copy.sort((a, b) => a.text.localeCompare(b.text));
  if (mode === 'done-last')  copy.sort((a, b) => a.done - b.done);
  if (mode === 'done-first') copy.sort((a, b) => b.done - a.done);
  return copy;
}

function refreshLevel() {
  const done = tasks.filter(t => t.done).length;
  levelEl.textContent = getLevelText(done);
}

function refreshXP() {
  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  xpFill.style.width = `${pct}%`;
  statsEl.textContent = `${done}/${total} QUESTS`;
  xpFill.closest('[role="progressbar"]').setAttribute('aria-valuenow', pct);
}

function spawnSparkle(li) {
  const sp = document.createElement('span');
  sp.className = 'sparkle';
  sp.textContent = ['⭐','✨','+XP','🌟','★'][Math.floor(Math.random() * 5)];
  li.appendChild(sp);
  setTimeout(() => sp.remove(), 800);
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderTasks() {
  const sorted = getSorted();
  todoList.innerHTML = '';

  if (sorted.length === 0) {
    todoList.innerHTML = '<li class="quest-empty">NO QUESTS YET<br>WHAT ARE YOU WAITING FOR?</li>';
    refreshXP();
    refreshLevel();
    return;
  }

  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = `quest-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    /* Pixel checkbox */
    const chk = document.createElement('div');
    chk.className = `pixel-checkbox${task.done ? ' checked' : ''}`;
    chk.setAttribute('role', 'checkbox');
    chk.setAttribute('aria-checked', task.done ? 'true' : 'false');
    chk.setAttribute('tabindex', '0');
    chk.title = task.done ? 'Mark incomplete' : 'Mark complete';
    chk.textContent = task.done ? '✓' : '';

    const toggleDone = () => {
      const t = tasks.find(t => t.id === task.id);
      if (!t) return;
      t.done = !t.done;
      saveTasks();
      if (t.done) {
        spawnSparkle(li);
        const doneCount = tasks.filter(t => t.done).length;
        if (doneCount === 1)  triggerAchievement('firstComplete');
        if (doneCount === 5)  triggerAchievement('fiveComplete');
        if (doneCount === 10) triggerAchievement('tenComplete');
        showToast('✨ Quest complete! +50 XP');
      }
      renderTasks();
    };

    chk.addEventListener('click', toggleDone);
    chk.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDone(); } });

    /* Text */
    const txt = document.createElement('span');
    txt.className = 'quest-text';
    txt.textContent = task.text;

    /* Actions */
    const actions = document.createElement('div');
    actions.className = 'quest-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-tiny-pixel';
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit quest';
    editBtn.setAttribute('aria-label', `Edit: ${task.text}`);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-tiny-pixel danger';
    delBtn.textContent = '🗑️';
    delBtn.title = 'Delete quest';
    delBtn.setAttribute('aria-label', `Delete: ${task.text}`);

    actions.append(editBtn, delBtn);
    li.append(chk, txt, actions);

    editBtn.addEventListener('click', () => startEdit(li, task, txt));
    delBtn.addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
      showToast('Quest removed from log.');
    });

    todoList.appendChild(li);
  });

  refreshXP();
  refreshLevel();
}

function startEdit(li, task, textSpan) {
  const inp = document.createElement('input');
  inp.className = 'quest-edit-input';
  inp.value = task.text;
  inp.maxLength = 120;
  textSpan.replaceWith(inp);
  inp.focus();
  inp.select();

  const commit = () => {
    const val = inp.value.trim();
    if (!val) { renderTasks(); return; }
    const dup = tasks.some(t => t.id !== task.id && t.text.toLowerCase() === val.toLowerCase());
    if (dup) { showToast('⚠ Quest with that name already exists!'); inp.focus(); return; }
    const t = tasks.find(t => t.id === task.id);
    if (t) t.text = val;
    saveTasks();
    renderTasks();
  };

  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter')  commit();
    if (e.key === 'Escape') renderTasks();
  });
  inp.addEventListener('blur', commit);
}

todoForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  const dup = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
  if (dup) { showToast('⚠ Quest already in log!'); return; }

  const isFirst = tasks.length === 0;
  tasks.push({ id: Date.now(), text, done: false });
  saveTasks();
  renderTasks();
  todoInput.value = '';
  todoInput.focus();

  if (isFirst) triggerAchievement('firstTask');
  showToast('📜 New quest added to log!');
});

sortSelect.addEventListener('change', renderTasks);
renderTasks();

/* ─────────────────────────────────────────
   PORTALS (QUICK LINKS)
───────────────────────────────────────── */
const linksGrid     = document.getElementById('linksGrid');
const linkForm      = document.getElementById('linkForm');
const linkNameInput = document.getElementById('linkName');
const linkUrlInput  = document.getElementById('linkUrl');

let links = store.get('links', [
  { id: 1, name: 'Google',  url: 'https://google.com'  },
  { id: 2, name: 'YouTube', url: 'https://youtube.com' },
  { id: 3, name: 'GitHub',  url: 'https://github.com'  },
]);

function saveLinks() { store.set('links', links); }

const ICON_MAP = {
  'google.com':'🔍','youtube.com':'▶','github.com':'🐙',
  'twitter.com':'🐦','x.com':'🐦','reddit.com':'🤖',
  'notion.so':'📝','figma.com':'🎨','netflix.com':'🎬',
  'spotify.com':'🎵','stackoverflow.com':'💬','linkedin.com':'💼',
  'wikipedia.org':'📖','discord.com':'💬','twitch.tv':'🎮',
  'instagram.com':'📸','facebook.com':'📘',
};

function getLinkIcon(url) {
  try { return ICON_MAP[new URL(url).hostname.replace('www.','')] || '🌀'; }
  catch { return '🌀'; }
}

function renderLinks() {
  linksGrid.innerHTML = '';
  if (links.length === 0) {
    linksGrid.innerHTML = '<span class="portal-empty">NO PORTALS CONFIGURED</span>';
    return;
  }
  links.forEach(link => {
    const a = document.createElement('a');
    a.className  = 'portal-btn';
    a.href       = link.url;
    a.target     = '_blank';
    a.rel        = 'noopener noreferrer';
    a.title      = link.url;

    const icon  = document.createElement('span');
    icon.textContent = getLinkIcon(link.url);

    const lbl = document.createElement('span');
    lbl.className   = 'portal-label';
    lbl.textContent = link.name;

    const rm = document.createElement('button');
    rm.className   = 'portal-remove';
    rm.textContent = '✕';
    rm.title       = `Remove "${link.name}"`;
    rm.setAttribute('aria-label', `Remove ${link.name} portal`);
    rm.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      links = links.filter(l => l.id !== link.id);
      saveLinks();
      renderLinks();
      showToast(`Portal "${link.name}" closed.`);
    });

    a.append(icon, lbl, rm);
    linksGrid.appendChild(a);
  });
}

linkForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = linkNameInput.value.trim();
  let   url  = linkUrlInput.value.trim();
  if (!name || !url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  const dup = links.some(l => l.url.toLowerCase() === url.toLowerCase());
  if (dup) { showToast('⚠ That portal already exists!'); return; }

  const isFirst = links.length === 0;
  links.push({ id: Date.now(), name, url });
  saveLinks();
  renderLinks();
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  showToast(`🌀 Portal "${name}" opened!`);

  if (isFirst) triggerAchievement('firstLink');
});

renderLinks();
