export const metadata = {
  title: 'Classificados Brasília',
  description: 'Plataforma de classificados para acompanhantes em Brasília',
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <a href="/" className="brand">Classificados Brasília</a>
            <nav className="nav">
              <a href="/" className="nav-link">Vitrine</a>
              <a href="/cadastro" className="nav-link">Cadastrar Perfil</a>
              <a href="/chat" className="nav-link">Chat</a>
            </nav>
          </div>
        </header>
        <main className="container">
          {children}
        </main>
        <footer className="site-footer">
          <div className="container">
            <small>© {new Date().getFullYear()} Classificados Brasília</small>
          </div>
        </footer>
      </body>
    </html>
  );
}
