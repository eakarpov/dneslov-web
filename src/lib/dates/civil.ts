// Canonical day identity across the app.
//
// A day is addressed by its CIVIL (Gregorian) date in ISO form: 2026-08-24.
// The Julian ("старый стиль") rendering is a display concern, derived here —
// never part of a URL, so one day never gets two addresses.

export interface DateParts {
    year: number;
    month: number; // 1-12
    day: number;   // 1-31
}

// The church day starts in the evening: the monolith shifts "now" by +9h
// (CoreFeatures#church_time_gap), so after 15:00 local "today" is tomorrow.
const CHURCH_DAY_GAP_HOURS = 9;

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value: number) => String(value).padStart(2, "0");

const gregorianToJdn = ({ year, month, day }: DateParts): number => {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return (
        day +
        Math.floor((153 * m + 2) / 5) +
        365 * y +
        Math.floor(y / 4) -
        Math.floor(y / 100) +
        Math.floor(y / 400) -
        32045
    );
};

const julianToJdn = ({ year, month, day }: DateParts): number => {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
};

const jdnToJulian = (jdn: number): DateParts => {
    const c = jdn + 32082;
    const d = Math.floor((4 * c + 3) / 1461);
    const e = c - Math.floor((1461 * d) / 4);
    const m = Math.floor((5 * e + 2) / 153);
    return {
        day: e - Math.floor((153 * m + 2) / 5) + 1,
        month: m + 3 - 12 * Math.floor(m / 10),
        year: d - 4800 + Math.floor(m / 10),
    };
};

const jdnToGregorian = (jdn: number): DateParts => {
    const a = jdn + 32044;
    const b = Math.floor((4 * a + 3) / 146097);
    const c = a - Math.floor((146097 * b) / 4);
    const d = Math.floor((4 * c + 3) / 1461);
    const e = c - Math.floor((1461 * d) / 4);
    const m = Math.floor((5 * e + 2) / 153);
    return {
        day: e - Math.floor((153 * m + 2) / 5) + 1,
        month: m + 3 - 12 * Math.floor(m / 10),
        year: 100 * b + d - 4800 + Math.floor(m / 10),
    };
};

export const formatCivilISO = ({ year, month, day }: DateParts): string =>
    `${year}-${pad(month)}-${pad(day)}`;

// Returns null for anything that isn't a real calendar date, so a bad URL
// segment ends in a 404 rather than a silently shifted day.
export const parseCivilISO = (value: string): DateParts | null => {
    const match = ISO_RE.exec(value);
    if (!match) return null;

    const parts = { year: +match[1], month: +match[2], day: +match[3] };
    if (parts.month < 1 || parts.month > 12 || parts.day < 1 || parts.day > 31) {
        return null;
    }
    // Round-trip through Date to reject 2026-02-30 and friends.
    const probe = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
    if (
        probe.getUTCFullYear() !== parts.year ||
        probe.getUTCMonth() + 1 !== parts.month ||
        probe.getUTCDate() !== parts.day
    ) {
        return null;
    }
    return parts;
};

export const fromDate = (date: Date): DateParts => ({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
});

export const toDate = ({ year, month, day }: DateParts): Date => new Date(year, month - 1, day);

export const churchToday = (now: Date = new Date()): DateParts =>
    fromDate(new Date(now.getTime() + CHURCH_DAY_GAP_HOURS * 3600 * 1000));

export const churchTodayISO = (now?: Date): string => formatCivilISO(churchToday(now));

export const addDays = (parts: DateParts, days: number): DateParts => {
    const date = toDate(parts);
    date.setDate(date.getDate() + days);
    return fromDate(date);
};

// Julian ("старый стиль") rendering of a civil date. Computed, not hardcoded to
// 13 days — the gap grows to 14 in 2100 and the app should not need a fix then.
export const civilToJulian = (parts: DateParts): DateParts => jdnToJulian(gregorianToJdn(parts));

// How many days the old style lags behind the civil one for a given date:
// 13 today, 14 from 1 March 2100. Positive by definition — civil is ahead.
export const julianGapDays = (parts: DateParts): number =>
    julianToJdn(parts) - gregorianToJdn(parts);

// Inverse of civilToJulian: takes the numerals shown in the Julian-style grid
// back to the civil day they address.
export const julianToCivil = (parts: DateParts): DateParts => jdnToGregorian(julianToJdn(parts));

// The legacy backend takes the date as `d=<style><DD.MM.YYYY>`, where the style
// prefix says how to read the number: `н` = new-Julian (== civil until 2800),
// `ю` = Julian. We always address days civilly, so we always send `н`.
export const toLegacyDateParam = (parts: DateParts): string =>
    `н${pad(parts.day)}.${pad(parts.month)}.${parts.year}`;

const MONTHS_GENITIVE = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export const formatHuman = (parts: DateParts): string =>
    `${parts.day} ${MONTHS_GENITIVE[parts.month - 1]} ${parts.year}`;
