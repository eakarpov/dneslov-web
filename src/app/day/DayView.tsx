import { getDayMemories } from "../api";
import { resolveDay } from "./resolve";
import { DateParts } from "../../lib/dates/civil";
import Calendar from "../components/Calendar/index";
import SourceList from "../components/SourceList/index";
import DayList from "./DayList";
import Tour from "../components/Tour";
import FastLine from "../components/FastLine";

export interface DayViewProps {
    date: DateParts | null;
    query: string;
    // null = "not specified in the URL", which means the page default.
    calendaries: string[] | null;
}

const DayView = async ({ date, query, calendaries: requested }: DayViewProps) => {
    // The default selection is the licit calendaries, and it is sent to the
    // backend explicitly: the legacy default (днес,рпц) is invisible to the UI,
    // so relying on it would show a selection that doesn't match the results.
    const { calendaries, calendariesTotal, defaultCalendaries, filters } = await resolveDay(
        date,
        query,
        requested,
    );

    const { data: items, stale } = await getDayMemories(filters);

    const calendaryTitles = Object.fromEntries(
        calendaries
            .filter((calendary) => calendary.slug?.text)
            .map((calendary) => [
                calendary.slug.text,
                calendary.titles?.[0]?.text ?? calendary.slug.text,
            ]),
    );

    return (
        <>
            <Tour />
            <div className="flex flex-col">
                <Calendar
                    filters={filters}
                    defaultCalendaries={defaultCalendaries}
                    calendaries={calendaries}
                />
                {date && (
                    <FastLine
                        date={date}
                        fastDays={
                            calendaries.find((calendary) =>
                                filters.calendaries.includes(calendary.slug?.text),
                            )?.meta?.fast_days
                        }
                    />
                )}
                <SourceList
                    items={calendaries}
                    total={calendariesTotal}
                    filters={filters}
                    defaultCalendaries={defaultCalendaries}
                />
            </div>
            <div className="flex w-full min-w-0">
                <DayList
                    items={items ?? { list: [], page: 1, total: 0 }}
                    unavailable={items === null}
                    stale={stale}
                    filters={filters}
                    defaultCalendaries={defaultCalendaries}
                    calendaryTitles={calendaryTitles}
                />
            </div>
        </>
    );
};

export default DayView;
