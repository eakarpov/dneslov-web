// The backend distinguishes what a memory *is* through Memory subclasses, and
// hands the class name over as `type`. The monolith never shows it, so a place
// and a person look alike in the reference.

const LABELS: Record<string, string> = {
    Place: "место",
    Building: "строение",
    Council: "собор",
    Group: "собрание",
    Thing: "предмет",
    Concept: "понятие",
    Order: "чин",
    Subsisten: "ипостась",
};

// Identity — a person — is left unlabelled on purpose: nearly every memory is
// one, so saying so on each page would be noise. The label earns its place
// exactly when the memory is *not* a person.
export const memoryTypeLabel = (type?: string): string | undefined =>
    (type && LABELS[type]) || undefined;
