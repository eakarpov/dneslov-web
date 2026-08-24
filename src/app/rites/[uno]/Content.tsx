import {memo} from "react";
import RitePage from "./RitePage";
import {IRite} from "../../../dto/rite";

interface ContentProps {
    ritePromise: Promise<IRite | undefined>;
}

const Content = async ({ ritePromise }: ContentProps) => {
    const rite = await ritePromise;

    return (
        <RitePage rite={rite} />
    );
};

export default memo(Content);
