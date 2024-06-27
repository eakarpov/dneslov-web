import dayjs, {Dayjs} from "dayjs";
import {IFastDaysMeta} from "../../dto/calendar";
import * as easterCalc  from 'date-easter';
import {strict} from "assert";
import {is} from "immutable";

const easterDate = (yearIn: number, isJul: boolean) => {
    let year = yearIn || new Date().getFullYear();
    return new Date(Date.parse(isJul && easterCalc.julianEaster(year) || easterCalc.orthodoxEaster(year)));
}

// "matchBound" function to the test weither the date passed as an argument
// is a fast day returning the measure the fast of any. Argument:
// date        - the date to match
// forward     - "+nnn" day after pascha date
// backward    - "-nnn" day before pascha date
// strictDay   - "nn" day of the month in the year
// strictMonth - "mm" month of the year
// weekDayIn   - "%n" week day only selection
// weekDay     - week day for the date to match
// easter      - easter for the date to match
// year        - year of the date to match
// baseDateRef - reference hash t store or read baseDate value from "date"
const matchBound = (date, forward, backward, strictDay, strictMonth, weekDayIn, weekDay, easter, year, baseDateRef, isJul: boolean) => {
    let cond = false;
    let condDate;
    const baseDate = baseDateRef.date;
    const starOfDate = dayjs(date).startOf("day").valueOf();

    const condString = () => (weekDayIn ? +weekDayIn === weekDay : true) && (baseDateRef.date ? starOfDate <= condDate : starOfDate >= condDate);

    // if (date.getDate() === 29) {
    //     console.log("forward", forward, backward, strictDay, baseDateRef, strictMonth, weekDayIn, weekDay);
    // }

    if (forward) {
        condDate = dayjs(easter).add(+forward, "days").startOf("day").valueOf();
        cond = condString();
    } else if (backward) {
        condDate = dayjs(easter).subtract(+backward, "days").startOf("day").valueOf();
        if (baseDate && condDate < baseDate) {
            condDate = dayjs(easterDate(year + 1, isJul)).subtract(+backward, "days").startOf("day").valueOf();
        }

        cond = condString();
    } else if (strictDay) {
        condDate = new Date(date)
        condDate.setDate(strictDay)
        condDate.setMonth(+strictMonth - 1)
        if (baseDate && condDate < baseDate) {
            // condDate.setFullYear(condDate.getFullYear() + 1)
        }
        condDate = dayjs(condDate).startOf("day").valueOf();
        // if (date.getDate() === 29) {
        //     console.log("222222", baseDateRef, condDate, baseDate);
        // }
        // if (!baseDate) {
        //     baseDateRef.date = condDate
        // }

        cond = condString();
    }
    // if (date.getDate() === 18) {
    //     console.log(date.getDate(), date.getMonth(), condString(), condDate, baseDate, +date);
    // }

    if (!baseDate) {
        baseDateRef.date = condDate
    }

    return cond
}

const isDayFasten = (date: Date, fastDays: IFastDaysMeta[], isSundayFirst: boolean, isJul: boolean, weekDay: number) => {
    const year = date.getFullYear();
    const easter = easterDate(year, isJul);

    if (!fastDays) return false;

    return fastDays.reduce((measure, rule) => {
        let fast = [rule.days].flat().some((ranges) => {
            return [ranges].flat().some((range) => {
                const baseDateRef = {};
                const match = range.match(/(?:(?:\+(\d+))|(?:\-(\d+))|(\d+)\.(\d+))(?:%(\d))?(?:\.\.(?:(?:\+(\d+))|(?:\-(\d+))|(\d+)\.(\d+))(?:%(\d))?)?/);
                if (match === null) return undefined;
                const begin = matchBound(date, match[1], match[2], match[3], match[4], match[5], weekDay, easter, year, baseDateRef, isJul)

                if (begin) {
                    let end

                    if (match[6] || match[7] || match[8]) {
                        end = matchBound(date, match[6], match[7], match[8], match[9], match[10], weekDay, easter, year, baseDateRef, isJul)
                    } else {
                        end = matchBound(date, match[1], match[2], match[3], match[4], match[5], weekDay, easter, year, baseDateRef, isJul)
                    }
                    // if (date.getDate() === 29) {
                    //     console.log(begin, end, "begin end", match);
                    // }

                    return begin && end
                } else {
                    return begin
                }
            })
        })

        const flattenArr = [rule.measure].flat();

        return measure || fast && flattenArr[flattenArr.length - 1];
    }, false);
};

export const getFullWeeksStartAndEndInMonth = (
    month, year, baseDate: Dayjs, dateToday: Dayjs, pickedDate: Dayjs|null, isSundayFirst: boolean, fastDays: IFastDaysMeta[], isJul: boolean,
) => {
    let weeks = [],
        lastDate = new Date(year, month + 1, 0),
        numDays = lastDate.getDate()

    const getDay = isSundayFirst ? baseDate.day() + 1 === 7 ? 0 : baseDate.day() + 1 : baseDate.day();

    let start = 1
    let end
    if (getDay === 1) {
        end = 7
    } else if (getDay === 0) {
        let preMonthEndDay = new Date(year, month, 0)
        start = preMonthEndDay.getDate() - 6 + 1
        end = 1
    } else {
        let preMonthEndDay = new Date(year, month, 0)
        start = preMonthEndDay.getDate() + 1 - getDay + 1
        end = 7 - getDay + 1
        weeks.push({
            start: start,
            end: end
        })
        start = end + 1
        end = end + 7
    }
    while (start <= numDays) {
        weeks.push({
            start: start,
            end: end
        });
        start = end + 1;
        end = end + 7;
        end = start === 1 && end === 8 ? 1 : end;
        if (end > numDays && start <= numDays) {
            end = end - numDays
            weeks.push({
                start: start,
                end: end
            })
            break
        }
    }
    const easter = easterDate(year, isJul);
    return weeks.map(({start, end}, index) => {
        const sub = +(start > end && index === 0);
        return Array.from({length: 7}, (_, index) => {
            const date = new Date(year, month - sub, start + index);

            return {
                isToday: dayjs(date).isSame(dateToday, "date"),
                isActive: pickedDate && dayjs(date).isSame(pickedDate, "date"),
                date: date.getDate(),
                dateJs: dayjs(date),
                dateNew: dayjs(date).add(13, "days").format("DD"),
                monthValue: date.getMonth(),
                month: date.toLocaleString('en', {month: 'long'}),
                day: date.toLocaleString('en', {weekday: 'long'}),
                isFast: isDayFasten(date, fastDays, isSundayFirst, isJul, isSundayFirst ? index : index + 1 === 7 ? 0 : index + 1),
                isEaster: dayjs(easter).isSame(date, "day"),
            };
        });
    });
}