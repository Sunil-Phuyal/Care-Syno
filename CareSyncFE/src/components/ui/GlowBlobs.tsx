// src/components/ui/GlowBlobs.tsx
// Soft background glow for coloured side panels: mint at the top right, yellow at the bottom left.
// The parent needs `relative isolate overflow-clip` (a `fixed` parent already counts as relative).
// Use `small` for narrow areas such as the app sidebar.

export function GlowBlobs({ small = false }: { small?: boolean }) {
  const mint = small ? '-right-16 -top-16 h-56 w-56' : '-right-24 -top-28 h-96 w-96';
  const warm = small ? '-bottom-20 -left-16 h-48 w-48' : '-bottom-32 -left-24 h-80 w-80';

  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute ${mint} -z-10 rounded-full bg-primary-200/60 blur-3xl dark:bg-primary-800/25 print:hidden`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute ${warm} -z-10 rounded-full bg-warning-100/70 blur-3xl dark:bg-warning-900/10 print:hidden`}
      />
    </>
  );
}