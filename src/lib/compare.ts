import { IDayMemo } from "../dto/day";

// What one calendary keeps on a day and another does not. The monolith cannot
// answer this at all: there the calendary selection only ever unions the
// results, so a memory present in either shows up once and unlabelled.

export interface Comparison {
    onlyA: IDayMemo[];
    onlyB: IDayMemo[];
    both: IDayMemo[];
}

const keyOf = (memo: IDayMemo): string => memo.slug ?? `#${memo.id}`;

export const compareDays = (a: IDayMemo[], b: IDayMemo[]): Comparison => {
    const inB = new Set(b.map(keyOf));
    const inA = new Set(a.map(keyOf));

    return {
        onlyA: a.filter((memo) => !inB.has(keyOf(memo))),
        both: a.filter((memo) => inB.has(keyOf(memo))),
        // Taken from B so the wording of a shared memory comes from the
        // calendary it is being shown under.
        onlyB: b.filter((memo) => !inA.has(keyOf(memo))),
    };
};
