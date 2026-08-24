import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DayView from "../DayView";
import { parseCalendaries } from "../resolve";
import {
    churchTodayISO,
    civilToJulian,
    formatHuman,
    parseCivilISO,
} from "../../../lib/dates/civil";

export const revalidate = 3600;

interface PageProps {
    params: { date: string };
    searchParams: { c?: string; q?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const date = parseCivilISO(params.date);

    if (!date) {
        return { title: "День не найден — Днеслов" };
    }

    const julian = civilToJulian(date);
    const title = `${formatHuman(date)} — Днеслов`;

    return {
        title,
        description: `Памяти святых и праздников на ${formatHuman(date)} (${formatHuman(julian)} ст. ст.).`,
        // Today lives at "/" — keep one canonical address for it.
        alternates: {
            canonical: params.date === churchTodayISO() ? "/" : `/day/${params.date}`,
        },
    };
}

export default function DayPage({ params, searchParams }: PageProps) {
    const date = parseCivilISO(params.date);

    if (!date) {
        notFound();
    }

    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <DayView
                date={date}
                query={searchParams.q ?? ""}
                calendaries={parseCalendaries(searchParams.c)}
            />
        </Suspense>
    );
}
