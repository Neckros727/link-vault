import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  applyTheme,
  getTheme,
  toggleTheme,
  getUser,
  logout,
  getCategories,
  saveCategory,
  deleteCategory,
  saveAllCategories,
  getLinks,
  saveLink,
  deleteLink,
  saveAllLinks,
  uid,
  ensureSeeded,
} from './lib/store.js';
import './styles.css';

/* ---------- Icons ---------- */

function icon(paths, extra) {
  return function Icon(props) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size || 20}
        height={props.size || 20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={props.className}
      >
        {paths}
        {extra}
      </svg>
    );
  };
}

const IconSearch = icon(
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </>
);
const IconPlus = icon(
  <>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </>
);
const IconFolder = icon(
  <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
);
const IconLink = icon(
  <>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </>
);
const IconCopy = icon(
  <>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </>
);
const IconExternal = icon(
  <>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </>
);
const IconPencil = icon(
  <>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </>
);
const IconTrash = icon(
  <>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </>
);
const IconMoon = icon(<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />);
const IconSun = icon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </>
);
const IconLogout = icon(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </>
);
const IconMenu = icon(
  <>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </>
);
const IconX = icon(
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>
);
const IconDownload = icon(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </>
);
const IconUpload = icon(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M17 8l-5-5-5 5" />
    <path d="M12 3v12" />
  </>
);
const IconCheck = icon(<path d="M20 6 9 17l-5-5" />);

/* ---------- Helpers ---------- */

const AVATAR_COLORS = [
  '#0284c7',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#ea580c',
  '#059669',
  '#4f46e5',
  '#dc2626',
];

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url || '';
  }
}

function initialOf(title) {
  const t = (title || '').trim();
  return t ? t.charAt(0).toUpperCase() : '?';
}

function colorFor(str) {
  let h = 0;
  const s = String(str || '');
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/* ---------- Studio ---------- */

function Studio() {
  const [user, setUser] = useState(() => getUser());
  const [theme, setThemeState] = useState(() => getTheme());
  const [categories, setCategories] = useState(() => getCategories());
  const [links, setLinks] = useState(() => getLinks());
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // null | {kind:'link', id?} | {kind:'category', id?}
  const [linkDraft, setLinkDraft] = useState({
    title: '',
    url: '',
    categoryId: '',
    description: '',
  });
  const [categoryDraft, setCategoryDraft] = useState('');
  const importRef = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!user) {
      window.location.assign('../');
    }
  }, [user]);

  function showToast(message) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  function persistCategories(next) {
    saveAllCategories(next);
    setCategories(next);
  }

  function persistLinks(next) {
    saveAllLinks(next);
    setLinks(next);
  }

  /* Link actions */
  function openLinkModal(link) {
    if (link) {
      setLinkDraft({
        title: link.title || '',
        url: link.url || '',
        categoryId: link.categoryId || '',
        description: link.description || '',
      });
      setModal({ kind: 'link', id: link.id });
    } else {
      setLinkDraft({
        title: '',
        url: '',
        categoryId: activeCategory !== 'all' ? activeCategory : '',
        description: '',
      });
      setModal({ kind: 'link' });
    }
  }

  function submitLink(event) {
    event.preventDefault();
    const title = linkDraft.title.trim();
    let url = linkDraft.url.trim();
    if (!title || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const now = Date.now();
    if (modal && modal.id) {
      const next = links.map((l) =>
        l.id === modal.id
          ? { ...l, title, url, categoryId: linkDraft.categoryId || null, description: linkDraft.description.trim() }
          : l
      );
      persistLinks(next);
      showToast('Link atualizado');
    } else {
      const next = [
        {
          id: uid(),
          title,
          url,
          categoryId: linkDraft.categoryId || null,
          description: linkDraft.description.trim(),
          createdAt: now,
        },
        ...links,
      ];
      persistLinks(next);
      showToast('Link adicionado');
    }
    setModal(null);
  }

  function removeLink(id) {
    const link = links.find((l) => l.id === id);
    persistLinks(deleteLink(id));
    showToast(link ? `"${link.title}" removido` : 'Link removido');
  }

  async function copyLink(url) {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copiado');
    } catch {
      showToast('Não foi possível copiar');
    }
  }

  /* Category actions */
  function openCategoryModal(category) {
    setCategoryDraft(category ? category.name : '');
    setModal({ kind: 'category', id: category ? category.id : null });
  }

  function submitCategory(event) {
    event.preventDefault();
    const name = categoryDraft.trim();
    if (!name) return;
    if (modal && modal.id) {
      persistCategories(
        categories.map((c) => (c.id === modal.id ? { ...c, name } : c))
      );
      showToast('Categoria renomeada');
    } else {
      persistCategories([
        ...categories,
        { id: uid(), name, createdAt: Date.now() },
      ]);
      showToast('Categoria criada');
    }
    setModal(null);
  }

  function removeCategory(id) {
    const cat = categories.find((c) => c.id === id);
    if (
      !window.confirm(
        `Remover a categoria "${cat ? cat.name : ''}"? Os links dela ficarão sem categoria.`
      )
    ) {
      return;
    }
    const next = deleteCategory(id);
    setCategories(next);
    setLinks(getLinks());
    if (activeCategory === id) setActiveCategory('all');
    showToast('Categoria removida');
  }

  /* Theme / auth */
  function handleToggleTheme() {
    const next = toggleTheme();
    setThemeState(next);
  }

  function handleLogout() {
    logout();
    window.location.assign('../');
  }

  /* Import / export */
  function exportData() {
    const payload = JSON.stringify(
      { exportedAt: new Date().toISOString(), categories, links },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkvault-links.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exportado');
  }

  function importData(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data.categories)) {
          persistCategories(data.categories);
        }
        if (Array.isArray(data.links)) {
          persistLinks(data.links);
        }
        showToast('Backup importado');
      } catch {
        showToast('Arquivo inválido');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  /* Filtering */
  const filteredLinks = useMemo(() => {
    let list = links.slice();
    if (activeCategory !== 'all') {
      list = list.filter((l) => l.categoryId === activeCategory);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((l) => {
        const cat = categories.find((c) => c.id === l.categoryId);
        return (
          (l.title || '').toLowerCase().includes(q) ||
          (l.url || '').toLowerCase().includes(q) ||
          (l.description || '').toLowerCase().includes(q) ||
          (cat ? cat.name.toLowerCase().includes(q) : false)
        );
      });
    }
    if (sort === 'name') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'pt-BR'));
    } else {
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    return list;
  }, [links, categories, activeCategory, query, sort]);

  const categoryCount = (id) => links.filter((l) => l.categoryId === id).length;

  const activeCategoryName =
    activeCategory === 'all'
      ? 'Todos os links'
      : (categories.find((c) => c.id === activeCategory) || {}).name ||
        'Links';

  return (
    <div className="studio">
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <span>L</span>
          </div>
          <div className="brand-text">
            <strong>LinkVault AI</strong>
            <small>Seus links em ordem</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('all');
              setSidebarOpen(false);
            }}
          >
            <IconLink size={18} />
            <span>Todos os links</span>
            <span className="nav-count">{links.length}</span>
          </button>

          <div className="nav-section-title">
            <span>Categorias</span>
            <button
              type="button"
              className="icon-btn subtle"
              title="Nova categoria"
              onClick={() => openCategoryModal(null)}
            >
              <IconPlus size={16} />
            </button>
          </div>

          {categories.length === 0 && (
            <p className="nav-empty">Nenhuma categoria ainda.</p>
          )}
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`nav-item-wrap ${activeCategory === cat.id ? 'active' : ''}`}
            >
              <button
                type="button"
                className={`nav-item ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSidebarOpen(false);
                }}
              >
                <IconFolder size={18} />
                <span>{cat.name}</span>
                <span className="nav-count">{categoryCount(cat.id)}</span>
              </button>
              <button
                type="button"
                className="nav-item-edit"
                title="Editar categoria"
                onClick={() => openCategoryModal(cat)}
              >
                <IconPencil size={14} />
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-actions">
            <button
              type="button"
              className="mini-btn"
              title="Exportar backup"
              onClick={exportData}
            >
              <IconDownload size={16} /> Exportar
            </button>
            <button
              type="button"
              className="mini-btn"
              title="Importar backup"
              onClick={() => importRef.current && importRef.current.click()}
            >
              <IconUpload size={16} /> Importar
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              hidden
              onChange={importData}
            />
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={handleToggleTheme}
          >
            {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            <span>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
          </button>

          <div className="sidebar-user">
            <div className="user-avatar">{user ? initialOf(user.name) : '?'}</div>
            <div className="user-meta">
              <strong>{user ? user.name : 'Usuário'}</strong>
              <small>{user ? user.username || '—' : ''}</small>
            </div>
            <button
              type="button"
              className="icon-btn subtle"
              title="Sair"
              onClick={handleLogout}
            >
              <IconLogout size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <IconMenu size={20} />
          </button>

          <div className="search-wrap">
            <IconSearch size={18} />
            <input
              type="search"
              placeholder="Buscar links..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Ordenar links"
          >
            <option value="recent">Mais recentes</option>
            <option value="name">Nome (A–Z)</option>
          </select>

          <button
            type="button"
            className="primary-btn"
            onClick={() => openLinkModal(null)}
          >
            <IconPlus size={18} />
            <span>Adicionar link</span>
          </button>
        </header>

        <div className="main-heading">
          <div>
            <h1>{activeCategoryName}</h1>
            <p>
              {filteredLinks.length === 1
                ? '1 link'
                : `${filteredLinks.length} links`}
            </p>
          </div>
        </div>

        {filteredLinks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <IconLink size={28} />
            </div>
            <h2>{query ? 'Nada encontrado' : 'Nenhum link por aqui'}</h2>
            <p>
              {query
                ? 'Tente buscar com outro termo.'
                : 'Adicione seu primeiro link para começar a organizar seus favoritos.'}
            </p>
            {!query && (
              <button
                type="button"
                className="primary-btn"
                onClick={() => openLinkModal(null)}
              >
                <IconPlus size={18} />
                <span>Adicionar link</span>
              </button>
            )}
          </div>
        ) : (
          <div className="link-grid">
            {filteredLinks.map((link) => {
              const cat = categories.find((c) => c.id === link.categoryId);
              return (
                <article className="link-card" key={link.id}>
                  <div className="link-card-top">
                    <div
                      className="link-avatar"
                      style={{ background: colorFor(link.title) }}
                    >
                      {initialOf(link.title)}
                    </div>
                    <div className="link-actions">
                      <button
                        type="button"
                        className="icon-btn subtle"
                        title="Copiar link"
                        onClick={() => copyLink(link.url)}
                      >
                        <IconCopy size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn subtle"
                        title="Abrir em nova aba"
                        onClick={() => window.open(link.url, '_blank', 'noopener')}
                      >
                        <IconExternal size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn subtle"
                        title="Editar"
                        onClick={() => openLinkModal(link)}
                      >
                        <IconPencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn subtle danger"
                        title="Remover"
                        onClick={() => removeLink(link.id)}
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>

                  <h2 className="link-title">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.title}
                    </a>
                  </h2>
                  <p className="link-host">{hostOf(link.url)}</p>
                  {link.description && (
                    <p className="link-desc">{link.description}</p>
                  )}

                  <div className="link-card-footer">
                    {cat && <span className="badge">{cat.name}</span>}
                    <span className="link-date">{formatDate(link.createdAt)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {modal && modal.kind === 'link' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={modal.id ? 'Editar link' : 'Adicionar link'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2>{modal.id ? 'Editar link' : 'Adicionar link'}</h2>
              <button
                type="button"
                className="icon-btn subtle"
                onClick={() => setModal(null)}
              >
                <IconX size={18} />
              </button>
            </div>
            <form className="modal-form" onSubmit={submitLink}>
              <label>
                Título
                <input
                  type="text"
                  required
                  placeholder="Ex.: Meu site favorito"
                  value={linkDraft.title}
                  onChange={(e) =>
                    setLinkDraft({ ...linkDraft, title: e.target.value })
                  }
                />
              </label>
              <label>
                URL
                <input
                  type="text"
                  required
                  inputMode="url"
                  placeholder="https://exemplo.com"
                  value={linkDraft.url}
                  onChange={(e) =>
                    setLinkDraft({ ...linkDraft, url: e.target.value })
                  }
                />
              </label>
              <label>
                Categoria
                <select
                  value={linkDraft.categoryId}
                  onChange={(e) =>
                    setLinkDraft({ ...linkDraft, categoryId: e.target.value })
                  }
                >
                  <option value="">Sem categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Descrição
                <textarea
                  rows="3"
                  placeholder="Uma nota rápida sobre este link (opcional)"
                  value={linkDraft.description}
                  onChange={(e) =>
                    setLinkDraft({ ...linkDraft, description: e.target.value })
                  }
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setModal(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  <IconCheck size={18} />
                  <span>{modal.id ? 'Salvar' : 'Adicionar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal && modal.kind === 'category' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div
            className="modal modal-sm"
            role="dialog"
            aria-modal="true"
            aria-label={modal.id ? 'Editar categoria' : 'Nova categoria'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2>{modal.id ? 'Editar categoria' : 'Nova categoria'}</h2>
              <button
                type="button"
                className="icon-btn subtle"
                onClick={() => setModal(null)}
              >
                <IconX size={18} />
              </button>
            </div>
            <form className="modal-form" onSubmit={submitCategory}>
              <label>
                Nome
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex.: Trabalho"
                  value={categoryDraft}
                  onChange={(e) => setCategoryDraft(e.target.value)}
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setModal(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  <IconCheck size={18} />
                  <span>Salvar</span>
                </button>
              </div>
              {modal.id && (
                <button
                  type="button"
                  className="danger-link"
                  onClick={() => {
                    removeCategory(modal.id);
                    setModal(null);
                  }}
                >
                  Excluir categoria
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

if (!getUser()) {
  window.location.assign('../');
} else {
  ensureSeeded();
  createRoot(document.getElementById('root')).render(<Studio />);
}
