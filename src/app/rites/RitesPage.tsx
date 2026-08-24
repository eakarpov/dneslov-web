import {memo} from "react";
import Link from "next/link";
import {IRite} from "../../dto/rite";
import "../common/content.scss";

interface RitesPageProps {
    rites: IRite[];
}

const RitesPage = ({ rites }: RitesPageProps) => {
    if (rites.length === 0) {
        return (
            <div className="flex flex-col content-page">
                Чины пока не добавлены
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full content-page">
            <ul className="item-list">
                {rites.map((rite) => (
                    <li key={rite.id}>
                        <Link href={`/rites/${rite.id}`}>
                            {[rite.abbreviation, rite.title].filter(Boolean).join(' — ')}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default memo(RitesPage);
