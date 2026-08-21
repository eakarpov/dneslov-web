import {memo} from "react";
import Link from "next/link";
import GalleryGrid from "../../../components/GalleryGrid";
import {IGalleryList} from "../../../../dto/gallery";
import "../../../common/content.scss";

interface ContentProps {
    galleryPromise: Promise<IGalleryList | undefined>;
    memorySlug: string;
}

const Content = async ({ galleryPromise, memorySlug }: ContentProps) => {
    const gallery = await galleryPromise;

    return (
        <div className="flex flex-col w-full">
            <div className="content-header">
                <Link href={`/memory/${memorySlug}`} className="content-back">
                    ← к памяти
                </Link>
                {gallery?.gallery_title && (
                    <div className="content-title">{gallery.gallery_title}</div>
                )}
            </div>
            <GalleryGrid
                initialImages={gallery?.images || []}
                total={gallery?.total || 0}
                slug={memorySlug}
            />
        </div>
    );
};

export default memo(Content);
