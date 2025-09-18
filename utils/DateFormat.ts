export const formValidationDateHour12 = (hour: string | number): string => {
  const date = new Date(parseInt(hour as string));
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedHours = hours > 12 ? hours - 12 : hours;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedTime = 
      `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  
  return formattedTime;
};

export const formatDate = (timestamp: string | number): string => {
  const parse = parseInt(timestamp as string);
  const date = new Date(parse); 

  const day = String(date.getDate()).padStart(2, '0'); 
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};