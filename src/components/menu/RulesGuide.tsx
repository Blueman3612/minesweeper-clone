import { FlagIcon, MineIcon } from "@/components/ui/icons";

function Row({ hint, children }: { hint: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex w-[104px] shrink-0 justify-start">{hint}</span>
      <span className="text-sm text-ink">{children}</span>
    </li>
  );
}

export function RulesGuide() {
  return (
    <section
      aria-labelledby="guide-title"
      className="w-full max-w-[728px] rounded-xl border border-line bg-surface p-6"
    >
      <div className="flex items-center justify-between">
        <h2 id="guide-title" className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Field manual
        </h2>
        <span className="flex items-center gap-1 font-mono text-xs text-ink-muted">
          <span className="n1">1</span>
          <span className="n2">2</span>
          <span className="n3">3</span>
          <span className="n4">4</span>
          <span className="n5">5</span>
          <span className="n6">6</span>
          <span className="n7">7</span>
          <span className="n8">8</span>
        </span>
      </div>

      <div className="mt-5 grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-muted">Controls</h3>
          <ul className="space-y-3">
            <Row hint={<span className="kbd">Left click</span>}>Reveal a cell</Row>
            <Row hint={<span className="kbd">Right click</span>}>
              Cycle <FlagIcon size={14} className="inline align-[-2px] text-ink" /> flag, ? mark, clear
            </Row>
            <Row hint={<span className="kbd">Face</span>}>Start a new round</Row>
            <Row hint={<span className="kbd">Menu</span>}>Change difficulty</Row>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-muted">Rules</h3>
          <ul className="space-y-3">
            <Row hint={<span className="font-mono text-sm"><span className="n1">1</span> to <span className="n8">8</span></span>}>
              Mines in the 8 cells around it
            </Row>
            <Row hint={<span className="kbd">Win</span>}>Reveal every safe cell</Row>
            <Row hint={<span className="kbd"><MineIcon size={12} className="mr-1" />Lose</span>}>Reveal a mine</Row>
            <Row hint={<span className="kbd">First click</span>}>Always safe. Starts the clock</Row>
          </ul>
        </div>
      </div>

      <p className="mt-6 border-t border-line pt-4 text-xs text-ink-muted">
        Best times are saved in this browser, one per difficulty.
      </p>
    </section>
  );
}
