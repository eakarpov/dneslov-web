// Shapes match Api::CommonController#jsonize(only: [...]) restrictions in
// GalleryController — index and show return different field sets.
export interface IGalleryImageListItem {
    uid: string;
    titles: { id: number; text: string }[];
    thumb_url: string;
    url: string;
    type?: string;
    width?: number;
    height?: number;
}

export interface IGalleryImageDetail {
    uid: string;
    title?: string;
    description?: string;
    attitudes_to?: string;
    url: string;
    type?: string;
    width?: number;
    height?: number;
}

export interface IGalleryAttituded {
    id: number;
    gallery_title?: string;
    gallery_event?: string;
    attitude_to?: string;
    slug?: string;
    event_id?: number;
}
