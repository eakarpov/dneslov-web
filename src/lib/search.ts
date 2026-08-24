// Query syntax, mirroring the backend (app/models/concerns/by_token.rb):
// "/" separates OR groups, whitespace inside a group means AND.
// Parsing here is purely presentational — the raw string goes to the backend,
// which does the actual matching; we only need the groups to draw removable
// chips for them.

export const parseQueryGroups = (query: string): string[] =>
    query
        .split("/")
        .map((group) => group.trim().replace(/\s+/g, " "))
        .filter(Boolean);

export const formatQueryGroups = (groups: string[]): string => groups.join(" / ");

// Collapses stray whitespace and spaces out slashes so what the reader typed
// and what the chips show line up.
export const normalizeQuery = (query: string): string =>
    formatQueryGroups(parseQueryGroups(query));

export const removeQueryGroup = (query: string, index: number): string =>
    formatQueryGroups(parseQueryGroups(query).filter((_, i) => i !== index));
