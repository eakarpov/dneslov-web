"use client";
import {memo, useCallback, useEffect, useMemo} from "react";
import "./styles.scss";
import {ChevronLeftIcon, ChevronRightIcon, Cog6ToothIcon} from '@heroicons/react/24/solid';
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {CALENDAR_TYPE} from "../../../types/index";
import {useAppDispatch, useAppSelector} from "../../../lib/hooks";
import { slice } from "../../../lib/store/global";
import {getFullWeeksStartAndEndInMonth} from "../../../lib/utils/dates";

const isSundayFirst = true;

const Calendar = () => {
    const dispatch = useAppDispatch();
    const dateValue = useAppSelector(state => state.global.dateValue);
    const currentDateValue = useAppSelector(state => state.global.currentDate);

    const calendaries = useAppSelector(state => state.global.calendaries);
    const currentCalendar = useAppSelector(state => state.global.currentCalendar);

    const fastDays = useMemo(() => currentCalendar?.meta?.fast_days, [currentCalendar]);

    const isJul = dateValue.calendarType === CALENDAR_TYPE.JULIAN;

    const pickedDate = dateValue.value ? isJul ? dayjs(dateValue.value) : dayjs(dateValue.value).add(13, "days") : null;

    const today = dayjs();
    const dateToday = isJul ? today.subtract(13, "days") : today;

    const dateValueObject = dayjs(currentDateValue, { locale: "ru" });
    const dateValueObjectOld = dateValueObject.subtract(13, "days");

    const onJulianClicked = useCallback(() => {
        dispatch(slice.actions.UpdateCalendarType(CALENDAR_TYPE.JULIAN));
    }, []);

    const onNewJulianClicked = useCallback(() => {
        dispatch(slice.actions.UpdateCalendarType(CALENDAR_TYPE.NEW_JULIAN))
    }, []);

    const onGoNextMonth = useCallback(() => {
        dispatch(slice.actions.UpdateCurrentDate(dateValueObject.add(1, 'month').valueOf()));
    }, [dateValueObject]);

    const onGoPrevMonth = useCallback(() => {
        dispatch(slice.actions.UpdateCurrentDate(dateValueObject.subtract(1, 'month').valueOf()));
    }, [dateValueObject]);

    const onGoTomorrow = useCallback(() => {
        dispatch(slice.actions.UpdateCurrentDate(today.add(1, 'day').valueOf()));
        dispatch(slice.actions.UpdateDateValue(dateToday.add(1, 'day').valueOf()));
    }, [dateToday, today]);

    const onGoYesterday = useCallback(() => {
        dispatch(slice.actions.UpdateCurrentDate(today.subtract(1, 'day').valueOf()));
        dispatch(slice.actions.UpdateDateValue(dateToday.subtract(1, 'day').valueOf()));
    }, [dateToday, today]);

    const onGoToDate = useCallback((date) => () => {
        dispatch(slice.actions.UpdateDateValue(isJul ? date.dateJs.valueOf() : date.dateJs.subtract(13, "days").valueOf()));
    }, [isJul]);

    const weekArray = getFullWeeksStartAndEndInMonth(
        isJul ? dateValueObjectOld.month() : dateValueObject.month(),
        isJul ? dateValueObjectOld.year() : dateValueObject.year(),
        isJul ? dateValueObjectOld.startOf("month").add(13, "days") : dateValueObject.startOf("month"),
        dateToday,
        pickedDate,
        isSundayFirst,
        fastDays,
        isJul,
    );

    useEffect(() => {
        if (!pickedDate) return;
        if (pickedDate.month() !== dateValueObject.month() || pickedDate.year() !== dateValueObject.year()) {
            console.log('should trigger');

        }
        // dispatch(slice.actions.UpdateCurrentDate(pickedDate.valueOf()));
    }, [pickedDate, dateValueObject]);

    useEffect(() => {
        const currCalendar =  calendaries.find(item => item.licit);
        if (currCalendar) {
            dispatch(slice.actions.UpdateCurrentCalendar(currCalendar));
        }
    }, [calendaries]);

    return (
        <div className="calendar-wrapper">
            <div className="calendar-header">
                <div
                    onClick={onJulianClicked}
                    className={dateValue.calendarType === CALENDAR_TYPE.JULIAN ? "calendar-active" : ""}
                >
                    Юлианский
                </div>
                <div
                    onClick={onNewJulianClicked}
                    className={dateValue.calendarType === CALENDAR_TYPE.NEW_JULIAN ? "calendar-active" : ""}
                >
                    Новоюлианский
                </div>
            </div>
            <div className="calendar-date-header">
                <div className="calendar-chevron" onClick={onGoPrevMonth}>
                    <ChevronLeftIcon />
                </div>
                <div className="calendar-month">
                    {dateValueObject.format("MMMM")}, {dateValueObject.year()}
                </div>
                <div className="calendar-chevron" onClick={onGoNextMonth}>
                    <ChevronRightIcon />
                </div>
            </div>
            <div className="calendar-week-days">
                {isSundayFirst && (
                    <div>
                        Вс
                    </div>
                )}
                <div>
                    Пн
                </div>
                <div>
                    Вт
                </div>
                <div>
                    Ср
                </div>
                <div>
                    Чт
                </div>
                <div>
                    Пт
                </div>
                <div>
                    Сб
                </div>
                {!isSundayFirst && (
                    <div>
                        Вс
                    </div>
                )}
            </div>
            {weekArray.map(week => (
                <div className="calendar-week">
                    {week.map(day => (
                        <div
                            onClick={onGoToDate(day)}
                            className={
                                `calendar-day ${
                                    day.monthValue !== dateValueObject.month() && `calendar-day-not-current-month`} ${
                                    day.isFast && `calendar-day-is-fasting`} ${
                                    day.isEaster && `calendar-day-is-easter`} ${
                                    day.isToday  && `calendar-day-is-today`} ${
                                    day.isActive  && `calendar-day-is-active`}`
                            }
                        >
                            <span>
                                {day.date}
                            </span>
                            {isJul && (
                                <span className="secondary">
                                    {day.dateNew}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            ))}
            <div className="calendar-yesterday-tomorrow">
                <div onClick={onGoYesterday}>
                    <div className="calendar-chevron">
                        <ChevronLeftIcon />
                    </div>
                    Вчера
                </div>
                <div onClick={onGoTomorrow}>
                    Завтра
                    <div className="calendar-chevron">
                        <ChevronRightIcon />
                    </div>
                </div>
            </div>
            <div className="calendar-settings">
                <div className="calendar-settings-name">
                    {currentCalendar ? currentCalendar.titles && currentCalendar.titles[0]?.text : `Выбранный календарь`}
                </div>
                <div className="calendar-settings-icon">
                    <Cog6ToothIcon />
                </div>
            </div>
        </div>
    );
};

export default memo(Calendar);
