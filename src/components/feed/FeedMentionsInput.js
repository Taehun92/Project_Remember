import { MentionsInput, Mention } from 'react-mentions';
import './mentions.css';

export default function FeedMentionsInput({ text, onChange, users, minHeight = 450 }) {
    const userSuggestions = users.map(u => ({
        id: `${u.type}:${u.id}`,
        display: u.tagname,
        username: u.username,
        filepath: u.img_path || '',
        filename: u.img_name || ''
    }));

    return (
        <MentionsInput
            value={text}
            onChange={onChange}
            markup="@{{__display__}}({{__id__}})"
            placeholder="내용을 입력하세요..."
            spellCheck={false}
            classNames={{
                control: 'mentions__control',
                input: 'mentions__input',
                highlighter: 'mentions__highlighter',
                suggestions: 'mentions__suggestions',
                mention: 'mention'
            }}
            style={{
                control: {
                    minHeight: minHeight,
                    border: 'none',
                    fontSize: 14,
                    backgroundColor: '#fff',
                },
                input: {
                    minHeight: minHeight,
                    padding: 8
                },
                highlighter: {
                    minHeight: minHeight,
                    padding: 8
                }
            }}
        >
            <Mention
                trigger="@"
                data={(query, callback) => {
                    query = query || '';
                    const filtered = userSuggestions.filter((u) =>
                        u.display?.toLowerCase().includes(query.toLowerCase())
                    );
                    callback(filtered);
                }}
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
                            src={
                                entry.filepath && entry.filename
                                    ? `http://localhost:3005${entry.filepath}${entry.filename}`
                                    : '/default-profile.png'
                            }
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
        </MentionsInput>
    );
}
