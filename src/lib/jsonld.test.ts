import { describe, expect, it } from "vitest";
import { eventJsonLd, imageJsonLd, memoryJsonLd, serializeJsonLd } from "./jsonld";
import { IMemory } from "../dto/memory";
import { IEvent } from "../dto/event";
import { IGalleryImageDetail } from "../dto/gallery";

const memory = (patch: Partial<IMemory> = {}) =>
    ({
        id: 1,
        slug: "спас",
        short_name: "Иисус Христос",
        type: "Identity",
        names: [{ id: 1, name_text: "Спас" }],
        links: [{ id: 1, type: "WikiLink", url: "https://drevo-info.ru/articles/28.html" }],
        events: [],
        memoes: [],
        scripta: [],
        coverings: [],
        bond_memories: [],
        ...patch,
    }) as unknown as IMemory;

describe("memoryJsonLd", () => {
    it("reads the schema type from the memory's own type", () => {
        expect(memoryJsonLd(memory())["@type"]).toBe("Person");
        expect(memoryJsonLd(memory({ type: "Place" }))["@type"]).toBe("Place");
        expect(memoryJsonLd(memory({ type: "Council" }))["@type"]).toBe("Organization");
    });

    it("falls back to Thing for a type we have not seen", () => {
        expect(memoryJsonLd(memory({ type: "Newfangled" }))["@type"]).toBe("Thing");
        expect(memoryJsonLd(memory({ type: undefined }))["@type"]).toBe("Thing");
    });

    it("gives an absolute address", () => {
        expect(memoryJsonLd(memory()).url).toMatch(/^https?:\/\/.+\/memory\/спас$/);
    });

    it("passes the external links through as sameAs", () => {
        expect(memoryJsonLd(memory()).sameAs).toEqual(["https://drevo-info.ru/articles/28.html"]);
    });
});

describe("eventJsonLd", () => {
    it("states an unparseable date as text rather than as startDate", () => {
        const data = eventJsonLd(
            { id: 5, happened_at: "ок. 303", titles: [] } as unknown as IEvent,
            "гвгрд",
        );

        expect(data).not.toHaveProperty("startDate");
        expect(data.disambiguatingDescription).toBe("ок. 303");
    });
});

describe("imageJsonLd", () => {
    it("points at the file and at its page", () => {
        const data = imageJsonLd({
            uid: "abc",
            url: "https://cdn.dneslov.org/images/abc.webp",
        } as IGalleryImageDetail);

        expect(data.contentUrl).toBe("https://cdn.dneslov.org/images/abc.webp");
        expect(data.url).toMatch(/\/gallery\/abc$/);
    });
});

describe("serializeJsonLd", () => {
    it("drops empty fields", () => {
        const json = serializeJsonLd({ a: 1, b: null, c: "", d: [], e: undefined });
        expect(JSON.parse(json)).toEqual({ a: 1 });
    });

    it("cannot close the script tag it sits in", () => {
        const json = serializeJsonLd({ name: "</script><script>alert(1)</script>" });

        expect(json).not.toContain("</script>");
        expect(json).toContain("\\u003c");
        expect(JSON.parse(json).name).toBe("</script><script>alert(1)</script>");
    });
});
