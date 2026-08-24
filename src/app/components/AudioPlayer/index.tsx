'use client';
import {memo, useEffect, useRef} from "react";
import {PlayIcon, PauseIcon} from "@heroicons/react/24/solid";

interface AudioPlayerProps {
    url: string;
    playing: boolean;
    onActivePlay: (url: string) => void;
}

const AudioPlayer = ({ url, playing, onActivePlay }: AudioPlayerProps) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!audioRef.current) return;

        if (playing) {
            audioRef.current.play().catch(() => {});
        } else {
            audioRef.current.pause();
        }
    }, [playing]);

    const onToggle = () => {
        onActivePlay(playing ? "" : url);
    };

    return (
        <button
            type="button"
            className="audio-player-button"
            onClick={onToggle}
            aria-label={playing ? "Пауза" : "Слушать"}
        >
            {playing ? <PauseIcon className="audio-player-icon" /> : <PlayIcon className="audio-player-icon" />}
            <audio ref={audioRef} src={url} preload="none" onEnded={() => onActivePlay("")} />
        </button>
    );
};

export default memo(AudioPlayer);
