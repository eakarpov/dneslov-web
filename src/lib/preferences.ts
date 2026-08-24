// Display preferences live in a cookie, never in the URL and never on the
// server render path: pages must stay identical for every visitor so they can be
// cached and indexed. Only how a day is *drawn* depends on this.
import { CALENDAR_TYPE } from "../types/index";

const COOKIE = "dneslov.prefs";
const MAX_AGE_DAYS = 365;

export interface IPreferences {
    calendarType: CALENDAR_TYPE;
}

export const DEFAULT_PREFERENCES: IPreferences = {
    calendarType: CALENDAR_TYPE.JULIAN,
};

const isCalendarType = (value: unknown): value is CALENDAR_TYPE =>
    value === CALENDAR_TYPE.JULIAN || value === CALENDAR_TYPE.NEW_JULIAN;

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
        };
    } catch {
        return DEFAULT_PREFERENCES;
    }
};

export const writePreferences = (preferences: IPreferences): void => {
    if (typeof document === "undefined") return;

    const value = encodeURIComponent(JSON.stringify(preferences));
    document.cookie = `${COOKIE}=${value}; path=/; max-age=${MAX_AGE_DAYS * 24 * 3600}; samesite=lax`;
};
