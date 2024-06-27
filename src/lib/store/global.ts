import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {CALENDAR_TYPE, IDateValue} from "../../types/index";
import {ICalendar} from "../../dto/calendar";

export interface IGlobalSettings {
    dateValue: IDateValue;
    search: string;
    calendaries: ICalendar[];
    currentDate: number|undefined;
    currentCalendar: ICalendar|undefined;
}

export const initialState: IGlobalSettings = {
    dateValue: {
        calendarType: CALENDAR_TYPE.JULIAN,
        value: Date.now() - 13 * 24 * 3600 * 1000,
    },
    currentDate: undefined,
    search: "",
    calendaries: [],
    currentCalendar: undefined,
}

export const GlobalSettingsSlice = createSlice({
    name: 'global_settings',
    initialState,
    reducers: {
        UpdateDateValue (state, action: PayloadAction<number>){
            state.dateValue = {
                ...state.dateValue,
                value: action.payload,
            };
        },
        UpdateCurrentDate (state, action: PayloadAction<number>){
            state.currentDate = action.payload;
        },
        UpdateCalendarType (state, action: PayloadAction<CALENDAR_TYPE>){
            state.dateValue = {
                ...state.dateValue,
                calendarType: action.payload,
            };
        },
        UpdateSearch (state, action: PayloadAction<string>){
            state.search = action.payload;
        },
        UpdateCalendaries (state, action: PayloadAction<ICalendar[]>){
            state.calendaries = action.payload;
        },
        UpdateCurrentCalendar (state, action: PayloadAction<ICalendar|undefined>){
            state.currentCalendar = action.payload;
        },
    }
})

export const slice = GlobalSettingsSlice;

export default GlobalSettingsSlice.reducer;