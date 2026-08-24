import {memo} from "react";
import RitesPage from "./RitesPage";
import {IRite} from "../../dto/rite";

interface ContentProps {
    ritesPromise: Promise<IRite[]>;
}

const Content = async ({ ritesPromise }: ContentProps) => {
    const rites = await ritesPromise;

    return (
        <RitesPage rites={rites} />
    );
};

export default memo(Content);
