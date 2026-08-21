// Verified against real memories#show.json / events#show.json responses.
export interface IMemo {
    id: number;
    calendary_slug: string;
    title?: string;
    description?: string;
    kind_code?: string;
    orders?: Record<string, string | null>;
    children?: IMemo[];
    children_total?: number;
}
