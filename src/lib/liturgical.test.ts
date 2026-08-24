import { describe, expect, it } from "vitest";
import { getScriptumTitle, sortScripta } from "./liturgical";
import { IScriptum } from "../dto/scriptum";

const scriptum = (fields: Partial<IScriptum>) => fields as IScriptum;

describe("sortScripta", () => {
    it("orders by liturgical sequence, not by arrival", () => {
        const sorted = sortScripta([
            scriptum({ type: "Kontakion" }),
            scriptum({ type: "Troparion" }),
            scriptum({ type: "Irmos" }),
        ]);

        expect(sorted.map((s) => s.type)).toEqual(["Irmos", "Troparion", "Kontakion"]);
    });

    it("does not mutate the input", () => {
        const input = [scriptum({ type: "Kontakion" }), scriptum({ type: "Irmos" })];
        sortScripta(input);
        expect(input.map((s) => s.type)).toEqual(["Kontakion", "Irmos"]);
    });
});

describe("getScriptumTitle", () => {
    it("labels a known type in Russian", () => {
        expect(getScriptumTitle(scriptum({ type: "Troparion" }))).toBe("Тропарь");
    });

    it("keeps an unknown type as it came", () => {
        expect(getScriptumTitle(scriptum({ type: "Whatever" }))).toBe("Whatever");
    });

    it("adds title, prosomeion and tone", () => {
        expect(
            getScriptumTitle(
                scriptum({
                    type: "Kontakion",
                    title: "Взбранной Воеводе",
                    prosomeion_title: "Дева днесь",
                    tone: 8,
                }),
            ),
        ).toBe("Кондак «Взбранной Воеводе», подобен «Дева днесь», глас 8-й");
    });

    it("accepts a tone that arrives as a number", () => {
        // Real payloads send both "8" and 8.
        expect(getScriptumTitle(scriptum({ type: "Troparion", tone: 4 }))).toBe("Тропарь, глас 4-й");
        expect(getScriptumTitle(scriptum({ type: "Troparion", tone: "4" as unknown as number }))).toBe(
            "Тропарь, глас 4-й",
        );
    });
});
