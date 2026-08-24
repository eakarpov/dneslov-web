import { memo, Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "../../../../common/Navbar";
import { getEventGallery } from "./api";
import Content from "./Content";

export const revalidate = 3600;

interface PageParams {
    params: { id: string; event: string };
}

export const metadata: Metadata = {
    title: "Галерея события — Днеслов",
};

const EventGalleryRoutePage = ({ params }: PageParams) => {
    const galleryPromise = getEventGallery(params.id, params.event, 0, 24);

    return (
        <div>
            <Navbar />
            <main className="flex m-4">
                <Suspense fallback={<div>Загрузка...</div>}>
                    <Content
                        galleryPromise={galleryPromise}
                        memorySlug={params.id}
                        event={params.event}
                    />
                </Suspense>
            </main>
        </div>
    );
};

export default memo(EventGalleryRoutePage);
