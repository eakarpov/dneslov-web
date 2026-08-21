import {memo, Suspense} from "react";
import Navbar from "../../../common/Navbar";
import {getMemoryGallery} from "./api";
import Content from "./Content";

const MemoryGalleryRoutePage = (props: { params: { id: string } }) => {
    const galleryPromise = getMemoryGallery(props.params.id, 0, 24);

    return (
        <div>
            <Navbar />
            <main className="flex m-4 w-full">
                <Suspense fallback={<div>Загрузка...</div>}>
                    <Content galleryPromise={galleryPromise} memorySlug={props.params.id} />
                </Suspense>
            </main>
        </div>
    );
};

export default memo(MemoryGalleryRoutePage);
