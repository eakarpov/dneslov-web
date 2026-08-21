import {memo} from "react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
    return (
        <div className="flex items-center justify-between navbar">
            <Link href="/">
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={320}
                    height={64}
                    priority
                />
            </Link>
            <nav className="navbar-links">
                <Link href="/gallery">Галерея</Link>
                <Link href="/rites">Чины</Link>
                <Link href="/about">О проекте</Link>
            </nav>
            <a href="https://dneslov.org" className="navbar-legacy-link">
                Старая версия сайта
            </a>
        </div>
    )
};

export default memo(Navbar);
