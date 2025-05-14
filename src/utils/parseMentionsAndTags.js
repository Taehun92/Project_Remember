export function parseMentionsAndTags(text, mentions = []) {
  if (!text) return '';

  let result = text;

  // 멘션 변환
  mentions.forEach(({ id, display, name }) => {
    const tag = display || name; // 👈 핵심!
    const [type, uid] = id.split(':');
    const regex = new RegExp(`@${tag}\\(\\{\\{${id}\\}\\}\\)`, 'g');
    const span = `<span class="mention-link" data-type="${type}" data-id="${uid}">@${tag}</span>`;
    result = result.replace(regex, span);
  });

  // 태그 변환 (#해시태그)
  result = result.replace(/#(\S+)/g, (match, tag) => {
    return `<span class="tag-link" data-tag="${tag}">#${tag}</span>`;
  });

  return result;
}