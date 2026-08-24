"use client";
import { memo, useCallback, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { readPreferences, writePreferences } from "../../../lib/preferences";
import "./styles.scss";

// A first-visit walkthrough of the things that aren't self-evident here: the
// two calendar styles, the calendary selection and the search syntax. The
// monolith ships intro.js plus its own 14-step script; this is the same idea in
// a fraction of the weight, and it highlights by measuring the real element so
// there is no separate copy of the layout to keep in sync.

export const TOUR_EVENT = "dneslov:tour";

interface Step {
    selector: string;
    text: string;
}

const STEPS: Step[] = [
    {
        selector: ".calendar-header",
        text: "Стиль календаря: юлианский (старый) или новоюлианский. Это только способ показа — день остаётся тем же, и ссылка на него не меняется.",
    },
    {
        selector: ".calendar-week",
        text: "В юлианском стиле в клетке две даты: сверху старого стиля, снизу гражданская. Кружком отмечен нынешний день — он начинается вечером предыдущего.",
    },
    {
        selector: ".source-list",
        text: "Календари, из которых собираются памяти. Нажмите, чтобы добавить или убрать — выборка попадёт в адрес страницы, и ссылкой можно поделиться.",
    },
    {
        selector: ".search-container",
        text: "Поиск по именам и описаниям. Слова через пробел ищутся все сразу, через «/» — любое из них.",
    },
    {
        selector: ".selection-container",
        text: "Условия выборки. Любое можно снять крестиком.",
    },
];

interface Rect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const measure = (selector: string): Rect | null => {
    const el = document.querySelector(selector);
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return null;

    return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
};

const Tour = () => {
    const [step, setStep] = useState<number | null>(null);
    const [rect, setRect] = useState<Rect | null>(null);

    useEffect(() => {
        if (!readPreferences().tourSeen) setStep(0);

        // Lets the navbar re-open the walkthrough without either component
        // knowing about the other.
        const onRequest = () => setStep(0);
        document.addEventListener(TOUR_EVENT, onRequest);

        return () => document.removeEventListener(TOUR_EVENT, onRequest);
    }, []);

    useEffect(() => {
        if (step === null) return;

        const update = () => setRect(measure(STEPS[step].selector));
        update();

        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);

        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [step]);

    const finish = useCallback(() => {
        setStep(null);
        writePreferences({ tourSeen: true });
    }, []);

    useEffect(() => {
        if (step === null) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") finish();
        };

        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [step, finish]);

    if (step === null) return null;

    const isLast = step === STEPS.length - 1;
    // A step whose element is missing on this page is skipped rather than
    // pointing at nothing.
    const highlight = rect;

    return (
        <div className="tour" role="dialog" aria-modal="true" aria-label="Знакомство с сайтом">
            <div className="tour-backdrop" onClick={finish} />
            {highlight && (
                <div
                    className="tour-highlight"
                    style={{
                        top: highlight.top - 4,
                        left: highlight.left - 4,
                        width: highlight.width + 8,
                        height: highlight.height + 8,
                    }}
                />
            )}
            <div className="tour-card">
                <button type="button" className="tour-close" aria-label="Закрыть" onClick={finish}>
                    <XMarkIcon />
                </button>
                <p>{STEPS[step].text}</p>
                <div className="tour-actions">
                    <span className="tour-progress">
                        {step + 1} из {STEPS.length}
                    </span>
                    {step > 0 && (
                        <button type="button" onClick={() => setStep(step - 1)}>
                            Назад
                        </button>
                    )}
                    <button
                        type="button"
                        className="tour-next"
                        onClick={() => (isLast ? finish() : setStep(step + 1))}
                    >
                        {isLast ? "Понятно" : "Дальше"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default memo(Tour);
