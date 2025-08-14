import { DappWithRating } from '@/types/dapps';
import { Recommendation } from '@/types/dapps';
import { FormattedRecommendationOutput, RecommendationData } from '@/types/formattedOutput';

/**
 * Formats recommendation data for UI consumption, organizing recommendations by type
 * and providing structured output with metadata for display components.
 *
 * This function takes raw recommendation data and transforms it into a structured format
 * that's optimized for UI rendering, including organized lists by recommendation type
 * (by rating, by rating count, overall) and summary statistics.
 *
 * @param recommendation - Raw recommendation data containing ranked lists by different criteria
 * @param dapps - Array of dapp data with ratings to match against recommendation IDs
 * @returns FormattedRecommendationOutput with organized recommendations and summary metadata
 *
 */
export const formatRecommendationForUI = (
  recommendation: Recommendation,
  dapps: DappWithRating[]
): FormattedRecommendationOutput => {
  const formatRecommendationList = (
    recList: { rank: number; id: string; reason: string; category: string[] }[],
    type: 'by_rating' | 'by_rating_count' | 'overall',
    title: string,
    description: string
  ) => {
    const recommendations = recList
      .map((rec) => {
        const dapp = dapps.find((d) => d.id === rec.id);
        if (!dapp) return null;

        return {
          rank: rec.rank,
          dapp,
          reason: rec.reason,
          category: rec.category,
          rating: dapp.rating,
          ratingCount: dapp.ratingCount,
        };
      })
      .filter((rec): rec is NonNullable<typeof rec> => rec !== null);

    return {
      type,
      title,
      description,
      recommendations,
    };
  };

  const allRecommendationLists = [
    formatRecommendationList(
      recommendation.by_rating,
      'by_rating',
      'Top Rated DApps',
      'Recommendations based on highest user ratings'
    ),
    formatRecommendationList(
      recommendation.by_rating_count,
      'by_rating_count',
      'Most Popular DApps',
      'Recommendations based on number of user reviews'
    ),
    formatRecommendationList(
      recommendation.overall,
      'overall',
      'Overall Best DApps',
      'Comprehensive recommendations considering all factors'
    ),
  ];

  const nonEmptyRecommendations = allRecommendationLists.filter(
    (list) => list.recommendations.length > 0
  );

  const allRecommendations = nonEmptyRecommendations.flatMap((list) => list.recommendations);

  const uniqueDapps = new Map();
  allRecommendations.forEach((rec) => {
    if (!uniqueDapps.has(rec.dapp.id)) {
      uniqueDapps.set(rec.dapp.id, rec);
    }
  });

  const topRecommendation =
    nonEmptyRecommendations.find((list) => list.type === 'overall')?.recommendations[0] ||
    nonEmptyRecommendations.find((list) => list.type === 'by_rating')?.recommendations[0] ||
    nonEmptyRecommendations.find((list) => list.type === 'by_rating_count')?.recommendations[0];

  return {
    recommendations: nonEmptyRecommendations,
    summary: {
      totalRecommendations: uniqueDapps.size,
      topRecommendation: topRecommendation
        ? {
            name: topRecommendation.dapp.title,
            reason: topRecommendation.reason,
            category: topRecommendation.category,
          }
        : undefined,
    },
  };
};

export const formatRecommendationsForDisplay = (data: RecommendationData): string => {
  let markdown = `# 🏆 DApp Recommendations\n\n`;

  if (data.overall.length > 0) {
    markdown += `##  Overall Best DApps\n\n`;
    markdown += `*Comprehensive recommendations considering all factors*\n\n`;

    data.overall.forEach((item) => {
      markdown += `### ${getRankBadge(item.rank)} ${item.dapp.title}\n\n`;
      markdown += `**${item.reason}**\n\n`;
      markdown += `**Description:** ${item.dapp.description}\n\n`;
      markdown += `**Categories:** ${item.dapp.categories.map((cat) => `${getCategoryEmoji(cat)} ${cat}`).join(', ')}\n\n`;
      markdown += `**Author:** ${item.dapp.author}\n\n`;
      markdown += `**Links:** [Visit App](${item.dapp.url})`;
      if (item.dapp.twitter) markdown += ` | [Twitter](${item.dapp.twitter})`;
      if (item.dapp.discord) markdown += ` | [Discord](${item.dapp.discord})`;
      markdown += `\n\n---\n\n`;
    });
  }

  if (data.byRating.length > 0) {
    markdown += `## ⭐ Top Rated DApps\n\n`;
    markdown += `*Based on highest user ratings*\n\n`;

    data.byRating.forEach((item) => {
      markdown += `### ${getRankBadge(item.rank)} ${item.dapp.title}\n\n`;
      markdown += `**${item.reason}**\n\n`;
      markdown += `**Categories:** ${item.dapp.categories.map((cat) => `${getCategoryEmoji(cat)} ${cat}`).join(', ')}\n\n`;
      markdown += `[Visit App](${item.dapp.url})\n\n`;
    });
  }

  if (data.byRatingCount.length > 0) {
    markdown += `##  Most Popular DApps\n\n`;
    markdown += `*Based on number of user reviews*\n\n`;

    data.byRatingCount.forEach((item) => {
      markdown += `### ${getRankBadge(item.rank)} ${item.dapp.title}\n\n`;
      markdown += `**${item.reason}**\n\n`;
      markdown += `**Categories:** ${item.dapp.categories.map((cat) => `${getCategoryEmoji(cat)} ${cat}`).join(', ')}\n\n`;
      markdown += `[Visit App](${item.dapp.url})\n\n`;
    });
  }

  return markdown;
};

/**
 * Maps dapp categories to appropriate emoji representations for enhanced visual display.
 *
 * This utility function provides consistent emoji mapping for different dapp categories,
 * making the UI more engaging and easier to scan. It handles common DeFi and blockchain
 * categories with relevant emojis, falling back to a generic mobile app emoji for unknown categories.
 *
 * @param category - The category string to map to an emoji
 * @returns Emoji string representing the category, or 📱 for unknown categories
 *
 */
export const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    swap: '🔄',
    swaps: '🔄',
    lending: '💰',
    staking: '🔒',
    'data & analytics': '📊',
    'dev toolings': '🛠️',
    gaming: '🎮',
    nft: '🖼️',
    defi: '🏦',
    social: '👥',
    wallet: '👛',
    bridge: '🌉',
    bridges: '🌉',
    governance: '🗳️',
    'liquid staking': '💧',
  };

  return emojiMap[category.toLowerCase()] || '📱';
};

/**
 * Formats rating and review count into a user-friendly display string with visual stars.
 *
 * This function creates a readable rating display that includes:
 * - Visual star representation (⭐) based on the rating value
 * - Half-star support for decimal ratings
 * - Formatted rating score with one decimal place
 * - Review count in parentheses
 * - Fallback message for missing rating data
 *
 * @param rating - The numerical rating score (0-5 scale)
 * @param count - The number of reviews/ratings
 * @returns Formatted rating string with stars and metadata, or 'No ratings' if data is missing
 *
 */
export const formatRatingDisplay = (rating?: number, count?: number): string => {
  if (!rating || !count) return 'No ratings';

  const stars = '⭐'.repeat(Math.floor(rating));
  const halfStar = rating % 1 >= 0.5 ? '⭐' : '';
  return `${stars}${halfStar} ${rating.toFixed(1)} (${count} reviews)`;
};

/**
 * Generates appropriate rank badges for recommendation display, using medals for top 3 positions.
 *
 * This function provides visual rank indicators that enhance the recommendation display:
 * - Gold medal (🥇) for 1st place
 * - Silver medal (🥈) for 2nd place
 * - Bronze medal (🥉) for 3rd place
 * - Number format (#4, #5, etc.) for positions beyond the top 3
 *
 * @param rank - The numerical rank position (1-based indexing)
 * @returns Emoji medal for top 3 positions, or formatted number string for other positions
 *
 */
export const getRankBadge = (rank: number): string => {
  const badges = ['🥇', '🥈', '🥉'];
  return rank <= 3 ? badges[rank - 1] : `#${rank}`;
};
