'use client';
import {List, InfiniteLoader} from "react-virtualized";
import {memo, useRef, useState, useEffect, useCallback} from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/solid";
import {getItemsBatch, getItemsLocal} from "./api";
import "./home.scss";
import Link from "next/link";
import {useAppDispatch, useAppSelector} from "../lib/hooks";
import dayjs from "dayjs";
import {slice} from "../lib/store/global";

enum STATUS {
    STATUS_LOADING= "STATUS_LOADING",
    STATUS_LOADED= "STATUS_LOADED",
}

const timeoutIdMap = {};

const HomePage = ({ items, dateTime, calendaries }: any) => {
    const timeoutId = useRef<NodeJS.Timeout|null>(null);

    const dispatch = useAppDispatch();

    const dateValue = useAppSelector(state => state.global.dateValue);
    const pickedCalendaries = useAppSelector(state => state.global.calendaries);
    const search = useAppSelector(state => state.global.search);

    const [frontInit, setFrontInit] = useState(false);

    const [total, setTotal] = useState(items.total);
    const [loadedRowsMap, setLoadedRowsMap] = useState<{ [key: string]: STATUS }>(items.list.reduce((p: any,c: any,i: number) => ({...p, [i]: STATUS.STATUS_LOADED }), {}));
    const [dataRowsMap, setDataRowsMap] = useState<{ [key: string]: any }>(items.list.reduce((p: any,c: any,i: number) => ({...p, [i]: c }), {}));
    const [loadingRowCount, setLoadingRowCount] = useState(0);
    const [loadedRowCount, setLoadedRowCount] = useState(0);
    const [searchValue, setSearchValue] = useState<string>(search);

    const onClearDate = useCallback(() => {
        dispatch(slice.actions.UpdateDateValue(undefined));
    }, []);

    const onClearCategory = useCallback((el) => () => {
        dispatch(slice.actions.UpdateCalendaries(pickedCalendaries.filter(item => item.id !== el.id)));
    }, [pickedCalendaries]);

    const onSearchChange = useCallback((e) => {
        setSearchValue(e.target.value);
    }, []);

    const onKeyDownHandler = useCallback((e) => {
        if (e.keyCode === 13) {
            dispatch(slice.actions.UpdateSearch(searchValue));
        }
    }, [searchValue]);

    const rowRenderer = ({index, key, style}: any) => {
        // const item = dataRowsMap[index];

        // console.log(item, loadedRowsMap[index]);
        // if (!item) return null;

        let content = <div />;
        if (loadedRowsMap[index] === STATUS.STATUS_LOADING) {
            content = (
                <div>
                    Загрузка...
                </div>
            );
        }
        if (loadedRowsMap[index] === STATUS.STATUS_LOADED) {
            content = (
                <>
                    <div className="chip">
                        {dataRowsMap[index]?.orders && Object.values(dataRowsMap[index].orders)[0]}
                    </div>
                    <span>
                        <Link href={`memory/${dataRowsMap[index]?.slug}`}>
                            {dataRowsMap[index]?.title}
                        </Link>
                    </span>
                </>
            );
        }
        return (
            <div className="flex" key={key} style={style}>
                {content}
            </div>
        )
    };

    useEffect(() => {
        setFrontInit(true);
    }, []);

    useEffect(() => {
        if (frontInit) {
            setLoadedRowsMap({});
            setDataRowsMap({});
            setLoadingRowCount(0);
            setLoadedRowCount(0);
            getItemsLocal(
                dateValue.value ? dayjs(dateValue.value).format('DD.MM.YYYY') : "", dateValue.calendarType,
                pickedCalendaries.map(el => el.slug?.text),
                search,
            ).then((res) => {
                console.log(res);
                setLoadedRowsMap(res.list.reduce((p: any,c: any,i: number) => ({...p, [i]: STATUS.STATUS_LOADED }), {}));
                setDataRowsMap(res.list.reduce((p: any,c: any,i: number) => ({...p, [i]: c }), {}));
                setTotal(res.total);
            });
        }
    }, [dateValue, pickedCalendaries, frontInit, search]);

    const isRowLoaded = ({index}: { index: number }) => {
        return !!loadedRowsMap[index];
    }

    const loadMoreRows = async ({startIndex, stopIndex}: { startIndex: number; stopIndex: number; }) => {
        console.log(startIndex, stopIndex);
        const increment = stopIndex - startIndex + 1;

        const newStateLoadedBefore: { [key: string]: STATUS } = {};
        for (let i = startIndex; i <= stopIndex; i++) {
            newStateLoadedBefore[i] = STATUS.STATUS_LOADING;
        }
        setLoadedRowsMap(state => ({
            ...state,
            ...newStateLoadedBefore,
        }));

        setLoadedRowCount(loadingRowCount + increment)

        const timeout = setTimeout(() => {
            // if (timeout !== timeoutId.current) return;
            console.log("timeout id worker", timeout, timeoutId.current, startIndex, stopIndex);
            // delete timeoutIdMap[timeoutId];
            // if (Object.values(timeoutIdMap).includes(true)) {
            //     Object.keys(timeoutIdMap).forEach(item => {
            //         clearTimeout(item);
            //         delete timeoutIdMap[item];
            //     });
            // }

            getItemsBatch(dateTime, calendaries, startIndex, stopIndex).then(newItems => {
                console.log(newItems);
                if (!newItems) return;

                const newState: { [key: string]: any } = {};
                newItems.list.slice(stopIndex - startIndex + 1).forEach((item: any, index: number) => {
                    newState[startIndex + index] = item;
                });
                setDataRowsMap(state => ({
                    ...state,
                    ...newState,
                }));

                const newStateLoaded: { [key: string]: STATUS } = {};
                for (let i = startIndex; i <= stopIndex; i++) {
                    newStateLoaded[i] = STATUS.STATUS_LOADED;
                }
                setLoadedRowsMap(state => ({
                    ...state,
                    ...newStateLoaded,
                }));

                setLoadedRowCount(loadingRowCount - increment);
                setLoadingRowCount(loadedRowCount + increment);
            });

            // promiseResolver();
        }, 1000);
        timeoutId.current = timeout;
        //
        // timeoutIdMap[timeoutId] = true;

        // let promiseResolver;
        //
        // return new Promise(resolve => {
        //     promiseResolver = resolve;
        // });
    }
    // console.log(dataRowsMap);

    useEffect(() => () => {
        Object.keys(timeoutIdMap).forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
    }, []);

    if (!items) return (
        <div className="flex flex-col">
            Здесь будет содержимое главной
        </div>
    );

    return (
    <div className="flex flex-col w-full">
        <div className="search-container">
            <div className="search-icon">
                <MagnifyingGlassIcon />
            </div>
            <div className="max-w-md search-input">
                <div className="relative z-0 w-full mb-5 group">
                    <input
                        name="floating_email"
                        id="floating_email"
                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                        value={searchValue}
                        onChange={onSearchChange}
                        onKeyDown={onKeyDownHandler}
                    />
                    <label
                        htmlFor="floating_email"
                        className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                        Что ищем?
                    </label>
                </div>
            </div>
        </div>
        <div className="selection-container">
            <div>
                Выборка:
            </div>
            {dateValue.value && (
                <div className="chip selection-date">
                    {dayjs(dateValue.value).format(`DD.MM.YYYY`)}
                    <div onClick={onClearDate}>
                        <XMarkIcon />
                    </div>
                </div>
            )}
            {pickedCalendaries.map((calendar) => (
                <div className="chip selection-date">
                    {calendar.titles && calendar.titles[0].text}
                    <div onClick={onClearCategory(calendar)}>
                        <XMarkIcon />
                    </div>
                </div>
            ))}
        </div>
        <InfiniteLoader
            isRowLoaded={isRowLoaded}
            loadMoreRows={loadMoreRows}
            rowCount={total}
        >
            {({ onRowsRendered, registerChild }) => (
                // <AutoSizer ref={registerChild}>
                //     {({ width, height }) => (
                        <List
                            ref={registerChild}
                            height={600}
                            onRowsRendered={onRowsRendered}
                            rowCount={total}
                            rowHeight={30}
                            rowRenderer={rowRenderer}
                            width={600}
                        />
                    // )}
                // </AutoSizer>
            )}
        </InfiniteLoader>
    </div>
  );
};

export default memo(HomePage);
