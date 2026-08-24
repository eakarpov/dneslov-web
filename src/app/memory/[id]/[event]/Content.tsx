import {memo} from "react";
import EventPage from "./EventPage";
import {IEvent} from "../../../../dto/event";
import {LegacyResult} from "../../../../lib/api/load";

interface ContentProps {
    eventPromise: Promise<LegacyResult<IEvent>>;
    memorySlug: string;
}

const Content = async ({ eventPromise, memorySlug }: ContentProps) => {
    const { data, unavailable } = await eventPromise;

    return (
        <EventPage event={data ?? undefined} memorySlug={memorySlug} unavailable={unavailable} />
    );
};

export default memo(Content);
