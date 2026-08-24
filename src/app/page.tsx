import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "./common/Navbar";
import DayView from "./day/DayView";
import { churchToday } from "../lib/dates/civil";

// "Today" moves, so this page is re-rendered often; the underlying backend
// responses are cached separately for an hour.
export const revalidate = 300;

export const metadata: Metadata = {
    title: "Днеслов — православный календарь",
    description: "Памяти святых, праздников и чтимых икон на сегодняшний день.",
    alternates: { canonical: "/" },
};

// The home page is deliberately parameter-free: it is the canonical "today"
// address. Any filtering navigates to /day/<date> or /search.
export default function Home() {
    return (
        <div>
            <Navbar />
            <main className="flex m-4">
                <Suspense fallback={<div>Загрузка...</div>}>
                    <DayView date={churchToday()} query="" calendaries={null} />
                </Suspense>
            </main>
        </div>
    );
}
