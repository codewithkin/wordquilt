import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  buyPack,
  emptyProgress,
  freeContentExhausted,
  hintsAvailable,
  ownsPack,
  packSewnCount,
  sewDaily,
  sewPuzzle,
  spendHint,
  today,
  totalSquares,
  type Progress,
} from "@/lib/progress";
import { progressStore } from "@/lib/progress-store";
import { PACKS } from "@/lib/puzzles";

/**
 * Progress, loaded once at launch and written on every change.
 *
 * Writes are fire-and-forget: the UI updates from state immediately and
 * persistence catches up. A player mid-puzzle must never wait on a disk write,
 * and must never see an error about one.
 */

interface ProgressValue {
  progress: Progress;
  ready: boolean;
  hints: number;
  squares: number;
  sewnInPack: (packId: string) => number;
  /** Free packs are owned by everyone; paid ones only once bought. */
  owns: (packId: string) => boolean;
  buy: (packId: string) => void;
  /**
   * Every puzzle the player can reach is sewn. The single condition that opens
   * the Wall — never a timer, a session count, or a number of days.
   */
  outOfContent: boolean;
  sew: (id: string) => void;
  sewDailyFor: (date: string) => void;
  useHint: () => boolean;
}

const ProgressContext = createContext<ProgressValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    progressStore.load().then((p) => {
      setProgress(p);
      setReady(true);
    });
  }, []);

  const update = useCallback((next: Progress) => {
    setProgress(next);
    void progressStore.save(next);
  }, []);

  const sew = useCallback(
    (id: string) => setProgress((p) => { const n = sewPuzzle(p, id); void progressStore.save(n); return n; }),
    [],
  );

  const sewDailyFor = useCallback(
    (date: string) => setProgress((p) => { const n = sewDaily(p, date); void progressStore.save(n); return n; }),
    [],
  );

  const buy = useCallback(
    (packId: string) =>
      setProgress((p) => { const n = buyPack(p, packId); void progressStore.save(n); return n; }),
    [],
  );

  /** Returns whether a hint was actually available to spend. */
  const useHint = useCallback(() => {
    let spent = false;
    setProgress((p) => {
      if (hintsAvailable(p) <= 0) return p;
      spent = true;
      const n = spendHint(p);
      void progressStore.save(n);
      return n;
    });
    return spent;
  }, []);

  const value = useMemo<ProgressValue>(
    () => ({
      progress,
      ready,
      hints: hintsAvailable(progress, today()),
      squares: totalSquares(progress),
      sewnInPack: (packId: string) => packSewnCount(progress, packId),
      owns: (packId: string) => {
        const pack = PACKS.find((p) => p.id === packId);
        return pack ? ownsPack(progress, pack) : false;
      },
      buy,
      outOfContent: freeContentExhausted(progress, PACKS),
      sew,
      sewDailyFor,
      useHint,
    }),
    [progress, ready, buy, sew, sewDailyFor, useHint],
  );

  // `update` is retained for future callers that replace progress wholesale
  // (a restore, a debug reset). Referenced here so it is not dropped as dead.
  void update;

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
