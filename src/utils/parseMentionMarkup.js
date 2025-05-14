export function parseMentionMarkup(markup = '') {
  const mentionRegex = /@({{)?@?(.+?)}?}\(\{\{(.+?)\}\}\)/g;
  const mentions = [];
  let plainText = markup;
  let match;

  while ((match = mentionRegex.exec(markup)) !== null) {
    const fullMatch = match[0];
    const display = match[2];
    const id = match[3];

    mentions.push({ id, display });
    plainText = plainText.replace(fullMatch, `@${display}`);
  }

  return { plainText, mentions };
}
