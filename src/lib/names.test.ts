import { describe, expect, it } from "vitest";
import { cleanNameQuery, normalizeName, titleMatchesName } from "./names";

describe("normalizeName", () => {
    it("drops the combining accents real titles carry", () => {
        expect(normalizeName("Кири́лл")).toBe("кирилл");
        expect(normalizeName("Варфоломе́й")).toBe("варфоломей");
    });

    it("treats ё and е as one letter, as the backend does", () => {
        expect(normalizeName("Пётр")).toBe("петр");
        expect(normalizeName("Петр")).toBe("петр");
    });
});

describe("titleMatchesName", () => {
    it("finds the name whatever case or accent it is written in", () => {
        expect(titleMatchesName("Кири́лл, святи́тель Горти́нский", "кирилл")).toBe(true);
        expect(titleMatchesName("Пётр, митрополит Киевский", "петр")).toBe(true);
        expect(titleMatchesName("Пётр, митрополит Киевский", "Пётр")).toBe(true);
    });

    it("matches a word start, like the backend's own search", () => {
        expect(titleMatchesName("Петра́ и Па́вла", "пётр")).toBe(true);
    });

    it("does not match in the middle of a word", () => {
        expect(titleMatchesName("Первопрестольницы", "рест")).toBe(false);
    });

    it("says no to nothing", () => {
        expect(titleMatchesName(undefined, "петр")).toBe(false);
        expect(titleMatchesName("Пётр", "")).toBe(false);
        expect(titleMatchesName("Пётр", "   ")).toBe(false);
    });
});

describe("cleanNameQuery", () => {
    it("keeps letters, digits, spaces and hyphens", () => {
        expect(cleanNameQuery("  Пётр  ")).toBe("Пётр");
        expect(cleanNameQuery("Мария-Магдалина")).toBe("Мария-Магдалина");
    });

    it("throws away anything that could steer a query", () => {
        expect(cleanNameQuery("пётр/павел")).toBe("пётр павел");
        expect(cleanNameQuery("пётр?q=1&c=2")).toBe("пётр q 1 c 2");
    });
});
