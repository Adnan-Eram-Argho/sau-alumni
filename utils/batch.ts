// Batch year-r list — 2001 theke CHALIT BACHOR + 1 porjonto
// AUTO hisheb hoy. 2027 ashlei 2027 nije-i sob dropdown-e
// boshe jabe — database/admin/code kichhu-i lagbe na.

export const BATCH_MIN = 2001;

// Current student-ra porer bachor graduate kore — tai +1.
// (Bar-r seshe 1-2 ghontar timezone difference hoileo
// kono practical somossa nei)
export const BATCH_MAX = new Date().getFullYear() + 1;

// 2001 theke BATCH_MAX, ascending
export const BATCH_YEARS: number[] = Array.from(
    { length: BATCH_MAX - BATCH_MIN + 1 },
    (_, i) => BATCH_MIN + i
);

export function isValidBatchYear(year: number | null): boolean {
    return (
        year !== null &&
        Number.isInteger(year) &&
        year >= BATCH_MIN &&
        year <= BATCH_MAX
    );
}