// Matches RitesController#object_json: jsonize(only: %w(id abbreviation title description text))
export interface IRite {
    id: number;
    abbreviation?: string;
    title?: string;
    description?: string;
    text?: string;
}
