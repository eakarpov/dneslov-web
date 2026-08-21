import {memo} from "react";
import MemoryPage from "./MemoryPage";
import {IMemory} from "../../../dto/memory";

interface ContentProps {
    itemPromise: Promise<IMemory | undefined>;
}

const Content = async ({ itemPromise }: ContentProps) => {
    const item = await itemPromise;

    return (
        <MemoryPage item={item} />
    );
}

export default memo(Content);
