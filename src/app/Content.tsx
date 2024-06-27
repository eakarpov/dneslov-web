import {memo, Suspense} from "react";
import Calendar from "./components/Calendar/index";
import SourceList from "./components/SourceList/index";
import getDefaultItems from "./api";
import HomePageContainer from "./HomePageContainer";
import {CALENDAR_TYPE} from "../types/index";
import dayjs from "dayjs";

const Content = async ({ itemsPromise }: any) => {
    const items = await itemsPromise;

    console.log("err", items);

    const itemsData = getDefaultItems(
        dayjs(Date.now() - 13 * 24 * 3600 * 1000).format("DD.MM.YYYY"),
        CALENDAR_TYPE.JULIAN,
        items.list.map(el => el.slug?.text).join(','));

    return (
        <>
            <div className="flex flex-col">
                <Calendar />
                <SourceList items={items} />
            </div>
            <div className="flex w-full">
                <Suspense fallback={<div>Загрузка...</div>}>
                    <HomePageContainer
                        itemsPromise={itemsData}
                        // dateTime={`23.04.2024`}
                        calendaries={items.list.map(el => el.slug?.text).join(',')}
                    />
                </Suspense>
            </div>
        </>
    );
};

export default memo(Content);
