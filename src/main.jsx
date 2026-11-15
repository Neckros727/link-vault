import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { applyTheme, getTheme, login } from './lib/store.js';
import './styles.css';

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="field-icon"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="field-icon"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="submit-icon"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hint, setHint] = useState(false);

  useEffect(() => {
    applyTheme(getTheme());
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    login(username, password);
    window.location.assign('./studio/');
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <span>L</span>
          </div>
          <h1 className="login-title">LinkVault AI</h1>
          <p className="login-subtitle">Bem-vindo de volta</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="usuario">Usuário</label>
            <div className="input-wrap">
              <MailIcon />
              <input
                id="usuario"
                type="text"
                required
                placeholder="usuário"
                value={username}
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="senha">Senha</label>
            <div className="input-wrap">
              <LockIcon />
              <input
                id="senha"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="login-submit">
            Entrar Agora
            <ArrowIcon />
          </button>
        </form>

        <div className="signup-row">
          <button
            type="button"
            className="signup-btn"
            onClick={() => setHint(true)}
          >
            Não tem uma conta? Crie agora
          </button>
          {hint && (
            <p className="signup-hint" role="status">
              Conta demo: qualquer usuário e senha funcionam.
            </p>
          )}
        </div>

        <div className="login-footer">
          <p>ACESSO RESTRITO • LINKVAULT V1.0</p>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Login />);
