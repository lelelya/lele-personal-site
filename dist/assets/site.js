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
  appendChildren(info, interests);

  const linkBox = createElement('div', { className: 'link-box' });
  linkBox.append(createElement('strong', { text: '♡ LINK' }));
  const links = createElement('div', { className: 'profile-links' });
  profile.links.forEach((link) => {
    if (link.action === 'blogroll') {
      const button = createElement('button', { className: 'blogroll-button', text: link.label });
      button.type = 'button';
      button.addEventListener('click', () => document.querySelector('#blogroll-dialog')?.showModal());
      links.append(button);
    } else {
      links.append(createElement('a', { text: link.label, href: link.url }));
    }
  });
  linkBox.append(links);
  container.replaceChildren(top, info, linkBox);
}

function renderIntroduction(profile) {
  const container = document.querySelector('#introduction-content');
  const introduction = profile.introduction;
  container.replaceChildren(
    createElement('h1', { text: introduction.title }),
    createElement('p', { text: introduction.text }),
    createElement('p', { className: 'welcome-sign', text: introduction.signature })
  );
}

function renderDiary(items) {
  const container = document.querySelector('#diary-list');
  if (!items.length) {
    container.replaceChildren(createElement('p', { className: 'content-empty', text: 'no diary entries yet...' }));
    return;
  }
  container.replaceChildren(...items.map((item) => appendChildren(
    createElement(item.url ? 'a' : 'div', { className: 'desk-line', href: item.url }),
    createElement('time', { text: item.date }),
    createElement('span', { text: item.title }),
    Number.isFinite(item.likes) ? createElement('span', { className: 'likes', text: `♡ ${item.likes}` }) : null
  )));
}

function renderProjects(items) {
  const container = document.querySelector('#project-list');
  if (!items.length) {
    container.replaceChildren(createElement('p', { className: 'content-empty', text: 'no projects yet...' }));
    return;
  }
  container.replaceChildren(...items.map((item) => {
    const details = createElement('div');
    const tags = createElement('div', { className: 'tiny-tags' });
    item.tags.forEach((tag) => tags.append(createElement('span', { text: tag })));
    appendChildren(details, createElement('h3', { text: item.name }), createElement('p', { text: item.description }), tags);
    return appendChildren(
      createElement(item.url ? 'a' : 'div', { className: 'project-line', href: item.url }),
      createElement('div', { className: 'project-thumb', text: item.icon }),
      details,
      createElement('span', { text: '♡' })
    );
  }));
}

function renderNotes(items) {
  const container = document.querySelector('#notes-list');
  if (!items.length) {
    container.replaceChildren(createElement('p', { className: 'content-empty', text: 'no notes yet...' }));
    return;
  }
  container.replaceChildren(...items.map((item) => appendChildren(
    createElement(item.url ? 'a' : 'div', { className: 'desk-line', href: item.url }),
    createElement('span', { text: `▱ ${item.category}` }),
    createElement('span', { text: item.file }),
    createElement('time', { text: item.date })
  )));
}

function renderProjectPage(items) {
  const container = document.querySelector('#project-page-list');
  if (!items.length) {
    container.replaceChildren(createElement('p', { className: 'content-empty', text: 'no projects yet...' }));
    return;
  }
  container.replaceChildren(...items.map((item) => {
    const card = createElement(item.url ? 'a' : 'article', { className: 'project-card', href: item.url });
    const tags = createElement('div', { className: 'tags' });
    (item.tags || []).forEach((tag) => tags.append(createElement('span', { text: tag })));
    return appendChildren(card, createElement('h2', { text: item.name }), createElement('p', { text: item.description }), tags);
  }));
}

function renderNotesPage(items) {
  const container = document.querySelector('#notes-page-list');
  if (!items.length) {
    container.replaceChildren(createElement('p', { className: 'content-empty', text: 'no notes yet...' }));
    return;
  }
  container.replaceChildren(...items.map((item) => {
    const row = createElement(item.url ? 'a' : 'div', { className: 'file', href: item.url });
    const details = appendChildren(createElement('div'), createElement('h3', { text: item.file }), createElement('p', { text: item.category }));
    return appendChildren(row, createElement('span', { className: 'file-icon', text: '♡' }), details, createElement('time', { text: item.date }));
  }));
}

function renderMusic(music) {
  const container = document.querySelector('#music-player');
  const cover = createElement('div', { className: 'player-cover' });
  if (music.cover) {
    cover.append(createElement('img', { src: music.cover, alt: music.coverAlt || '' }));
  } else {
    cover.textContent = '♫';
    cover.setAttribute('aria-hidden', 'true');
  }
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
    ['projects.json', renderProjects, ['#project-list']],
    ['diary.json', renderDiary, ['#diary-list']],
    ['notes.json', renderNotes, ['#notes-list']],
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

if (document.querySelector('#project-page-list')) {
  loadJson('projects.json').then(renderProjectPage).catch((error) => {
    console.error(error);
    showLoadError('#project-page-list');
  });
}

if (document.querySelector('#notes-page-list')) {
  loadJson('notes.json').then(renderNotesPage).catch((error) => {
    console.error(error);
    showLoadError('#notes-page-list');
  });
}

const contentGuide = document.querySelector('#content-guide');
if (contentGuide) {
  const guideText = document.querySelector('#content-guide-text');
  const guideFiles = { projects: 'projects.json', diary: 'diary.json', notes: 'notes.json' };
  document.querySelectorAll('[data-content-guide]').forEach((button) => {
    button.addEventListener('click', () => {
      const file = guideFiles[button.dataset.contentGuide];
      if (!file) return;
      guideText.textContent = `目前没有在线编辑功能。站长可以编辑 dist/data/${file} 添加内容。`;
      contentGuide.showModal();
    });
  });
}
