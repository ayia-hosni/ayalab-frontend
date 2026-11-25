/**
 * Problems whose three visualizer tabs are still the hand-written React components rather than
 * rows in problem_game_configs. They use a fixed-slot node layout (nodes stay put while links
 * reverse) that the generic engines can't draw yet, so the tab wrappers fall back to these when
 * a problem has no config. Move a problem out of here once its configs are seeded.
 */
export type LegacyGameLoader = () => Promise<{ default: any }>;

export interface LegacyGameModules {
  movePointer: LegacyGameLoader;
  solutionSlides: LegacyGameLoader;
  traceGame: LegacyGameLoader;
}

export const LEGACY_GAMES: Record<string, LegacyGameModules> = {
  'remove-linked-list-elements': {
    movePointer:    () => import('./move-pointer-remove-elements-react'),
    solutionSlides: () => import('./solution-slides-remove-elements-react'),
    traceGame:      () => import('./linked-list-game-remove-elements-react'),
  },
  'fibonacci-number': {
    movePointer:    () => import('./move-pointer-fibonacci-react'),
    solutionSlides: () => import('./solution-slides-fibonacci-react'),
    traceGame:      () => import('./linked-list-game-fibonacci-react'),
  },
  'palindrome-linked-list': {
    movePointer:    () => import('./move-pointer-palindrome-react'),
    solutionSlides: () => import('./solution-slides-palindrome-react'),
    traceGame:      () => import('./linked-list-game-palindrome-react'),
  },
};
