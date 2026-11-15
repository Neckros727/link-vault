// Data layer for LinkVault AI. Everything is stored in the browser's
// localStorage, so the app works fully client-side (no server needed).

const KEYS = {
  user: 'linkvault_user',
  categories: 'linkvault_categories',
  links: 'linkvault_links',
  theme: 'linkvault_theme',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

/* ---------- Theme ---------- */

export function getTheme() {
  return read(KEYS.theme, 'light');
}

export function setTheme(theme) {
  write(KEYS.theme, theme);
  applyTheme(theme);
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

/* ---------- Auth (mock, local only) ---------- */

export function getUser() {
  return read(KEYS.user, null);
}

export function login(username, password) {
  const name = username.trim() || 'Usuário';
  const user = { username: username.trim(), name, loggedAt: Date.now() };
  write(KEYS.user, user);
  return user;
}

export function logout() {
  localStorage.removeItem(KEYS.user);
}

/* ---------- Categories ---------- */

export function getCategories() {
  return read(KEYS.categories, []);
}

export function saveCategory(category) {
  const list = getCategories();
  const index = list.findIndex((c) => c.id === category.id);
  if (index >= 0) {
    list[index] = category;
  } else {
    list.push(category);
  }
  write(KEYS.categories, list);
  return list;
}

export function saveAllCategories(categories) {
  write(KEYS.categories, categories);
}

export function deleteCategory(id) {
  const categories = getCategories().filter((c) => c.id !== id);
  write(KEYS.categories, categories);
  // Unlink links that pointed to this category.
  const links = getLinks().map((link) =>
    link.categoryId === id ? { ...link, categoryId: null } : link
  );
  write(KEYS.links, links);
  return categories;
}

/* ---------- Links ---------- */

export function getLinks() {
  return read(KEYS.links, []);
}

export function saveLink(link) {
  const list = getLinks();
  const index = list.findIndex((l) => l.id === link.id);
  if (index >= 0) {
    list[index] = link;
  } else {
    list.push(link);
  }
  write(KEYS.links, list);
  return list;
}

export function saveAllLinks(links) {
  write(KEYS.links, links);
}

export function deleteLink(id) {
  const links = getLinks().filter((l) => l.id !== id);
  write(KEYS.links, links);
  return links;
}

/* ---------- Seed demo content (first run) ---------- */

export function ensureSeeded() {
  if (localStorage.getItem(KEYS.links) === null) {
    const now = Date.now();
    const cat = [
      { id: 'cat-dev', name: 'Desenvolvimento', createdAt: now },
      { id: 'cat-design', name: 'Design', createdAt: now },
      { id: 'cat-news', name: 'Notícias', createdAt: now },
    ];
    write(KEYS.categories, cat);
    const links = [
      {
        id: 'l1',
        title: 'MDN Web Docs',
        url: 'https://developer.mozilla.org/',
        categoryId: 'cat-dev',
        description: 'Documentação de referência para HTML, CSS e JavaScript.',
        createdAt: now - 1000,
      },
      {
        id: 'l2',
        title: 'GitHub',
        url: 'https://github.com/',
        categoryId: 'cat-dev',
        description: 'Onde o código vive.',
        createdAt: now - 2000,
      },
      {
        id: 'l3',
        title: 'Figma',
        url: 'https://www.figma.com/',
        categoryId: 'cat-design',
        description: 'Ferramenta colaborativa de design.',
        createdAt: now - 3000,
      },
      {
        id: 'l4',
        title: 'Dribbble',
        url: 'https://dribbble.com/',
        categoryId: 'cat-design',
        description: 'Inspiração de design e portfólios.',
        createdAt: now - 4000,
      },
      {
        id: 'l5',
        title: 'The Verge',
        url: 'https://www.theverge.com/',
        categoryId: 'cat-news',
        description: 'Notícias de tecnologia e cultura digital.',
        createdAt: now - 5000,
      },
      {
        id: 'l6',
        title: 'Hacker News',
        url: 'https://news.ycombinator.com/',
        categoryId: 'cat-news',
        description: 'Notícias e discussões de tecnologia.',
        createdAt: now - 6000,
      },
    ];
    write(KEYS.links, links);
  }
}
