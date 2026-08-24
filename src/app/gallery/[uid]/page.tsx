import {memo, Suspense} from "react";
import {getGalleryImage} from "./api";
import Content from "./Content";

const GalleryImageRoutePage = (props: { params: { uid: string } }) => {
    const imagePromise = getGalleryImage(props.params.uid);

    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <Content imagePromise={imagePromise} />
        </Suspense>
    );
};

export default memo(GalleryImageRoutePage);
