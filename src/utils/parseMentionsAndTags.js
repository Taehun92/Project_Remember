export function parseMentionsAndTags(text, mentions = []) {
  if (!text) return '';

  let result = text;

  // 멘션 변환
  mentions.forEach(({ id, display, name }) => {
    const tag = display || name;
    const [type, uid] = id.split(':');

    // 이중 중괄호로 둘러싼 멘션 패턴 처리
    const regex = new RegExp(`@\\{\\{${tag}\\}\\}\\(\\{\\{${id}\\}\\}\\)`, 'g');
    const span = `<span class="mention-link" data-type="${type}" data-id="${uid}" data-tag="${tag}">@${tag}</span>`;
    result = result.replace(regex, span);
  });

  // 태그 변환 (#해시태그)
  result = result.replace(/#(\S+)/g, (match, tag) => {
    return `<span class="tag-link" data-tag="${tag}">#${tag}</span>`;
  });

  return result;
}