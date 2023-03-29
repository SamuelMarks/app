import { useMemo } from 'react';
import type { Workspace } from '../lib/models';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useWorkspaces } from './useWorkspaces';

export function useActiveWorkspace(): Workspace | null {
  const workspaceId = useActiveWorkspaceId();
  const workspaces = useWorkspaces();
  return useMemo(
    () => workspaces.find((w) => w.id === workspaceId) ?? null,
    [workspaces, workspaceId],
  );
}
