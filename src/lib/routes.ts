import { IDayFilters } from "./api/day";
import { DateParts, formatCivilISO } from "./dates/civil";

// Every filter that changes *which* memories are listed lives in the URL, so a
// view is always shareable. Filters equal to the page default are left out to
// keep one canonical address per view.
const listParams = (
    filters: IDayFilters,
    defaultCalendaries: readonly string[],
): URLSearchParams => {
    const params = new URLSearchParams();

    const selected = [...filters.calendaries].sort().join(",");
    const fallback = [...defaultCalendaries].sort().join(",");
    if (selected !== fallback) {
        params.set("c", filters.calendaries.join(","));
    }
    if (filters.query) {
        params.set("q", filters.query);
    }

    return params;
};

export const buildListHref = (
    filters: IDayFilters,
    defaultCalendaries: readonly string[],
): string => {
    const search = listParams(filters, defaultCalendaries).toString();
    const path = filters.date ? `/day/${formatCivilISO(filters.date)}` : "/search";

    return search ? `${path}?${search}` : path;
};

// The same day, as a calendar file, under the same filters.
export const dayCalendarHref = (
    filters: IDayFilters,
    defaultCalendaries: readonly string[],
): string | null => {
    if (!filters.date) return null;

    const search = listParams(filters, defaultCalendaries).toString();
    const path = `/day/${formatCivilISO(filters.date)}/calendar.ics`;

    return search ? `${path}?${search}` : path;
};

// Not percent-encoded here: both next/link and the metadata layer encode the
// path themselves, and pre-encoding made canonical URLs come out double-encoded
// (%25D1%2581... instead of %D1%81...).
export const memoryHref = (slug: string): string => `/memory/${slug}`;

export const eventHref = (slug: string, event: number | string): string =>
    `${memoryHref(slug)}/${event}`;

export const dayHref = (date: DateParts): string => `/day/${formatCivilISO(date)}`;
