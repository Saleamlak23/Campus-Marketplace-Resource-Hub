import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-text-muted">
          © {year} Campus Marketplace & Resource Hub. Built for university communities.
        </p>
        <div className="flex gap-6 text-sm">
          <Link to="/" className="text-text-muted transition-colors hover:text-text">
            Home
          </Link>
          <Link to="/login" className="text-text-muted transition-colors hover:text-text">
            Log in
          </Link>
          <Link to="/register" className="text-text-muted transition-colors hover:text-text">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
