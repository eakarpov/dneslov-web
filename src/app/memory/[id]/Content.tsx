import {memo} from "react";
import MemoryPage from "./MemoryPage";
import JsonLd from "../../components/JsonLd";
import {memoryJsonLd} from "../../../lib/jsonld";
import {IMemory} from "../../../dto/memory";

interface ContentProps {
    itemPromise: Promise<IMemory | null>;
}

const Content = async ({ itemPromise }: ContentProps) => {
    const item = await itemPromise;

    return (
        <MemoryPage item={item ?? undefined} />
    );
}

export default memo(Content);
