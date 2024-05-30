import { catppuccin } from './themes/catppuccin';
import { github } from './themes/github';
import { hotdogStand } from './themes/hotdog-stand';
import { monokaiPro } from './themes/monokai-pro';
import { rosePine } from './themes/rose-pine';
import { yaak, yaakDark, yaakLight } from './themes/yaak';

export const defaultDarkTheme = yaakDark;
export const defaultLightTheme = yaakLight;

export const yaakThemes = [
  ...yaak,
  ...catppuccin,
  ...rosePine,
  ...github,
  ...monokaiPro,
  ...hotdogStand,
];
