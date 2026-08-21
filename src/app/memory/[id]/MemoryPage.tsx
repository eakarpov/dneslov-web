'use client';
import {memo, useCallback, useMemo, useState} from "react";
import Link from "next/link";
import Chip from "../../components/Chip";
import AudioPlayer from "../../components/AudioPlayer";
import {IMemory} from "../../../dto/memory";
import {getDescribedMemoes, getExternalLinks, getHappenedAt, getOrder} from "./selectors";
import {getScriptumTitle, sortScripta} from "../../../lib/liturgical";
import {getEventTitle} from "../../../lib/events";
import "../../common/content.scss";

const LINK_LABELS: Record<string, string> = {
    WikiLink: "Википедия",
    BeingLink: "Жития",
    PatericLink: "Патерик",
};

interface MemoryPageProps {
    item?: IMemory;
}

const MemoryPage = ({ item }: MemoryPageProps) => {
    const [playingAudioUrl, setPlayingAudioUrl] = useState<string>("");

    const onActivePlay = useCallback((url: string) => {
        setPlayingAudioUrl(url);
    }, []);

    const order = useMemo(() => item && getOrder(item), [item]);
    const externalLinks = useMemo(() => (item ? getExternalLinks(item) : []), [item]);
    const happenedAt = useMemo(() => item && getHappenedAt(item), [item]);
    const describedMemoes = useMemo(() => (item ? getDescribedMemoes(item) : []), [item]);
    const sortedScripta = useMemo(() => (item ? sortScripta(item.scripta || []) : []), [item]);

    if (!item) {
        return (
            <div className="flex flex-col memory-page">
                Память не найдена
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full memory-page">
            <div className="memory-header">
                <Chip text={order} className="order" />
                <div className="memory-title">
                    <span>{item.short_name}</span>
                    {item.names?.length > 0 && (
                        <div className="memory-names">
                            {item.names.map((name, index) => (
                                // real API responses contain names sharing the same id (different alphabet/language variants)
                                <span key={`${name.id}-${index}`}>{name.name_text}</span>
                            ))}
                        </div>
                    )}
                </div>
                <Chip text={happenedAt} />
            </div>

            {item.image_url && (
                <div className="memory-image">
                    <Link href={`/memory/${item.slug}/gallery`}>
                        <img src={item.image_url} alt={item.short_name} />
                    </Link>
                </div>
            )}

            {externalLinks.length > 0 && (
                <div className="memory-section">
                    <div className="memory-section-title">Внешние ссылки</div>
                    <div className="flex flex-wrap">
                        {externalLinks.map((link) => (
                            <Chip
                                key={link.id}
                                text={link.text || LINK_LABELS[link.type] || link.url}
                                url={link.url}
                                className="external"
                            />
                        ))}
                    </div>
                </div>
            )}

            {item.coverings?.length > 0 && (
                <div className="memory-section">
                    <div className="memory-section-title">Покровительствует</div>
                    <div className="flex flex-wrap">
                        {item.coverings.map((covering) => (
                            <Chip key={covering.id} text={covering.name} className="place" />
                        ))}
                    </div>
                </div>
            )}

            {describedMemoes.length > 0 ? (
                <div className="memory-section">
                    {describedMemoes.map((memo) => (
                        <p key={memo.id} className="memory-description">{memo.description}</p>
                    ))}
                </div>
            ) : item.description && (
                <div className="memory-section">
                    <p className="memory-description">{item.description}</p>
                </div>
            )}

            {sortedScripta.length > 0 && (
                <div className="memory-section scripta">
                    {sortedScripta.map((scriptum, index) => (
                        <div key={scriptum.id ?? index} className="scriptum">
                            <div className="scriptum-title">
                                <span>{getScriptumTitle(scriptum)}</span>
                                {scriptum.audio_url && (
                                    <AudioPlayer
                                        url={scriptum.audio_url}
                                        playing={scriptum.audio_url === playingAudioUrl}
                                        onActivePlay={onActivePlay}
                                    />
                                )}
                            </div>
                            <div className="scriptum-text">{scriptum.text}</div>
                        </div>
                    ))}
                </div>
            )}

            {item.bond_memories?.length > 0 && (
                <div className="memory-section">
                    <div className="memory-section-title">Опорная память</div>
                    <div className="flex flex-wrap">
                        {item.bond_memories.map((bond) => (
                            <Chip
                                key={bond.slug}
                                text={[bond.order, bond.name].filter(Boolean).join(" ")}
                                url={`/memory/${bond.slug}`}
                                className="order"
                            />
                        ))}
                    </div>
                </div>
            )}

            {item.events?.length > 0 && (
                <div className="memory-section">
                    <div className="memory-section-title">События</div>
                    <ul className="memory-events">
                        {item.events.map((event) => (
                            <li key={event.id}>
                                <Link href={`/memory/${item.slug}/${event.id}`}>
                                    {getEventTitle(event)}
                                </Link>
                                {(event.happened_at || event.place?.short_name) && (
                                    <span className="memory-event-meta">
                                        {[event.happened_at, event.place?.short_name].filter(Boolean).join(", ")}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default memo(MemoryPage);
