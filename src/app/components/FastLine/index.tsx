"use client";
import { memo } from "react";
import { IFastDaysMeta } from "../../../dto/calendar";
import { DateParts } from "../../../lib/dates/civil";
import { describeFast, fastForDate } from "../../../lib/fasting";
import "./styles.scss";

interface FastLineProps {
    date: DateParts;
    fastDays?: IFastDaysMeta[];
    // Comes from the calendar rather than being read again here, so the line
    // and the coloured cells can never disagree about the style.
    isJul: boolean;
}

const FastLine = ({ date, fastDays, isJul }: FastLineProps) => {
    const fast = fastForDate(date, fastDays, isJul);

    if (!fast) return null;

    return <div className="fast-line">{describeFast(fast)}</div>;
};

export default memo(FastLine);
