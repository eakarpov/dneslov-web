import {ISlug} from "./index";

export interface ICalendarLink {
    type: string;
    url: string;
    id: number;
}

export interface ICalendarTitle {
    id: number;
    text: string;
}

export enum FAST_MEASURE {
    EGG= "egg",
    MEAT= "meat",
    FISH= "fish",
    BUTTER= "butter", // oil
    MILK= "milk",
}

export interface IFastDaysMeta {
    title: string;
    measure: FAST_MEASURE[]|FAST_MEASURE;
    days: string[];
}

export interface ICalendarMeta {
    fast_days: IFastDaysMeta[];
}

export interface ICalendar {
    licit: boolean;
    links: ICalendarLink[];
    author_name: string;
    date: string;
    id: number;
    slug: ISlug;
    titles: ICalendarTitle[];
    description: ICalendarTitle[];
    meta: ICalendarMeta;
}