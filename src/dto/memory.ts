import {IScriptum} from "./scriptum";
import {IMemo} from "./memo";
import {IEvent} from "./event";

export interface IMemoryName {
    id: number;
    name_text: string;
    state_code?: string;
}

export interface IMemoryLink {
    id: number;
    type: "WikiLink" | "BeingLink" | "PatericLink" | "IconLink" | string;
    url: string;
    text?: string;
}

export interface ICovering {
    id: number;
    name: string;
}

export interface IBondMemory {
    slug: string;
    order?: string;
    name?: string;
}

// Verified 2026-08-21 against a real memories#show.json response (memories#show.json
// is still legacy, not under /api/v1 — see roadmap Stage 4, re-check after it migrates).
// Note: there is no top-level `place`/`date` on this payload (unlike Memory.jsx's props,
// which the monolith populates from elsewhere) — happened-at/place info lives on events.
export interface IMemory {
    id: number;
    slug: string;
    short_name?: string;
    // Memory subclass on the backend: Identity, Place, Building, Council,
    // Group, Thing, Concept, Order, Subsisten. Verified on a real payload.
    type?: string;
    kind?: string;
    quantity?: string | number | null;
    base_year?: number;
    description?: string;
    names: IMemoryName[];
    links: IMemoryLink[];
    events: IEvent[];
    memoes: IMemo[];
    scripta: IScriptum[];
    coverings: ICovering[];
    image_url?: string;
    bond_memories: IBondMemory[];
}
