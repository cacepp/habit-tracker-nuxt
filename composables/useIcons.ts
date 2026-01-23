import { icons } from '@iconify-json/lucide';

const ICONS = Object.freeze(
  Object.keys(icons.icons).map(
    name => `i-lucide-${name}`,
  ),
);

export const useIcons = () => ({
  icons: ICONS,
});
