import {fetchLegacyJson} from "../../../../lib/api/host";
import {IEvent} from "../../../../dto/event";

// EventsController#show wraps the payload as { event: {...} }, unlike memories#show.
export const getEvent = async (slug: string, eventCode: string): Promise<IEvent | undefined> => {
    return fetchLegacyJson(`/${slug}/${eventCode}.json`)
        .then(data => data.event)
        .catch(e => console.log(e));
};
