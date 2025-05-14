export function renderHighlightedText(text, mentions = [], navigate) {
  const regex = /(@[\w가-힣]+)|(#\w+)/g;
  const parts = [];
  let lastIndex = 0;
  let mentionIndex = 0;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const matched = match[0];

    if (lastIndex < start) {
      parts.push(text.slice(lastIndex, start));
    }

    const isMention = matched.startsWith('@');
    let onClick = null;

    if (isMention && mentions[mentionIndex]) {
      const { id } = mentions[mentionIndex];
      const [type, realId] = id.split(':');
      onClick = () => navigate(type === 'DUSER' ? `/deceased/${realId}` : `/myPage/${realId}`);
      mentionIndex++;
    } else {
      const tag = matched.slice(1);
      onClick = () => navigate(`/feeds?tag=${tag}`);
    }

    parts.push(
      <span
        key={start}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        style={{
          color: isMention ? '#3f51b5' : '#009688',
          fontWeight: 500,
          cursor: 'pointer'
        }}
      >
        {matched}
      </span>
    );

    lastIndex = start + matched.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}
