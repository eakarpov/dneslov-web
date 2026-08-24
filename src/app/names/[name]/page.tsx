import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import NameSearch from "../NameSearch";
import Content from "./Content";
import { searchMemories } from "../../api";
import { cleanNameQuery } from "../../../lib/names";
import "../styles.scss";

export const revalidate = 3600;

interface PageParams {
    params: { name: string };
}

const readName = (raw: string): string => cleanNameQuery(decodeURIComponent(raw));

export function generateMetadata({ params }: PageParams): Metadata {
    const name = readName(params.name);

    return {
        title: `Именины: ${name} — Днеслов`,
        description: `Памяти, носящие имя ${name}: когда празднуется тезоименитство.`,
        alternates: { canonical: `/names/${encodeURIComponent(name)}` },
    };
}

export default function NamePage({ params }: PageParams) {
    const name = readName(params.name);

    if (!name) {
        notFound();
    }

    return (
        <div className="flex flex-col w-full names-page">
            <h1>Имя: {name}</h1>
            <NameSearch initial={name} />
            <Suspense fallback={<div>Загрузка...</div>}>
                <Content name={name} resultsPromise={searchMemories(name)} />
            </Suspense>
        </div>
    );
}
