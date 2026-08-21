import {memo} from "react";
import ImagePage from "./ImagePage";
import {IGalleryImageDetail} from "../../../dto/gallery";

interface ContentProps {
    imagePromise: Promise<IGalleryImageDetail | undefined>;
}

const Content = async ({ imagePromise }: ContentProps) => {
    const image = await imagePromise;

    return (
        <ImagePage image={image} />
    );
};

export default memo(Content);
