import type { IndexedDBClient } from '~/types';

declare module '#app' {
  interface NuxtApp {
    $indexedDB: IndexedDBClient;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $indexedDB: IndexedDBClient;
  }
}
