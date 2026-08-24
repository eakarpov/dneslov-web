import { resolveApiAssetUrl } from "./host";
import { IDayMemoList } from "../../dto/day";
import { IMemory } from "../../dto/memory";

// The legacy index returns roundel_url absolute for some rows and host-relative
// for others; unresolved ones would be fetched from our own origin and 404.
export const normalizeDayList = (data: IDayMemoList): IDayMemoList => ({
    ...data,
    list: (data.list ?? []).map((item) => ({
        ...item,
        roundel_url: resolveApiAssetUrl(item.roundel_url),
    })),
});

// memories#show returns image_url — and some scripta audio — host-relative.
export const normalizeMemory = (data: IMemory | null): IMemory | null =>
    data && {
        ...data,
        image_url: resolveApiAssetUrl(data.image_url),
        scripta: data.scripta?.map((scriptum) => ({
            ...scriptum,
            audio_url: resolveApiAssetUrl(scriptum.audio_url),
        })),
        events: data.events?.map((event) => ({
            ...event,
            scripta: event.scripta?.map((scriptum) => ({
                ...scriptum,
                audio_url: resolveApiAssetUrl(scriptum.audio_url),
            })),
        })),
    };
