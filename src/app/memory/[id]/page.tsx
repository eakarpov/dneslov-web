import {Metadata} from "next";
import {memo, Suspense} from "react";
import Navbar from "../../common/Navbar";
import {getItem} from "./api";
import Content from "./Content";

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
        <div>
            <Navbar />
            <main className="flex m-4">
                <Suspense fallback={<div>Загрузка...</div>}>
                    <Content itemPromise={itemPromise} />
                </Suspense>
            </main>
        </div>
    );
};

export default memo(MemoryRoutePage);
