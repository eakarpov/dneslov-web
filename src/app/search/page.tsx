import { Suspense } from "react";
import type { Metadata } from "next";
import DayView from "../day/DayView";
import { parseCalendaries } from "../day/resolve";

interface PageProps {
    searchParams: { c?: string; q?: string };
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
    const query = searchParams.q;

    return {
        title: query ? `Поиск: ${query} — Днеслов` : "Поиск — Днеслов",
        // A search result set is not something to index.
        robots: { index: false, follow: true },
    };
}

// The dateless list: same view, no day pinned. Reached by removing the date
// chip on a day page.
export default function SearchPage({ searchParams }: PageProps) {
    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <DayView
                date={null}
                query={searchParams.q ?? ""}
                calendaries={parseCalendaries(searchParams.c)}
            />
        </Suspense>
    );
}
