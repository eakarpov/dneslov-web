import { describe, expect, it } from "vitest";
import { describeFast, fastForDate, fastMeasures, fastName } from "./fasting";
import { FAST_MEASURE, IFastDaysMeta } from "../dto/calendar";

// The rules as the РПЦ calendary actually ships them (calendaries.json meta).
const RULES: IFastDaysMeta[] = [
    {
        days: ["+8%3..+49%3", "+57%3..24.12%3", "-63%3", "07.01%3..-70%3"],
        title: "%{week}-th wednesday",
        measure: [FAST_MEASURE.MEAT, FAST_MEASURE.EGG, FAST_MEASURE.MILK, FAST_MEASURE.BUTTER],
    },
    {
        days: "01.08..14.08",
        title: "%{day}-th day of Dormintion fast",
        measure: [FAST_MEASURE.MEAT, FAST_MEASURE.EGG, FAST_MEASURE.MILK, FAST_MEASURE.BUTTER],
    },
    {
        days: "15.11..24.12",
        title: "%{day}-th day of Nativity fast",
        measure: [FAST_MEASURE.MEAT, FAST_MEASURE.EGG, FAST_MEASURE.MILK, FAST_MEASURE.BUTTER],
    },
];

describe("fastName", () => {
    it("names the fasts the templates only hint at", () => {
        expect(fastName("%{day}-th day of The Great Lent")).toBe("Великий пост");
        expect(fastName("%{day}-th day of Dormintion fast")).toBe("Успенский пост");
        expect(fastName("%{day}-th day of Nativity fast")).toBe("Рождественский пост");
        expect(fastName("%{week}-th wednesday")).toBe("среда");
    });

    it("keeps an unfamiliar rule's own wording rather than hiding it", () => {
        expect(fastName("some new rule")).toBe("some new rule");
        expect(fastName(undefined)).toBe("постный день");
    });
});

describe("fastMeasures", () => {
    it("lists what the fast excludes", () => {
        expect(fastMeasures(RULES[1])).toEqual(["мяса", "яиц", "молочного", "масла"]);
    });

    it("accepts a single measure as well as a list", () => {
        expect(fastMeasures({ days: "01.01", title: "x", measure: FAST_MEASURE.MEAT })).toEqual(["мяса"]);
    });
});

describe("fastForDate", () => {
    it("finds the Dormition fast on a civil date inside it", () => {
        // 25 August civil is 12 August old style — inside 01.08..14.08.
        const fast = fastForDate({ year: 2026, month: 8, day: 25 }, RULES, true);

        expect(fast?.name).toBe("Успенский пост");
    });

    it("does not find it once the fast is over", () => {
        // 30 August civil is 17 August old style, and it is a Sunday — so
        // neither the fixed range nor the Wednesday/Friday rules apply.
        expect(fastForDate({ year: 2026, month: 8, day: 30 }, RULES, true)).toBeNull();
    });

    it("reads fixed dates in the style it was given", () => {
        // The same civil numbers read as new-Julian fall outside the fast,
        // because there the Dormition fast runs by the civil date.
        expect(fastForDate({ year: 2026, month: 8, day: 25 }, RULES, false)).toBeNull();
    });

    it("returns nothing when the calendary carries no rules", () => {
        expect(fastForDate({ year: 2026, month: 8, day: 25 }, undefined, true)).toBeNull();
        expect(fastForDate({ year: 2026, month: 8, day: 25 }, [], true)).toBeNull();
    });
});

describe("describeFast", () => {
    it("reads as a sentence", () => {
        expect(describeFast({ name: "Успенский пост", measures: ["мяса", "рыбы"] })).toBe(
            "Успенский пост: без мяса, рыбы",
        );
    });

    it("omits the colon when nothing is listed", () => {
        expect(describeFast({ name: "среда", measures: [] })).toBe("среда");
    });
});
