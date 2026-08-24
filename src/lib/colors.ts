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

export interface ChipColors {
    background: string;
    color: string;
    borderColor: string;
}

export const slugChipColors = (slug?: string | null): ChipColors | undefined => {
    if (!slug) return undefined;

    const hue = hash(slug) % 360;

    return {
        background: `hsl(${hue} 55% 92%)`,
        borderColor: `hsl(${hue} 45% 78%)`,
        color: `hsl(${hue} 60% 28%)`,
    };
};
