import { fetchLegacyJson } from "../lib/api/host";
import { normalizeDayList } from "../lib/api/normalize";
import { DateParts, toLegacyDateParam } from "../lib/dates/civil";
import { IDayMemoList } from "../dto/day";
import { ICalendar } from "../dto/calendar";

export interface IDayFilters {
    date: DateParts | null;
    calendaries: string[];
    query: string;
}

export interface ICalendaryList {
    list: ICalendar[];
    total: number;
}

const EMPTY_CALENDARIES: ICalendaryList = { list: [], total: 0 };

// The day list is filtered by exactly these three things, and all three live in
// the URL — which is why the same filters can be rebuilt on the server and on
// the client without threading state through the component tree.
export const dayFiltersToParams = ({ date, calendaries, query }: IDayFilters): URLSearchParams => {
    const params = new URLSearchParams();

    if (date) params.set("d", toLegacyDateParam(date));
    if (calendaries.length > 0) params.set("c", calendaries.join(","));
    if (query) params.set("q", query);

    return params;
};

const rangeHeader = (from: number, to: number) => ({ Range: `records=${from}-${to}` });

// Server-side: straight to the legacy backend, with the response cached for an
// hour so a flaky dneslov.org can't stall every render.
// Returns null when the backend could not be reached — "nothing on this day" and
// "the reference is down" must not look the same to the reader.
export const getDayMemories = async (filters: IDayFilters): Promise<IDayMemoList | null> => {
    return fetchLegacyJson(`/index.json?${dayFiltersToParams(filters)}`, {
        next: { revalidate: 3600 },
    })
        .then(normalizeDayList)
        .catch((e) => {
            console.error(e);
            return null;
        });
};

// Client-side: through our own proxy, with the *current* filters — the previous
// version sent only `c`, so scrolling pulled in rows the active filter excluded.
export const fetchDayMemories = async (
    filters: IDayFilters,
    from: number,
    to: number,
): Promise<IDayMemoList> => {
    const params = dayFiltersToParams(filters);

    return fetch(`/api/v1/memories?${params}`, { headers: rangeHeader(from, to) })
        .then((res) => res.json())
        .catch(() => ({ list: [], page: 1, total: 0 }) as IDayMemoList);
};

export const getCalendaries = async (page = 1, per = 100): Promise<ICalendaryList> => {
    return fetchLegacyJson(`/calendaries.json?page=${page}&per=${per}&l=true`, {
        next: { revalidate: 3600 },
    }).catch(() => EMPTY_CALENDARIES);
};

export const fetchCalendaries = async (page = 1, per = 100): Promise<ICalendaryList> => {
    return fetch(`/api/v1/calendaries?page=${page}&per=${per}&l=true`)
        .then((res) => res.json())
        .catch(() => EMPTY_CALENDARIES);
};
