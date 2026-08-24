"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col">
            <h1>Не удалось загрузить страницу</h1>
            {/* The legacy backend goes silent fairly often — a retry is usually
                all it takes, so offer it before anything else. */}
            <p>Возможно, справочник временно недоступен. Попробуйте ещё раз.</p>
            <div>
                <button type="button" onClick={reset}>
                    Повторить
                </button>
            </div>
            <Link href="/">На сегодняшний день</Link>
        </div>
    );
}
