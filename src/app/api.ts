import {CALENDAR_TYPE} from "../types/index";

export const getItemsLocal = async (dateTime: string, calendarType: CALENDAR_TYPE, calendarString: string, search: string) => {
    return fetch(`/api/v1?${encodeURIComponent(
        `${calendarType === CALENDAR_TYPE.JULIAN ? `ю` : 'н'}${dateTime}&c=${calendarString}&q=${search}`
    )}`).then(res => res.json()).catch((e) => console.log(e));
};

const getItems = async (dateTime: string, calendarType: CALENDAR_TYPE, calendarString: string) => {
    return fetch(`http://${process.env.BASE_API_HOST}/index.json?d=${calendarType === CALENDAR_TYPE.JULIAN ? `ю` : 'н'}${dateTime}&c=${calendarString}`)
        .then(res => res.json()).catch(e => console.log(e));
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
    return fetch(`http://${process.env.BASE_API_HOST}/calendaries.json?page=${page}&per=${count}&l=true`).then(res => res.json());
}

export default getItems;
