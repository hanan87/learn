import type { ReactNode } from 'react';

/**
 * Holds a step's main button ("Got it, continue", "Check", "Finish"). It sits after the step's content
 * and sticks to the bottom of the lesson's scroll area when the content is taller than the screen, so
 * the button is always within thumb reach without scrolling. The faded top edge lets content scroll
 * under it; only the button itself takes taps.
 */
export function StepAction({ children }: { children: ReactNode }) {
  return (
    <div
      className="pointer-events-none sticky bottom-0 z-[5] -mx-4 bg-linear-to-t from-slate-50 from-65% to-transparent px-4 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] *:pointer-events-auto"
      data-testid="step-action"
    >
      {children}
    </div>
  );
}
