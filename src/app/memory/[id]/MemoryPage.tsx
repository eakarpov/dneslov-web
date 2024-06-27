'use client';
import {memo} from "react";
import Calendar from "../../components/Calendar/index";
import SourceList from "../../components/SourceList/index";

const MemoryPage = ({ item }) => {
    console.log(item);

    return (
        <>
            <div className="flex flex-col">
                <Calendar />
                <SourceList items={{ list: []}} />
            </div>
            <div className="flex w-full flex-col">
                <div className="flex">
                    <div className="chip">
                        {item.order}
                    </div>
                    <span>
                        {item.short_name}
                    </span>
                    <div>
                        {item.base_year}
                    </div>
                </div>
                {item.links?.length > 0 && (
                    <div>
                        <span className="font-bold">
                            Внешние ссылки
                        </span>
                        <div className="flex flex-wrap">
                            {item.links.map(link => (
                                <a href={link.url} target="_blank">
                                    {link.url}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
                {item.events?.length > 0 && (
                    <div>
                        <span className="font-bold">
                            События
                        </span>
                        <div className="flex flex-wrap">
                            {item.events.map(link => (
                                <div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
};

export default memo(MemoryPage);
