import { getCalendaries, getDayMemories, IDayFilters } from "../api";
import { DateParts } from "../../lib/dates/civil";
import Calendar from "../components/Calendar/index";
import SourceList from "../components/SourceList/index";
import DayList from "./DayList";

export interface DayViewProps {
    date: DateParts | null;
    query: string;
    // null = "not specified in the URL", which means the page default.
    calendaries: string[] | null;
}

const DayView = async ({ date, query, calendaries: requested }: DayViewProps) => {
    const calendaries = await getCalendaries();

    // The default selection is the licit calendaries, and it is sent to the
    // backend explicitly: the legacy default (днес,рпц) is invisible to the UI,
    // so relying on it would show a selection that doesn't match the results.
    const defaultCalendaries = calendaries.list
        .filter((calendary) => calendary.licit)
        .map((calendary) => calendary.slug?.text)
        .filter((slug): slug is string => Boolean(slug));

    const filters: IDayFilters = {
        date,
        calendaries: requested ?? defaultCalendaries,
        query,
    };

    const items = await getDayMemories(filters);

    const calendaryTitles = Object.fromEntries(
        calendaries.list
            .filter((calendary) => calendary.slug?.text)
            .map((calendary) => [
                calendary.slug.text,
                calendary.titles?.[0]?.text ?? calendary.slug.text,
            ]),
    );

    return (
        <>
            <div className="flex flex-col">
                <Calendar
                    filters={filters}
                    defaultCalendaries={defaultCalendaries}
                    calendaries={calendaries.list}
                />
                <SourceList
                    items={calendaries.list}
                    total={calendaries.total}
                    filters={filters}
                    defaultCalendaries={defaultCalendaries}
                />
            </div>
            <div className="flex w-full min-w-0">
                <DayList
                    items={items ?? { list: [], page: 1, total: 0 }}
                    unavailable={items === null}
                    filters={filters}
                    defaultCalendaries={defaultCalendaries}
                    calendaryTitles={calendaryTitles}
                />
            </div>
        </>
    );
};

export default DayView;
