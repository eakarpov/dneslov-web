import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getDayMemories } from "../../api";
import { resolveDay } from "../resolve";
import { civilToJulian, formatHuman, parseCivilISO } from "../../../lib/dates/civil";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Памяти дня — Днеслов";

export const revalidate = 3600;

const TITLES_SHOWN = 5;

// Satori refuses any element with more than one child unless its display is
// stated outright, so every box here carries it.
const column = { display: "flex", flexDirection: "column" as const };

// A card for the day, so a shared link arrives as something to look at rather
// than a bare address. The monolith has nothing of the sort.
export default async function Image({ params }: { params: { date: string } }) {
    const date = parseCivilISO(params.date);

    // PT Astra Serif is the monolith's own face and, unlike the default the
    // image renderer ships with, it covers Cyrillic.
    const [regular, bold] = await Promise.all([
        readFile(join(process.cwd(), "public/fonts/PTAstraSerif-Regular.ttf")),
        readFile(join(process.cwd(), "public/fonts/PTAstraSerif-Bold.ttf")),
    ]);

    const options = {
        ...size,
        fonts: [
            { name: "PT Astra Serif", data: regular, weight: 400 as const, style: "normal" as const },
            { name: "PT Astra Serif", data: bold, weight: 700 as const, style: "normal" as const },
        ],
    };

    const frame = {
        ...column,
        width: "100%",
        height: "100%",
        padding: "56px 64px",
        background: "#fdf8f3",
        fontFamily: "PT Astra Serif",
    };

    if (!date) {
        return new ImageResponse(
            (
                <div style={{ ...frame, alignItems: "center", justifyContent: "center" }}>
                    <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>Днеслов</div>
                </div>
            ),
            options,
        );
    }

    // A card must not fail because the reference is briefly unreachable; an
    // empty list is a fine card, an error is not.
    const titles: string[] = [];
    let total = 0;

    try {
        const { filters } = await resolveDay(date, "", null);
        const { data } = await getDayMemories(filters);

        total = data?.total ?? 0;
        titles.push(
            ...(data?.list ?? [])
                .map((item) => item.title)
                .filter((title): title is string => Boolean(title))
                .slice(0, TITLES_SHOWN),
        );
    } catch {
        // fall through to the plain date card
    }

    const rest = Math.max(0, total - titles.length);

    return new ImageResponse(
        (
            <div style={frame}>
                <div style={{ ...column, fontSize: 54, fontWeight: 700, color: "#7a1f24" }}>
                    {formatHuman(date)}
                </div>
                <div style={{ ...column, fontSize: 28, color: "#8a7a6a", marginTop: 6 }}>
                    {formatHuman(civilToJulian(date))} ст. ст.
                </div>
                <div style={{ ...column, marginTop: 28 }}>
                    {titles.map((title) => (
                        <div key={title} style={{ display: "flex", fontSize: 32, color: "#2f2a26", marginBottom: 10 }}>
                            {title.length > 58 ? `${title.slice(0, 57)}…` : title}
                        </div>
                    ))}
                    {rest > 0 && (
                        <div style={{ display: "flex", fontSize: 26, color: "#8a7a6a" }}>
                            и ещё {rest}
                        </div>
                    )}
                </div>
                <div style={{ display: "flex", marginTop: "auto", fontSize: 28, color: "#8a7a6a" }}>
                    Днеслов — православный календарь
                </div>
            </div>
        ),
        options,
    );
}
