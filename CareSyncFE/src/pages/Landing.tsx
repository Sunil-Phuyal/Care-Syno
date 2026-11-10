// src/pages/Landing.tsx
// Public home page for CareSyno. Logged-in users are sent straight to the dashboard.

import { Link, Navigate } from 'react-router-dom';
import { Bell, Check, ChevronDown, ClipboardList, Clock, FileText, Globe, HeartHandshake, Home, Mail, Pill, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import careSyncLogo from '../assets/careSyncLogo.svg?url';

const FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900';

const BTN_PRIMARY = `inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 active:bg-primary-800 ${FOCUS}`;
const BTN_SECONDARY = `inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 ${FOCUS}`;

/* ------------------------------------------------------------------ */
/* Hero visual: one day of medicines for an example patient            */
/* ------------------------------------------------------------------ */

type Dose = {
  time: string;
  medicine: string;
  detail: string;
  status: 'given' | 'due';
  note: string;
};

const DOSES: Dose[] = [
  { time: '8:00 AM', medicine: 'Metformin', detail: '500 mg, with breakfast', status: 'given', note: 'Given by Sita at 8:04' },
  { time: '1:00 PM', medicine: 'Amlodipine', detail: '5 mg', status: 'given', note: 'Given by Ram at 1:02' },
  { time: '8:00 PM', medicine: 'Atorvastatin', detail: '20 mg, after dinner', status: 'due', note: 'Due in 25 minutes' },
];

function DayTimeline() {
  return (
    <figure className="relative w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between bg-primary-700 px-5 py-4 text-white dark:bg-primary-800">
          <div>
            <p className="text-xs text-primary-100">Today&rsquo;s medicines</p>
            <p className="font-display text-lg font-semibold leading-tight">Aama, 72</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-semibold leading-none">2 of 3</p>
            <p className="mt-1 text-xs text-primary-100">doses given</p>
          </div>
        </div>

        <ol className="relative px-5 py-5">
          <span
            aria-hidden="true"
            className="absolute bottom-9 left-[2.15rem] top-9 w-px bg-primary-200 dark:bg-gray-600"
          />
          {DOSES.map((d) => (
            <li key={d.time} className="relative flex gap-4 pb-6 last:pb-0">
              <span className="relative z-10 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center">
                {d.status === 'given' ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                ) : (
                  <span className="relative flex h-6 w-6 items-center justify-center">
                    <span className="absolute h-6 w-6 rounded-full bg-warning-400 opacity-50 motion-safe:animate-ping" />
                    <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-warning-500 text-white">
                      <Clock className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                  </span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-gray-900 dark:text-gray-50">{d.medicine}</p>
                  <p className="flex-shrink-0 text-xs tabular-nums text-gray-500 dark:text-gray-400">{d.time}</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{d.detail}</p>
                <p
                  className={
                    d.status === 'due'
                      ? 'mt-1 text-xs font-semibold text-warning-700 dark:text-warning-400'
                      : 'mt-1 text-xs text-primary-700 dark:text-primary-400'
                  }
                >
                  {d.note}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex items-center gap-3 border-t border-gray-100 bg-gray-50 px-5 py-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
          <Mail className="h-4 w-4 flex-shrink-0 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          Reminder emailed to Sita and Ram
        </div>
      </div>
      <div className="-mt-3 ml-8 hidden w-fit items-center gap-3 rounded-xl border border-warning-200 bg-white px-4 py-3 shadow-lg dark:border-warning-700 dark:bg-gray-800 lg:relative lg:z-10 lg:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-300">
          <Bell className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">Atorvastatin at 8:00 PM</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Reminder sent to 2 caregivers</p>
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-gray-500 dark:text-gray-400">Example schedule with sample data.</figcaption>
    </figure>
  );
}
/* ------------------------------------------------------------------ */
/* Permissions visual                                                  */
/* ------------------------------------------------------------------ */

const PERMISSION_ROWS: { label: string; sita: boolean; ram: boolean }[] = [
  { label: 'View medicines and history', sita: true, ram: true },
  { label: 'Record a dose as given', sita: true, ram: true },
  { label: 'Edit dose times', sita: true, ram: false },
  { label: 'Invite or remove caregivers', sita: false, ram: false },
];

function Mark({ on }: { on: boolean }) {
  return on ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-label="Allowed" />
    </span>
  ) : (
    <span className="inline-block h-0.5 w-3 rounded bg-gray-300 dark:bg-gray-600" role="img" aria-label="Not allowed" />
  );
}

function PermissionsPanel() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Example of what each caregiver is allowed to do</caption>
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <th scope="col" className="px-4 py-3 font-medium">Can this person&hellip;</th>
            <th scope="col" className="w-20 px-2 py-3 text-center font-medium">Sita</th>
            <th scope="col" className="w-20 px-2 py-3 text-center font-medium">Ram</th>
          </tr>
        </thead>
        <tbody>
          {PERMISSION_ROWS.map((r) => (
            <tr key={r.label} className="border-b border-gray-100 last:border-0 dark:border-gray-700/60">
              <th scope="row" className="px-4 py-3 font-normal text-gray-800 dark:text-gray-200">{r.label}</th>
              <td className="px-2 py-3 text-center"><Mark on={r.sita} /></td>
              <td className="px-2 py-3 text-center"><Mark on={r.ram} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    icon: Pill,
    title: 'Medicine schedules',
    text: 'Add each medicine with its dose times. Keep schedules for more than one person in the same account.',
  },
  {
    icon: Mail,
    title: 'Reminder emails',
    text: 'Caregivers get an email 30 minutes before a dose, 5 minutes before, and when it is due.',
  },
  {
    icon: ClipboardList,
    title: 'A record of every dose',
    text: 'Mark doses as given or skipped. The history shows who gave what, and when.',
  },
  {
    icon: Users,
    title: 'Family access you control',
    text: 'Invite relatives and helpers by email, then choose what each of them can see and change.',
  },
  {
    icon: FileText,
    title: 'Adherence reports',
    text: 'See how consistently medicines were taken, and print a summary for the next doctor visit.',
  },
];

const SCENARIOS = [
  {
    icon: Home,
    title: 'You live with them',
    text: 'Enter the morning and evening doses once. Whoever is at home that day sees what is due and marks it done.',
  },
  {
    icon: Globe,
    title: 'You live far away',
    text: 'A son or daughter working abroad can see that the afternoon tablet was given, without phoning to check.',
  },
  {
    icon: HeartHandshake,
    title: 'You rely on a helper',
    text: 'Give a nurse or neighbour access to record doses only, and keep changes to the schedule to yourself.',
  },
];

const FAQ = [
  {
    q: 'Who can see my family\u2019s information?',
    a: 'Only you and the caregivers you invite. Each caregiver gets just the permissions you choose for them.',
  },
  {
    q: 'Does a caregiver need to install anything?',
    a: 'No. They get an email invitation, set a password, and sign in from any browser, including a phone.',
  },
  {
    q: 'Will I get reminders if the page is closed?',
    a: 'Yes. Reminder emails go out whether or not the app is open. Browser notifications are optional and can be switched on in settings.',
  },
  {
    q: 'Does CareSyno give medical advice?',
    a: 'No. It records and reminds what a doctor or pharmacist has prescribed. Always follow the prescription and ask a professional if you are unsure.',
  },
];

const STEPS = [
  { title: 'Add the person you care for', text: 'Create your account and add their profile.' },
  { title: 'Enter their medicines and times', text: 'Set the dose times once. CareSyno tracks the rest of the day.' },
  { title: 'Invite the rest of the family', text: 'Everyone sees the same schedule and gets the same reminders.' },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function Landing() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // A saved token means the visitor is probably signed in and the server is still checking it.
  const hasSession = Boolean(storage.getToken());

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/85 backdrop-blur dark:border-gray-800 dark:bg-gray-900/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className={`flex items-center gap-2.5 rounded-lg ${FOCUS}`}>
            <img src={careSyncLogo} alt="" className="h-9 w-9" />
            <span className="font-display text-xl font-bold tracking-tight">CareSyno</span>
          </Link>

          <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
            <a
              href="#features"
              className={`hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white sm:inline-block ${FOCUS}`}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className={`hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white sm:inline-block ${FOCUS}`}
            >
              How it works
            </a>
            <a
              href="#faq"
              className={`hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white md:inline-block ${FOCUS}`}
            >
              FAQ
            </a>
            {hasSession ? (
              <Link to="/dashboard" className={`${BTN_PRIMARY} !px-4 !py-2`}>
                Open dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 hover:text-primary-700 dark:text-gray-100 dark:hover:text-primary-300 ${FOCUS}`}
                >
                  Sign in
                </Link>
                <Link to="/register" className={`${BTN_PRIMARY} !px-4 !py-2`}>
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary-50 dark:bg-gray-800/40">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-primary-200/60 blur-3xl dark:bg-primary-800/25" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-warning-100/70 blur-3xl dark:bg-warning-900/10" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
            <div>
              <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-primary-950 dark:text-gray-50 sm:text-5xl lg:text-[3.5rem]">
                Everyone who helps care for them, on the same schedule.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                CareSyno keeps medicine times, given doses and caregiver access in one place, so nobody has to
                phone around to ask whether the evening tablet was taken.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className={`${BTN_PRIMARY} w-full sm:w-auto`}>
                  Create an account
                </Link>
                <Link to="/login" className={`${BTN_SECONDARY} w-full sm:w-auto`}>
                  Sign in
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                {['Email reminders', 'Caregiver permissions', 'Works on any phone'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" strokeWidth={3} aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center lg:justify-end">
              <DayTimeline />
            </div>
          </div>
        </section>

        {/* Who it is for */}
        <section>
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
            <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Built for how families really share care
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {SCENARIOS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="border-t-2 border-primary-600 pt-5 dark:border-primary-500">
                  <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-lg font-semibold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-16 bg-primary-50/70 dark:bg-gray-800/30">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-24">
            <div className="lg:sticky lg:top-8 lg:self-start">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                What CareSyno does
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-gray-600 dark:text-gray-400">
                A small set of tools for the daily job of making sure the right medicine is given at the right
                time, by someone who can be trusted to do it.
              </p>
            </div>

            <ul className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-700 dark:border-gray-700">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4 py-6">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/60 dark:text-primary-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{title}</h3>
                    <p className="mt-1 leading-relaxed text-gray-600 dark:text-gray-400">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Permissions */}
        <section>
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                A helper does not need to see everything
              </h2>
              <p className="mt-4 max-w-lg leading-relaxed text-gray-700 dark:text-gray-300">
                A neighbour who gives the morning tablet can record doses without being able to change the
                schedule or invite anyone else. You decide, caregiver by caregiver, and you can change it later.
              </p>
            </div>
            <PermissionsPanel />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-16 bg-primary-50/70 dark:bg-gray-800/30">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Set up in three steps</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4 md:block">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 font-display text-lg font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="md:mt-4">
                    <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1 leading-relaxed text-gray-600 dark:text-gray-400">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-16">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-24">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Common questions</h2>
            <div className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-700 dark:border-gray-700">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 rounded font-semibold [&::-webkit-details-marker]:hidden ${FOCUS}`}>
                    {f.q}
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-400">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="bg-primary-800 dark:bg-primary-900">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center">
            <h2 className="max-w-xl font-display text-3xl font-bold leading-tight tracking-tight text-white">
              Start with one person and one medicine.
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className={`inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary-800 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800`}
              >
                Create an account
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg border border-primary-300 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-gray-500 dark:text-gray-400 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <img src={careSyncLogo} alt="" className="h-7 w-7" />
            <span className="font-display font-semibold text-gray-800 dark:text-gray-200">CareSyno</span>
            <span>&copy; 2026</span>
          </div>
          <nav aria-label="Footer" className="flex gap-5">
            <Link to="/login" className="hover:text-gray-800 dark:hover:text-gray-200">Sign in</Link>
            <Link to="/register" className="hover:text-gray-800 dark:hover:text-gray-200">Create account</Link>
            <a href="#faq" className="hover:text-gray-800 dark:hover:text-gray-200">FAQ</a>
          </nav>
          <p className="max-w-md">
            If the site has been idle, the first page can take about a minute to respond while the server wakes up.
          </p>
        </div>
      </footer>
    </div>
  );
}