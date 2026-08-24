"use client";
import { memo, useCallback, useEffect, useState } from "react";
import "./styles.scss";
import { useRouter } from "next/navigation";
import { ICalendar } from "../../../dto/calendar";
import { IDayFilters, fetchCalendaries } from "../../../lib/api/day";
import { buildListHref } from "../../../lib/routes";
import { slugChipColors } from "../../../lib/colors";

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
            {all.map((calendary) => {
                const slug = calendary.slug?.text;
                const isActive = selected.has(slug);
                const colors = slugChipColors(slug);

                return (
                    <button
                        type="button"
                        key={calendary.id}
                        aria-pressed={isActive}
                        // The colour is derived from the slug, so a calendary
                        // looks the same here and in the selection chips.
                        style={
                            isActive
                                ? { background: colors?.color, color: "#fff", borderColor: colors?.color }
                                : colors
                        }
                        className={`source-item ${isActive ? "source-item-is-active" : ""}`}
                        title={calendary.descriptions?.[0]?.text}
                        onClick={onToggle(calendary)}
                    >
                        {calendary.titles?.[0]?.text ?? slug}
                    </button>
                );
            })}
        </div>
    );
};

export default memo(SourceList);
