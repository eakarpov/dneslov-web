// Shape of a row in the day list (legacy `/index.json`).
// Verified against a real dneslov.org response (2026-08-24).
export interface IDayMemo {
    id?: number;
    slug?: string;
    title?: string;
    note?: string;
    happened_at?: string;
    roundel_url?: string;
    // order slug -> short name
    orders?: Record<string, string | null>;
    calendary_slug?: string;
    // The event this memo belongs to; the row links through to it.
    event_id?: number;
    event_title?: string;
    // "несвязаный" means the memo is not bound to another memory's event.
    bind_kind_code?: string;
    bond_to_id?: number | null;
    bond_to_title?: string | null;
    base_year?: number;
    year_date?: string;
    add_date?: string;
}

export interface IDayMemoList {
    list: IDayMemo[];
    page: number;
    total: number;
}
