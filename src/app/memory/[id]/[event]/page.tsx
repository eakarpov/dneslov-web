import {Metadata} from "next";
import {memo, Suspense} from "react";
import Navbar from "../../../common/Navbar";
import {getEvent} from "./api";
import Content from "./Content";
import {getEventTitle} from "../../../../lib/events";
import {eventHref} from "../../../../lib/routes";

export const revalidate = 3600;

interface PageParams {
    params: { id: string; event: string };
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { data: event, unavailable } = await getEvent(params.id, params.event);

    if (unavailable) {
        return { title: "Справочник недоступен — Днеслов", robots: { index: false } };
    }

    if (!event) {
        return { title: "Событие не найдено — Днеслов" };
    }

    const title = `${getEventTitle(event)} — Днеслов`;
    const description = event.description?.slice(0, 200);

    return {
        title,
        description,
        alternates: { canonical: eventHref(params.id, params.event) },
        openGraph: {
            title,
            description,
        },
    };
}

const EventRoutePage = ({ params }: PageParams) => {
    const eventPromise = getEvent(params.id, params.event);

    return (
        <div>
            <Navbar />
            <main className="flex m-4">
                <Suspense fallback={<div>Загрузка...</div>}>
                    <Content eventPromise={eventPromise} memorySlug={params.id} />
                </Suspense>
            </main>
        </div>
    );
};

export default memo(EventRoutePage);
