import {memo} from "react";
import MemoryPage from "./MemoryPage";
import {IMemory} from "../../../dto/memory";
import {LegacyResult} from "../../../lib/api/load";

interface ContentProps {
    itemPromise: Promise<LegacyResult<IMemory>>;
}

const Content = async ({ itemPromise }: ContentProps) => {
    const { data, unavailable } = await itemPromise;

    return (
        <MemoryPage item={data ?? undefined} unavailable={unavailable} />
    );
}

export default memo(Content);
