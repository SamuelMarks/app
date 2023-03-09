import { useQuery, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { useEffect } from 'react';
import type { Appearance } from '../lib/theme/window';
import {
  getAppearance,
  setAppearance,
  subscribeToPreferredAppearanceChange,
  toggleAppearance,
} from '../lib/theme/window';

const appearanceQueryKey = ['theme', 'appearance'];

const forceSetTheme = debounce((gray: string) => {
  setAppearance(getAppearance(), gray);
}, 200);

export default function useTheme() {
  const queryClient = useQueryClient();
  const appearance = useQuery({
    queryKey: appearanceQueryKey,
    queryFn: getAppearance,
    initialData: getAppearance(),
  }).data;

  const themeChange = (appearance: Appearance) => {
    setAppearance(appearance);
  };

  const handleToggleAppearance = async () => {
    const newAppearance = toggleAppearance();
    await queryClient.setQueryData(appearanceQueryKey, newAppearance);
  };

  useEffect(() => {
    return subscribeToPreferredAppearanceChange(themeChange);
  }, []);

  return {
    appearance,
    forceSetTheme,
    toggleAppearance: handleToggleAppearance,
  };
}
