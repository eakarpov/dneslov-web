import { NextRequest } from "next/server";
import { getDayMemories } from "../../../api";
import { parseCalendaries, resolveDay } from "../../resolve";
import { parseCivilISO } from "../../../../lib/dates/civil";
import { buildDayCalendar, IcsEntry } from "../../../../lib/ics";
import { memoryHref } from "../../../../lib/routes";

export const revalidate = 3600;

// The whole day in one file, filtered by the same `c`/`q` the page uses.
export async function GET(request: NextRequest, { params }: { params: { date: string } }) {
    const date = parseCivilISO(params.date);

    if (!date) {
        return new Response("Not found", { status: 404 });
    }

    const { filters } = await resolveDay(
        date,
        request.nextUrl.searchParams.get("q") ?? "",
        parseCalendaries(request.nextUrl.searchParams.get("c")),
    );

    const { data } = await getDayMemories(filters);

    const origin = request.nextUrl.origin;
    const entries: IcsEntry[] = (data?.list ?? [])
        .filter((item) => item.title)
        .map((item, index) => ({
            uid: `${item.slug ?? index}-${params.date}@dneslov`,
            summary: [Object.values(item.orders ?? {})[0], item.title].filter(Boolean).join(" "),
            description: item.note ?? undefined,
            url: item.slug ? `${origin}${memoryHref(item.slug)}` : undefined,
        }));

    return new Response(buildDayCalendar(date, entries), {
        headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": `attachment; filename="dneslov-${params.date}.ics"`,
        },
    });
}
