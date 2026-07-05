export function DashboardBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,color-mix(in_oklch,var(--primary),transparent_94%),transparent_24rem),linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-size-[100%_100%,56px_56px,56px_56px]"
      />
      <div
        aria-hidden="true"
        className="ledger-noise pointer-events-none fixed inset-0 opacity-70 mix-blend-multiply"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-32 bg-linear-to-b from-background via-background/70 to-transparent"
      />
    </>
  )
}
