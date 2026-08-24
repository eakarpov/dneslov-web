"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import "./styles.scss";
import { ChevronLeftIcon, ChevronRightIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useRouter } from "next/navigation";
import { CALENDAR_TYPE } from "../../../types/index";
import { ICalendar } from "../../../dto/calendar";
import { IDayFilters } from "../../api";
import { buildListHref } from "../../../lib/routes";
import { getFullWeeksStartAndEndInMonth } from "../../../lib/utils/dates";
import {
    DateParts,
    addDays,
    churchToday,
    civilToJulian,
    formatCivilISO,
    fromDate,
    julianToCivil,
    toDate,
} from "../../../lib/dates/civil";
import { DEFAULT_PREFERENCES, readPreferences, writePreferences } from "../../../lib/preferences";

const isSundayFirst = true;

interface CalendarProps {
    filters: IDayFilters;
    defaultCalendaries: string[];
    calendaries: ICalendar[];
}

const Calendar = ({ filters, defaultCalendaries, calendaries }: CalendarProps) => {
    const router = useRouter();

    // Display style is a preference, not part of the address: the same day has
    // exactly one URL whichever style it is drawn in. Read after mount so the
    // server and the first client render agree.
    const [calendarType, setCalendarType] = useState(DEFAULT_PREFERENCES.calendarType);
    useEffect(() => setCalendarType(readPreferences().calendarType), []);

    const isJul = calendarType === CALENDAR_TYPE.JULIAN;

    // The grid is drawn in the numerals of the chosen style ("frame"); URLs and
    // everything crossing the wire stay civil.
    const toFrame = useCallback((date: DateParts) => (isJul ? civilToJulian(date) : date), [isJul]);
    const fromFrame = useCallback((date: DateParts) => (isJul ? julianToCivil(date) : date), [isJul]);

    const today = useMemo(() => churchToday(), []);
    const selected = filters.date ?? today;
    const selectedKey = filters.date ? formatCivilISO(filters.date) : null;

    // Which month the grid shows; follows the selection but can be paged away.
    const [anchor, setAnchor] = useState<DateParts>(selected);
    useEffect(() => {
        if (filters.date) setAnchor(filters.date);
    }, [selectedKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const frameAnchor = toFrame(anchor);

    const currentCalendar = useMemo(
        () => calendaries.find((calendary) => filters.calendaries.includes(calendary.slug?.text)),
        [calendaries, filters.calendaries],
    );

    const goToDate = useCallback(
        (date: DateParts) => {
            router.push(buildListHref({ ...filters, date }, defaultCalendaries));
        },
        [router, filters, defaultCalendaries],
    );

    const shiftMonth = useCallback(
        (months: number) => {
            const shifted = dayjs(toDate(frameAnchor)).add(months, "month");
            setAnchor(fromFrame(fromDate(shifted.toDate())));
        },
        [frameAnchor, fromFrame],
    );

    const onPickStyle = useCallback((next: CALENDAR_TYPE) => {
        setCalendarType(next);
        writePreferences({ calendarType: next });
    }, []);

    const weekArray = getFullWeeksStartAndEndInMonth(
        frameAnchor.month - 1,
        frameAnchor.year,
        // Weekday of the month start must come from the real civil date.
        dayjs(toDate(fromFrame({ ...frameAnchor, day: 1 }))),
        dayjs(toDate(toFrame(today))),
        filters.date ? dayjs(toDate(toFrame(filters.date))) : null,
        isSundayFirst,
        currentCalendar?.meta?.fast_days ?? [],
        isJul,
    );

    const monthLabel = dayjs(toDate(frameAnchor)).locale("ru").format("MMMM");

    return (
        <div className="calendar-wrapper">
            <div className="calendar-header">
                <div
                    onClick={() => onPickStyle(CALENDAR_TYPE.JULIAN)}
                    className={isJul ? "calendar-active" : ""}
                >
                    Юлианский
                </div>
                <div
                    onClick={() => onPickStyle(CALENDAR_TYPE.NEW_JULIAN)}
                    className={!isJul ? "calendar-active" : ""}
                >
                    Новоюлианский
                </div>
            </div>
            <div className="calendar-date-header">
                <div className="calendar-chevron" onClick={() => shiftMonth(-1)}>
                    <ChevronLeftIcon />
                </div>
                <div className="calendar-month">
                    {monthLabel}, {frameAnchor.year}
                </div>
                <div className="calendar-chevron" onClick={() => shiftMonth(1)}>
                    <ChevronRightIcon />
                </div>
            </div>
            <div className="calendar-week-days">
                {isSundayFirst && <div>Вс</div>}
                <div>Пн</div>
                <div>Вт</div>
                <div>Ср</div>
                <div>Чт</div>
                <div>Пт</div>
                <div>Сб</div>
                {!isSundayFirst && <div>Вс</div>}
            </div>
            {weekArray.map((week) => (
                <div className="calendar-week" key={week[0].dateJs.valueOf()}>
                    {week.map((day) => (
                        <div
                            key={day.dateJs.valueOf()}
                            onClick={() => goToDate(fromFrame(fromDate(day.dateJs.toDate())))}
                            className={
                                `calendar-day ${
                                    day.monthValue !== frameAnchor.month - 1 && `calendar-day-not-current-month`} ${
                                    day.isFast && `calendar-day-is-fasting`} ${
                                    day.isEaster && `calendar-day-is-easter`} ${
                                    day.isToday && `calendar-day-is-today`} ${
                                    day.isActive && `calendar-day-is-active`}`
                            }
                        >
                            <span>{day.date}</span>
                            {isJul && <span className="secondary">{day.dateNew}</span>}
                        </div>
                    ))}
                </div>
            ))}
            <div className="calendar-yesterday-tomorrow">
                <div onClick={() => goToDate(addDays(selected, -1))}>
                    <div className="calendar-chevron">
                        <ChevronLeftIcon />
                    </div>
                    Вчера
                </div>
                <div onClick={() => goToDate(addDays(selected, 1))}>
                    Завтра
                    <div className="calendar-chevron">
                        <ChevronRightIcon />
                    </div>
                </div>
            </div>
            <div className="calendar-settings">
                <div className="calendar-settings-name">
                    {currentCalendar?.titles?.[0]?.text ?? "Выбранный календарь"}
                </div>
                <div className="calendar-settings-icon">
                    <Cog6ToothIcon />
                </div>
            </div>
        </div>
    );
};

export default memo(Calendar);
