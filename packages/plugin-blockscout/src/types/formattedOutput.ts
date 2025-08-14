import { DappWithRating } from './dapps';

export interface FormattedAppInfoOutput {
  title: string;
  description: string;
  rating: {
    score: number;
    count: number;
    formatted: string;
  };
  website: {
    url: string;
    displayText: string;
  };
  categories: string[];
  socialLinks: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    github?: string[];
  };
  metadata: {
    author: string;
    hasSocialLinks: boolean;
    hasGithub: boolean;
  };
}

export interface FormattedRecommendationOutput {
  recommendations: Array<{
    type: 'by_rating' | 'by_rating_count' | 'overall';
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

export interface RecommendationItem {
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

export interface RecommendationData {
  byRating: RecommendationItem[];
  byRatingCount: RecommendationItem[];
  overall: RecommendationItem[];
}
