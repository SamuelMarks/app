import { emit } from '@tauri-apps/api/event';
import { getCurrent } from '@tauri-apps/api/webviewWindow';
import { useEffect } from 'react';
import { fallbackRequestName } from '../lib/fallbackRequestName';
import { useActiveEnvironment } from './useActiveEnvironment';
import { useActiveRequest } from './useActiveRequest';
import { useActiveWorkspace } from './useActiveWorkspace';
import { useOsInfo } from './useOsInfo';

export function useSyncWindowTitle() {
  const activeRequest = useActiveRequest();
  const activeWorkspace = useActiveWorkspace();
  const activeEnvironment = useActiveEnvironment();
  const osInfo = useOsInfo();
  useEffect(() => {
    let newTitle = activeWorkspace ? activeWorkspace.name : 'Yaak';
    if (activeEnvironment) {
      newTitle += ` [${activeEnvironment.name}]`;
    }
    if (activeRequest) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      newTitle += ` – ${fallbackRequestName(activeRequest)}`;
    }

    // TODO: This resets the stoplight position so we can't use it on macOS yet. Perhaps
    //  we can
    if (osInfo?.osType !== 'macos') {
      getCurrent().setTitle(newTitle).catch(console.error);
    } else {
      emit('yaak_title_changed', newTitle).catch(console.error);
    }
  }, [activeEnvironment, activeRequest, activeWorkspace, osInfo?.osType]);
}
