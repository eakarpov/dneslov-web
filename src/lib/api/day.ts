// Client-safe half of the day API: filter shape, query building and the
// browser-side fetches. Kept apart from src/app/api.ts so the server-only
// fetch layer (BASE_API_HOST, next/cache) stays out of the client bundle.
import { DateParts, toLegacyDateParam } from "../dates/civil";
import { IDayMemoList } from "../../dto/day";
import { ICalendar } from "../../dto/calendar";

export interface IDayFilters {
    date: DateParts | null;
    calendaries: string[];
    query: string;
}

export interface ICalendaryList {
    list: ICalendar[];
    total: number;
}

export const EMPTY_DAY: IDayMemoList = { list: [], page: 1, total: 0 };
export const EMPTY_CALENDARIES: ICalendaryList = { list: [], total: 0 };

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

// Through our own proxy, with the *current* filters — the previous version sent
// only `c`, so scrolling pulled in rows the active filter excluded.
export const fetchDayMemories = async (
    filters: IDayFilters,
    from: number,
    to: number,
): Promise<IDayMemoList> =>
    fetch(`/api/v1/memories?${dayFiltersToParams(filters)}`, {
        headers: { Range: `records=${from}-${to}` },
    })
        .then((res) => res.json())
        .catch(() => EMPTY_DAY);

export const fetchCalendaries = async (page = 1, per = 100): Promise<ICalendaryList> =>
    fetch(`/api/v1/calendaries?page=${page}&per=${per}&l=true`)
        .then((res) => res.json())
        .catch(() => EMPTY_CALENDARIES);
