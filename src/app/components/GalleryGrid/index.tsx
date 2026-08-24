'use client';
import {memo, useCallback, useState} from "react";
import Link from "next/link";
import {IGalleryImageListItem} from "../../../dto/gallery";
import Lightbox from "../Lightbox";
import "./styles.scss";

const PAGE_SIZE = 25;

interface GalleryGridProps {
    initialImages: IGalleryImageListItem[];
    total: number;
    slug?: string;
    event?: string;
}

const GalleryGrid = ({ initialImages, total, slug, event }: GalleryGridProps) => {
    const [images, setImages] = useState(initialImages);
    const [loading, setLoading] = useState(false);
    const [openAt, setOpenAt] = useState<number | null>(null);

    const onLoadMore = useCallback(() => {
        setLoading(true);
        const from = images.length;
        const to = from + PAGE_SIZE - 1;
        const params = new URLSearchParams();
        if (slug) params.set('slug', slug);
        if (event) params.set('event', event);

        fetch(`/api/v1/gallery?${params.toString()}`, {
            headers: { Range: `records=${from}-${to}` },
        }).then(res => res.json()).then(data => {
            setImages(prev => [...prev, ...(data?.images || [])]);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [images.length, slug, event]);

    if (images.length === 0) {
        return <div className="gallery-empty">Изображений нет</div>;
    }

    return (
        <div className="flex flex-col w-full">
            <div className="gallery-grid">
                {images.map((image, index) => (
                    // Still a real link, so crawlers and middle-click reach the
                    // image page; a plain click opens the viewer in place.
                    <Link
                        href={`/gallery/${image.uid}`}
                        key={image.uid}
                        className="gallery-grid-item"
                        onClick={(e) => {
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                            e.preventDefault();
                            setOpenAt(index);
                        }}
                    >
                        <img src={image.thumb_url} alt={image.titles?.[0]?.text || ''} referrerPolicy="no-referrer" />
                    </Link>
                ))}
            </div>
            {images.length < total && (
                <button type="button" className="gallery-load-more" onClick={onLoadMore} disabled={loading}>
                    {loading ? 'Загрузка...' : 'Показать ещё'}
                </button>
            )}
            {openAt !== null && (
                <Lightbox
                    images={images}
                    index={openAt}
                    onClose={() => setOpenAt(null)}
                    onIndexChange={setOpenAt}
                />
            )}
        </div>
    );
};

export default memo(GalleryGrid);
