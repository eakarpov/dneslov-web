import {memo} from "react";
import Link from "next/link";
import {IGalleryImageDetail} from "../../../dto/gallery";
import "../../common/content.scss";
import "../../components/GalleryGrid/styles.scss";

interface ImagePageProps {
    image?: IGalleryImageDetail;
}

const ImagePage = ({ image }: ImagePageProps) => {
    if (!image) {
        return (
            <div className="flex flex-col content-page">
                Изображение не найдено
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full content-page">
            {image.title && <div className="content-title">{image.title}</div>}
            <img src={image.url} alt={image.title || ''} className="gallery-image-full" />
            {image.description && (
                <p className="content-description">{image.description}</p>
            )}
            {image.attitudes_to?.length > 0 && (
                <div className="content-section">
                    <div className="content-section-title">Относится к</div>
                    <div className="flex flex-wrap">
                        {image.attitudes_to.map((attitude, index) => (
                            <Link
                                key={`${attitude.slug}-${attitude.event_id}-${index}`}
                                href={attitude.event_id ? `/memory/${attitude.slug}/${attitude.event_id}` : `/memory/${attitude.slug}`}
                                className="chip"
                            >
                                {[attitude.memory_title, attitude.event_title].filter(Boolean).join(' — ')}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(ImagePage);
