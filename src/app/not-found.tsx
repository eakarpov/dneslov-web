import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col">
            <h1>Страница не найдена</h1>
            <p>Такого адреса на Днеслове нет.</p>
            <Link href="/">На сегодняшний день</Link>
        </div>
    );
}
