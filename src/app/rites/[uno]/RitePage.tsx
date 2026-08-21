import {memo} from "react";
import Link from "next/link";
import {IRite} from "../../../dto/rite";
import "../../common/content.scss";

interface RitePageProps {
    rite?: IRite;
}

const RitePage = ({ rite }: RitePageProps) => {
    if (!rite) {
        return (
            <div className="flex flex-col content-page">
                Чин не найден
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full content-page">
            <div className="content-header">
                <Link href="/rites" className="content-back">
                    ← все чины
                </Link>
                <div className="content-title">
                    {[rite.abbreviation, rite.title].filter(Boolean).join(' — ')}
                </div>
            </div>
            {rite.description && (
                <p className="content-description">{rite.description}</p>
            )}
            {rite.text && (
                <div className="content-description">{rite.text}</div>
            )}
        </div>
    );
};

export default memo(RitePage);
