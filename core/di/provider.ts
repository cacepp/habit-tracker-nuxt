import { container } from 'tsyringe';

export const useDI = () => ({
  resolve: <T>(token: string | symbol): T => container.resolve<T>(token),
});
