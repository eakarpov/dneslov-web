import { IMemory } from "../dto/memory";
import { IEvent } from "../dto/event";
import { IGalleryImageDetail } from "../dto/gallery";
import { SITE_URL } from "./site";
import { memoryHref } from "./routes";
import { getEventTitle } from "./events";

// Structured data, of which the monolith has none. The memory's own `type`
// already distinguishes people from places and things, so the schema.org type
// is read from the data rather than guessed.
const SCHEMA_TYPES: Record<string, string> = {
    Identity: "Person",
    Place: "Place",
    Building: "Place",
    Council: "Organization",
    Group: "Organization",
    Thing: "Thing",
    Concept: "Thing",
    Order: "Thing",
    Subsisten: "Thing",
};

export const memoryJsonLd = (memory: IMemory) => ({
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPES[memory.type ?? ""] ?? "Thing",
    name: memory.short_name,
    alternateName: memory.names?.map((name) => name.name_text).filter(Boolean),
    description: memory.description,
    image: memory.image_url,
    url: `${SITE_URL}${memoryHref(memory.slug)}`,
    sameAs: memory.links?.map((link) => link.url).filter(Boolean),
});

export const eventJsonLd = (event: IEvent, memorySlug: string) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: getEventTitle(event),
    description: event.description,
    location: event.place?.short_name,
    url: `${SITE_URL}${memoryHref(memorySlug)}/${event.id}`,
    // happened_at is often not a date at all ("ок. 303", "I"), so it is stated
    // as plain text rather than forced into startDate.
    disambiguatingDescription: event.happened_at,
});

export const imageJsonLd = (image: IGalleryImageDetail) => ({
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: image.url,
    name: image.title,
    description: image.description,
    width: image.width,
    height: image.height,
    url: `${SITE_URL}/gallery/${image.uid}`,
});

// Drops empty fields so the output stays readable, and neutralises "<" so the
// payload can never close the surrounding script tag.
export const serializeJsonLd = (data: object): string =>
    JSON.stringify(data, (_key, value) => {
        if (value === null || value === undefined || value === "") return undefined;
        if (Array.isArray(value) && value.length === 0) return undefined;
        return value;
    }).replace(/</g, "\\u003c");
