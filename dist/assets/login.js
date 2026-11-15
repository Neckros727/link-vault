(function () {
  'use strict';

  var THEME_KEY = 'linkvault_theme';
  var USER_KEY = 'linkvault_user';

  function readTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || 'light';
    } catch (e) {
      return 'light';
    }
  }

  function applyTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  applyTheme(readTheme());

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('login-form');
    var username = document.getElementById('usuario');
    var password = document.getElementById('senha');
    var signupBtn = document.getElementById('signup-btn');
    var hint = document.getElementById('signup-hint');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = (username.value || '').trim() || 'Usuário';
      try {
        localStorage.setItem(
          USER_KEY,
          JSON.stringify({
            username: (username.value || '').trim(),
            name: name,
            loggedAt: Date.now(),
          })
        );
      } catch (e) {
        /* ignore storage errors */
      }
      window.location.assign('./studio/');
    });

    signupBtn.addEventListener('click', function () {
      hint.hidden = false;
      hint.textContent = 'Conta demo: qualquer usuário e senha funcionam.';
    });
  });
})();
