import {IScriptum} from "../dto/scriptum";

// Labels and ordering mirror app/components/Memory.jsx#ScriptumTable in the monolith.
export const SCRIPTUM_LABELS: Record<string, string> = {
    Irmos: "Ирмос",
    Ikos: "Икос",
    Troparion: "Тропарь",
    Kontakion: "Кондак",
    Stichira: "Стихира",
    CryStichira: "Воззвашна",
    Exapostilarion: "Светилен",
    SessionalHymn: "Седальна",
    Kanonion: "Седальна канона",
    Kathismion: "Седальна кафизмы",
    Polileosion: "Седальна полиелея",
    Apostichus: "Стиховна",
    Stichiron: "Литийна",
    Praision: "Хвалитна",
    Sedation: "Степенна",
    Anatolion: "Восточна",
    Resurrexion: "Воскресна",
    Ipakoi: "Ипакой",
    Magnification: "Величание",
    Prayer: "Молитва",
    Orison: "Моление",
    Canticle: "Спевна",
    Chant: "Песнопение",
    Canto: "Песма",
    Bible: "Зачало",
    Prolog: "Пролог",
    Scriptum: "Текст",
    Stichus: "Стих",
};

const SCRIPTUM_ORDER = Object.keys(SCRIPTUM_LABELS);

export const sortScripta = (scripta: IScriptum[]): IScriptum[] =>
    [...scripta].sort((a, b) => SCRIPTUM_ORDER.indexOf(a.type) - SCRIPTUM_ORDER.indexOf(b.type));

export const getScriptumTitle = (scriptum: IScriptum): string => {
    const heading = [SCRIPTUM_LABELS[scriptum.type] || scriptum.type, scriptum.title && `«${scriptum.title}»`]
        .filter(Boolean)
        .join(" ");

    return [
        heading,
        scriptum.prosomeion_title && `подобен «${scriptum.prosomeion_title}»`,
        scriptum.tone && `глас ${scriptum.tone}-й`,
    ].filter(Boolean).join(", ");
};
