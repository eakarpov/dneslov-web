// Verified against real gallery.json / gallery/:uid.json / :slug/gallery.json responses.
export interface IGalleryTitle {
    id: number;
    text: string;
    type?: string;
}

export interface IGalleryImageListItem {
    id: number;
    uid: string;
    url: string;
    thumb_url: string;
    type?: string;
    width?: number;
    height?: number;
    titles: IGalleryTitle[];
}

export interface IGalleryAttitude {
    slug?: string;
    event_id?: number | null;
    event_title?: string;
    memory_title?: string;
}

export interface IGalleryImageDetail {
    uid: string;
    title?: string;
    description?: string;
    attitudes_to: IGalleryAttitude[];
    url: string;
    type?: string;
    width?: number;
    height?: number;
}

export interface IGalleryScope {
    id?: number;
    gallery_title?: string;
    gallery_event?: string;
    attitude_to?: string;
    slug?: string;
    event_id?: number;
}

export interface IGalleryList extends Partial<IGalleryScope> {
    images: IGalleryImageListItem[];
    total: number;
    range: string;
}
