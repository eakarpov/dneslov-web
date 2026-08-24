import { resolveApiAssetUrl } from "./host";
import { IDayMemoList } from "../../dto/day";

// The legacy index returns roundel_url absolute for some rows and host-relative
// for others; unresolved ones would be fetched from our own origin and 404.
export const normalizeDayList = (data: IDayMemoList): IDayMemoList => ({
    ...data,
    list: (data.list ?? []).map((item) => ({
        ...item,
        roundel_url: resolveApiAssetUrl(item.roundel_url),
    })),
});
