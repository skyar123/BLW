import { useMemo } from 'react';
import { useFeedingLogsFirestore } from './useFeedingLogsFirestore';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
  isActiveToday: boolean;
  ironStreak: number;
}

export function useStreaks(babyId?: string) {
  const { logs } = useFeedingLogsFirestore();

  const streakData = useMemo((): StreakData => {
    if (!babyId) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastLogDate: null,
        isActiveToday: false,
        ironStreak: 0,
      };
    }

    const babyLogs = logs.filter((log) => log.babyId === babyId);
    if (babyLogs.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastLogDate: null,
        isActiveToday: false,
        ironStreak: 0,
      };
    }

    // Get unique dates sorted descending
    const uniqueDates = [...new Set(babyLogs.map((log) => log.loggedDate))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const lastLogDate = uniqueDates[0];
    const isActiveToday = lastLogDate === today;

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = isActiveToday ? today : yesterday;

    // If last log was more than yesterday, streak is broken
    if (lastLogDate !== today && lastLogDate !== yesterday) {
      currentStreak = 0;
    } else {
      for (const date of uniqueDates) {
        if (date === checkDate) {
          currentStreak++;
          // Move to previous day
          const prevDate = new Date(checkDate);
          prevDate.setDate(prevDate.getDate() - 1);
          checkDate = prevDate.toISOString().split('T')[0];
        } else if (date < checkDate) {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    const sortedDatesAsc = [...uniqueDates].reverse();

    for (let i = 1; i < sortedDatesAsc.length; i++) {
      const prevDate = new Date(sortedDatesAsc[i - 1]);
      const currDate = new Date(sortedDatesAsc[i]);
      const diffDays = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      lastLogDate,
      isActiveToday,
      ironStreak: 0, // TODO: Calculate iron streak separately
    };
  }, [logs, babyId]);

  return streakData;
}
