import {memo, Suspense} from "react";
import Navbar from "../common/Navbar";
import {getGalleryIndex} from "./api";
import Content from "./Content";

const GalleryRoutePage = () => {
    const galleryPromise = getGalleryIndex(0, 24);

    return (
        <div>
            <Navbar />
            <main className="flex m-4 w-full">
                <Suspense fallback={<div>Загрузка...</div>}>
                    <Content galleryPromise={galleryPromise} />
                </Suspense>
            </main>
        </div>
    );
};

export default memo(GalleryRoutePage);
