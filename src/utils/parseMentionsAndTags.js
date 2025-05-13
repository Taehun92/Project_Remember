export function parseMentionsAndTags(text, mentions = [], navigate) {
  if (!text) return '';

  const mentionMap = new Map();
  mentions.forEach(m => {
    mentionMap.set(`@{{${m.name}}}({{${m.id}}})`, {
      type: m.id.split(':')[0],
      id: m.id.split(':')[1],
      name: m.name
    });
  });

  // 멘션 변환
  const replaced = text.replace(/@{{(.*?)}}\(\\?{{(USER|DUSER):(\d+)}}\)/g, (_, display, type, id) => {
    return `<span class="mention-link" data-type="${type}" data-id="${id}">${display}</span>`;
  });

  // 태그 변환 (#을 링크처럼 표시)
  const final = replaced.replace(/#{{(.*?)}}\(\\?{{.*?}}\)/g, (_, name) => {
    return `<span class="tag-link" data-tag="${name}">#${name}</span>`;
  });

  return final;
}