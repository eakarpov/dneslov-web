import {memo} from "react";
import ImagePage from "./ImagePage";
import JsonLd from "../../components/JsonLd";
import {imageJsonLd} from "../../../lib/jsonld";
import {IGalleryImageDetail} from "../../../dto/gallery";

interface ContentProps {
    imagePromise: Promise<IGalleryImageDetail | undefined>;
}

const Content = async ({ imagePromise }: ContentProps) => {
    const image = await imagePromise;

    return (
        <>
            {image && <JsonLd data={imageJsonLd(image)} />}
            <ImagePage image={image} />
        </>
    );
};

export default memo(Content);
