"use client";
import { memo, useEffect, useState } from "react";
import { IFastDaysMeta } from "../../../dto/calendar";
import { CALENDAR_TYPE } from "../../../types/index";
import { DateParts } from "../../../lib/dates/civil";
import { describeFast, fastForDate } from "../../../lib/fasting";
import { DEFAULT_PREFERENCES, readPreferences } from "../../../lib/preferences";
import "./styles.scss";

interface FastLineProps {
    date: DateParts;
    fastDays?: IFastDaysMeta[];
}

const FastLine = ({ date, fastDays }: FastLineProps) => {
    // The rules are read in the numerals of the style the grid shows, so the
    // line and the coloured cells can never disagree.
    const [calendarType, setCalendarType] = useState(DEFAULT_PREFERENCES.calendarType);
    useEffect(() => setCalendarType(readPreferences().calendarType), []);

    const isJul = calendarType === CALENDAR_TYPE.JULIAN;
    const fast = fastForDate(date, fastDays, isJul);

    if (!fast) return null;

    return <div className="fast-line">{describeFast(fast)}</div>;
};

export default memo(FastLine);
