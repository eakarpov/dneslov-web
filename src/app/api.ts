// Server-only fetchers for the day view. Client code imports lib/api/day.
import { fetchLegacyAnswer } from "../lib/api/host";
import { normalizeDayList } from "../lib/api/normalize";
import { swallowOutage } from "../lib/api/load";
import {
    EMPTY_CALENDARIES,
    ICalendaryList,
    IDayFilters,
    dayFiltersToParams,
} from "../lib/api/day";
import { IDayMemoList } from "../dto/day";

export type { IDayFilters, ICalendaryList };

export interface DayMemories {
    // null when there is nothing live and nothing saved to fall back on.
    data: IDayMemoList | null;
    // Served from the last known good copy: the reference did not answer.
    stale: boolean;
}

// Cached for an hour so a flaky dneslov.org can't stall every render. If it is
// unreachable, the last known good copy stands in; only when there is no copy
// at all does the list come back empty, and then it says so rather than
// pretending the day is empty.
export const getDayMemories = async (filters: IDayFilters): Promise<DayMemories> => {
    try {
        const { data, stale } = await fetchLegacyAnswer(`/index.json?${dayFiltersToParams(filters)}`, {
            next: { revalidate: 3600 },
        });

        return { data: normalizeDayList(data), stale };
    } catch (e) {
        swallowOutage(e);
        return { data: null, stale: false };
    }
};

// A name lookup asks the backend the same question the search box does, just
// over a wider window: the filtering to actual name matches happens here.
export const searchMemories = async (query: string, limit = 200): Promise<IDayMemoList | null> => {
    try {
        const { data } = await fetchLegacyAnswer(
            `/index.json?${new URLSearchParams({ q: query })}`,
            {
                headers: { Range: `records=0-${limit - 1}` },
                next: { revalidate: 3600 },
            },
        );

        return normalizeDayList(data);
    } catch (e) {
        swallowOutage(e);
        return null;
    }
};

export const getCalendaries = async (page = 1, per = 100): Promise<ICalendaryList> => {
    try {
        const { data } = await fetchLegacyAnswer(`/calendaries.json?page=${page}&per=${per}&l=true`, {
            next: { revalidate: 3600 },
        });

        return data ?? EMPTY_CALENDARIES;
    } catch (e) {
        swallowOutage(e);
        return EMPTY_CALENDARIES;
    }
};
