import {memo} from "react";
import GalleryGrid from "../components/GalleryGrid";
import {IGalleryList} from "../../dto/gallery";

interface ContentProps {
    galleryPromise: Promise<IGalleryList | undefined>;
}

const Content = async ({ galleryPromise }: ContentProps) => {
    const gallery = await galleryPromise;

    return (
        <GalleryGrid initialImages={gallery?.images || []} total={gallery?.total || 0} />
    );
};

export default memo(Content);
