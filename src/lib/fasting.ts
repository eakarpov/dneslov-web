import { FAST_MEASURE, IFastDaysMeta } from "../dto/calendar";
import { DateParts, civilToJulian, toDate } from "./dates/civil";
import { matchFastRule } from "./utils/dates";

// The calendary's own fast rules carry English title templates
// ("%{day}-th day of Dormintion fast"). The monolith reads them only to colour
// calendar cells and never shows them; naming the fast is most of the value.

const NAMES: [RegExp, string][] = [
    [/great lent/i, "Великий пост"],
    [/passion/i, "Страстная седмица"],
    [/peter/i, "Петров пост"],
    [/dormintion|dormition/i, "Успенский пост"],
    [/nativity/i, "Рождественский пост"],
    [/carnival/i, "Сырная седмица"],
    [/john/i, "Усекновение главы Иоанна Предтечи"],
    [/theophany/i, "Крещенский сочельник"],
    [/wednesday/i, "среда"],
    [/friday/i, "пятница"],
];

const MEASURES: Record<string, string> = {
    [FAST_MEASURE.MEAT]: "мяса",
    [FAST_MEASURE.EGG]: "яиц",
    [FAST_MEASURE.MILK]: "молочного",
    [FAST_MEASURE.BUTTER]: "масла",
    [FAST_MEASURE.FISH]: "рыбы",
};

export const fastName = (title?: string): string => {
    if (!title) return "постный день";

    const found = NAMES.find(([pattern]) => pattern.test(title));

    // An unrecognised rule keeps its own wording rather than being hidden.
    return found ? found[1] : title;
};

export const fastMeasures = (rule: IFastDaysMeta): string[] =>
    [rule.measure].flat().map((measure) => MEASURES[measure]).filter(Boolean);

export interface FastOfDay {
    name: string;
    measures: string[];
}

// Takes the civil date. Two different things are derived from it:
//   - the fixed-date rules (01.08..14.08 is the Dormition fast) are read in the
//     numerals of the style the calendar is drawn in;
//   - the weekday for the Wednesday/Friday rules comes from the real civil date,
//     because that is the day of the week the reader is actually living.
// Mixing those up makes a Tuesday match the Wednesday rule.
export const fastForDate = (
    date: DateParts,
    fastDays: IFastDaysMeta[] | undefined,
    isJul: boolean,
): FastOfDay | null => {
    if (!fastDays?.length) return null;

    const frame = isJul ? civilToJulian(date) : date;
    const weekDay = toDate(date).getDay();
    const rule = matchFastRule(toDate(frame), fastDays, isJul, weekDay);

    if (!rule) return null;

    return { name: fastName(rule.title), measures: fastMeasures(rule) };
};

export const describeFast = (fast: FastOfDay): string =>
    fast.measures.length > 0 ? `${fast.name}: без ${fast.measures.join(", ")}` : fast.name;
