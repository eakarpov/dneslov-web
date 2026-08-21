import {memo} from "react";
import Link from "next/link";

interface ChipProps {
    text?: string | null;
    url?: string;
    className?: string;
}

const Chip = ({ text, url, className = "" }: ChipProps) => {
    if (!text) return null;

    const classes = `chip ${className}`.trim();

    if (url) {
        return (
            <Link href={url} className={classes}>
                {text}
            </Link>
        );
    }

    return <div className={classes}>{text}</div>;
};

export default memo(Chip);
