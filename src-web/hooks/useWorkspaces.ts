import { useQuery } from '@tanstack/react-query';
import type { Workspace } from '@yaakapp/api';
import { invokeCmd } from '../lib/tauri';

// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/ban-types
export function workspacesQueryKey(_?: {}) {
  return ['workspaces'];
}

export function useWorkspaces() {
  return (
    useQuery({
      queryKey: workspacesQueryKey(),
      queryFn: async () => {
        const workspaces = await invokeCmd('cmd_list_workspaces');
        return workspaces as Workspace[];
      },
    }).data ?? []
  );
}
