import {memo, Suspense} from "react";
import {getMemoryGallery} from "./api";
import Content from "./Content";

const MemoryGalleryRoutePage = (props: { params: { id: string } }) => {
    const galleryPromise = getMemoryGallery(props.params.id, 0, 24);

    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <Content galleryPromise={galleryPromise} memorySlug={props.params.id} />
        </Suspense>
    );
};

export default memo(MemoryGalleryRoutePage);
