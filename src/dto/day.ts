// Shape of a row in the day list (legacy `/index.json`).
// Field names verified against real dneslov.org responses.
export interface IDayMemo {
    id?: number;
    slug?: string;
    title?: string;
    note?: string;
    happened_at?: string;
    roundel_url?: string;
    orders?: Record<string, string | null>;
    calendary_slugs?: string[];
}

export interface IDayMemoList {
    list: IDayMemo[];
    page: number;
    total: number;
}
