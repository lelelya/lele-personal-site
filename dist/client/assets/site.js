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
  container.replaceChildren(...items.slice(0, 3).map((item) => appendChildren(
    createElement(item.url ? 'a' : 'div', { className: 'desk-line', href: item.url }),
    createElement('time', { text: item.date }),
    createElement('span', { text: item.title }),
    item.tags?.length ? createElement('span', { className: 'entry-tags', text: item.tags.join(' · ') }) : null
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
  container.replaceChildren(...items.slice(0, 3).map((item) => appendChildren(
    createElement(item.url ? 'a' : 'div', { className: 'desk-line', href: item.url }),
    createElement('span', { text: item.tags?.length ? `▱ ${item.tags[0]}` : '▱' }),
    createElement('span', { text: item.title }),
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

function renderArticleList(items, containerId, emptyText) {
  const container = document.querySelector(containerId);
  if (!items.length) {
    container.replaceChildren(createElement('p', { className: 'content-empty', text: emptyText }));
    return;
  }
  container.replaceChildren(...items.map((item) => {
    const row = createElement('a', { className: 'file', href: item.url });
    const details = appendChildren(
      createElement('div'),
      createElement('h3', { text: item.title }),
      item.tags?.length ? createElement('p', { text: item.tags.join(' · ') }) : null
    );
    return appendChildren(row, createElement('span', { className: 'file-icon', text: '♡' }), details, createElement('time', { text: item.date }));
  }));
}

function renderBlogroll(items) {
  const container = document.querySelector('#blogroll-list');
  if (!container) return;
  if (!items.length) {
    container.replaceChildren(createElement('p', { className: 'content-empty', text: 'no friends yet...' }));
    return;
  }
  container.replaceChildren(...items.map((item) => {
    const card = createElement('a', { className: 'blogroll-card', href: item.url });
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    const avatar = createElement('img', {
      src: item.avatar,
      alt: item.avatarAlt || `${item.name} 的网站标志`
    });
    const copy = createElement('div');
    appendChildren(
      copy,
      createElement('strong', { text: `${item.name} ↗` }),
      createElement('p', { text: item.description }),
      createElement('small', { text: new URL(item.url).hostname })
    );
    return appendChildren(card, avatar, copy);
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
  if (!music.audio) {
    info.append(
      createElement('strong', { text: 'no track loaded...' }),
      createElement('p', { className: 'player-empty', text: 'add an audio file to play ♫' })
    );
    container.replaceChildren(appendChildren(createElement('div', { className: 'player-body' }), cover, info));
    return;
  }

  const audio = createElement('audio', { src: music.audio });
  audio.preload = 'metadata';
  const controls = createElement('div', { className: 'player-controls' });
  const play = createElement('button', { className: 'player-play', text: '▶' });
  play.type = 'button';
  play.setAttribute('aria-label', '播放');
  const progressInput = createElement('input', { className: 'player-progress' });
  progressInput.type = 'range';
  progressInput.min = '0';
  progressInput.max = '100';
  progressInput.value = '0';
  progressInput.step = '0.1';
  progressInput.setAttribute('aria-label', '播放进度');
  const mute = createElement('button', { className: 'player-mute', text: '♪' });
  mute.type = 'button';
  mute.setAttribute('aria-label', '静音');
  const time = createElement('small', { className: 'player-time', text: '0:00 / --:--' });
  const state = createElement('small', { className: 'player-state', text: '' });

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '--:--';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  };
  const sync = () => {
    progressInput.value = audio.duration ? String(audio.currentTime / audio.duration * 100) : '0';
    time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  };
  play.addEventListener('click', async () => {
    try {
      if (audio.paused) await audio.play();
      else audio.pause();
    } catch {
      state.textContent = 'unable to play this track';
    }
  });
  progressInput.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = Number(progressInput.value) / 100 * audio.duration;
  });
  mute.addEventListener('click', () => {
    audio.muted = !audio.muted;
    mute.textContent = audio.muted ? '×' : '♪';
    mute.setAttribute('aria-label', audio.muted ? '取消静音' : '静音');
  });
  audio.addEventListener('play', () => { play.textContent = 'Ⅱ'; play.setAttribute('aria-label', '暂停'); });
  audio.addEventListener('pause', () => { play.textContent = '▶'; play.setAttribute('aria-label', '播放'); });
  audio.addEventListener('timeupdate', sync);
  audio.addEventListener('loadedmetadata', sync);
  audio.addEventListener('ended', sync);
  audio.addEventListener('error', () => { state.textContent = 'audio file could not be loaded'; });

  controls.append(play, progressInput, mute);
  info.append(
    createElement('strong', { text: music.title || 'untitled track' }),
    document.createElement('br'),
    createElement('span', { text: music.artist || 'unknown artist' }),
    controls,
    time,
    state,
    audio
  );
  container.replaceChildren(appendChildren(createElement('div', { className: 'player-body' }), cover, info));
}

function initializeSearch() {
  const form = document.querySelector('#site-search-form');
  const input = document.querySelector('#site-search');
  const results = document.querySelector('#search-results');
  if (!form || !input || !results) return;

  let index = [];
  let matches = [];
  let activeIndex = -1;
  const typeLabels = { diary: 'Diary', notes: 'Study Note', project: 'Project', page: 'Page' };

  const close = () => {
    results.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
  };
  const setActive = (nextIndex) => {
    const links = [...results.querySelectorAll('a')];
    if (!links.length) return;
    activeIndex = (nextIndex + links.length) % links.length;
    links.forEach((link, itemIndex) => link.setAttribute('aria-selected', String(itemIndex === activeIndex)));
    links[activeIndex].scrollIntoView({ block: 'nearest' });
  };
  const draw = (query) => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) {
      matches = [];
      close();
      return;
    }
    matches = index.filter((item) => [item.title, item.text, ...(item.tags || [])]
      .join(' ')
      .toLocaleLowerCase()
      .includes(normalized)).slice(0, 8);
    if (!matches.length) {
      results.replaceChildren(createElement('p', { className: 'search-empty', text: 'no matching pages...' }));
    } else {
      results.replaceChildren(...matches.map((item) => {
        const link = createElement('a', { className: 'search-result', href: item.url });
        link.setAttribute('role', 'option');
        link.setAttribute('aria-selected', 'false');
        const heading = appendChildren(
          createElement('div', { className: 'search-result-head' }),
          createElement('strong', { text: item.title }),
          createElement('span', { text: typeLabels[item.type] || item.type })
        );
        return appendChildren(link, heading, item.excerpt ? createElement('small', { text: item.excerpt }) : null);
      }));
    }
    results.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    activeIndex = -1;
  };

  loadJson('search-index.json').then((items) => { index = Array.isArray(items) ? items : []; }).catch((error) => {
    console.error(error);
    results.replaceChildren(createElement('p', { className: 'search-empty', text: 'search is temporarily unavailable' }));
  });
  input.addEventListener('input', () => draw(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(activeIndex + 1); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive(activeIndex - 1); }
    if (event.key === 'Escape') close();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const target = activeIndex >= 0 ? matches[activeIndex] : matches[0];
    if (target) location.href = target.url;
  });
  document.addEventListener('pointerdown', (event) => {
    if (!form.contains(event.target)) close();
  });
}

async function initializeGuestbook() {
  const container = document.querySelector('#guestbook-comments');
  if (!container) return;
  try {
    const config = await loadJson('guestbook.json');
    if (!config.repo || !config.repoId || !config.category || !config.categoryId) {
      throw new Error('Giscus is not configured');
    }
    container.replaceChildren();
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    Object.entries({
      repo: config.repo,
      'repo-id': config.repoId,
      category: config.category,
      'category-id': config.categoryId,
      mapping: 'specific',
      term: 'guestbook',
      strict: '0',
      reactionsEnabled: '1',
      emitMetadata: '0',
      inputPosition: 'top',
      theme: 'light',
      lang: 'zh-CN',
      loading: 'lazy'
    }).forEach(([key, value]) => { script.dataset[key] = value; });
    container.append(script);
  } catch (error) {
    console.error(error);
    container.replaceChildren(
      appendChildren(
        createElement('div', { className: 'guestbook-empty' }),
        createElement('p', { text: 'guestbook is being connected...' }),
        createElement('small', { text: 'GitHub login will be required to leave a message ♡' })
      )
    );
  }
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
    ['music.json', renderMusic, ['#music-player']],
    ['blogroll.json', renderBlogroll, ['#blogroll-list']]
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

if (document.querySelector('.desk-home')) {
  initializeHomepage();
  initializeSearch();
  initializeGuestbook();
}

if (document.querySelector('#project-page-list')) {
  loadJson('projects.json').then(renderProjectPage).catch((error) => {
    console.error(error);
    showLoadError('#project-page-list');
  });
}

if (document.querySelector('#notes-page-list')) {
  loadJson('notes.json').then((items) => renderArticleList(items, '#notes-page-list', 'no notes yet...')).catch((error) => {
    console.error(error);
    showLoadError('#notes-page-list');
  });
}

if (document.querySelector('#diary-page-list')) {
  loadJson('diary.json').then((items) => renderArticleList(items, '#diary-page-list', 'no diary entries yet...')).catch((error) => {
    console.error(error);
    showLoadError('#diary-page-list');
  });
}

const contentGuide = document.querySelector('#content-guide');
if (contentGuide) {
  const guideText = document.querySelector('#content-guide-text');
  const guideFiles = {
    projects: '编辑 dist/client/data/projects.json 添加真实项目。',
    diary: '在 content/diary/ 新建 Markdown 文件，然后运行 npm run build。',
    notes: '在 content/notes/ 新建 Markdown 文件，然后运行 npm run build。'
  };
  document.querySelectorAll('[data-content-guide]').forEach((button) => {
    button.addEventListener('click', () => {
      const file = guideFiles[button.dataset.contentGuide];
      if (!file) return;
      guideText.textContent = `目前没有在线编辑功能。站长可以${file}`;
      contentGuide.showModal();
    });
  });
}
