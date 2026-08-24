import {IMemory, IMemoryLink} from "../../../dto/memory";
import {IMemo} from "../../../dto/memo";

const EXTERNAL_LINK_TYPES = ["WikiLink", "BeingLink", "PatericLink"];

export const getExternalLinks = (memory: IMemory): IMemoryLink[] =>
    memory.links.filter((link) => EXTERNAL_LINK_TYPES.includes(link.type));

const firstOrderFrom = (memoes: IMemo[] = []): string | undefined =>
    memoes.reduce<string | undefined>((order, memo) => {
        if (order) return order;
        return (memo.orders && Object.values(memo.orders).find(Boolean)) || undefined;
    }, undefined);

// Mirrors app/components/Memory.jsx#getOrder: first order found either on this
// memory's own calendar entries or, failing that, on any of its events.
export const getOrder = (memory: IMemory): string | undefined =>
    firstOrderFrom(memory.memoes) ||
    memory.events.reduce<string | undefined>((order, event) => order || firstOrderFrom(event.memoes), undefined);

const HAPPENED_AT_KINDS = ["Miracle", "Appearance", "Writing", "Veneration", "Repose", "Resurrection"];

export const getHappenedAt = (memory: IMemory): string | undefined =>
    memory.events.find((event) => event.kind_code && HAPPENED_AT_KINDS.includes(event.kind_code) && event.happened_at)
        ?.happened_at;

const DESCRIPTION_KINDS = [
    "Appearance", "Writing", "Repose", "Veneration", "Miracle",
    "Resurrection", "Monasticry", "Council", "Marriage", "Family",
];

// One described memo per calendar (a saint can have a different biography text per calendar source).
export const getDescribedMemoes = (memory: IMemory): IMemo[] => {
    const byCalendary = new Map<string, IMemo>();

    memory.memoes
        .filter((memo) => memo.kind_code && DESCRIPTION_KINDS.includes(memo.kind_code) && memo.description)
        .forEach((memo) => {
            if (!byCalendary.has(memo.calendary_slug)) {
                byCalendary.set(memo.calendary_slug, memo);
            }
        });

    return Array.from(byCalendary.values());
};
