import {memo} from "react";
import HomePage from "./HomePage";

const HomePageContainer = async ({ itemsPromise, dateTime, calendaries}: any) => {
    const items = await itemsPromise;

    if (!items) return null;

    return (
        <HomePage
            items={items}
            dateTime={dateTime}
            calendaries={calendaries}
        />
    )
};

export default memo(HomePageContainer);
