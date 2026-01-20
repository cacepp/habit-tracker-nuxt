export const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const toDateString = (isoString: string) =>
  isoString.split('T')[0];
