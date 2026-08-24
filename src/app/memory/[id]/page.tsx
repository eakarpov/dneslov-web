import {Metadata} from "next";
import {memo, Suspense} from "react";
import {getItem} from "./api";
import Content from "./Content";
import { memoryHref } from "../../../lib/routes";

export const revalidate = 3600;

interface PageParams {
    params: { id: string };
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const item = await getItem(params.id);

    if (!item) {
        return { title: "Память не найдена — Днеслов" };
    }

    const title = `${item.short_name} — Днеслов`;
    const description = item.description?.slice(0, 200);

    return {
        title,
        description,
        // A memory has exactly one address. Legacy links carry a ?c= calendary
        // hint that nothing renders yet, so point crawlers at the bare URL.
        alternates: { canonical: memoryHref(params.id) },
        openGraph: {
            title,
            description,
            images: item.image_url ? [item.image_url] : undefined,
        },
    };
}

const MemoryRoutePage = ({ params }: PageParams) => {
    const itemPromise = getItem(params.id);

    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <Content itemPromise={itemPromise} />
        </Suspense>
    );
};

export default memo(MemoryRoutePage);
