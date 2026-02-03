import 'reflect-metadata';
import { registerDependencies } from '@/core/di/container';

export default defineNuxtPlugin(() => {
  registerDependencies();
});
