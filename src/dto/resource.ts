// Matches ResourcesController#object_json: jsonize(only: %w(id abbreviation title description text))
export interface IResource {
    id: number;
    abbreviation?: string;
    title?: string;
    description?: string;
    text?: string;
}
