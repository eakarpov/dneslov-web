'use client';
import { AutoSizer, List, InfiniteLoader } from "react-virtualized";
import { memo, useCallback, useEffect, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchDayMemories, IDayFilters } from "../api";
import { IDayMemo, IDayMemoList } from "../../dto/day";
import { buildListHref, memoryHref } from "../../lib/routes";
import { formatHuman } from "../../lib/dates/civil";
import "../home.scss";

const ROW_HEIGHT = 58;
const LIST_HEIGHT = 600;

interface DayListProps {
    items: IDayMemoList;
    // The backend did not answer at all, as opposed to answering "nothing".
    unavailable?: boolean;
    filters: IDayFilters;
    defaultCalendaries: string[];
    calendaryTitles: Record<string, string>;
}

const indexRows = (list: IDayMemo[], offset = 0): Record<number, IDayMemo> =>
    Object.fromEntries(list.map((item, index) => [offset + index, item]));

const DayList = ({ items, unavailable, filters, defaultCalendaries, calendaryTitles }: DayListProps) => {
    const router = useRouter();

    const [searchValue, setSearchValue] = useState(filters.query);
    const [rows, setRows] = useState<Record<number, IDayMemo>>(() => indexRows(items.list));
    // react-virtualized measures the DOM, so it can only run after mount.
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // A new server render (i.e. a new URL) replaces the list wholesale — the
    // rows we had belong to the previous filters.
    useEffect(() => {
        setRows(indexRows(items.list));
        setSearchValue(filters.query);
    }, [items, filters.query]);

    const navigate = useCallback(
        (next: Partial<IDayFilters>) => {
            router.push(buildListHref({ ...filters, ...next }, defaultCalendaries));
        },
        [router, filters, defaultCalendaries],
    );

    const onSubmitSearch = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                navigate({ query: searchValue.trim() });
            }
        },
        [navigate, searchValue],
    );

    const isRowLoaded = useCallback(({ index }: { index: number }) => Boolean(rows[index]), [rows]);

    const loadMoreRows = useCallback(
        async ({ startIndex, stopIndex }: { startIndex: number; stopIndex: number }) => {
            // Paging now carries the *active* filters. It used to send only `c`,
            // so scrolling mixed in rows the current date/query excluded.
            const batch = await fetchDayMemories(filters, startIndex, stopIndex);
            setRows((prev) => ({ ...prev, ...indexRows(batch.list ?? [], startIndex) }));
        },
        [filters],
    );

    const rowRenderer = useCallback(
        ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
            const item = rows[index];

            if (!item) {
                return (
                    <div className="home-row" key={key} style={style}>
                        <div>Загрузка...</div>
                    </div>
                );
            }

            const title = item.happened_at ? `${item.title} (${item.happened_at})` : item.title;
            const order = item.orders ? Object.values(item.orders)[0] : null;

            return (
                <div className="home-row" key={key} style={style}>
                    <div className="home-row-icon">
                        {item.roundel_url && (
                            <img src={item.roundel_url} alt="" referrerPolicy="no-referrer" />
                        )}
                    </div>
                    <div className="home-row-chip">
                        <div className="chip">{order}</div>
                    </div>
                    <div className="home-row-text">
                        <div className="home-row-title">
                            {item.slug ? (
                                <Link href={memoryHref(item.slug)} title={title}>
                                    {title}
                                </Link>
                            ) : (
                                <span title={title}>{title}</span>
                            )}
                        </div>
                        {item.note && (
                            <div className="home-row-note" title={item.note}>
                                {item.note}
                            </div>
                        )}
                    </div>
                </div>
            );
        },
        [rows],
    );

    return (
        <div className="flex flex-col w-full">
            <div className="search-container">
                <div className="search-icon">
                    <MagnifyingGlassIcon />
                </div>
                <div className="search-input">
                    <div className="relative z-0 w-full mb-5 group">
                        <input
                            name="q"
                            id="day-search"
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            placeholder=" "
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={onSubmitSearch}
                        />
                        <label
                            htmlFor="day-search"
                            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                            Что ищем?
                        </label>
                    </div>
                </div>
            </div>

            <div className="selection-container">
                <div>Выборка:</div>
                {filters.date && (
                    <div className="chip selection-date">
                        {formatHuman(filters.date)}
                        <div onClick={() => navigate({ date: null })} role="button" aria-label="Убрать дату">
                            <XMarkIcon />
                        </div>
                    </div>
                )}
                {filters.calendaries.map((slug) => (
                    <div className="chip selection-date" key={slug}>
                        {calendaryTitles[slug] ?? slug}
                        <div
                            role="button"
                            aria-label="Убрать календарь"
                            onClick={() =>
                                navigate({
                                    calendaries: filters.calendaries.filter((item) => item !== slug),
                                })
                            }
                        >
                            <XMarkIcon />
                        </div>
                    </div>
                ))}
                {filters.query && (
                    <div className="chip selection-date">
                        {filters.query}
                        <div role="button" aria-label="Убрать запрос" onClick={() => navigate({ query: "" })}>
                            <XMarkIcon />
                        </div>
                    </div>
                )}
            </div>

            {unavailable && (
                <div className="home-empty">
                    Справочник сейчас не отвечает. Попробуйте обновить страницу.
                </div>
            )}
            {!unavailable && items.total === 0 && (
                <div className="home-empty">Ничего не найдено</div>
            )}

            {mounted && items.total > 0 && (
                <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={items.total}>
                    {({ onRowsRendered, registerChild }) => (
                        <AutoSizer disableHeight className="home-list">
                            {({ width }) => (
                                <List
                                    ref={registerChild}
                                    height={LIST_HEIGHT}
                                    onRowsRendered={onRowsRendered}
                                    rowCount={items.total}
                                    rowHeight={ROW_HEIGHT}
                                    rowRenderer={rowRenderer}
                                    width={width}
                                />
                            )}
                        </AutoSizer>
                    )}
                </InfiniteLoader>
            )}
        </div>
    );
};

export default memo(DayList);
