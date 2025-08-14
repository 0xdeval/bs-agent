import { DappWithRating } from '@/types/dapps';
import { FormattedAppInfoOutput } from '../../types/formattedOutput';

/**
 * Formats app information into a structured response with all data
 * @param appInfo - The app information object containing all app details
 * @returns Formatted app info output with structured data
 */
export const formatAppInfo = (appInfo: DappWithRating): FormattedAppInfoOutput => {
  const socialLinks = {
    ...(appInfo.twitter && { twitter: appInfo.twitter }),
    ...(appInfo.telegram && { telegram: appInfo.telegram }),
    ...(appInfo.discord && { discord: appInfo.discord }),
    ...(appInfo.github && appInfo.github.length > 0 && { github: appInfo.github }),
  };

  const hasSocialLinks = Object.keys(socialLinks).length > 0;
  const hasGithub = appInfo.github && appInfo.github.length > 0;

  return {
    title: appInfo.title,
    description: appInfo.description,
    rating: {
      score: appInfo.rating || 0,
      count: appInfo.ratingCount || 0,
      formatted: `${appInfo.rating || 0} (${appInfo.ratingCount || 0} ratings)`,
    },
    website: {
      url: appInfo.url,
      displayText: appInfo.url,
    },
    categories: appInfo.categories,
    socialLinks,
    metadata: {
      author: appInfo.author,
      hasSocialLinks,
      hasGithub,
    },
  };
};

/**
 * Formats app information into a markdown text response
 * @param appInfo - The app information object containing all app details
 * @returns Markdown formatted text string
 */
export const formatAppInfoAsMarkdown = (appInfo: DappWithRating): string => {
  const formatted = formatAppInfo(appInfo);

  let markdown = `# ${formatted.title} info\n`;
  markdown += `**About app:** ${formatted.description}\n`;
  markdown += `**Users ratings:** ${formatted.rating.formatted}\n`;
  markdown += `**Website:** [${formatted.website.displayText}](${formatted.website.url})\n`;
  markdown += `**Categories:** ${formatted.categories.join(', ')}\n`;

  if (formatted.metadata.hasSocialLinks) {
    markdown += `**Social Links:**\n`;
    if (formatted.socialLinks.twitter) {
      markdown += `**Twitter:** ${formatted.socialLinks.twitter}\n`;
    }
    if (formatted.socialLinks.telegram) {
      markdown += `**Telegram:** ${formatted.socialLinks.telegram}\n`;
    }
    if (formatted.socialLinks.discord) {
      markdown += `**Discord:** ${formatted.socialLinks.discord}\n`;
    }
    if (formatted.socialLinks.github && formatted.socialLinks.github.length > 0) {
      markdown += `**GitHub:** ${formatted.socialLinks.github.join(', ')}\n`;
    }
  }

  return markdown;
};

/**
 * Formats app information into a plain text response
 * @param appInfo - The app information object containing all app details
 * @returns Plain text formatted string
 */
export const formatAppInfoAsText = (appInfo: DappWithRating): string => {
  const formatted = formatAppInfo(appInfo);

  let text = `${formatted.title} Information\n\n`;
  text += `About app: ${formatted.description}\n\n`;
  text += `Users ratings: ${formatted.rating.formatted}\n`;
  text += `Website: ${formatted.website.url}\n`;
  text += `Categories: ${formatted.categories.join(', ')}\n`;

  if (formatted.metadata.hasSocialLinks) {
    text += `\nSocial Links:\n`;
    if (formatted.socialLinks.twitter) {
      text += `Twitter: ${formatted.socialLinks.twitter}\n`;
    }
    if (formatted.socialLinks.telegram) {
      text += `Telegram: ${formatted.socialLinks.telegram}\n`;
    }
    if (formatted.socialLinks.discord) {
      text += `Discord: ${formatted.socialLinks.discord}\n`;
    }
    if (formatted.socialLinks.github && formatted.socialLinks.github.length > 0) {
      text += `GitHub: ${formatted.socialLinks.github.join(', ')}\n`;
    }
  }

  return text;
};
