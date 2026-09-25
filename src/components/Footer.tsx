import Link from 'next/link';
import { HeartHandshake, ShieldCheck, Accessibility, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xl">
              <HeartHandshake className="w-6 h-6" />
              <span>NourishLink</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Empowering local communities by connecting donors, food banks, and individuals in need. 
              Engineered with accessible WCAG AAA high-contrast design, real-time logistics, and 
              AI-driven food triage to eliminate food waste and fight food insecurity.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                <Accessibility className="w-3.5 h-3.5" /> WCAG AAA Accessible
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Encrypted & RBAC Protected
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Shelf-Life Triage
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/donations" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Surplus Food Listings
                </Link>
              </li>
              <li>
                <Link href="/food-banks" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Pantry Network
                </Link>
              </li>
              <li>
                <Link href="/donor" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Donor Hub
                </Link>
              </li>
              <li>
                <Link href="/recipient" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Request Assistance
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Pantry Operations
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer Attribution (Assignment Mandatory Specification) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Developer Profile
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Developed By</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Sarthak Sethi</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Fullstack Web Engineer</p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <a
                  href="https://www.github.com/sarthakj7792"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  aria-label="GitHub Profile of Sarthak Sethi"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>github.com/sarthakj7792</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/sarthaksethi5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  aria-label="LinkedIn Profile of Sarthak Sethi"
                >
                  <svg className="w-4 h-4 fill-current text-sky-600" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>linkedin.com/in/sarthaksethi5</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & attribution */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>
            © {new Date().getFullYear()} NourishLink — Built for House of Edtech Fullstack Developer Assignment.
          </p>
          <div className="flex gap-4">
            <span>Next.js 16</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Prisma & PostgreSQL</span>
            <span>•</span>
            <span>AI Triage</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
