export const getErrorMessage = (err: unknown) => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) return (err as { message: string }).message;
  return 'Неизвестная ошибка';
};
