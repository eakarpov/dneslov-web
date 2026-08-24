import { fetchLegacyJson } from "../../../../lib/api/host";
import { loadLegacy, LegacyResult } from "../../../../lib/api/load";
import { IEvent } from "../../../../dto/event";

// EventsController#show wraps the payload as { event: {...} }, unlike memories#show.
export const getEvent = async (slug: string, eventCode: string): Promise<LegacyResult<IEvent>> =>
    loadLegacy<IEvent>(() =>
        fetchLegacyJson(`/${slug}/${eventCode}.json`, { next: { revalidate: 3600 } }).then(
            (data) => data?.event ?? null,
        ),
    );
