import type { Pitch } from './types';

export const SECTORS = [
    { id: 'sector-1', name: 'Settore 1', range: { min: 1, max: 60 } },
    { id: 'sector-2', name: 'Settore 2', range: { min: 61, max: 120 } },
    { id: 'sector-3', name: 'Settore 3', range: { min: 121, max: 180 } },
    { id: 'sector-4', name: 'Settore 4', range: { min: 181, max: 240 } },
    { id: 'sector-5', name: 'Settore 5', range: { min: 241, max: 300 } },
];

/**
 * Helper function to display pitch number with suffix
 * @param pitch Pitch object
 * @returns Display string like "001" or "001a"
 */
export function getPitchDisplayNumber(pitch: Pitch): string {
    return pitch.suffix ? `${pitch.number}${pitch.suffix}` : pitch.number;
}

/**
 * Helper function to check if a pitch is split (has siblings)
 * @param pitch Pitch object
 * @param allPitches Array of all pitches
 * @returns true if pitch has a sibling with same number
 */
export function isPitchSplit(pitch: Pitch, allPitches: Pitch[]): boolean {
    if (!pitch.suffix) return false;

    const siblingPitches = allPitches.filter(
        p => p.number === pitch.number && p.id !== pitch.id
    );

    return siblingPitches.length > 0;
}

/**
 * Get sibling pitch (e.g., if given "001a", returns "001b" if exists)
 * @param pitch Pitch object
 * @param allPitches Array of all pitches
 * @returns Sibling pitch or null
 */
export function getSiblingPitch(pitch: Pitch, allPitches: Pitch[]): Pitch | null {
    if (!pitch.suffix) return null;

    const targetSuffix = pitch.suffix === 'a' ? 'b' : 'a';

    return allPitches.find(
        p => p.number === pitch.number && p.suffix === targetSuffix
    ) || null;
}

/**
 * Check if pitch can be split
 * @param pitch Pitch object
 * @returns true if pitch has no suffix (is single)
 */
export function canSplitPitch(pitch: Pitch): boolean {
    return pitch.suffix === '';
}

/**
 * Check if two pitches can be merged
 * @param pitchA First pitch
 * @param pitchB Second pitch
 * @returns true if both have same number and complementary suffixes
 */
export function canMergePitches(pitchA: Pitch, pitchB: Pitch): boolean {
    return (
        pitchA.number === pitchB.number &&
        ((pitchA.suffix === 'a' && pitchB.suffix === 'b') ||
            (pitchA.suffix === 'b' && pitchB.suffix === 'a'))
    );
}

/**
 * Get sector for a given pitch number
 * @param pitchNumber Pitch number string (e.g. "001")
 * @returns Sector object or undefined
 */
export function getPitchSector(pitchNumber: string) {
    const num = parseInt(pitchNumber, 10);
    if (isNaN(num)) return undefined;
    return SECTORS.find(s => num >= s.range.min && num <= s.range.max);
}
