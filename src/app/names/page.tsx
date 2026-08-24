import type { Metadata } from "next";
import NameSearch from "./NameSearch";
import "./styles.scss";

export const metadata: Metadata = {
    title: "Именины — Днеслов",
    description: "Поиск памятей по имени: когда празднуется тезоименитство.",
    alternates: { canonical: "/names" },
};

export default function NamesPage() {
    return (
        <div className="flex flex-col w-full names-page">
            <h1>Именины</h1>
            <p>
                Введите имя, и мы покажем памяти, которые его носят. Поиск идёт по началу
                слова, поэтому «пётр» найдёт и «Петра», и «Петру»; ударения и разница
                между «е» и «ё» значения не имеют.
            </p>
            <NameSearch />
        </div>
    );
}
