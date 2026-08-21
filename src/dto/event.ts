import {IPlace} from "./place";
import {IScriptum} from "./scriptum";
import {IMemo} from "./memo";

// Verified against a real events#show.json response.
export interface IEventTitle {
    type: "Appellation" | "Title" | string;
    text: string;
}

export interface IEvent {
    id: number;
    kind_code?: string;
    happened_at?: string;
    memory_id?: number;
    place?: IPlace;
    titles: IEventTitle[];
    description?: string;
    scripta?: IScriptum[];
    memoes: IMemo[];
}
