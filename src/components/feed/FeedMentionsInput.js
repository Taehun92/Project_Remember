import React from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import './mentions.css';

export default function FeedMentionsInput({ text, onChange, users }) {
    const userSuggestions = users.map(u => ({
        id: `${u.TYPE}:${u.ID}`,          // USER:1, DUSER:2
        display: u.TAGNAME,               // Mentions 입력용
        username: u.USERNAME,             // 보조 텍스트
        filepath: u.IMG_PATH || '',
        filename: u.IMG_NAME || ''
    }));

    return (
        <MentionsInput
            value={text}
            onChange={onChange}
            placeholder="내용을 입력하세요..."
            spellCheck={false}
            allowSpaceInQuery
            classNames={{
                control: 'mentions__control',
                input: 'mentions__input',
                highlighter: 'mentions__highlighter',
                suggestions: 'mentions__suggestions',
                mention: 'mention'
            }}
        >
            <Mention
                trigger="@"
                data={userSuggestions}
                markup="@{{__display__}}({{__id__}})"
                displayTransform={(id, display) => `${display}`}
                appendSpaceOnAdd
                renderSuggestion={(entry, search, highlightedDisplay, index, focused) => (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: focused ? '#f0f0f0' : '#fff',
                            padding: '6px 10px',
                            borderBottom: '1px solid #eee',
                            gap: '10px'
                        }}
                    >
                        <img
                            src={`http://localhost:3005${entry.filepath}${entry.filename}` || ``}
                            alt="프로필"
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                        />
                        <div style={{ lineHeight: 1.2 }}>
                            <div style={{ fontWeight: 'bold' }}>{entry.display}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{entry.username}</div>
                        </div>
                    </div>
                )}
            />
            <Mention
                trigger="#"
                data={(query, callback) => {
                    if (!query || query.trim() === '') return;  // ✅ 방어 로직 추가

                    fetch(`http://localhost:3005/tags/search?tagname=${encodeURIComponent(query)}`)
                        .then(res => res.json())
                        .then(data => {
                            const list = Array.isArray(data.list) ? data.list : [];

                            const suggestions = list.map(tag => ({
                                id: tag.TAGNO.toString(),
                                display: tag.TAGNAME
                            }));

                            const exists = list.some(tag => tag.TAGNAME === query);

                            if (!exists && query.trim()) {
                                suggestions.push({
                                    id: `new:${query}`,
                                    display: `#${query}`
                                });
                            }

                            callback(suggestions);
                        })
                        .catch(err => {
                            console.error('태그 검색 오류:', err);
                            callback([]); // ✅ 실패 시에도 callback 필요
                        });
                }}
                markup="#{{__display__}}({{__id__}})"
                displayTransform={(id, display) => {
                    return display.startsWith('#') ? display : `#${display}`;
                }}
                appendSpaceOnAdd
            />
        </MentionsInput>
    );
}
