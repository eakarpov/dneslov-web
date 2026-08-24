import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Last known good answer for every backend request we have ever made.
//
// dneslov.org goes silent often — roughly a third of requests during
// development — and a calendar reference that is briefly unreachable is far
// better served from yesterday's copy than from an error page. Next's own data
// cache cannot do this: it stores successes only, and a failed fetch there just
// propagates.
//
// Entries are files under a cache directory so the copy survives a restart or a
// redeploy of the frontend, which is exactly when the backend being down hurts
// most.

const DIR = process.env.LEGACY_CACHE_DIR || join(process.cwd(), ".cache", "legacy");

// Past this, a saved copy is considered too old to stand in for the real thing.
const MAX_AGE_MS = Number(process.env.LEGACY_CACHE_MAX_AGE_MS || 30 * 24 * 3600 * 1000);

// Rough ceiling on entries; pruned occasionally rather than on every write.
const MAX_ENTRIES = Number(process.env.LEGACY_CACHE_MAX_ENTRIES || 2000);
const PRUNE_EVERY = 50;

interface Entry {
    savedAt: number;
    value: unknown;
}

// Same-process memory, so a hot key costs no disk read at all.
const memory = new Map<string, Entry>();
let writesSincePrune = 0;

const fileFor = (key: string) => join(DIR, `${createHash("sha1").update(key).digest("hex")}.json`);

const prune = async () => {
    try {
        const names = await readdir(DIR);
        if (names.length <= MAX_ENTRIES) return;

        const withTimes = await Promise.all(
            names.map(async (name) => {
                const path = join(DIR, name);
                return { path, mtime: (await stat(path)).mtimeMs };
            }),
        );

        withTimes
            .sort((a, b) => a.mtime - b.mtime)
            .slice(0, withTimes.length - MAX_ENTRIES)
            .forEach(({ path }) => {
                unlink(path).catch(() => undefined);
            });
    } catch {
        // Pruning is housekeeping; never let it break a request.
    }
};

export const rememberFresh = async (key: string, value: unknown): Promise<void> => {
    const entry: Entry = { savedAt: Date.now(), value };
    memory.set(key, entry);

    try {
        await mkdir(DIR, { recursive: true });
        await writeFile(fileFor(key), JSON.stringify(entry), "utf8");

        writesSincePrune += 1;
        if (writesSincePrune >= PRUNE_EVERY) {
            writesSincePrune = 0;
            await prune();
        }
    } catch {
        // A read-only or full disk must not take the site down; the in-process
        // copy still helps for the lifetime of this server.
    }
};

export interface StaleHit {
    value: unknown;
    savedAt: number;
}

export const recallStale = async (key: string): Promise<StaleHit | null> => {
    const fromMemory = memory.get(key);
    const entry =
        fromMemory ??
        (await readFile(fileFor(key), "utf8")
            .then((raw) => JSON.parse(raw) as Entry)
            .catch(() => null));

    if (!entry) return null;
    if (Date.now() - entry.savedAt > MAX_AGE_MS) return null;

    if (!fromMemory) memory.set(key, entry);

    return { value: entry.value, savedAt: entry.savedAt };
};
