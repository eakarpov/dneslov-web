import { getCalendaries, IDayFilters } from "../api";
import { DateParts } from "../../lib/dates/civil";
import { ICalendar } from "../../dto/calendar";

// Mirrors the backend's own default (CoreFeatures#default_calendary_slugs).
// Used when the calendary list itself could not be fetched: sending no `c` at
// all leaves the backend resolving titles in днес+рпц while listing memoes from
// every calendary, so rows from elsewhere come back with no title. Naming the
// same default keeps the list and the visible selection consistent.
const FALLBACK_CALENDARIES = ["днес", "рпц"];

export interface ResolvedDay {
    calendaries: ICalendar[];
    calendariesTotal: number;
    defaultCalendaries: string[];
    filters: IDayFilters;
}

// One place where "which calendaries is this view about" is decided, shared by
// the page, the calendar file and the social card so they can never drift.
export const resolveDay = async (
    date: DateParts | null,
    query: string,
    requested: string[] | null,
): Promise<ResolvedDay> => {
    const calendaries = await getCalendaries();

    const licit = calendaries.list
        .filter((calendary) => calendary.licit)
        .map((calendary) => calendary.slug?.text)
        .filter((slug): slug is string => Boolean(slug));

    const defaultCalendaries = licit.length > 0 ? licit : FALLBACK_CALENDARIES;

    return {
        calendaries: calendaries.list,
        calendariesTotal: calendaries.total,
        defaultCalendaries,
        filters: { date, calendaries: requested ?? defaultCalendaries, query },
    };
};

export const parseCalendaries = (value?: string | null): string[] | null => {
    if (!value) return null;
    const slugs = value.split(",").map((slug) => slug.trim()).filter(Boolean);
    return slugs.length > 0 ? slugs : null;
};
