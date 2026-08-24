"use client";
import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Option {
    slug: string;
    title: string;
}

interface ComparePickerProps {
    date: string;
    options: Option[];
    a: string;
    b: string;
}

const ComparePicker = ({ date, options, a, b }: ComparePickerProps) => {
    const router = useRouter();

    const go = useCallback(
        (side: "a" | "b", value: string) => {
            // Picking the calendary that is already on the other side swaps the
            // two rather than leaving the reader comparing one with itself.
            const next =
                side === "a"
                    ? { a: value, b: value === b ? a : b }
                    : { a: value === a ? b : a, b: value };

            router.push(`/day/${date}/compare?${new URLSearchParams(next)}`);
        },
        [router, date, a, b],
    );

    return (
        <div className="compare-picker">
            <label>
                Слева
                <select value={a} onChange={(e) => go("a", e.target.value)}>
                    {options.map((option) => (
                        <option key={option.slug} value={option.slug}>
                            {option.title}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Справа
                <select value={b} onChange={(e) => go("b", e.target.value)}>
                    {options.map((option) => (
                        <option key={option.slug} value={option.slug}>
                            {option.title}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
};

export default memo(ComparePicker);
