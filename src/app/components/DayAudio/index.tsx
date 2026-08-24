"use client";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PlayIcon, PauseIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { IDayMemo } from "../../../dto/day";
import { IMemory } from "../../../dto/memory";
import { mapWithLimit, Track, tracksOfMemory } from "../../../lib/playlist";
import { memoryHref } from "../../../lib/routes";
import "./styles.scss";

// How many memories to ask for at once. The reference is slow and often
// unreachable; a whole day at once would be a good way to get nothing.
const CONCURRENCY = 4;

interface DayAudioProps {
    rows: IDayMemo[];
}

const DayAudio = ({ rows }: DayAudioProps) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [tracks, setTracks] = useState<Track[] | null>(null);
    const [gathering, setGathering] = useState(false);
    const [current, setCurrent] = useState(0);
    const [playing, setPlaying] = useState(false);

    const slugs = rows.map((row) => row.slug).filter((slug): slug is string => Boolean(slug));

    // Gathering happens on request, not on page load: it costs one request per
    // memory of the day, and most readers only want to look.
    const gather = useCallback(async () => {
        setGathering(true);

        const memories = await mapWithLimit(slugs, CONCURRENCY, (slug) =>
            fetch(`/api/v1/memory?${new URLSearchParams({ slug })}`)
                .then((res) => res.json() as Promise<IMemory | null>)
                .catch(() => null),
        );

        setTracks(memories.filter(Boolean).flatMap((memory) => tracksOfMemory(memory as IMemory)));
        setCurrent(0);
        setGathering(false);
    }, [slugs.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

    const step = useCallback(
        (delta: number) => {
            if (!tracks?.length) return;
            setCurrent((index) => (index + delta + tracks.length) % tracks.length);
            setPlaying(true);
        },
        [tracks],
    );

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (playing) {
            audio.play().catch(() => setPlaying(false));
        } else {
            audio.pause();
        }
    }, [playing, current]);

    if (!tracks) {
        return (
            <button type="button" className="day-audio-start" onClick={gather} disabled={gathering || slugs.length === 0}>
                {gathering ? "Собираем песнопения..." : "Слушать день"}
            </button>
        );
    }

    if (tracks.length === 0) {
        return <div className="day-audio-empty">Записей за этот день нет.</div>;
    }

    const track = tracks[current];

    return (
        <div className="day-audio">
            <div className="day-audio-controls">
                <button type="button" onClick={() => step(-1)} aria-label="Предыдущее">
                    <ChevronLeftIcon />
                </button>
                <button
                    type="button"
                    className="day-audio-play"
                    onClick={() => setPlaying((on) => !on)}
                    aria-label={playing ? "Пауза" : "Слушать"}
                >
                    {playing ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Следующее">
                    <ChevronRightIcon />
                </button>
                <div className="day-audio-now">
                    <Link href={memoryHref(track.memorySlug)}>{track.memoryTitle}</Link>
                    <span className="day-audio-track">{track.title}</span>
                    <span className="day-audio-count">
                        {current + 1} из {tracks.length}
                    </span>
                </div>
            </div>

            <ol className="day-audio-list">
                {tracks.map((item, index) => (
                    <li key={item.url}>
                        <button
                            type="button"
                            aria-current={index === current ? "true" : undefined}
                            onClick={() => {
                                setCurrent(index);
                                setPlaying(true);
                            }}
                        >
                            {item.memoryTitle} — {item.title}
                        </button>
                    </li>
                ))}
            </ol>

            <audio
                ref={audioRef}
                src={track.url}
                preload="none"
                // Moving on by itself is the whole point of a day playlist.
                onEnded={() => step(1)}
                onPause={() => setPlaying(false)}
                onPlay={() => setPlaying(true)}
            />
        </div>
    );
};

export default memo(DayAudio);
