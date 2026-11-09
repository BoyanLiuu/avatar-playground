// Locks survive a reload (localStorage). They are read at boot (./boot.ts), before the playground
// first draws. Saved data is untrusted: anything that is not a list of a style's own part keys is
// ignored.
import { z } from "zod";
import { STYLES, type StyleId } from "@/content/styles";
import { usePlayground } from "./playground";

export const LOCKS_KEY = "avatar-locks";

const Saved = z.object({
  v: z.literal(1),
  locks: z.partialRecord(
    z.enum(STYLES.map((s) => s.id) as [StyleId, ...StyleId[]]),
    z.array(z.string().max(32)).max(16),
  ),
});

/** Parse saved locks; anything malformed reads as nothing saved. */
export const parseLocks = (raw: string | null) => {
  if (!raw) return {};
  try {
    const saved = Saved.safeParse(JSON.parse(raw));
    return saved.success ? saved.data.locks : {};
  } catch {
    return {};
  }
};

export const serializeLocks = (locks: Partial<Record<StyleId, string[]>>) =>
  JSON.stringify({ v: 1, locks });

const locksOf = () => {
  const { memory } = usePlayground.getState();
  return Object.fromEntries(STYLES.map(({ id }) => [id, memory[id].locks]));
};

/** Apply the saved locks (once, at boot). */
export const restoreSavedLocks = () => {
  try {
    const saved = parseLocks(localStorage.getItem(LOCKS_KEY));
    if (Object.keys(saved).length) usePlayground.getState().restoreLocks(saved);
  } catch {
    // storage unavailable: locks last for this page only
  }
};

/** Save the locks whenever they change; returns the unsubscribe. */
export const saveLocksOnChange = () => {
  let last = JSON.stringify(locksOf());
  return usePlayground.subscribe(() => {
    const now = JSON.stringify(locksOf());
    if (now === last) return;
    last = now;
    try {
      localStorage.setItem(LOCKS_KEY, serializeLocks(JSON.parse(now)));
    } catch {
      // storage full or unavailable: keep going without saving
    }
  });
};
