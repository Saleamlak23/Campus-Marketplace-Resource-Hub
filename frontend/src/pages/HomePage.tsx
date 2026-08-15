import { Link } from 'react-router-dom';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useAuthStore } from '../store/authStore';

export default function HomePage() {
  const { isAuthenticated, user, university } = useAuthStore();

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-12 text-white shadow-lg sm:px-10">
        <Badge variant="primary" className="mb-4 border-white/20 bg-white/10 text-white">
          Campus Marketplace & Resource Hub
        </Badge>
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Buy, sell, and share resources within your university community
        </h1>
        <p className="mt-4 max-w-2xl text-primary-100">
          Textbooks, past exam papers, tutoring, and peer-to-peer messaging — scoped to your
          campus so every listing and conversation stays local and trustworthy.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="secondary" size="lg">
                Go to dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button variant="secondary" size="lg">
                  Get started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  Log in
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {isAuthenticated && user && (
        <Card>
          <p className="text-sm text-text-muted">Signed in as</p>
          <p className="mt-1 text-lg font-semibold text-text">{user.name}</p>
          {university && (
            <p className="mt-1 text-sm text-text-muted">{university.name}</p>
          )}
        </Card>
      )}

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: 'Textbooks & listings',
            description: 'Browse and sell textbooks, equipment, and past exam papers from peers on your campus.',
          },
          {
            title: 'Find tutors',
            description: 'Discover tutors in your department, scoped to your university community.',
          },
          {
            title: 'Secure & scoped',
            description: 'University email verification ensures you only interact with members of your institution.',
          },
        ].map((feature) => (
          <Card key={feature.title} hoverable>
            <h2 className="text-lg font-semibold text-text">{feature.title}</h2>
            <p className="mt-2 text-sm text-text-muted">{feature.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
