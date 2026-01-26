import type { WeatherResponse } from '~/types';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  return $fetch<WeatherResponse>(`${config.public.weatherApiBase}`, {
    query: {
      q: getQuery(event).city,
      appid: config.apiKey,
      lang: 'ru',
      units: 'metric',
    },
  });
});
