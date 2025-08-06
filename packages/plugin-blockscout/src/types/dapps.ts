export interface MarketplaceDapp {
  id: string;
  title: string;
  external: boolean;
  internalWallet: boolean;
  priority: number | null;
  logo: string;
  logoDarkMode: string;
  shortDescription: string;
  categories: string[];
  author: string;
  url: string;
  description: string;
  site: string;
  twitter: string | null;
  telegram: string | null;
  discord: string | null;
  github: string[];
}

export type Dapp = Omit<
  MarketplaceDapp,
  | "external"
  | "internalWallet"
  | "priority"
  | "logoDarkMode"
  | "shortDescription"
  | "logo"
  | "site"
>;

export interface Rating {
  appId: string;
  rating: number;
  count: number;
}

export interface DappWithRating extends Dapp {
  rating?: number;
  ratingCount?: number;
}

export interface Recommendation {
  by_rating: { rank: number; id: string; reason: string; category: string[] }[];
  by_rating_count: {
    rank: number;
    id: string;
    reason: string;
    category: string[];
  }[];
  overall: { rank: number; id: string; reason: string; category: string[] }[];
}
