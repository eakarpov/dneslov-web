import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let dir: string;

const load = async () => {
    vi.resetModules();
    process.env.LEGACY_CACHE_DIR = dir;
    process.env.BASE_API_HOST = "dneslov.test";
    return import("./host");
};

const ok = (body: unknown) =>
    ({ ok: true, status: 200, json: async () => body }) as unknown as Response;

const status = (code: number) =>
    ({ ok: false, status: code, json: async () => ({}) }) as unknown as Response;

beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "dneslov-host-"));
});

afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
    vi.unstubAllGlobals();
});

describe("fetchLegacyAnswer", () => {
    it("returns a live answer and marks it fresh", async () => {
        const { fetchLegacyAnswer } = await load();
        vi.stubGlobal("fetch", vi.fn(async () => ok({ total: 7 })));

        expect(await fetchLegacyAnswer("/index.json")).toEqual({ data: { total: 7 }, stale: false });
    });

    it("treats 404 as an answer, not as a failure", async () => {
        const { fetchLegacyAnswer } = await load();
        vi.stubGlobal("fetch", vi.fn(async () => status(404)));

        expect(await fetchLegacyAnswer("/нетакого.json")).toEqual({ data: null, stale: false });
    });

    it("falls back to the last known good copy when the backend goes silent", async () => {
        const { fetchLegacyAnswer } = await load();

        vi.stubGlobal("fetch", vi.fn(async () => ok({ total: 7 })));
        await fetchLegacyAnswer("/index.json");

        vi.stubGlobal(
            "fetch",
            vi.fn(async () => {
                throw new Error("connect ETIMEDOUT");
            }),
        );
        const answer = await fetchLegacyAnswer("/index.json");

        expect(answer.data).toEqual({ total: 7 });
        expect(answer.stale).toBe(true);
    });

    it("falls back on a server error too", async () => {
        const { fetchLegacyAnswer } = await load();

        vi.stubGlobal("fetch", vi.fn(async () => ok({ total: 7 })));
        await fetchLegacyAnswer("/index.json");

        vi.stubGlobal("fetch", vi.fn(async () => status(502)));
        expect((await fetchLegacyAnswer("/index.json")).stale).toBe(true);
    });

    it("throws when there is nothing live and nothing saved", async () => {
        const { fetchLegacyAnswer, LegacyUnavailableError } = await load();
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => {
                throw new Error("connect ETIMEDOUT");
            }),
        );

        await expect(fetchLegacyAnswer("/never-seen.json")).rejects.toBeInstanceOf(
            LegacyUnavailableError,
        );
    });

    it("keeps ranges apart, so page two is never served as page one", async () => {
        const { fetchLegacyAnswer } = await load();

        vi.stubGlobal("fetch", vi.fn(async () => ok({ page: 1 })));
        await fetchLegacyAnswer("/index.json", { headers: { Range: "records=0-24" } });

        vi.stubGlobal("fetch", vi.fn(async () => ok({ page: 2 })));
        await fetchLegacyAnswer("/index.json", { headers: { Range: "records=25-49" } });

        vi.stubGlobal(
            "fetch",
            vi.fn(async () => {
                throw new Error("connect ETIMEDOUT");
            }),
        );

        expect((await fetchLegacyAnswer("/index.json", { headers: { Range: "records=25-49" } })).data)
            .toEqual({ page: 2 });
    });

    it("times out rather than hanging forever", async () => {
        const { fetchLegacyAnswer, LegacyUnavailableError } = await load();

        vi.stubGlobal(
            "fetch",
            vi.fn(
                (_url: string, init: RequestInit) =>
                    new Promise((_resolve, reject) => {
                        init.signal?.addEventListener("abort", () => reject(new Error("aborted")));
                    }),
            ),
        );

        await expect(fetchLegacyAnswer("/slow.json", {}, 10)).rejects.toBeInstanceOf(
            LegacyUnavailableError,
        );
    });
});
