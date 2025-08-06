import { logger } from "@elizaos/core";
import {
  Dapp,
  DappWithRating,
  Rating,
  Recommendation,
} from "../../types/dapps";
import { MarketplaceDapp } from "../../types/dapps";

export const filterDapps = (dapps: MarketplaceDapp[]): Dapp[] => {
  return dapps.map((dapp) => ({
    id: dapp.id,
    title: dapp.title,
    description: dapp.description,
    url: dapp.url,
    twitter: dapp.twitter,
    telegram: dapp.telegram,
    discord: dapp.discord,
    github: dapp.github,
    categories: dapp.categories,
    author: dapp.author,
  }));
};

export const getMarketplaceApiUrl = (chainId: number) =>
  `https://admin-rs.services.blockscout.com/api/v1/chains/${chainId}/marketplace/dapps`;

export const getUniqueCategories = (dapps: Dapp[]): string[] => {
  return Array.from(new Set(dapps.flatMap((dapp) => dapp.categories)));
};

export const filterDappsByCategories = (
  dapps: Dapp[],
  categories: string[]
): Dapp[] => {
  logger.info("Categories to filter by: ", categories);

  return dapps.filter((dapp) => {
    return dapp.categories.some((category) =>
      categories.map((c) => c.toLowerCase()).includes(category.toLowerCase())
    );
  });
};

export const retrieveFinalRecommendation = (
  dapps: Dapp[],
  recommendations: Recommendation
): {
  byRating: Array<{ dapp: Dapp; rank: number; reason: string }>;
  byRatingCount: Array<{ dapp: Dapp; rank: number; reason: string }>;
  overall: Array<{ dapp: Dapp; rank: number; reason: string }>;
} => {
  // Helper function to process recommendations
  const processRecommendations = (
    recommendationArray: { rank: number; id: string; reason: string }[]
  ) => {
    const recommendationMap = new Map<
      string,
      { rank: number; reason: string }
    >();
    recommendationArray.forEach((rec) => {
      recommendationMap.set(rec.id.toLowerCase(), {
        rank: rec.rank,
        reason: rec.reason,
      });
    });

    const matchedDapps = dapps
      .filter((dapp) => recommendationMap.has(dapp.id.toLowerCase()))
      .map((dapp) => {
        const recData = recommendationMap.get(dapp.id.toLowerCase())!;
        return {
          dapp,
          rank: recData.rank,
          reason: recData.reason,
        };
      });

    return matchedDapps.sort((a, b) => a.rank - b.rank);
  };

  return {
    byRating: processRecommendations(recommendations.by_rating),
    byRatingCount: processRecommendations(recommendations.by_rating_count),
    overall: processRecommendations(recommendations.overall),
  };
};

export const combineDappWithRatings = (
  dapps: Dapp[],
  ratings: Rating[]
): DappWithRating[] => {
  const ratingMap = new Map<string, { rating: number; count: number }>();
  ratings.forEach((rating) => {
    ratingMap.set(rating.appId, {
      rating: rating.rating,
      count: rating.count,
    });
  });

  return dapps.map((dapp) => {
    const ratingData = ratingMap.get(dapp.id);

    return {
      ...dapp,
      rating: ratingData?.rating,
      ratingCount: ratingData?.count,
    };
  });
};

export const formatRecommendation = (recommendation: Recommendation) => {
  return {
    byRating: recommendation.by_rating,
    byRatingCount: recommendation.by_rating_count,
    overall: recommendation.overall,
  };
};
