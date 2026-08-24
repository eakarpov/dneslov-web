// Stable colour per slug: the same order or calendary always gets the same chip
// wherever it appears, without a colour field in the API.
//
// The monolith derives this from the slug's characters (mixins/GetSlugColor),
// but that formula can emit "g" into a hex triplet — not a colour at all. This
// is a plain hash into a hue, with saturation and lightness fixed so every chip
// stays readable.

const hash = (value: string): number => {
    let h = 0;
    for (let i = 0; i < value.length; i += 1) {
        h = (h * 31 + value.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
};

// Only the hue is decided here. Saturation and lightness are theme tokens, so
// the same chip works on a light and on a dark screen without this code — which
// runs on the server — knowing which one the reader is on.
export type ChipHue = { "--chip-h": string };

export const slugChipHue = (slug?: string | null): ChipHue | undefined =>
    slug ? ({ "--chip-h": `${hash(slug) % 360}` } as ChipHue) : undefined;
