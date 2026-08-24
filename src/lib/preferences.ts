// Reader preferences live in a cookie, never in the URL and never on the server
// render path: pages must stay identical for every visitor so they can be cached
// and indexed. Only how a page is *drawn*, or an optional client-side refetch,
// depends on this.
import { CALENDAR_TYPE } from "../types/index";

const COOKIE = "dneslov.prefs";
const MAX_AGE_DAYS = 365;

export interface IPreferences {
    calendarType: CALENDAR_TYPE;
    // Last calendary selection the reader made, when it differed from the site
    // default. Memory pages use it to offer their content in that context.
    calendaries?: string[];
    // The walkthrough is shown once; the navbar link brings it back.
    tourSeen?: boolean;
}

export const DEFAULT_PREFERENCES: IPreferences = {
    calendarType: CALENDAR_TYPE.JULIAN,
};

const isCalendarType = (value: unknown): value is CALENDAR_TYPE =>
    value === CALENDAR_TYPE.JULIAN || value === CALENDAR_TYPE.NEW_JULIAN;

const isSlugList = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every((item) => typeof item === "string");

export const readPreferences = (): IPreferences => {
    if (typeof document === "undefined") return DEFAULT_PREFERENCES;

    const raw = document.cookie
        .split("; ")
        .find((part) => part.startsWith(`${COOKIE}=`))
        ?.slice(COOKIE.length + 1);

    if (!raw) return DEFAULT_PREFERENCES;

    try {
        const parsed = JSON.parse(decodeURIComponent(raw));

        return {
            calendarType: isCalendarType(parsed?.calendarType)
                ? parsed.calendarType
                : DEFAULT_PREFERENCES.calendarType,
            calendaries: isSlugList(parsed?.calendaries) ? parsed.calendaries : undefined,
            tourSeen: parsed?.tourSeen === true,
        };
    } catch {
        return DEFAULT_PREFERENCES;
    }
};

export const writePreferences = (patch: Partial<IPreferences>): void => {
    if (typeof document === "undefined") return;

    const next = { ...readPreferences(), ...patch };
    const value = encodeURIComponent(JSON.stringify(next));
    document.cookie = `${COOKIE}=${value}; path=/; max-age=${MAX_AGE_DAYS * 24 * 3600}; samesite=lax`;
};

export const sameSlugs = (a: readonly string[] = [], b: readonly string[] = []): boolean =>
    a.length === b.length && [...a].sort().join(",") === [...b].sort().join(",");
