export const GAME_SAVE_KEY = "portfolio_game_saves_v1";
export const SAVE_SLOT_COUNT = 3;

export type GameSaveState = {
  isDismissed: boolean;
  showSpriteDialog: boolean;
  activeDialogIndex: number;
  isStartPressed: boolean;
  isTransitionFading: boolean;
  savedAt: string;
  version: 1;
};

export type SaveSlot = {
  slot: number;
  state: GameSaveState | null;
};

type SaveStorage = Partial<Record<number, GameSaveState>>;

function readSaveStorage(): SaveStorage {
  const raw = localStorage.getItem(GAME_SAVE_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as SaveStorage;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function isValidSaveState(value: Partial<GameSaveState> | undefined): value is GameSaveState {
  if (!value) {
    return false;
  }

  return (
    value.version === 1 &&
    typeof value.isDismissed === "boolean" &&
    typeof value.showSpriteDialog === "boolean" &&
    typeof value.activeDialogIndex === "number" &&
    typeof value.isStartPressed === "boolean" &&
    typeof value.isTransitionFading === "boolean" &&
    typeof value.savedAt === "string"
  );
}

export function listSaveSlots(): SaveSlot[] {
  const storage = readSaveStorage();

  return Array.from({ length: SAVE_SLOT_COUNT }, (_, index) => {
    const slot = index + 1;
    const candidate = storage[slot];

    return {
      slot,
      state: isValidSaveState(candidate) ? candidate : null,
    };
  });
}

export function saveGameStateToSlot(
  slot: number,
  state: Omit<GameSaveState, "savedAt" | "version">,
) {
  const storage = readSaveStorage();
  const payload: GameSaveState = {
    ...state,
    savedAt: new Date().toISOString(),
    version: 1,
  };

  storage[slot] = payload;
  localStorage.setItem(GAME_SAVE_KEY, JSON.stringify(storage));
}

export function loadGameStateFromSlot(slot: number): GameSaveState | null {
  const storage = readSaveStorage();
  const candidate = storage[slot];

  if (!isValidSaveState(candidate)) {
    return null;
  }

  return candidate;
}

export function formatSavedAt(savedAt: string): string {
  const date = new Date(savedAt);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString();
}

export function sanitizeSlot(slot: number): number {
  if (slot < 1) {
    return 1;
  }

  if (slot > SAVE_SLOT_COUNT) {
    return SAVE_SLOT_COUNT;
  }

  return slot;
}

export function clearAllSaves() {
  localStorage.removeItem(GAME_SAVE_KEY);
}
