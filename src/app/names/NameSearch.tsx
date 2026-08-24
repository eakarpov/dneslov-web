"use client";
import { memo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { cleanNameQuery } from "../../lib/names";

const NameSearch = ({ initial = "" }: { initial?: string }) => {
    const router = useRouter();
    const [value, setValue] = useState(initial);

    const submit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const name = cleanNameQuery(value);
            if (name) router.push(`/names/${encodeURIComponent(name)}`);
        },
        [router, value],
    );

    return (
        <form className="name-search" onSubmit={submit}>
            <label htmlFor="name-input">Имя</label>
            <input
                id="name-input"
                name="name"
                value={value}
                placeholder="Пётр"
                onChange={(e) => setValue(e.target.value)}
            />
            <button type="submit">Найти</button>
        </form>
    );
};

export default memo(NameSearch);
