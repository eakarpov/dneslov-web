'use client';
import {memo, useCallback, useEffect, useState} from "react";
import "./styles.scss";
import {slice} from "../../../lib/store/global";
import {CALENDAR_TYPE} from "../../../types/index";
import {useAppDispatch, useAppSelector} from "../../../lib/hooks";
import {getCalendariesLocal} from "../../api";

const SourceList = ({ items }) => {
    const dispatch = useAppDispatch();

    const [page, setPage] = useState(1);

    const calendaries = useAppSelector(state => state.global.calendaries);

    const [itemsMore, setItemsMore] = useState([]);

    console.log(items.list);

    const onPickSource = useCallback((el) => () => {
        const has = calendaries.find(item => item.id === el.id);
        dispatch(slice.actions.UpdateCalendaries(has ? calendaries.filter(item => item.id !== el.id) : [...calendaries, el]));
    }, [calendaries]);

    const onScroll = useCallback((e) => {
        if (e.currentTarget.scrollHeight === e.currentTarget.clientHeight + e.currentTarget.scrollTop) {
            setPage(page + 1);
        }
    }, [page]);

    useEffect(() => {
        if (page > 1 && items.list.length + itemsMore.length < items.total) {
            getCalendariesLocal(page, 100).then((res) => {
                setItemsMore([...itemsMore, ...res.list]);
            })
        }
    }, [page, items, itemsMore]);

    useEffect(() => {
        dispatch(slice.actions.UpdateCalendaries(items.list.filter(el => el.licit)));
    }, [items.list]);

    return (
        <div className="source-list" onScroll={onScroll}>
            {items.list.map(el => (
                <div
                    key={el.id}
                    className={`source-item ${calendaries.find(item => item.id === el.id) && `source-item-is-active`}`}
                    onClick={onPickSource(el)}
                >
                    {el.titles && el.titles[0]?.text}
                </div>
            ))}
            {itemsMore.map(el => (
                <div
                    key={el.id}
                    className={`source-item ${calendaries.find(item => item.id === el.id) && `source-item-is-active`}`}
                    onClick={onPickSource(el)}
                >
                    {el.titles && el.titles[0]?.text}
                </div>
            ))}
        </div>
    );
};

export default memo(SourceList);
