/**
 * Shape of the form state shared between the Predictor and Simulator
 * screens (see `contexts/PlannerContext.tsx`) and persisted via
 * `lib/storage.ts`. Kept as plain data - no React/RN imports - so it can be
 * validated and defaulted independently of the provider.
 */

export interface PredictorState {
  currentPulls: string;
  stellarJade: string;
  starlight: string;
  daysUntilEnd: string;
  updatesUntilChar: string;
  updateHalf: 'First' | 'Second';
  paidStatus: 'F2P' | 'BP' | 'ESP' | 'ESP+BP';
}

export interface SimulatorState {
  numPulls: string;
  characterPity: string;
  lightconePity: string;
  numCharWanted: string;
  numLightWanted: string;
  guaranteedChar: 'Yes' | 'No';
  guaranteedLight: 'Yes' | 'No';
}

export interface PlannerState {
  predictor: PredictorState;
  simulator: SimulatorState;
  /** Set by the Predictor screen's "Predict" action; consumed by the Simulator's "Use predicted pulls" chip. */
  lastPredictedPulls: number | null;
}

export const DEFAULT_PLANNER_STATE: PlannerState = {
  predictor: {
    currentPulls: '',
    stellarJade: '',
    starlight: '',
    daysUntilEnd: '',
    updatesUntilChar: '',
    updateHalf: 'First',
    paidStatus: 'F2P',
  },
  simulator: {
    numPulls: '',
    characterPity: '',
    lightconePity: '',
    numCharWanted: '',
    numLightWanted: '',
    guaranteedChar: 'No',
    guaranteedLight: 'No',
  },
  lastPredictedPulls: null,
};
