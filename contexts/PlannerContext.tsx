/**
 * Shares form state between the Predictor and Simulator screens and
 * persists it across app restarts. Mounted once at `app/(tabs)/_layout.tsx`
 * so both tab screens - which stay mounted for the app's lifetime under one
 * tab navigator - read and write through the same state instead of local
 * `useState`.
 */

import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { loadPlannerState, savePlannerState } from '@/lib/storage';
import { DEFAULT_PLANNER_STATE, PlannerState } from '@/lib/plannerState';

type PlannerContextValue = [PlannerState, Dispatch<SetStateAction<PlannerState>>];

const PlannerContext = createContext<PlannerContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 400;

export function PlannerProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<PlannerState>(DEFAULT_PLANNER_STATE);
  const hasLoaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted state once on mount.
  useEffect(() => {
    let cancelled = false;
    loadPlannerState().then((loaded) => {
      if (cancelled) return;
      if (loaded) setState(loaded);
      hasLoaded.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounce-save on every change, but only after the initial load has
  // resolved - otherwise the default state would briefly overwrite storage.
  useEffect(() => {
    if (!hasLoaded.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      savePlannerState(state);
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  const value = useMemo<PlannerContextValue>(() => [state, setState], [state]);

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlannerState(): PlannerContextValue {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlannerState must be used within a PlannerProvider');
  return ctx;
}
