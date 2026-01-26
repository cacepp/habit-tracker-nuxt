import type { WeatherResponse } from '~/types';

type FormattedWeather = WeatherResponse & {
  formatted: {
    temp: string;
    feelsLike: string;
    description: string;
    iconCode: string;
  };
};

export const useWeather = (city: MaybeRef<string>) => {
  const queryParams = computed(() => ({
    city: unref(city),
  }));

  const fetchKey = computed(() => `weather-${unref(city)}`);

  const { data, pending, error } = useFetch<FormattedWeather>('/api/weather', {
    key: fetchKey,
    query: queryParams,
    server: false,
    immediate: true,
    lazy: false,

    async onRequest() {
      await new Promise(resolve => setTimeout(resolve, 3000));
    },

    transform: (data: WeatherResponse): FormattedWeather => {
      const temp = data?.main?.temp ?? 0;
      const feelsLike = data?.main?.feels_like ?? 0;
      const description = data?.weather?.[0]?.description ?? 'Нет данных';
      const icon = data?.weather?.[0]?.icon ?? '01d';

      return {
        ...data,
        formatted: {
          temp: `${Math.round(temp)}°C`,
          feelsLike: `${Math.round(feelsLike)}°C`,
          description,
          iconCode: icon,
        },
      };
    },
  });

  return {
    data,
    pending,
    error,
  };
};
