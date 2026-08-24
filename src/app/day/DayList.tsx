'use client';
import { AutoSizer, List, InfiniteLoader } from "react-virtualized";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchDayMemories, IDayFilters } from "../../lib/api/day";
import { IDayMemo, IDayMemoList } from "../../dto/day";
import { buildListHref, dayCalendarHref, eventHref, memoryHref } from "../../lib/routes";
import { formatHuman } from "../../lib/dates/civil";
import { normalizeQuery, parseQueryGroups, removeQueryGroup } from "../../lib/search";
import { slugChipColors } from "../../lib/colors";
import { sameSlugs, writePreferences } from "../../lib/preferences";
import Chip from "../components/Chip";
import Markdown from "../../lib/markdown";
import "../home.scss";

const ROW_HEIGHT = 58;
// Starting height for the server render; replaced by a viewport-derived one
// after mount so the list fills a phone screen instead of overflowing it.
const LIST_HEIGHT = 600;
const LIST_MIN_HEIGHT = 320;
const CHROME_HEIGHT = 260;
// Long enough not to fire a request per keystroke, short enough that the list
// follows typing. The monolith waits 1.5s, which reads as the site being stuck.
const SEARCH_DEBOUNCE_MS = 700;
const UNBOUND = "несвязаный";

interface DayListProps {
    items: IDayMemoList;
    // The backend did not answer at all, as opposed to answering "nothing".
    unavailable?: boolean;
    // Shown from the last known good copy while the reference is unreachable.
    stale?: boolean;
    filters: IDayFilters;
    defaultCalendaries: string[];
    calendaryTitles: Record<string, string>;
}

const indexRows = (list: IDayMemo[], offset = 0): Record<number, IDayMemo> =>
    Object.fromEntries(list.map((item, index) => [offset + index, item]));

const DayRow = ({ item }: { item: IDayMemo }) => {
    const [roundelFailed, setRoundelFailed] = useState(false);
    const orders = Object.entries(item.orders ?? {});
    const eventChipText = [
        item.bind_kind_code && item.bind_kind_code !== UNBOUND ? item.bind_kind_code : null,
        item.event_title,
        item.happened_at,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <>
            <div className="home-row-icon">
                {item.roundel_url && !roundelFailed ? (
                    <img
                        src={item.roundel_url}
                        alt=""
                        referrerPolicy="no-referrer"
                        onError={() => setRoundelFailed(true)}
                    />
                ) : (
                    <span className="home-row-icon-blank" aria-hidden="true" />
                )}
            </div>
            <div className="home-row-orders">
                {orders.map(([slug, shortName]) => (
                    <Chip
                        key={slug}
                        text={shortName ?? slug}
                        title={slug}
                        className="order"
                        colors={slugChipColors(slug)}
                    />
                ))}
            </div>
            <div className="home-row-text">
                <div className="home-row-line">
                    <span className="home-row-title" title={item.title}>
                        {item.slug ? (
                            <Link href={memoryHref(item.slug)}>{item.title}</Link>
                        ) : (
                            item.title
                        )}
                    </span>
                    {eventChipText && (
                        <Chip
                            text={eventChipText}
                            className="event"
                            url={item.slug && item.event_id ? eventHref(item.slug, item.event_id) : undefined}
                        />
                    )}
                </div>
                {item.note && (
                    <div className="home-row-note" title={item.note}>
                        <Markdown source={item.note} inline />
                    </div>
                )}
            </div>
        </>
    );
};

const DayList = ({
    items,
    unavailable,
    stale,
    filters,
    defaultCalendaries,
    calendaryTitles,
}: DayListProps) => {
    const router = useRouter();

    const [searchValue, setSearchValue] = useState(filters.query);
    const [rows, setRows] = useState<Record<number, IDayMemo>>(() => indexRows(items.list));
    // react-virtualized measures the DOM, so it can only run after mount.
    const [mounted, setMounted] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [listHeight, setListHeight] = useState(LIST_HEIGHT);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const update = () =>
            setListHeight(Math.max(LIST_MIN_HEIGHT, window.innerHeight - CHROME_HEIGHT));

        update();
        window.addEventListener("resize", update);

        return () => window.removeEventListener("resize", update);
    }, []);

    // Remember a selection the reader actually made, so memory pages can offer
    // their content in the same context. The default is not worth storing.
    useEffect(() => {
        if (sameSlugs(filters.calendaries, defaultCalendaries)) {
            writePreferences({ calendaries: undefined });
            return;
        }

        writePreferences({ calendaries: filters.calendaries });
    }, [filters.calendaries, defaultCalendaries]);

    useEffect(
        () => () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        },
        [],
    );

    // A new server render (i.e. a new URL) replaces the list wholesale — the
    // rows we had belong to the previous filters.
    useEffect(() => {
        setRows(indexRows(items.list));
        setSearchValue(filters.query);
    }, [items, filters.query]);

    const hrefFor = useCallback(
        (next: Partial<IDayFilters>) => buildListHref({ ...filters, ...next }, defaultCalendaries),
        [filters, defaultCalendaries],
    );

    const navigate = useCallback(
        (next: Partial<IDayFilters>) => {
            router.push(hrefFor(next));
        },
        [router, hrefFor],
    );

    const onSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchValue(value);

            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                // replace, not push: typing should not bury the previous view
                // under a history entry per pause.
                router.replace(hrefFor({ query: normalizeQuery(value) }));
            }, SEARCH_DEBOUNCE_MS);
        },
        [router, hrefFor],
    );

    const onSearchKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key !== "Enter") return;

            if (debounceRef.current) clearTimeout(debounceRef.current);
            navigate({ query: normalizeQuery(searchValue) });
        },
        [navigate, searchValue],
    );

    const isRowLoaded = useCallback(({ index }: { index: number }) => Boolean(rows[index]), [rows]);

    const loadMoreRows = useCallback(
        async ({ startIndex, stopIndex }: { startIndex: number; stopIndex: number }) => {
            // Paging carries the *active* filters. It used to send only `c`, so
            // scrolling mixed in rows the current date/query excluded.
            const batch = await fetchDayMemories(filters, startIndex, stopIndex);
            setRows((prev) => ({ ...prev, ...indexRows(batch.list ?? [], startIndex) }));
        },
        [filters],
    );

    const rowRenderer = useCallback(
        ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
            const item = rows[index];

            return (
                <div className="home-row" key={key} style={style}>
                    {item ? <DayRow item={item} /> : <div className="home-row-loading">Загрузка...</div>}
                </div>
            );
        },
        [rows],
    );

    const queryGroups = parseQueryGroups(filters.query);
    const icsHref = dayCalendarHref(filters, defaultCalendaries);

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
                            onChange={onSearchChange}
                            onKeyDown={onSearchKeyDown}
                        />
                        <label
                            htmlFor="day-search"
                            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                            Что ищем?
                        </label>
                        <div className="search-hint">
                            Пробел — все слова, «/» — любое из них
                        </div>
                    </div>
                </div>
            </div>

            <div className="selection-container">
                <div className="selection-label">Выборка:</div>
                {filters.date && (
                    <Chip
                        text={formatHuman(filters.date)}
                        className="selection"
                        onRemove={() => navigate({ date: null })}
                        removeLabel="Убрать дату"
                    />
                )}
                {filters.calendaries.map((slug) => (
                    <Chip
                        key={slug}
                        text={calendaryTitles[slug] ?? slug}
                        className="selection"
                        colors={slugChipColors(slug)}
                        onRemove={() =>
                            navigate({
                                calendaries: filters.calendaries.filter((item) => item !== slug),
                            })
                        }
                        removeLabel="Убрать календарь"
                    />
                ))}
                {queryGroups.map((group, index) => (
                    <Chip
                        key={`${group}-${index}`}
                        text={group}
                        className="selection query"
                        onRemove={() => navigate({ query: removeQueryGroup(filters.query, index) })}
                        removeLabel="Убрать слово"
                    />
                ))}
                {icsHref && (
                    <a className="day-ics" href={icsHref} download>
                        Скачать день (.ics)
                    </a>
                )}
            </div>

            {stale && (
                <div className="home-stale">
                    Справочник не отвечает — показана сохранённая выдача, она могла устареть.
                </div>
            )}
            {unavailable && (
                <div className="home-empty">
                    Справочник сейчас не отвечает. Попробуйте обновить страницу.
                </div>
            )}
            {!unavailable && items.total === 0 && (
                <div className="home-empty">Ничего не найдено</div>
            )}

            {mounted && items.total > 0 && (
                <InfiniteLoader
                    isRowLoaded={isRowLoaded}
                    loadMoreRows={loadMoreRows}
                    rowCount={items.total}
                >
                    {({ onRowsRendered, registerChild }) => (
                        <AutoSizer disableHeight className="home-list">
                            {({ width }) => (
                                <List
                                    ref={registerChild}
                                    height={listHeight}
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
