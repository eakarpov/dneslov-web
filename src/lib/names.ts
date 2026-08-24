// Name lookup. The backend has a rich model of names (Nomen knows diminutives,
// translations and roots) but exposes none of it publicly — only the general
// text search, which happily matches a word inside a description and calls it a
// hit. Filtering on the title is what turns that search into a name lookup.

// Titles carry combining acute accents ("Кири́лл"), and ё/е are treated as one
// letter by the backend's own unaccented matching, so both go before comparing.
export const normalizeName = (value: string): string =>
    value
        .normalize("NFD")
        // Only the stress marks come off. Stripping every combining character
        // would take the breve off "й" and the diaeresis off "ё", turning
        // "Варфоломей" into "варфоломеи".
        .replace(/[\u0300\u0301]/g, "")
        .normalize("NFC")
        .toLowerCase()
        .replace(/ё/g, "е")
        .trim();

const WORDS = /[^\p{L}\p{N}]+/u;

// Mirrors the backend's word-start prefix match (`\m<text>.*`), so "пётр"
// finds "Петра" but not "Петропавловск"... well, it finds that too — the
// backend is a prefix matcher and we do not pretend to be smarter than it.
export const titleMatchesName = (title: string | undefined, name: string): boolean => {
    const needle = normalizeName(name);

    if (!needle || !title) return false;

    return normalizeName(title)
        .split(WORDS)
        .some((word) => word.startsWith(needle));
};

// What the reader typed, tidied for display and for the address.
export const cleanNameQuery = (value: string): string =>
    value.replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
