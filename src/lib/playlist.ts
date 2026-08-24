import { IMemory } from "../dto/memory";
import { getScriptumTitle } from "./liturgical";

// The day's chants, gathered from its memories. The reference has the audio —
// the monolith plays it one file at a time inside a memory page and offers no
// way to hear the day through.

export interface Track {
    url: string;
    title: string;
    memoryTitle: string;
    memorySlug: string;
}

// A memory can carry chants of its own and chants hanging off its events.
export const tracksOfMemory = (memory: IMemory): Track[] => {
    const own = memory.scripta ?? [];
    const fromEvents = (memory.events ?? []).flatMap((event) => event.scripta ?? []);
    const seen = new Set<string>();

    return [...own, ...fromEvents]
        .filter((scriptum) => {
            if (!scriptum.audio_url || seen.has(scriptum.audio_url)) return false;
            seen.add(scriptum.audio_url);
            return true;
        })
        .map((scriptum) => ({
            url: scriptum.audio_url!,
            title: getScriptumTitle(scriptum),
            memoryTitle: memory.short_name ?? memory.slug,
            memorySlug: memory.slug,
        }));
};

// Runs a bounded number of requests at a time: a day can hold two dozen
// memories, and asking a reference that answers slowly for all of them at once
// is a good way to get none of them.
export const mapWithLimit = async <T, R>(
    items: T[],
    limit: number,
    run: (item: T) => Promise<R>,
): Promise<R[]> => {
    const results: R[] = new Array(items.length);
    let cursor = 0;

    const worker = async () => {
        while (cursor < items.length) {
            const index = cursor++;
            results[index] = await run(items[index]);
        }
    };

    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));

    return results;
};
