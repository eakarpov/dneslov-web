import { describe, expect, it } from "vitest";
import { getEventTitle } from "./events";
import { IEvent } from "../dto/event";

const event = (titles: { type: string; text: string }[]) => ({ titles }) as unknown as IEvent;

describe("getEventTitle", () => {
    it("prefers the short appellation over the full title", () => {
        expect(
            getEventTitle(
                event([
                    { type: "Title", text: "Полное предложение о событии" },
                    { type: "Appellation", text: "Преставление" },
                ]),
            ),
        ).toBe("Преставление");
    });

    it("does not depend on the order the API returns", () => {
        // The monolith sorts on ["Subject", "Event"], which never matches the
        // real payload — there it is the array order that decides by accident.
        expect(
            getEventTitle(
                event([
                    { type: "Appellation", text: "Преставление" },
                    { type: "Title", text: "Полное предложение о событии" },
                ]),
            ),
        ).toBe("Преставление");
    });

    it("falls back to whatever title exists", () => {
        expect(getEventTitle(event([{ type: "Title", text: "Только полное" }]))).toBe("Только полное");
    });

    it("returns nothing when there are no titles", () => {
        expect(getEventTitle(event([]))).toBeUndefined();
        expect(getEventTitle({} as IEvent)).toBeUndefined();
    });
});
