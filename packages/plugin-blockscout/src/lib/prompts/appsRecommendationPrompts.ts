import { DappWithRating } from '../../types/dapps';
import { UserIntent } from '../../types/userData';

export const recommendDappsPrompt = (
  userIntent: UserIntent,
  dapps: Pick<DappWithRating, 'id' | 'description' | 'rating' | 'ratingCount'>[]
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
  ${userIntent.chain ? `Chain: ${userIntent.chain}` : ''}
  
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
