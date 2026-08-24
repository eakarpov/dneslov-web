import { memo } from "react";
import Link from "next/link";
import { IDayMemoList } from "../../../dto/day";
import { titleMatchesName } from "../../../lib/names";
import { memoryHref } from "../../../lib/routes";

interface ContentProps {
    name: string;
    resultsPromise: Promise<IDayMemoList | null>;
}

const Content = async ({ name, resultsPromise }: ContentProps) => {
    const results = await resultsPromise;

    if (!results) {
        return <p>Справочник сейчас не отвечает. Попробуйте обновить страницу.</p>;
    }

    // The backend matches the word anywhere it indexes — description, calendary
    // title, dates. Only rows whose own title carries the name are a name hit.
    const matches = results.list.filter((item) => titleMatchesName(item.title, name));

    if (matches.length === 0) {
        return (
            <p>
                Памятей с таким именем не нашлось.{" "}
                <Link href={`/search?q=${encodeURIComponent(name)}`}>
                    Поискать это слово по всему справочнику
                </Link>
                .
            </p>
        );
    }

    return (
        <>
            <ul className="name-results">
                {matches.map((item, index) => (
                    <li key={`${item.slug}-${item.id ?? index}`}>
                        {item.slug ? (
                            <Link href={memoryHref(item.slug)}>{item.title}</Link>
                        ) : (
                            item.title
                        )}
                        {item.happened_at && (
                            <span className="name-result-meta">{item.happened_at}</span>
                        )}
                    </li>
                ))}
            </ul>
            <p className="name-note">
                Найдено {matches.length} из {results.list.length} совпадений поиска — остальные
                упоминают слово в описании, а не носят его как имя. Дни памяти указаны на
                странице каждой памяти.{" "}
                <Link href={`/search?q=${encodeURIComponent(name)}`}>Показать всё</Link>.
            </p>
        </>
    );
};

export default memo(Content);
