import {memo} from "react";
import EventPage from "./EventPage";
import {IEvent} from "../../../../dto/event";

interface ContentProps {
    eventPromise: Promise<IEvent | null>;
    memorySlug: string;
}

const Content = async ({ eventPromise, memorySlug }: ContentProps) => {
    const event = await eventPromise;

    return (
        <EventPage event={event ?? undefined} memorySlug={memorySlug} />
    );
};

export default memo(Content);
