"use client";
import { memo, useCallback, useEffect, useState } from "react";
import "./styles.scss";
import { useRouter } from "next/navigation";
import { ICalendar } from "../../../dto/calendar";
import { IDayFilters } from "../../api";
import { fetchCalendaries } from "../../api";
import { buildListHref } from "../../../lib/routes";

const PER_PAGE = 100;

interface SourceListProps {
    items: ICalendar[];
    total: number;
    filters: IDayFilters;
    defaultCalendaries: string[];
}

const SourceList = ({ items, total, filters, defaultCalendaries }: SourceListProps) => {
    const router = useRouter();

    const [extra, setExtra] = useState<ICalendar[]>([]);
    const [page, setPage] = useState(1);

    const all = [...items, ...extra];
    const selected = new Set(filters.calendaries);

    // Selection is a filter, so it belongs in the URL — that is what makes a
    // filtered day shareable at all.
    const onToggle = useCallback(
        (calendary: ICalendar) => () => {
            const slug = calendary.slug?.text;
            if (!slug) return;

            const next = selected.has(slug)
                ? filters.calendaries.filter((item) => item !== slug)
                : [...filters.calendaries, slug];

            router.push(buildListHref({ ...filters, calendaries: next }, defaultCalendaries));
        },
        [router, filters, defaultCalendaries, selected],
    );

    const onScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const el = e.currentTarget;
            if (el.scrollHeight === el.clientHeight + el.scrollTop && all.length < total) {
                setPage((current) => current + 1);
            }
        },
        [all.length, total],
    );

    useEffect(() => {
        if (page === 1) return;

        let cancelled = false;
        fetchCalendaries(page, PER_PAGE).then((res) => {
            if (!cancelled) setExtra((current) => [...current, ...res.list]);
        });

        return () => {
            cancelled = true;
        };
    }, [page]);

    return (
        <div className="source-list" onScroll={onScroll}>
            {all.map((calendary) => (
                <div
                    key={calendary.id}
                    className={`source-item ${
                        selected.has(calendary.slug?.text) ? "source-item-is-active" : ""
                    }`}
                    onClick={onToggle(calendary)}
                >
                    {calendary.titles?.[0]?.text ?? calendary.slug?.text}
                </div>
            ))}
        </div>
    );
};

export default memo(SourceList);
