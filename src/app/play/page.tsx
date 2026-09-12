import { Suspense } from "react";
import { GameLoader } from "@/components/game/GameLoader";

function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center text-sm text-ink-muted" aria-busy="true">
      Laying the field
    </main>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<Loading />}>
      <GameLoader />
    </Suspense>
  );
}
