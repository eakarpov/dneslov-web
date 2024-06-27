export enum CALENDAR_TYPE {
    JULIAN= "JULIAN",
    NEW_JULIAN= "NEW_JULIAN",
}

export interface IDateValue {
    calendarType: CALENDAR_TYPE;
    value: number|undefined;
}
