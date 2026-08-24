import { IDayFilters } from "../app/api";
import { DateParts, formatCivilISO } from "./dates/civil";

// Every filter that changes *which* memories are listed lives in the URL, so a
// view is always shareable. Filters equal to the page default are left out to
// keep one canonical address per view.
export const buildListHref = (
    filters: IDayFilters,
    defaultCalendaries: readonly string[],
): string => {
    const params = new URLSearchParams();

    const selected = [...filters.calendaries].sort().join(",");
    const fallback = [...defaultCalendaries].sort().join(",");
    if (selected !== fallback) {
        params.set("c", filters.calendaries.join(","));
    }
    if (filters.query) {
        params.set("q", filters.query);
    }

    const search = params.toString();
    const path = filters.date ? `/day/${formatCivilISO(filters.date)}` : "/search";

    return search ? `${path}?${search}` : path;
};

export const memoryHref = (slug: string): string => `/memory/${encodeURIComponent(slug)}`;

export const eventHref = (slug: string, event: number | string): string =>
    `${memoryHref(slug)}/${event}`;

export const dayHref = (date: DateParts): string => `/day/${formatCivilISO(date)}`;
