export const POINTS_EXACT = 5;
export const POINTS_RESULT = 2;

export function pointsFor(
    predHome: number,
    predAway: number,
    realHome: number,
    realAway: number
): number {
    if (predHome === realHome && predAway === realAway) return POINTS_EXACT;
    if (Math.sign(predHome - predAway) === Math.sign(realHome - realAway)) return POINTS_RESULT;
    return 0;
}