import { chainsMapping } from "./constants";
import { Dapp, DappWithRating } from "../types/dapps";
import { UserIntent } from "../types/userData";
import { getUniqueCategories } from "./marketplace/utils";

export const parseUserIntentPrompt = (lastUserMessage: string) => `
You're an data analyst. Your task is to extract the user intent from a text and return a JSON format structure data. The data that you need to extract is chain name and use case. Take into account the following rules:
- IMPORTANT: extract a user use case that he'll mention. It could be a swap, borrow, lend, etc.
- IMPORTANT: extract a chain name that he'll mention. It could be a base, ethereum, arbitrum, etc
- Right after a chain name and use case are extracted you need to get a chainId for a chain name based on the following mapping JSON structure:

${JSON.stringify(chainsMapping)}

Here the minimal categories of use cases that you can extract:  
- swap
- bridge
- borrow
- lending
- games
- liquid staking
- yield aggregator
- cdps
- nfts
- DAO
- wallets 
- socials 
- games
- dev tooling
- dev & analytics
- payments

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example responses:
\`\`\`json
{
    "useCase": "borrow",
    "chain": "base",
    "chainId": 8453,
}
\`\`\`

Here is a recent messages from a user that you need to analyze and extract a user intent from:

${lastUserMessage}

`;

export const mapDappsByCategoriesPrompt = (
  providedUseCase: string,
  dapps: Dapp[]
) => {
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

export const recommendDappsPrompt = (
  userIntent: UserIntent,
  dapps: Pick<DappWithRating, "id" | "description" | "rating" | "ratingCount">[]
) => {
  const responseTemplate = `You are a JSON generator. Your ONLY task is to output valid JSON.

DO NOT add any text before or after the JSON.
DO NOT use single quotes.
DO NOT use underscores in property names.
DO NOT add extra spaces or formatting.
DO NOT add comments or explanations.

Generate a JSON object with this EXACT structure:

\`\`\`json
{
  "by_rating": [
    {
      "rank": 1,
      "id": "example-app",
      "reason": "Example reason text",
      "category": ["example-category"]
    }
  ],
  "by_rating_count": [
    {
      "rank": 1,
      "id": "example-app",
      "reason": "Example reason text",
      "category": ["example-category"]
    }
  ],
  "overall": [
    {
      "rank": 1,
      "id": "example-app",
      "reason": "Example reason text",
      "category": ["example-category"]
    }
  ]
}
\`\`\`

Rules:
1. rank must be a number (not string)
2. All strings must use double quotes
3. Property names must be exactly: "rank", "id", "reason", "category"
4. No underscores, no extra characters
5. category must be an array of strings

Context:
Use case: ${userIntent.useCase}
${userIntent.chain ? `Chain: ${userIntent.chain}` : ""}

Available dapps: ${JSON.stringify(dapps)}

Output ONLY the JSON object. Nothing else.`;

  return responseTemplate;
};

export const recommendationFallbackPrompt = (content: string) => `

Based on the following content, provide a recommendation of dapps for a user based on his use case:

${content}

Important rules to take into account: 
- Use only the content that is provided above to give a recommendation 
- Provide different lists of dapps based on different criteria, e.g. rating, rating count, etc.
- Each dapp should have a rank based on your recommendation. 1 is the best, 2 is the second best, etc.
- Provide a summary that will be easy to understand and read to a user
- If the content above is empty, tell a user that you couldn't find any DETAILED recommendations, but you can provide an overall recommendation based on your memory


`;
