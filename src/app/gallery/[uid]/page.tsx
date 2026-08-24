import {memo, Suspense} from "react";
import Navbar from "../../common/Navbar";
import {getGalleryImage} from "./api";
import Content from "./Content";

const GalleryImageRoutePage = (props: { params: { uid: string } }) => {
    const imagePromise = getGalleryImage(props.params.uid);

    return (
        <div>
            <Navbar />
            <main className="flex m-4">
                <Suspense fallback={<div>Загрузка...</div>}>
                    <Content imagePromise={imagePromise} />
                </Suspense>
            </main>
        </div>
    );
};

export default memo(GalleryImageRoutePage);
