import { chainsMapping } from '../constants';

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

export const parseInterestedAppNamePrompt = (lastUserMessage: string) => `
You're an data analyst. Your task is to extract the name of an app that a user is interested in a text and return a JSON format structure data. Take into account the following rules:
- IMPORTANT: extract a name of an app that a user is interested in
- IMPORTANT: if a user didn't mention any app name, then return null

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example responses:
\`\`\`json
{
    "appName": "Uniswap",
}
\`\`\`

Here is a recent message from a user that you need to analyze and extract a name of an app that a user is interested in:

${lastUserMessage}
`;
