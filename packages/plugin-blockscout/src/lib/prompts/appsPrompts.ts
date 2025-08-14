import { Dapp } from '../../types/dapps';
import { getUniqueCategories } from '../marketplace/utils';

export const findCorrectAppPrompt = (appName: string, dapps: Dapp[]) => {
  const allAppsInfo = dapps.map((dapp) => ({
    id: dapp.id,
    title: dapp.title,
  }));

  return `
    Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.
  
  Example responses:
  \`\`\`json
  {
      "id": "uniswap",
      "title": "Uniswap"
  }
  \`\`\`
  
  You need to find a correct \`id\` of an app that matches a provided by a user app name. A user provided app name is: ${appName}
  
  Take into account the following rules:
  - IMPORTANT: Do not cut off the JSON markdown block. If you are running out of a context window or facing any other issues, finish properly the JSON markdown block and return what you have
  - You must return only one and the most relevant \`id\` for a provided app name
  - If no id is match a provided by a user app name, then return null
  
  Here is the list of all unique ids of dapps that you need to use:
  
  ${JSON.stringify(allAppsInfo)}
    `;
};

export const mapDappsByCategoriesPrompt = (providedUseCase: string, dapps: Dapp[]) => {
  const categories = getUniqueCategories(dapps);

  return `
    Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.
  
  Example responses:
  \`\`\`json
  {
      "categories": ["swap", "bridge"]
  }
  \`\`\`
  
  You need to match a provided by a user use case with all categories of a dapp that match this use case by its context. The provided use case is: ${providedUseCase}
  
  Take into account the following rules:
  - IMPORTANT: Do not cut off the JSON markdown block. If you are running out of a context window or facing any other issues, finish properly the JSON markdown block and return what you have
  - Include a unique name of dapps categories that match a provided use case by its context
  - If no categories are match a provided by a user use case, then return an empty array
  
  Here is the list of all unique categories of dapps that you need to use:
  
  ${JSON.stringify(categories)}
    `;
};
