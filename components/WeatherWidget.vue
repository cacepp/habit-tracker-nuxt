<script setup lang="ts">
const props = defineProps<{
  city?: string;
}>();

const config = useRuntimeConfig();
const iconBaseUrl = config.public.weatherIcon;

const {
  data: weatherData,
  pending,
  error,
} = useWeather(props.city || 'Петрозаводск');

const windDirection = (deg?: number): string => {
  const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
  const index = Math.round((deg || 0) / 45) % 8;
  return directions[index];
};
</script>

<template>
  <UCard
    v-if="!pending && !error"
    :ui="{
      body: 'bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-600/30 backdrop-blur-sm',
      root: 'rounded-2xl',
    }"
    class="p-0 select-none"
  >
    <div class="text-center">
      <img
        v-if="weatherData?.formatted?.iconCode"
        :src="`${iconBaseUrl}${weatherData.formatted.iconCode}@2x.png`"
        :alt="weatherData.formatted.description"
        class="w-12 h-12 mx-auto color"
        loading="lazy"
      >
      <div>
        <p class="text-2xl font-black text-white drop-shadow-md mb-1">
          {{ weatherData?.formatted?.temp || '--' }}
        </p>
        <UBadge
          size="sm"
          variant="subtle"
          class="text-sm backdrop-blur-sm bg-white/20 border-white/30 text-white/90"
        >
          {{ weatherData?.name }}
        </UBadge>
      </div>
    </div>

    <div class="pb-2">
      <p class="text-sm font-semibold text-white/95 text-center capitalize">
        {{ weatherData?.formatted?.description }}
      </p>
    </div>

    <div class="grid grid-cols-2 px-3 text-xs">
      <div class="text-center py-2">
        <div class="text-lg font-bold text-white">
          {{ weatherData?.formatted?.feelsLike }}
        </div>
        <div class="text-white/70 text-xs tracking-wider">
          ощущ.
        </div>
      </div>
      <div class="text-center py-2">
        <div class="text-lg font-bold text-white">
          {{ weatherData?.main?.humidity }}%
        </div>
        <div class="text-white/70 text-xs tracking-wider">
          влажн.
        </div>
      </div>
      <div class="text-center py-2">
        <div class="text-lg font-bold text-white">
          {{ weatherData?.wind?.speed }} м/с
        </div>
        <div class="text-white/70 text-xs tracking-wider">
          ветер
        </div>
      </div>
      <div class="text-center py-2">
        <div class="text-lg font-bold text-white">
          {{ windDirection(weatherData?.wind?.deg) }}
        </div>
        <div class="text-white/70 text-xs  tracking-wider">
          направл.
        </div>
      </div>
    </div>
  </UCard>

  <UCard
    v-else-if="pending"
    class="w-full"
  >
    <USkeleton class="h-32 bg-gray-200 rounded-xl mb-3 mx-auto" />
    <USkeleton class="h-5 bg-gray-200 rounded-lg w-3/4 mx-auto mb-3" />
    <div class="grid grid-cols-2 gap-2 px-3">
      <USkeleton class="h-9 bg-gray-200 rounded-lg" />
      <USkeleton class="h-9 bg-gray-200 rounded-lg" />
      <USkeleton class="h-9 bg-gray-200 rounded-lg" />
      <USkeleton class="h-9 bg-gray-200 rounded-lg" />
    </div>
  </UCard>

  <UCard
    v-else-if="error"
    class="w-full h-52 text-center p-4 flex flex-col justify-center"
  >
    <div class="text-gray-500 mb-3 text-sm">
      ❌ Не удалось загрузить погоду
    </div>
    <UButton
      color="primary"
      size="xs"
    >
      Повторить
    </UButton>
  </UCard>
</template>

<style scoped></style>
