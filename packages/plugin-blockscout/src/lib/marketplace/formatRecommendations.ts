import { DappWithRating } from "@/types/dapps";

import { Recommendation } from "@/types/dapps";

interface FormattedRecommendationOutput {
  recommendations: Array<{
    type: "by_rating" | "by_rating_count" | "overall";
    title: string;
    description: string;
    recommendations: Array<{
      rank: number;
      dapp: DappWithRating;
      reason: string;
      category: string[];
      rating?: number;
      ratingCount?: number;
    }>;
  }>;
  summary: {
    totalRecommendations: number;
    topRecommendation?: {
      name: string;
      reason: string;
      category: string[];
    };
  };
}

interface RecommendationItem {
  dapp: {
    id: string;
    title: string;
    description: string;
    url: string;
    twitter: string | null;
    telegram: string | null;
    discord: string | null;
    github: string[];
    categories: string[];
    author: string;
  };
  rank: number;
  reason: string;
}

interface RecommendationData {
  byRating: RecommendationItem[];
  byRatingCount: RecommendationItem[];
  overall: RecommendationItem[];
}

export const formatRecommendationForUI = (
  recommendation: Recommendation,
  dapps: DappWithRating[]
): FormattedRecommendationOutput => {
  // Helper function to format individual recommendation lists
  const formatRecommendationList = (
    recList: { rank: number; id: string; reason: string; category: string[] }[],
    type: "by_rating" | "by_rating_count" | "overall",
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

  // Create all recommendation lists
  const allRecommendationLists = [
    formatRecommendationList(
      recommendation.by_rating,
      "by_rating",
      "Top Rated DApps",
      "Recommendations based on highest user ratings"
    ),
    formatRecommendationList(
      recommendation.by_rating_count,
      "by_rating_count",
      "Most Popular DApps",
      "Recommendations based on number of user reviews"
    ),
    formatRecommendationList(
      recommendation.overall,
      "overall",
      "Overall Best DApps",
      "Comprehensive recommendations considering all factors"
    ),
  ];

  // Filter out empty lists
  const nonEmptyRecommendations = allRecommendationLists.filter(
    (list) => list.recommendations.length > 0
  );

  // Create summary from all available recommendations
  const allRecommendations = nonEmptyRecommendations.flatMap(
    (list) => list.recommendations
  );

  const uniqueDapps = new Map();
  allRecommendations.forEach((rec) => {
    if (!uniqueDapps.has(rec.dapp.id)) {
      uniqueDapps.set(rec.dapp.id, rec);
    }
  });

  // Find top recommendation (prefer overall, then by_rating, then by_rating_count)
  const topRecommendation =
    nonEmptyRecommendations.find((list) => list.type === "overall")
      ?.recommendations[0] ||
    nonEmptyRecommendations.find((list) => list.type === "by_rating")
      ?.recommendations[0] ||
    nonEmptyRecommendations.find((list) => list.type === "by_rating_count")
      ?.recommendations[0];

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

export const formatRecommendationsForDisplay = (
  data: RecommendationData
): string => {
  let markdown = `# 🏆 DApp Recommendations\n\n`;

  // Overall recommendations (most important)
  if (data.overall.length > 0) {
    markdown += `##  Overall Best DApps\n\n`;
    markdown += `*Comprehensive recommendations considering all factors*\n\n`;

    data.overall.forEach((item) => {
      markdown += `### ${getRankBadge(item.rank)} ${item.dapp.title}\n\n`;
      markdown += `**${item.reason}**\n\n`;
      markdown += `**Description:** ${item.dapp.description}\n\n`;
      markdown += `**Categories:** ${item.dapp.categories.map((cat) => `${getCategoryEmoji(cat)} ${cat}`).join(", ")}\n\n`;
      markdown += `**Author:** ${item.dapp.author}\n\n`;
      markdown += `**Links:** [Visit App](${item.dapp.url})`;
      if (item.dapp.twitter) markdown += ` | [Twitter](${item.dapp.twitter})`;
      if (item.dapp.discord) markdown += ` | [Discord](${item.dapp.discord})`;
      markdown += `\n\n---\n\n`;
    });
  }

  // Top rated
  if (data.byRating.length > 0) {
    markdown += `## ⭐ Top Rated DApps\n\n`;
    markdown += `*Based on highest user ratings*\n\n`;

    data.byRating.forEach((item) => {
      markdown += `### ${getRankBadge(item.rank)} ${item.dapp.title}\n\n`;
      markdown += `**${item.reason}**\n\n`;
      markdown += `**Categories:** ${item.dapp.categories.map((cat) => `${getCategoryEmoji(cat)} ${cat}`).join(", ")}\n\n`;
      markdown += `[Visit App](${item.dapp.url})\n\n`;
    });
  }

  // Most popular
  if (data.byRatingCount.length > 0) {
    markdown += `##  Most Popular DApps\n\n`;
    markdown += `*Based on number of user reviews*\n\n`;

    data.byRatingCount.forEach((item) => {
      markdown += `### ${getRankBadge(item.rank)} ${item.dapp.title}\n\n`;
      markdown += `**${item.reason}**\n\n`;
      markdown += `**Categories:** ${item.dapp.categories.map((cat) => `${getCategoryEmoji(cat)} ${cat}`).join(", ")}\n\n`;
      markdown += `[Visit App](${item.dapp.url})\n\n`;
    });
  }

  return markdown;
};

// Helper functions (keep existing ones)
export const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    swap: "🔄",
    swaps: "🔄",
    lending: "💰",
    staking: "🔒",
    "data & analytics": "📊",
    "dev toolings": "🛠️",
    gaming: "🎮",
    nft: "🖼️",
    defi: "🏦",
    social: "👥",
    wallet: "👛",
    bridge: "🌉",
    bridges: "🌉",
    governance: "🗳️",
    "liquid staking": "💧",
  };

  return emojiMap[category.toLowerCase()] || "📱";
};

export const formatRatingDisplay = (
  rating?: number,
  count?: number
): string => {
  if (!rating || !count) return "No ratings";

  const stars = "⭐".repeat(Math.floor(rating));
  const halfStar = rating % 1 >= 0.5 ? "⭐" : "";
  return `${stars}${halfStar} ${rating.toFixed(1)} (${count} reviews)`;
};

// Helper function to get rank badge
export const getRankBadge = (rank: number): string => {
  const badges = ["🥇", "🥈", "🥉"];
  return rank <= 3 ? badges[rank - 1] : `#${rank}`;
};
