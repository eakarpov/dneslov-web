import { memo } from "react";
import Link from "next/link";
import GalleryGrid from "../../../../components/GalleryGrid";
import { IGalleryList } from "../../../../../dto/gallery";
import { eventHref } from "../../../../../lib/routes";
import "../../../../common/content.scss";

interface ContentProps {
    galleryPromise: Promise<IGalleryList | undefined>;
    memorySlug: string;
    event: string;
}

const Content = async ({ galleryPromise, memorySlug, event }: ContentProps) => {
    const gallery = await galleryPromise;

    return (
        <div className="flex flex-col w-full">
            <div className="content-header">
                <Link href={eventHref(memorySlug, event)} className="content-back">
                    ← к событию
                </Link>
                {gallery?.gallery_title && (
                    <div className="content-title">{gallery.gallery_title}</div>
                )}
            </div>
            <GalleryGrid
                initialImages={gallery?.images || []}
                total={gallery?.total || 0}
                slug={memorySlug}
                event={event}
            />
        </div>
    );
};

export default memo(Content);
