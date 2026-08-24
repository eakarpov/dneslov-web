import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let dir: string;

const load = async () => {
    vi.resetModules();
    process.env.LEGACY_CACHE_DIR = dir;
    return import("./staleStore");
};

beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "dneslov-cache-"));
});

afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
    delete process.env.LEGACY_CACHE_MAX_AGE_MS;
});

describe("staleStore", () => {
    it("gives back what was saved", async () => {
        const { rememberFresh, recallStale } = await load();

        await rememberFresh("/index.json?d=н24.08.2026", { total: 12 });
        const hit = await recallStale("/index.json?d=н24.08.2026");

        expect(hit?.value).toEqual({ total: 12 });
    });

    it("knows nothing about a key it never saw", async () => {
        const { recallStale } = await load();
        expect(await recallStale("/never-fetched.json")).toBeNull();
    });

    it("keeps keys apart", async () => {
        const { rememberFresh, recallStale } = await load();

        await rememberFresh("/a.json", "a");
        await rememberFresh("/b.json", "b");

        expect((await recallStale("/a.json"))?.value).toBe("a");
        expect((await recallStale("/b.json"))?.value).toBe("b");
    });

    it("survives a restart, because the copy is on disk", async () => {
        const first = await load();
        await first.rememberFresh("/index.json", { total: 3 });

        // A fresh module instance has an empty in-process map.
        const second = await load();
        expect((await second.recallStale("/index.json"))?.value).toEqual({ total: 3 });
    });

    it("refuses a copy that is too old to stand in", async () => {
        process.env.LEGACY_CACHE_MAX_AGE_MS = "0";
        const { rememberFresh, recallStale } = await load();

        await rememberFresh("/index.json", { total: 3 });
        await new Promise((resolve) => setTimeout(resolve, 5));

        expect(await recallStale("/index.json")).toBeNull();
    });

    it("stores a null answer as an answer", async () => {
        // A 404 means "not there"; it must not resurrect an older copy.
        const { rememberFresh, recallStale } = await load();

        await rememberFresh("/gone.json", null);
        expect(await recallStale("/gone.json")).toEqual(
            expect.objectContaining({ value: null }),
        );
    });
});
