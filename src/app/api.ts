import {CALENDAR_TYPE} from "../types/index";
import {fetchLegacyJson} from "../lib/api/host";

export const getItemsLocal = async (dateTime: string, calendarType: CALENDAR_TYPE, calendarString: string, search: string) => {
    return fetch(`/api/v1?${encodeURIComponent(
        `d=${calendarType === CALENDAR_TYPE.JULIAN ? `ю` : 'н'}${dateTime}&c=${calendarString}&q=${search}`
    )}`).then(res => res.json()).catch((e) => console.log(e));
};

const getItems = async (dateTime: string, calendarType: CALENDAR_TYPE, calendarString: string) => {
    return fetchLegacyJson(`/index.json?d=${calendarType === CALENDAR_TYPE.JULIAN ? `ю` : 'н'}${dateTime}&c=${calendarString}`)
        .catch(e => console.log(e));
};

export const getItemsBatch = async (dateTime: string, calendarString: string, from: number, to: number) => {
    return fetch(`/api/v1?${encodeURIComponent(
        // `d=ю${dateTime}&c=${calendarString}`
        `c=${calendarString}`
    )}`, {
        headers: {
            'Range': `records=${from}-${to}`
        }
    }).then(res => res.json()).catch((e) => console.log(e));
};

export const getCalendariesLocal = (page, count) => {
    // return Promise.resolve(['рпц', 'нмр', 'днес']);
    return fetch(`/api/v1/calendaries?page=${page}&per=${count}&licit=true`).then(res => res.json());
}

// 185.133.40.112

export const getCalendaries = async (page, count) => {
    // return Promise.resolve(['рпц', 'нмр', 'днес']);
    return fetchLegacyJson(`/calendaries.json?page=${page}&per=${count}&l=true`);
}

export default getItems;
