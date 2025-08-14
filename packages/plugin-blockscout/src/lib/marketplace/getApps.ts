import { Dapp } from '../../types/dapps';
import { filterDapps, getMarketplaceApiUrl } from './utils';

export const fetchDapps = async (chainId: number): Promise<Dapp[]> => {
  const MARKETPLACE_API_URL = getMarketplaceApiUrl(chainId);

  try {
    const response = await fetch(MARKETPLACE_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch dapps');
    }
    const data = await response.json();
    return filterDapps(data);
  } catch (error) {
    console.error(error);
    return [];
  }
};
