// src/components/ui/GlowBlobs.tsx
// Soft background glow used on every page: mint at the top right, yellow at the bottom left.
// The parent needs `relative isolate` (and `overflow-clip` when it should crop the glow).
// Use `fixed` for the logged-in app, where the glow stays in place while the page scrolls.

export function GlowBlobs({ fixed = false }: { fixed?: boolean }) {
  const mint = fixed ? 'fixed -right-24 -top-28' : 'absolute -right-24 -top-28';
  const warm = fixed ? 'fixed -bottom-32 -left-24 lg:left-48' : 'absolute -bottom-32 -left-24';

  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none ${mint} -z-10 h-96 w-96 rounded-full bg-primary-200/60 blur-3xl dark:bg-primary-800/25 print:hidden`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none ${warm} -z-10 h-80 w-80 rounded-full bg-warning-100/70 blur-3xl dark:bg-warning-900/10 print:hidden`}
      />
    </>
  );
}