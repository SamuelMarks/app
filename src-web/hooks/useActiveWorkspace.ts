import { useMemo } from 'react';
import type { Workspace } from '@yaakapp/api';
import { useParams } from 'react-router-dom';
import type { RouteParamsWorkspace } from './useAppRoutes';
import { useWorkspaces } from './useWorkspaces';

export function useActiveWorkspace(): Workspace | null {
  const workspaceId = useActiveWorkspaceId();
  const workspaces = useWorkspaces();
  return useMemo(
    () => workspaces.find((w) => w.id === workspaceId) ?? null,
    [workspaces, workspaceId],
  );
}

function useActiveWorkspaceId(): string | null {
  const { workspaceId } = useParams<RouteParamsWorkspace>();
  return workspaceId ?? null;
}
