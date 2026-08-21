import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useAuthStore } from '../store/authStore';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="space-y-16 pb-8">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white shadow-lg sm:px-10 sm:py-16 lg:px-16">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-32 border-accent-500/30" />
        <div className="absolute bottom-0 right-20 h-28 w-28 rounded-full bg-primary-500/20 blur-2xl" />
        <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-accent-300">
              Your campus, connected
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Make campus life work better together.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Campus Marketplace brings the things students need into one trusted space: useful
              resources, fair exchanges, and help from people who understand your course.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button variant="secondary" size="lg">Open dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button variant="secondary" size="lg">Join your campus</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="border-slate-600 bg-transparent text-white hover:bg-white/10">
                      Log in
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <p className="mt-5 text-xs text-slate-400">Built for university communities. Kept local by design.</p>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:ml-auto">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs text-slate-400">Campus exchange</p>
                  <p className="mt-1 font-semibold">What do you need today?</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-slate-950">CM</span>
              </div>
              <div className="space-y-3 py-4">
                {['Find course resources', 'Connect with a tutor', 'Sell what you no longer need'].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-primary-700">0{index + 1}</span>
                    <span className="text-sm text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-accent-500 px-4 py-3 text-sm font-semibold text-slate-950">
                One place for your next step.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">Everything in one place</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">A practical hub for the everyday student.</h2>
          <p className="mt-4 text-text-muted">Spend less time searching across scattered groups and more time finding the right resource, person, or opportunity.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { number: '01', title: 'Browse & exchange', description: 'Find textbooks, equipment, and past papers from students at your university.' },
            { number: '02', title: 'Learn together', description: 'Discover tutors in your department and get support that fits your course.' },
            { number: '03', title: 'Stay connected', description: 'Message peers directly and keep every conversation close to the campus community.' },
          ].map((feature) => (
            <Card key={feature.number} hoverable className="border-t-4 border-t-primary-500">
              <span className="text-sm font-bold text-accent-600">{feature.number}</span>
              <h3 className="mt-5 text-xl font-semibold text-text">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-text-muted">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-8 border-y border-border py-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">Simple by design</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-text">From need to next step in three moves.</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            ['Create an account', 'Use your university details to join your campus.'],
            ['Explore what is available', 'Search listings, tutoring, and conversations.'],
            ['Make it happen', 'Connect, exchange, and keep moving forward.'],
          ].map(([title, description], index) => (
            <div key={title} className="relative">
              <span className="text-2xl font-bold text-primary-200">0{index + 1}</span>
              <h3 className="mt-3 font-semibold text-text">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {!isAuthenticated && (
        <section className="rounded-2xl bg-accent-50 px-6 py-10 text-center sm:px-10">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Ready to find your people and resources?</h2>
          <p className="mx-auto mt-3 max-w-xl text-text-muted">Join your university community and make your next campus exchange a little easier.</p>
          <Link to="/register" className="mt-6 inline-block">
            <Button size="lg">Create your account</Button>
          </Link>
        </section>
      )}
    </div>
  );
}
