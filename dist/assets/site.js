if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') return;
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.textContent = '✦';
    sparkle.style.left = `${event.clientX}px`;
    sparkle.style.top = `${event.clientY}px`;
    document.body.append(sparkle);
    setTimeout(() => sparkle.remove(), 700);
  });
}

const progress = document.querySelector('.progress');
if (progress) {
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--progress', `${max ? scrollY / max * 100 : 0}%`);
  }, { passive: true });
}

const createElement = (tag, options = {}) => {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text !== undefined) element.textContent = options.text;
  if (options.href) element.href = options.href;
  if (options.src) element.src = options.src;
  if (options.alt !== undefined) element.alt = options.alt;
  return element;
};

const appendChildren = (parent, ...children) => {
  parent.append(...children.filter(Boolean));
  return parent;
};

async function loadJson(file) {
  const response = await fetch(`/data/${file}`);
  if (!response.ok) throw new Error(`Unable to load ${file}`);
  return response.json();
}

function renderProfile(profile) {
  const container = document.querySelector('#profile-content');
  const top = createElement('div', { className: 'profile-top' });
  const picture = createElement('div', { className: 'profile-pic' });
  picture.append(createElement('img', { src: profile.avatar, alt: profile.avatarAlt }));
  const speech = createElement('div', { className: 'speech' });
  profile.greeting.forEach((line, index) => {
    if (index) speech.append(document.createElement('br'));
    speech.append(document.createTextNode(line));
  });
  appendChildren(top, picture, speech);

  const info = createElement('div', { className: 'profile-info' });
  info.append(createElement('h2', { text: `♡ ${profile.name}` }));
  const interests = createElement('ul');
  profile.interests.forEach((interest) => interests.append(createElement('li', { text: interest })));
  const stats = createElement('div', { className: 'profile-stats' });
  stats.append(
    createElement('span', { text: `Mood：${profile.mood}` }),
    createElement('span', { text: `Status：${profile.status}` }),
    createElement('span', { text: `Visits：${profile.visits}` })
  );
  appendChildren(info, interests, stats);

  const linkBox = createElement('div', { className: 'link-box' });
  linkBox.append(createElement('strong', { text: '♡ LINK' }));
  const links = createElement('div');
  profile.links.forEach((link) => links.append(createElement('a', { text: link.label, href: link.url })));
  linkBox.append(links);
  container.replaceChildren(top, info, linkBox);
}

function renderIntroduction(profile) {
  const container = document.querySelector('#introduction-content');
  const introduction = profile.introduction;
  container.replaceChildren(
    createElement('h1', { text: introduction.title }),
    createElement('p', { text: introduction.text }),
    createElement('p', { className: 'welcome-sign', text: introduction.signature }),
    createElement('img', { className: 'welcome-mascot', src: profile.avatar, alt: 'little jellyfish.exe 在窗口角落探头' })
  );
}

function renderStatus(items) {
  const container = document.querySelector('#current-list');
  container.replaceChildren(...items.map((item) => appendChildren(
    createElement('div', { className: 'current-row' }),
    createElement('span', { className: 'current-icon', text: item.icon }),
    createElement('b', { text: item.label }),
    createElement('span', { text: item.value }),
    createElement('span', { className: 'blocks', text: item.progress })
  )));
}

function renderDiary(items) {
  const container = document.querySelector('#diary-list');
  container.replaceChildren(...items.map((item) => appendChildren(
    createElement('a', { className: 'desk-line', href: item.url }),
    createElement('time', { text: item.date }),
    createElement('span', { text: item.title }),
    createElement('span', { className: 'likes', text: `♡ ${item.likes}` })
  )));
}

function renderProjects(items) {
  const container = document.querySelector('#project-list');
  container.replaceChildren(...items.map((item) => {
    const details = createElement('div');
    const tags = createElement('div', { className: 'tiny-tags' });
    item.tags.forEach((tag) => tags.append(createElement('span', { text: tag })));
    appendChildren(details, createElement('h3', { text: item.name }), createElement('p', { text: item.description }), tags);
    return appendChildren(
      createElement('a', { className: 'project-line', href: item.url }),
      createElement('div', { className: 'project-thumb', text: item.icon }),
      details,
      createElement('span', { text: '♡' })
    );
  }));
}

function renderNotes(items) {
  const container = document.querySelector('#notes-list');
  container.replaceChildren(...items.map((item) => appendChildren(
    createElement('a', { className: 'desk-line', href: item.url }),
    createElement('span', { text: `▱ ${item.category}` }),
    createElement('span', { text: item.file }),
    createElement('time', { text: item.date })
  )));
}

function renderTodo(items) {
  const container = document.querySelector('#todo-list');
  container.replaceChildren(...items.map((item) => {
    const row = createElement('li', { text: item.text });
    if (item.done) row.classList.add('is-done');
    return row;
  }));
}

function renderMusic(music) {
  const container = document.querySelector('#music-player');
  const cover = createElement('div', { className: 'player-cover' });
  cover.append(createElement('img', { src: music.cover, alt: music.coverAlt }));
  const info = createElement('div', { className: 'player-info' });
  const timeline = createElement('div', { className: 'player-line' });
  timeline.style.marginTop = '8px';
  timeline.append(document.createElement('i'));
  info.append(
    createElement('strong', { text: music.title }),
    document.createElement('br'),
    createElement('span', { text: music.artist }),
    createElement('div', { className: 'player-controls-2', text: '◀ Ⅱ ▶' }),
    timeline,
    createElement('small', { text: `${music.currentTime} / ${music.duration}` })
  );
  container.replaceChildren(appendChildren(createElement('div', { className: 'player-body' }), cover, info));
}

function showLoadError(containerId) {
  const container = document.querySelector(containerId);
  if (container) container.replaceChildren(createElement('p', { text: '内容暂时无法加载。' }));
}

async function initializeHomepage() {
  const sources = [
    ['profile.json', (data) => { renderProfile(data); renderIntroduction(data); }, ['#profile-content', '#introduction-content']],
    ['status.json', renderStatus, ['#current-list']],
    ['projects.json', renderProjects, ['#project-list']],
    ['diary.json', renderDiary, ['#diary-list']],
    ['notes.json', renderNotes, ['#notes-list']],
    ['todo.json', renderTodo, ['#todo-list']],
    ['music.json', renderMusic, ['#music-player']]
  ];

  await Promise.all(sources.map(async ([file, render, containers]) => {
    try {
      render(await loadJson(file));
    } catch (error) {
      console.error(error);
      containers.forEach(showLoadError);
    }
  }));
}

if (document.querySelector('.desk-home')) initializeHomepage();
