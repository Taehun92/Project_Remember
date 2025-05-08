export function formatDateOnly(dateValue) {
    if (!dateValue) return '';
  
    try {
      const dateObj =
        typeof dateValue === 'string'
          ? new Date(dateValue)
          : dateValue;
  
      if (isNaN(dateObj.getTime())) return ''; // 유효하지 않은 날짜 방지
  
      return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    } catch (err) {
      console.error('날짜 포맷 오류:', err);
      return '';
    }
  }

  export function formatYearOnly(dateValue) {
    if (!dateValue) return '';
  
    try {
      const dateObj =
        typeof dateValue === 'string'
          ? new Date(dateValue)
          : dateValue;
  
      if (isNaN(dateObj.getTime())) return '';
  
      return dateObj.getFullYear().toString(); // YYYY
    } catch (err) {
      console.error('년도 포맷 오류:', err);
      return '';
    }
  }