import {IEvent} from "../dto/event";

// Verified against a real events#show.json payload: title types are "Appellation"
// (short name) and "Title" (full sentence) — the monolith's EventSpan.jsx hardcodes
// ["Subject", "Event"] here, but that never matches real data, so on that page the
// API's own array order (Appellation first) ends up deciding it. We do it explicitly.
const EVENT_TITLE_TYPE_ORDER = ["Appellation", "Title"];

export const getEventTitle = (event: IEvent): string | undefined => {
    const sorted = [...(event.titles || [])].sort(
        (a, b) => EVENT_TITLE_TYPE_ORDER.indexOf(a.type) - EVENT_TITLE_TYPE_ORDER.indexOf(b.type)
    );

    return sorted[0]?.text;
};
