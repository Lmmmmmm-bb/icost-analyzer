export function DashboardBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_8%,color-mix(in_oklch,var(--primary),transparent_86%),transparent_24rem),radial-gradient(circle_at_88%_18%,color-mix(in_oklch,var(--chart-1),transparent_84%),transparent_22rem),linear-gradient(rgba(148,163,184,0.075)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.075)_1px,transparent_1px)] bg-[size:100%_100%,100%_100%,48px_48px,48px_48px]"
      />
      <div
        aria-hidden="true"
        className="ledger-noise pointer-events-none fixed inset-0 mix-blend-multiply"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-32 bg-gradient-to-b from-background via-background/70 to-transparent"
      />
    </>
  )
}
