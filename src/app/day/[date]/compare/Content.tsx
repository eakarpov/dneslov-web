import { memo } from "react";
import Link from "next/link";
import { getDayMemories } from "../../../api";
import { resolveDay } from "../../resolve";
import { DateParts, civilToJulian, formatCivilISO, formatHuman } from "../../../../lib/dates/civil";
import { compareDays } from "../../../../lib/compare";
import { IDayMemo } from "../../../../dto/day";
import { memoryHref } from "../../../../lib/routes";
import ComparePicker from "./ComparePicker";

// A whole day, not its first page.
const DAY_LIMIT = 200;

interface ContentProps {
    date: DateParts;
    a?: string;
    b?: string;
}

const Column = ({ title, rows }: { title: string; rows: IDayMemo[] }) => (
    <div className="compare-column">
        <h2>
            {title} <span className="compare-count">{rows.length}</span>
        </h2>
        {rows.length === 0 ? (
            <p className="compare-empty">пусто</p>
        ) : (
            <ul>
                {rows.map((row, index) => (
                    <li key={`${row.slug}-${row.id ?? index}`}>
                        {row.slug ? (
                            <Link href={memoryHref(row.slug)}>{row.title}</Link>
                        ) : (
                            row.title
                        )}
                    </li>
                ))}
            </ul>
        )}
    </div>
);

const Content = async ({ date, a, b }: ContentProps) => {
    const { calendaries, defaultCalendaries } = await resolveDay(date, "", null);

    const titles = Object.fromEntries(
        calendaries
            .filter((calendary) => calendary.slug?.text)
            .map((calendary) => [calendary.slug.text, calendary.titles?.[0]?.text ?? calendary.slug.text]),
    );

    const slugs = calendaries.map((calendary) => calendary.slug?.text).filter(Boolean) as string[];
    const left = a && slugs.includes(a) ? a : defaultCalendaries[0];
    const right = b && slugs.includes(b) ? b : defaultCalendaries[1] ?? defaultCalendaries[0];

    const [leftDay, rightDay] = await Promise.all([
        getDayMemories({ date, calendaries: [left], query: "" }, DAY_LIMIT),
        getDayMemories({ date, calendaries: [right], query: "" }, DAY_LIMIT),
    ]);

    if (!leftDay.data || !rightDay.data) {
        return <p>Справочник сейчас не отвечает. Попробуйте обновить страницу.</p>;
    }

    const { onlyA, both, onlyB } = compareDays(leftDay.data.list, rightDay.data.list);

    return (
        <>
            <h1>
                {formatHuman(date)}{" "}
                <span className="compare-old-style">({formatHuman(civilToJulian(date))} ст. ст.)</span>
            </h1>
            <p>
                <Link href={`/day/${formatCivilISO(date)}`}>← к дню</Link>
            </p>

            <ComparePicker
                date={formatCivilISO(date)}
                options={slugs.map((slug) => ({ slug, title: titles[slug] ?? slug }))}
                a={left}
                b={right}
            />

            <div className="compare-columns">
                <Column title={`Только в «${titles[left] ?? left}»`} rows={onlyA} />
                <Column title="В обоих" rows={both} />
                <Column title={`Только в «${titles[right] ?? right}»`} rows={onlyB} />
            </div>
        </>
    );
};

export default memo(Content);
