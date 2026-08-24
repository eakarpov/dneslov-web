import { CSSProperties, memo } from "react";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { ChipColors } from "../../../lib/colors";

interface ChipProps {
    text?: string | null;
    url?: string;
    className?: string;
    // Shown as a native tooltip — the monolith puts the order's full name here.
    title?: string | null;
    colors?: ChipColors;
    onRemove?: () => void;
    removeLabel?: string;
}

const Chip = ({ text, url, className = "", title, colors, onRemove, removeLabel }: ChipProps) => {
    if (!text) return null;

    const classes = `chip ${className}`.trim();
    const style: CSSProperties | undefined = colors;

    if (url) {
        return (
            <Link href={url} className={classes} style={style} title={title ?? undefined}>
                {text}
            </Link>
        );
    }

    return (
        <div className={classes} style={style} title={title ?? undefined}>
            <span>{text}</span>
            {onRemove && (
                <button
                    type="button"
                    className="chip-remove"
                    aria-label={removeLabel ?? "Убрать"}
                    onClick={onRemove}
                >
                    <XMarkIcon />
                </button>
            )}
        </div>
    );
};

export default memo(Chip);
