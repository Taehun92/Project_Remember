import React, { useState } from 'react';
import { Box, Avatar, Button, Typography } from '@mui/material';

export default function ImageUploader({
  currentImages = [],
  multiple = false,
  onFilesSelected,
}) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState(currentImages);

  // 파일 url 가져오기 - 파일 첨부 시 동작 
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    const urls = selected.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    onFilesSelected && onFilesSelected(selected);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} my={2}>
      <Box display="flex" gap={2} flexWrap="wrap">
        {previews.map((url, index) => (
          <Avatar
            key={index}
            src={url}
            sx={{ width: 120, height: 120, border: '2px dashed #ccc', bgcolor: '#f5f5f5' }}
          />
        ))}
      </Box>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="file"
          name="image"
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <Button variant="outlined" component="span" size="small">
          이미지 선택
        </Button>
        <Typography variant="body2" sx={{ ml: 1, maxWidth: 200, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {files.length === 0
            ? '선택 파일 없음'
            : files.map((file) => file.name).join(', ')}
        </Typography>
      </label>
    </Box>
  );
}
