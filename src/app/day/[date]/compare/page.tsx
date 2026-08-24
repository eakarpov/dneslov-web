import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Content from "./Content";
import { formatHuman, parseCivilISO } from "../../../../lib/dates/civil";
import "./styles.scss";

export const revalidate = 3600;

interface PageProps {
    params: { date: string };
    searchParams: { a?: string; b?: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
    const date = parseCivilISO(params.date);

    return {
        title: date ? `Сравнение календарей — ${formatHuman(date)}` : "Сравнение календарей",
        // A comparison of two particular calendaries is a tool, not a document.
        robots: { index: false, follow: true },
    };
}

// What one calendary keeps on this day and another does not — a question the
// monolith cannot even ask, because there the selection only unions.
export default function ComparePage({ params, searchParams }: PageProps) {
    const date = parseCivilISO(params.date);

    if (!date) {
        notFound();
    }

    return (
        <div className="flex flex-col w-full compare-page">
            <Suspense fallback={<div>Загрузка...</div>}>
                <Content date={date} a={searchParams.a} b={searchParams.b} />
            </Suspense>
        </div>
    );
}
