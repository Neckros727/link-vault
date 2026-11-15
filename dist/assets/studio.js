(function () {
  'use strict';

  /* ---------------- storage ---------------- */
  var KEYS = {
    user: 'linkvault_user',
    categories: 'linkvault_categories',
    links: 'linkvault_links',
    theme: 'linkvault_theme',
  };

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* ignore */
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------------- icons ---------------- */
  function svg(inner, size) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
      size +
      '" height="' +
      size +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      inner +
      '</svg>'
    );
  }

  var I = {
    search: function (s) {
      return svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>', s);
    },
    plus: function (s) {
      return svg('<path d="M5 12h14"/><path d="M12 5v14"/>', s);
    },
    folder: function (s) {
      return svg(
        '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
        s
      );
    },
    link: function (s) {
      return svg(
        '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
        s
      );
    },
    copy: function (s) {
      return svg(
        '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
        s
      );
    },
    external: function (s) {
      return svg(
        '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
        s
      );
    },
    pencil: function (s) {
      return svg(
        '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
        s
      );
    },
    trash: function (s) {
      return svg(
        '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
        s
      );
    },
    moon: function (s) {
      return svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>', s);
    },
    sun: function (s) {
      return svg(
        '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
        s
      );
    },
    logout: function (s) {
      return svg(
        '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
        s
      );
    },
    menu: function (s) {
      return svg('<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>', s);
    },
    x: function (s) {
      return svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', s);
    },
    download: function (s) {
      return svg(
        '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
        s
      );
    },
    upload: function (s) {
      return svg(
        '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
        s
      );
    },
    check: function (s) {
      return svg('<path d="M20 6 9 17l-5-5"/>', s);
    },
  };

  /* ---------------- state ---------------- */
  var state = {
    user: read(KEYS.user, null),
    theme: read(KEYS.theme, 'light'),
    categories: read(KEYS.categories, []),
    links: read(KEYS.links, []),
    activeCategory: 'all',
    query: '',
    sort: 'recent',
    sidebarOpen: false,
    modal: null, // {kind:'link'|'category', id:null|string}
    toast: null,
  };

  function applyTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
  applyTheme(state.theme);

  var root = document.getElementById('root');

  /* ---------------- helpers ---------------- */
  function esc(value) {
    return String(value == null ? '' : value).replace(
      /[&<>"']/g,
      function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      }
    );
  }

  function hostOf(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch (e) {
      return url || '';
    }
  }

  function initialOf(text) {
    var t = (text || '').trim();
    return t ? t.charAt(0).toUpperCase() : '?';
  }

  var AVATAR_COLORS = [
    '#0284c7', '#7c3aed', '#0891b2', '#db2777',
    '#ea580c', '#059669', '#4f46e5', '#dc2626',
  ];

  function colorFor(str) {
    var h = 0;
    var s = String(str || '');
    for (var i = 0; i < s.length; i += 1) {
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

  function categoryName(id) {
    for (var i = 0; i < state.categories.length; i += 1) {
      if (state.categories[i].id === id) return state.categories[i].name;
    }
    return '';
  }

  function categoryCount(id) {
    return state.links.filter(function (l) {
      return l.categoryId === id;
    }).length;
  }

  function filteredLinks() {
    var list = state.links.slice();
    if (state.activeCategory !== 'all') {
      list = list.filter(function (l) {
        return l.categoryId === state.activeCategory;
      });
    }
    var q = state.query.trim().toLowerCase();
    if (q) {
      list = list.filter(function (l) {
        var cat = categoryName(l.categoryId).toLowerCase();
        return (
          (l.title || '').toLowerCase().indexOf(q) !== -1 ||
          (l.url || '').toLowerCase().indexOf(q) !== -1 ||
          (l.description || '').toLowerCase().indexOf(q) !== -1 ||
          cat.indexOf(q) !== -1
        );
      });
    }
    if (state.sort === 'name') {
      list.sort(function (a, b) {
        return (a.title || '').localeCompare(b.title || '', 'pt-BR');
      });
    } else {
      list.sort(function (a, b) {
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
    }
    return list;
  }

  function activeCategoryName() {
    if (state.activeCategory === 'all') return 'Todos os links';
    var name = categoryName(state.activeCategory);
    return name || 'Links';
  }

  /* ---------------- render: sidebar ---------------- */
  function renderSidebar() {
    var el = document.getElementById('app-sidebar');
    if (!el) return;
    var html = '';

    html +=
      '<div class="sidebar-brand">' +
      '<div class="brand-logo"><span>L</span></div>' +
      '<div class="brand-text"><strong>LinkVault AI</strong><small>Seus links em ordem</small></div>' +
      '</div>';

    html += '<nav class="sidebar-nav">';

    html +=
      '<button type="button" class="nav-item' +
      (state.activeCategory === 'all' ? ' active' : '') +
      '" data-action="select-category" data-cat="all">' +
      I.link(18) +
      '<span>Todos os links</span>' +
      '<span class="nav-count">' + state.links.length + '</span>' +
      '</button>';

    html +=
      '<div class="nav-section-title"><span>Categorias</span>' +
      '<button type="button" class="icon-btn subtle" data-action="new-category" title="Nova categoria">' +
      I.plus(16) +
      '</button></div>';

    if (state.categories.length === 0) {
      html += '<p class="nav-empty">Nenhuma categoria ainda.</p>';
    }

    state.categories.forEach(function (cat) {
      var active = state.activeCategory === cat.id;
      html +=
        '<div class="nav-item-wrap' + (active ? ' active' : '') + '">' +
        '<button type="button" class="nav-item' + (active ? ' active' : '') + '" data-action="select-category" data-cat="' + esc(cat.id) + '">' +
        I.folder(18) +
        '<span>' + esc(cat.name) + '</span>' +
        '<span class="nav-count">' + categoryCount(cat.id) + '</span>' +
        '</button>' +
        '<button type="button" class="nav-item-edit" data-action="edit-category" data-cat="' + esc(cat.id) + '" title="Editar categoria">' +
        I.pencil(14) +
        '</button>' +
        '</div>';
    });

    html += '</nav>';

    html += '<div class="sidebar-footer">';

    html +=
      '<div class="sidebar-actions">' +
      '<button type="button" class="mini-btn" data-action="export" title="Exportar backup">' + I.download(16) + ' Exportar</button>' +
      '<button type="button" class="mini-btn" data-action="import" title="Importar backup">' + I.upload(16) + ' Importar</button>' +
      '<input type="file" id="import-file" accept="application/json" hidden />' +
      '</div>';

    html +=
      '<button type="button" class="theme-toggle" data-action="toggle-theme">' +
      (state.theme === 'dark' ? I.sun(18) : I.moon(18)) +
      '<span>' + (state.theme === 'dark' ? 'Modo claro' : 'Modo escuro') + '</span>' +
      '</button>';

    html +=
      '<div class="sidebar-user">' +
      '<div class="user-avatar">' + esc(initialOf(state.user ? state.user.name : '?')) + '</div>' +
      '<div class="user-meta"><strong>' + esc(state.user ? state.user.name : 'Usuário') + '</strong>' +
      '<small>' + esc(state.user ? state.user.username || '—' : '') + '</small></div>' +
      '<button type="button" class="icon-btn subtle" data-action="logout" title="Sair">' + I.logout(18) + '</button>' +
      '</div>';

    html += '</div>';

    el.innerHTML = html;
  }

  /* ---------------- render: list ---------------- */
  function renderList() {
    var el = document.getElementById('app-list');
    if (!el) return;
    var links = filteredLinks();
    var html = '';

    html +=
      '<div class="main-heading"><div><h1>' + esc(activeCategoryName()) + '</h1>' +
      '<p>' + (links.length === 1 ? '1 link' : links.length + ' links') + '</p></div></div>';

    if (links.length === 0) {
      html +=
        '<div class="empty-state">' +
        '<div class="empty-icon">' + I.link(28) + '</div>' +
        '<h2>' + (state.query ? 'Nada encontrado' : 'Nenhum link por aqui') + '</h2>' +
        '<p>' +
        (state.query
          ? 'Tente buscar com outro termo.'
          : 'Adicione seu primeiro link para começar a organizar seus favoritos.') +
        '</p>';
      if (!state.query) {
        html +=
          '<button type="button" class="primary-btn" data-action="new-link">' +
          I.plus(18) + '<span>Adicionar link</span></button>';
      }
      html += '</div>';
    } else {
      html += '<div class="link-grid">';
      links.forEach(function (link) {
        var cat = categoryName(link.categoryId);
        html +=
          '<article class="link-card">' +
          '<div class="link-card-top">' +
          '<div class="link-avatar" style="background:' + colorFor(link.title) + '">' + esc(initialOf(link.title)) + '</div>' +
          '<div class="link-actions">' +
          '<button type="button" class="icon-btn subtle" data-action="copy-link" data-url="' + esc(link.url) + '" title="Copiar link">' + I.copy(16) + '</button>' +
          '<button type="button" class="icon-btn subtle" data-action="open-link" data-url="' + esc(link.url) + '" title="Abrir em nova aba">' + I.external(16) + '</button>' +
          '<button type="button" class="icon-btn subtle" data-action="edit-link" data-id="' + esc(link.id) + '" title="Editar">' + I.pencil(16) + '</button>' +
          '<button type="button" class="icon-btn subtle danger" data-action="delete-link" data-id="' + esc(link.id) + '" title="Remover">' + I.trash(16) + '</button>' +
          '</div></div>' +
          '<h2 class="link-title"><a href="' + esc(link.url) + '" target="_blank" rel="noopener noreferrer">' + esc(link.title) + '</a></h2>' +
          '<p class="link-host">' + esc(hostOf(link.url)) + '</p>' +
          (link.description ? '<p class="link-desc">' + esc(link.description) + '</p>' : '') +
          '<div class="link-card-footer">' +
          (cat ? '<span class="badge">' + esc(cat) + '</span>' : '<span></span>') +
          '<span class="link-date">' + esc(formatDate(link.createdAt)) + '</span>' +
          '</div></article>';
      });
      html += '</div>';
    }

    el.innerHTML = html;
  }

  /* ---------------- render: modal & toast ---------------- */
  function renderModal() {
    var el = document.getElementById('modal-root');
    if (!el) return;
    if (!state.modal) {
      el.innerHTML = '';
      return;
    }

    if (state.modal.kind === 'link') {
      var link = null;
      if (state.modal.id) {
        link = state.links.filter(function (l) { return l.id === state.modal.id; })[0];
      }
      var catOptions = '<option value="">Sem categoria</option>';
      state.categories.forEach(function (cat) {
        catOptions +=
          '<option value="' + esc(cat.id) + '"' +
          (link && link.categoryId === cat.id ? ' selected' : '') +
          '>' + esc(cat.name) + '</option>';
      });

      el.innerHTML =
        '<div class="modal-backdrop">' +
        '<div class="modal" role="dialog" aria-modal="true" aria-label="' + (link ? 'Editar link' : 'Adicionar link') + '">' +
        '<div class="modal-head"><h2>' + (link ? 'Editar link' : 'Adicionar link') + '</h2>' +
        '<button type="button" class="icon-btn subtle" data-action="close-modal">' + I.x(18) + '</button></div>' +
        '<form class="modal-form" id="link-form" data-id="' + esc(state.modal.id || '') + '">' +
        '<label>Título<input type="text" id="f-title" required placeholder="Ex.: Meu site favorito" value="' + esc(link ? link.title : '') + '" /></label>' +
        '<label>URL<input type="text" id="f-url" required inputmode="url" placeholder="https://exemplo.com" value="' + esc(link ? link.url : '') + '" /></label>' +
        '<label>Categoria<select id="f-category">' + catOptions + '</select></label>' +
        '<label>Descrição<textarea id="f-desc" rows="3" placeholder="Uma nota rápida sobre este link (opcional)">' + esc(link ? link.description : '') + '</textarea></label>' +
        '<div class="modal-actions">' +
        '<button type="button" class="ghost-btn" data-action="close-modal">Cancelar</button>' +
        '<button type="submit" class="primary-btn">' + I.check(18) + '<span>' + (link ? 'Salvar' : 'Adicionar') + '</span></button>' +
        '</div></form></div></div>';

      // Pre-select a category when adding from within a category view.
      if (!link && state.activeCategory !== 'all') {
        var sel = document.getElementById('f-category');
        if (sel) sel.value = state.activeCategory;
      }
    } else {
      // category modal
      var cat = null;
      if (state.modal.id) {
        cat = state.categories.filter(function (c) { return c.id === state.modal.id; })[0];
      }
      el.innerHTML =
        '<div class="modal-backdrop">' +
        '<div class="modal modal-sm" role="dialog" aria-modal="true" aria-label="' + (cat ? 'Editar categoria' : 'Nova categoria') + '">' +
        '<div class="modal-head"><h2>' + (cat ? 'Editar categoria' : 'Nova categoria') + '</h2>' +
        '<button type="button" class="icon-btn subtle" data-action="close-modal">' + I.x(18) + '</button></div>' +
        '<form class="modal-form" id="category-form" data-id="' + esc(state.modal.id || '') + '">' +
        '<label>Nome<input type="text" id="c-name" required autofocus placeholder="Ex.: Trabalho" value="' + esc(cat ? cat.name : '') + '" /></label>' +
        '<div class="modal-actions">' +
        '<button type="button" class="ghost-btn" data-action="close-modal">Cancelar</button>' +
        '<button type="submit" class="primary-btn">' + I.check(18) + '<span>Salvar</span></button>' +
        '</div>' +
        (state.modal.id
          ? '<button type="button" class="danger-link" data-action="delete-category" data-cat="' + esc(state.modal.id) + '">Excluir categoria</button>'
          : '') +
        '</form></div></div>';
    }
  }

  function renderToast() {
    var el = document.getElementById('toast');
    if (!el) return;
    if (state.toast) {
      el.innerHTML = '<div class="toast">' + esc(state.toast) + '</div>';
    } else {
      el.innerHTML = '';
    }
  }

  var toastTimer = null;
  function showToast(message) {
    state.toast = message;
    renderToast();
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      state.toast = null;
      renderToast();
    }, 2200);
  }

  /* ---------------- actions ---------------- */
  function saveCategories(next) {
    state.categories = next;
    write(KEYS.categories, next);
    renderSidebar();
    renderList();
  }

  function saveLinks(next) {
    state.links = next;
    write(KEYS.links, next);
    renderSidebar();
    renderList();
  }

  function newLink() {
    state.modal = { kind: 'link', id: null };
    renderModal();
  }

  function editLink(id) {
    state.modal = { kind: 'link', id: id };
    renderModal();
  }

  function submitLink() {
    var form = document.getElementById('link-form');
    if (!form) return;
    var title = (document.getElementById('f-title').value || '').trim();
    var url = (document.getElementById('f-url').value || '').trim();
    var categoryId = document.getElementById('f-category').value;
    var description = (document.getElementById('f-desc').value || '').trim();
    if (!title || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    var id = form.getAttribute('data-id');

    if (id) {
      var next = state.links.map(function (l) {
        if (l.id === id) {
          return { title: title, url: url, categoryId: categoryId || null, description: description, id: l.id, createdAt: l.createdAt };
        }
        return l;
      });
      saveLinks(next);
      showToast('Link atualizado');
    } else {
      var fresh = {
        id: uid(),
        title: title,
        url: url,
        categoryId: categoryId || null,
        description: description,
        createdAt: Date.now(),
      };
      saveLinks([fresh].concat(state.links));
      showToast('Link adicionado');
    }
    state.modal = null;
    renderModal();
  }

  function deleteLink(id) {
    var link = state.links.filter(function (l) { return l.id === id; })[0];
    saveLinks(state.links.filter(function (l) { return l.id !== id; }));
    showToast(link ? '"' + link.title + '" removido' : 'Link removido');
  }

  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast('Link copiado');
      } catch (e) {
        showToast('Não foi possível copiar');
      }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { showToast('Link copiado'); },
        fallback
      );
    } else {
      fallback();
    }
  }

  function newCategory() {
    state.modal = { kind: 'category', id: null };
    renderModal();
  }

  function editCategory(id) {
    state.modal = { kind: 'category', id: id };
    renderModal();
  }

  function submitCategory() {
    var form = document.getElementById('category-form');
    if (!form) return;
    var name = (document.getElementById('c-name').value || '').trim();
    if (!name) return;
    var id = form.getAttribute('data-id');
    if (id) {
      saveCategories(
        state.categories.map(function (c) {
          return c.id === id ? { id: c.id, name: name, createdAt: c.createdAt } : c;
        })
      );
      showToast('Categoria renomeada');
    } else {
      saveCategories(
        state.categories.concat([{ id: uid(), name: name, createdAt: Date.now() }])
      );
      showToast('Categoria criada');
    }
    state.modal = null;
    renderModal();
  }

  function deleteCategory(id) {
    var cat = categoryName(id);
    if (!window.confirm('Remover a categoria "' + cat + '"? Os links dela ficarão sem categoria.')) {
      return;
    }
    var nextCategories = state.categories.filter(function (c) { return c.id !== id; });
    var nextLinks = state.links.map(function (l) {
      return l.categoryId === id ? Object.assign({}, l, { categoryId: null }) : l;
    });
    state.categories = nextCategories;
    state.links = nextLinks;
    write(KEYS.categories, nextCategories);
    write(KEYS.links, nextLinks);
    if (state.activeCategory === id) state.activeCategory = 'all';
    state.modal = null;
    renderSidebar();
    renderList();
    renderModal();
    showToast('Categoria removida');
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    write(KEYS.theme, state.theme);
    applyTheme(state.theme);
    renderSidebar();
  }

  function logout() {
    try {
      localStorage.removeItem(KEYS.user);
    } catch (e) {
      /* ignore */
    }
    window.location.assign('../');
  }

  function exportData() {
    var payload = JSON.stringify(
      { exportedAt: new Date().toISOString(), categories: state.categories, links: state.links },
      null,
      2
    );
    var blob = new Blob([payload], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'linkvault-links.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup exportado');
  }

  function importData(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        if (Array.isArray(data.categories)) saveCategories(data.categories);
        if (Array.isArray(data.links)) saveLinks(data.links);
        showToast('Backup importado');
      } catch (e) {
        showToast('Arquivo inválido');
      }
    };
    reader.readAsText(file);
  }

  /* ---------------- event delegation ---------------- */
  document.addEventListener('click', function (event) {
    var target = event.target.closest ? event.target.closest('[data-action]') : null;
    if (!target) return;
    var action = target.getAttribute('data-action');

    if (action === 'select-category') {
      state.activeCategory = target.getAttribute('data-cat');
      state.sidebarOpen = false;
      renderSidebar();
      renderList();
      var backdrop = document.getElementById('sidebar-backdrop');
      if (backdrop) backdrop.style.display = 'none';
      var drawer = document.getElementById('app-sidebar');
      if (drawer) drawer.classList.remove('open');
    } else if (action === 'new-category') {
      newCategory();
    } else if (action === 'edit-category') {
      editCategory(target.getAttribute('data-cat'));
    } else if (action === 'new-link') {
      newLink();
    } else if (action === 'edit-link') {
      editLink(target.getAttribute('data-id'));
    } else if (action === 'delete-link') {
      deleteLink(target.getAttribute('data-id'));
    } else if (action === 'copy-link') {
      copyText(target.getAttribute('data-url'));
    } else if (action === 'open-link') {
      window.open(target.getAttribute('data-url'), '_blank', 'noopener');
    } else if (action === 'toggle-theme') {
      toggleTheme();
    } else if (action === 'logout') {
      logout();
    } else if (action === 'export') {
      exportData();
    } else if (action === 'import') {
      var fileInput = document.getElementById('import-file');
      if (fileInput) fileInput.click();
    } else if (action === 'close-modal') {
      state.modal = null;
      renderModal();
    } else if (action === 'delete-category') {
      deleteCategory(target.getAttribute('data-cat'));
    } else if (action === 'menu-open') {
      state.sidebarOpen = true;
      var sidebar = document.getElementById('app-sidebar');
      if (sidebar) sidebar.classList.add('open');
      var backdrop2 = document.getElementById('sidebar-backdrop');
      if (backdrop2) backdrop2.style.display = 'block';
    }
  });

  // Close modal by clicking the backdrop itself (not its children).
  document.addEventListener('click', function (event) {
    if (event.target && event.target.classList && event.target.classList.contains('modal-backdrop')) {
      state.modal = null;
      renderModal();
    }
  });

  // Close the mobile drawer when its backdrop is clicked.
  document.addEventListener('click', function (event) {
    if (event.target && event.target.id === 'sidebar-backdrop') {
      state.sidebarOpen = false;
      var sidebar = document.getElementById('app-sidebar');
      if (sidebar) sidebar.classList.remove('open');
      event.target.style.display = 'none';
    }
  });

  document.addEventListener('submit', function (event) {
    if (event.target && event.target.id === 'link-form') {
      event.preventDefault();
      submitLink();
    } else if (event.target && event.target.id === 'category-form') {
      event.preventDefault();
      submitCategory();
    }
  });

  document.addEventListener('input', function (event) {
    if (event.target && event.target.id === 'search-input') {
      state.query = event.target.value;
      renderList();
    }
  });

  document.addEventListener('change', function (event) {
    if (event.target && event.target.id === 'sort-select') {
      state.sort = event.target.value;
      renderList();
    }
    if (event.target && event.target.id === 'import-file') {
      var file = event.target.files && event.target.files[0];
      if (file) importData(file);
      event.target.value = '';
    }
  });

  /* ---------------- boot ---------------- */
  if (!state.user) {
    window.location.assign('../');
  } else {
    // Seed a little demo content the first time.
    if (localStorage.getItem(KEYS.links) === null) {
      var now = Date.now();
      var seedCats = [
        { id: 'cat-dev', name: 'Desenvolvimento', createdAt: now },
        { id: 'cat-design', name: 'Design', createdAt: now },
        { id: 'cat-news', name: 'Notícias', createdAt: now },
      ];
      var seedLinks = [
        { id: 'l1', title: 'MDN Web Docs', url: 'https://developer.mozilla.org/', categoryId: 'cat-dev', description: 'Documentação de referência para HTML, CSS e JavaScript.', createdAt: now - 1000 },
        { id: 'l2', title: 'GitHub', url: 'https://github.com/', categoryId: 'cat-dev', description: 'Onde o código vive.', createdAt: now - 2000 },
        { id: 'l3', title: 'Figma', url: 'https://www.figma.com/', categoryId: 'cat-design', description: 'Ferramenta colaborativa de design.', createdAt: now - 3000 },
        { id: 'l4', title: 'Dribbble', url: 'https://dribbble.com/', categoryId: 'cat-design', description: 'Inspiração de design e portfólios.', createdAt: now - 4000 },
        { id: 'l5', title: 'The Verge', url: 'https://www.theverge.com/', categoryId: 'cat-news', description: 'Notícias de tecnologia e cultura digital.', createdAt: now - 5000 },
        { id: 'l6', title: 'Hacker News', url: 'https://news.ycombinator.com/', categoryId: 'cat-news', description: 'Notícias e discussões de tecnologia.', createdAt: now - 6000 },
      ];
      write(KEYS.categories, seedCats);
      write(KEYS.links, seedLinks);
      state.categories = seedCats;
      state.links = seedLinks;
    }

    // Build the app shell.
    root.innerHTML =
      '<div class="studio">' +
      '<div id="sidebar-backdrop" class="sidebar-backdrop"></div>' +
      '<aside id="app-sidebar" class="sidebar"></aside>' +
      '<main class="main">' +
      '<header class="topbar">' +
      '<button type="button" class="icon-btn menu-btn" data-action="menu-open" title="Menu">' + I.menu(20) + '</button>' +
      '<div class="search-wrap">' + I.search(18) +
      '<input id="search-input" type="search" placeholder="Buscar links..." /></div>' +
      '<select id="sort-select" class="sort-select" aria-label="Ordenar links">' +
      '<option value="recent">Mais recentes</option>' +
      '<option value="name">Nome (A–Z)</option>' +
      '</select>' +
      '<button type="button" class="primary-btn" data-action="new-link">' + I.plus(18) + '<span>Adicionar link</span></button>' +
      '</header>' +
      '<div id="app-list"></div>' +
      '</main>' +
      '</div>' +
      '<div id="modal-root"></div>' +
      '<div id="toast"></div>';

    renderSidebar();
    renderList();
  }
})();
