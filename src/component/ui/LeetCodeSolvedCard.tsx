import React from 'react';
import type { LeetCodeStats } from '../../data/achievementsData';
import LeetcodeStats from './skillBadges';

interface LeetCodeSolvedCardProps {
  stats?: LeetCodeStats | null;
  isDark?: boolean;
}

export const LeetCodeSolvedCard: React.FC<LeetCodeSolvedCardProps> = ({ stats, isDark = true }) => {
  const easySolved = stats?.easySolved ?? 187;
  const easyTotal = (stats?.easyTotal && stats.easyTotal > 0) ? stats.easyTotal : 958;

  const mediumSolved = stats?.mediumSolved ?? 36;
  const mediumTotal = (stats?.mediumTotal && stats.mediumTotal > 0) ? stats.mediumTotal : 2098;

  const hardSolved = stats?.hardSolved ?? 3;
  const hardTotal = (stats?.hardTotal && stats.hardTotal > 0) ? stats.hardTotal : 962;

  const attempting = stats?.attempting ?? 39;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <LeetcodeStats
        easySolved={easySolved}
        easyTotal={easyTotal}
        mediumSolved={mediumSolved}
        mediumTotal={mediumTotal}
        hardSolved={hardSolved}
        hardTotal={hardTotal}
        attempting={attempting}
        dark={isDark}
      />
    </div>
  );
};
