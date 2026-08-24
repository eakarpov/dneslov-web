import {memo, Suspense} from "react";
import {getGalleryIndex} from "./api";
import Content from "./Content";

// Rendered on demand rather than prerendered: the legacy backend is regularly
// unreachable, and a build must not bake in (or fail on) one bad minute. The
// data itself is still cached for an hour.
export const dynamic = "force-dynamic";
export const fetchCache = "default-cache";

const GalleryRoutePage = () => {
    const galleryPromise = getGalleryIndex(0, 24);

    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <Content galleryPromise={galleryPromise} />
        </Suspense>
    );
};

export default memo(GalleryRoutePage);
