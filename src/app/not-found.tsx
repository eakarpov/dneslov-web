import Link from "next/link";
import Navbar from "./common/Navbar";

export default function NotFound() {
    return (
        <div>
            <Navbar />
            <main className="flex flex-col m-4">
                <h1>Страница не найдена</h1>
                <p>Такого адреса на Днеслове нет.</p>
                <Link href="/">На сегодняшний день</Link>
            </main>
        </div>
    );
}
