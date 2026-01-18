import { differenceInDays, differenceInMonths, differenceInWeeks, parseISO } from 'date-fns';
import type { AgeResult, Phase } from '../types';

/**
 * Calculate the chronological age (time since birth)
 */
export function calculateChronologicalAge(birthDate: Date, referenceDate: Date = new Date()): AgeResult {
  const totalDays = differenceInDays(referenceDate, birthDate);
  const months = differenceInMonths(referenceDate, birthDate);

  // Calculate remaining weeks and days after months
  const monthsInDays = months * 30.44; // Average days per month
  const remainingDays = totalDays - Math.floor(monthsInDays);
  const weeks = Math.floor(remainingDays / 7);
  const days = remainingDays % 7;

  return {
    months,
    weeks: Math.max(0, weeks),
    days: Math.max(0, days),
    totalDays,
  };
}

/**
 * Calculate the corrected age for premature babies.
 *
 * Corrected age = Chronological age - (40 weeks - gestational age at birth)
 *
 * This is calculated by treating the due date as if it were the birth date,
 * which gives us the age the baby "should be" developmentally.
 *
 * Example: Baby born at 29 weeks (11 weeks early)
 * - Birth date: Jan 17, 2025
 * - Due date: April 7, 2025 (11 weeks later)
 * - On Jan 17, 2026: Chronological age = 12 months
 * - Corrected age = 12 months - 2.5 months = ~9.5 months
 */
export function calculateCorrectedAge(
  _birthDate: Date,
  dueDate: Date,
  referenceDate: Date = new Date()
): AgeResult {
  // If the due date hasn't passed yet, corrected age is 0
  if (referenceDate < dueDate) {
    return {
      months: 0,
      weeks: 0,
      days: 0,
      totalDays: 0,
    };
  }

  // Calculate age as if the baby was born on the due date
  return calculateChronologicalAge(dueDate, referenceDate);
}

/**
 * Calculate the adjustment in weeks between actual birth and due date
 */
export function calculatePrematurityAdjustment(birthDate: Date, dueDate: Date): number {
  return differenceInWeeks(dueDate, birthDate);
}

/**
 * Determine the developmental phase based on corrected age
 * Phase 1: 6-8 months (palmar grasp, thick sticks)
 * Phase 2: 9-11 months (pincer grasp developing, smaller pieces)
 * Phase 3: 12+ months (self-feeding, more textures)
 */
export function getCurrentPhase(correctedAgeMonths: number): Phase {
  if (correctedAgeMonths < 9) {
    return 'phase_1';
  } else if (correctedAgeMonths < 12) {
    return 'phase_2';
  }
  return 'phase_3';
}

/**
 * Get a human-readable phase label
 */
export function getPhaseLabel(phase: Phase): string {
  switch (phase) {
    case 'phase_1':
      return 'Phase 1 (6-8 months)';
    case 'phase_2':
      return 'Phase 2 (9-11 months)';
    case 'phase_3':
      return 'Phase 3 (12+ months)';
  }
}

/**
 * Format age for display
 * Examples:
 * - "8 months, 2 weeks"
 * - "12 months"
 * - "6 months, 1 week, 3 days"
 */
export function formatAge(age: AgeResult, includedays: boolean = false): string {
  const parts: string[] = [];

  if (age.months > 0) {
    parts.push(`${age.months} month${age.months !== 1 ? 's' : ''}`);
  }

  if (age.weeks > 0) {
    parts.push(`${age.weeks} week${age.weeks !== 1 ? 's' : ''}`);
  }

  if (includedays && age.days > 0) {
    parts.push(`${age.days} day${age.days !== 1 ? 's' : ''}`);
  }

  // If everything is 0, show "0 months"
  if (parts.length === 0) {
    return '0 months';
  }

  return parts.join(', ');
}

/**
 * Format the full age display for a baby, showing both chronological and corrected age
 * Example: "Scout: 8 months (6.5 adjusted)"
 */
export function formatBabyAgeDisplay(
  birthDateStr: string,
  dueDateStr?: string,
  referenceDate: Date = new Date()
): { chronological: string; corrected?: string; phase: Phase } {
  const birthDate = parseISO(birthDateStr);
  const chronologicalAge = calculateChronologicalAge(birthDate, referenceDate);
  const chronological = formatAge(chronologicalAge);

  if (!dueDateStr) {
    return {
      chronological,
      phase: getCurrentPhase(chronologicalAge.months),
    };
  }

  const dueDate = parseISO(dueDateStr);
  const correctedAge = calculateCorrectedAge(birthDate, dueDate, referenceDate);
  const corrected = formatAge(correctedAge);

  // Use corrected age for phase determination
  return {
    chronological,
    corrected,
    phase: getCurrentPhase(correctedAge.months),
  };
}

/**
 * Check if a baby is ready to start solids (around 6 months corrected age)
 */
export function isReadyForSolids(
  birthDateStr: string,
  dueDateStr?: string,
  referenceDate: Date = new Date()
): boolean {
  const birthDate = parseISO(birthDateStr);

  const ageToCheck = dueDateStr
    ? calculateCorrectedAge(birthDate, parseISO(dueDateStr), referenceDate)
    : calculateChronologicalAge(birthDate, referenceDate);

  // Generally ready around 6 months (or close to it - 5.5 months is common)
  return ageToCheck.months >= 5 || (ageToCheck.months === 5 && ageToCheck.weeks >= 2);
}

/**
 * Get the corrected age in decimal months (for calculations)
 * Example: 6 months and 2 weeks = 6.5 months
 */
export function getCorrectedAgeDecimal(
  birthDateStr: string,
  dueDateStr?: string,
  referenceDate: Date = new Date()
): number {
  const birthDate = parseISO(birthDateStr);

  const age = dueDateStr
    ? calculateCorrectedAge(birthDate, parseISO(dueDateStr), referenceDate)
    : calculateChronologicalAge(birthDate, referenceDate);

  // Convert to decimal months (4 weeks per month roughly)
  return age.months + (age.weeks / 4) + (age.days / 30);
}
