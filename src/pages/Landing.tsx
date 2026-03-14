import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Rocket, BarChart3, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    title: 'Real-time stock visibility',
    description: 'Track inventory levels instantly across warehouses and locations.',
    icon: BarChart3,
  },
  {
    title: 'Fast receipts & deliveries',
    description: 'Create and process receipts, deliveries, and transfers in seconds.',
    icon: Rocket,
  },
  {
    title: 'Secure access controls',
    description: 'Role-based permissions keeps your inventory data safe.',
    icon: ShieldCheck,
  },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-9 h-9 text-emerald-200" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">CoreInventory</h1>
            <p className="text-xs text-emerald-200/80">Inventory management made fast & simple</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl border border-emerald-200/30 text-sm font-semibold text-emerald-100 hover:bg-white/10 transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-white shadow-sm shadow-emerald-500/30 transition"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Make inventory management effortless.
            </h2>
            <p className="text-slate-200 text-lg sm:text-xl max-w-xl">
              CoreInventory helps teams stay in sync with stock levels, move orders quickly, and
              keep warehouses running smoothly — all from one clean dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition"
              >
                Get started
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-emerald-200 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-200/90">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-3xl bg-white/5 border border-white/10 p-10 shadow-xl shadow-black/20">
          <h3 className="text-2xl font-bold">Ready to modernize your warehouse?</h3>
          <p className="mt-2 text-slate-200/90 max-w-2xl">
            Start with a free trial account today. No credit card required — just sign up and
            start tracking stock across your locations.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition"
            >
              Create a free account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
            >
              I already have an account
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-200/70">
          <span>© {new Date().getFullYear()} CoreInventory</span>
          <span>Built with React, Tailwind & TypeScript</span>
        </div>
      </footer>
    </div>
  );
}
