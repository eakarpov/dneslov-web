'use client';
import {memo, useCallback, useMemo, useState} from "react";
import Link from "next/link";
import Chip from "../../../components/Chip";
import AudioPlayer from "../../../components/AudioPlayer";
import {IEvent} from "../../../../dto/event";
import {getEventTitle} from "../../../../lib/events";
import Markdown from "../../../../lib/markdown";
import {getScriptumTitle, sortScripta} from "../../../../lib/liturgical";
import "../../../common/content.scss";

interface EventPageProps {
    event?: IEvent;
    memorySlug: string;
}

const EventPage = ({ event, memorySlug }: EventPageProps) => {
    const [playingAudioUrl, setPlayingAudioUrl] = useState<string>("");

    const onActivePlay = useCallback((url: string) => {
        setPlayingAudioUrl(url);
    }, []);

    const title = useMemo(() => event && getEventTitle(event), [event]);
    const sortedScripta = useMemo(() => (event?.scripta ? sortScripta(event.scripta) : []), [event]);

    if (!event) {
        return (
            <div className="flex flex-col content-page">
                Событие не найдено
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full content-page">
            <div className="content-header">
                <Link href={`/memory/${memorySlug}`} className="content-back">
                    ← к памяти
                </Link>
                <div className="content-title">{title}</div>
                <Chip text={[event.happened_at, event.place?.short_name].filter(Boolean).join(", ")} />
            </div>

            {event.description && (
                <div className="content-section">
                    <Markdown source={event.description} className="content-description" />
                </div>
            )}

            {sortedScripta.length > 0 && (
                <div className="content-section scripta">
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
                            <Markdown source={scriptum.text} className="scriptum-text" />
                        </div>
                    ))}
                </div>
            )}

            {event.memoes?.length > 0 && (
                <div className="content-section">
                    <div className="content-section-title">В разных календарях</div>
                    <div className="flex flex-wrap">
                        {event.memoes.map((memo) => (
                            <Chip key={memo.id} text={[memo.calendary_slug, memo.title].filter(Boolean).join(": ")} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(EventPage);
