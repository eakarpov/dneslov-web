'use client';
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchDayMemories, IDayFilters } from "../../lib/api/day";
import { IDayMemo, IDayMemoList } from "../../dto/day";
import { buildListHref, dayCalendarHref, eventHref, memoryHref } from "../../lib/routes";
import { civilToJulian, formatHuman } from "../../lib/dates/civil";
import { normalizeQuery, parseQueryGroups, removeQueryGroup } from "../../lib/search";
import { slugChipHue } from "../../lib/colors";
import { sameSlugs, writePreferences } from "../../lib/preferences";
import Chip from "../components/Chip";
import Markdown from "../../lib/markdown";
import "../home.scss";

// The backend hands out 25 rows at a time.
const PAGE_SIZE = 25;
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
                        hue={slugChipHue(slug)}
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
    // Rendered straight from the server's rows: the list used to be virtualised,
    // which meant the server HTML carried no memories at all — nothing for a
    // crawler to index and nothing to print.
    const [rows, setRows] = useState<IDayMemo[]>(items.list);
    // Where the next page starts. Counted in requested records, not in rendered
    // rows: the backend de-duplicates after slicing, so a window of 25 can come
    // back with 24 — and stepping by the row count would skip a record.
    const [offset, setOffset] = useState(PAGE_SIZE);
    const [loadingMore, setLoadingMore] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        setRows(items.list);
        setOffset(PAGE_SIZE);
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

    const loadMore = useCallback(async () => {
        setLoadingMore(true);

        // Paging carries the *active* filters. It used to send only `c`, so
        // scrolling mixed in rows the current date/query excluded.
        const batch = await fetchDayMemories(filters, offset, offset + PAGE_SIZE - 1);

        setRows((prev) => [...prev, ...(batch.list ?? [])]);
        setOffset((current) => current + PAGE_SIZE);
        setLoadingMore(false);
    }, [filters, offset]);

    const queryGroups = parseQueryGroups(filters.query);
    const icsHref = dayCalendarHref(filters, defaultCalendaries);

    return (
        <div className="flex flex-col w-full">
            {/* Only ever seen on paper: the day and the site it came from. */}
            <div className="print-header">
                <strong>
                    {filters.date ? formatHuman(filters.date) : "Поиск по справочнику"}
                </strong>
                {filters.date && ` (${formatHuman(civilToJulian(filters.date))} ст. ст.)`}
                {" — Днеслов"}
            </div>

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
                        hue={slugChipHue(slug)}
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

            {rows.length > 0 && (
                <ul className="home-list">
                    {rows.map((item, index) => (
                        <li className="home-row" key={`${item.slug ?? "row"}-${item.id ?? index}`}>
                            <DayRow item={item} />
                        </li>
                    ))}
                </ul>
            )}

            {offset < items.total && (
                <button
                    type="button"
                    className="home-more"
                    onClick={loadMore}
                    disabled={loadingMore}
                >
                    {loadingMore ? "Загрузка..." : `Показать ещё (${items.total - offset})`}
                </button>
            )}

        </div>
    );
};

export default memo(DayList);
