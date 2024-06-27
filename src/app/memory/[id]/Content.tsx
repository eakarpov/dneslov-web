import {memo} from "react";
import MemoryPage from "./MemoryPage";

const Content = async ({ itemPromise }) => {
    const item = await itemPromise;

    return (
        <MemoryPage item={item} />
    );
}

export default memo(Content);
