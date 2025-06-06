import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, Avatar, ListItem, ListItemAvatar, ListItemText } from '@mui/material';

function UserTagSearch({ value, onChange, label = "사용자 태그네임" }) {
  const [searchText, setSearchText] = useState('');
  const [options, setOptions] = useState([]);
  console.log("options",options);
  
  useEffect(() => {
    // 사용자 태그네임 검색
    const fetchUsers = async () => {
      if (!searchText) return;
      try {
        const res = await fetch(`http://localhost:3005/user/search-tag?tagName=${searchText}`);
        const data = await res.json();
        setOptions(data.list || []);
      } catch (err) {
        console.error('🔍 태그네임 검색 오류:', err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300); // ⏱️ 디바운스 300ms

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) => option.tagName}
      value={value}
      onInputChange={(e, newInputValue) => setSearchText(newInputValue)}
      onChange={(e, newValue) => onChange(newValue)}
      renderOption={(props, option) => (
        <ListItem {...props}>
          <ListItemAvatar>
            <Avatar src={`http://localhost:3005${option.img_path}${option.img_name}`}>
              {option.userName[0]}
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={option.tagName} secondary={option.userName} />
        </ListItem>
      )}
      renderInput={(params) => (
        <TextField {...params} label={label} size="small" />
      )}
    />
  );
}

export default UserTagSearch;
