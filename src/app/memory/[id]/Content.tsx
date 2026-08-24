import {memo} from "react";
import MemoryPage from "./MemoryPage";
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
