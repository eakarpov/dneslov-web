"use client";
import { memo, useCallback, useEffect } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { IGalleryImageListItem } from "../../../dto/gallery";
import "./styles.scss";

interface LightboxProps {
    images: IGalleryImageListItem[];
    index: number;
    onClose: () => void;
    onIndexChange: (index: number) => void;
}

const Lightbox = ({ images, index, onClose, onIndexChange }: LightboxProps) => {
    const image = images[index];

    const step = useCallback(
        (delta: number) => {
            // Wraps, so paging never dead-ends on the first or last image.
            onIndexChange((index + delta + images.length) % images.length);
        },
        [index, images.length, onIndexChange],
    );

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
        };

        document.addEventListener("keydown", onKey);
        // The page behind must not scroll while the overlay is up.
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose, step]);

    if (!image) return null;

    const title = image.titles?.[0]?.text;

    return (
        <div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={title || "Изображение"}
            onClick={onClose}
        >
            <button type="button" className="lightbox-close" aria-label="Закрыть" onClick={onClose}>
                <XMarkIcon />
            </button>
            {images.length > 1 && (
                <button
                    type="button"
                    className="lightbox-nav lightbox-prev"
                    aria-label="Предыдущее"
                    onClick={(e) => {
                        e.stopPropagation();
                        step(-1);
                    }}
                >
                    <ChevronLeftIcon />
                </button>
            )}
            {/* Stops the backdrop handler from closing when the figure is clicked. */}
            <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
                <img src={image.url} alt={title || ""} referrerPolicy="no-referrer" />
                <figcaption>
                    {title && <span className="lightbox-title">{title}</span>}
                    <Link href={`/gallery/${image.uid}`} className="lightbox-link">
                        Подробнее об образе
                    </Link>
                    <span className="lightbox-counter">
                        {index + 1} из {images.length}
                    </span>
                </figcaption>
            </figure>
            {images.length > 1 && (
                <button
                    type="button"
                    className="lightbox-nav lightbox-next"
                    aria-label="Следующее"
                    onClick={(e) => {
                        e.stopPropagation();
                        step(1);
                    }}
                >
                    <ChevronRightIcon />
                </button>
            )}
        </div>
    );
};

export default memo(Lightbox);
