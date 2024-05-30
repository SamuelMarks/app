import { useQueryClient } from '@tanstack/react-query';
import { getCurrent } from '@tauri-apps/api/webviewWindow';
import { useEffect } from 'react';
import { useCommandPalette } from '../hooks/useCommandPalette';
import { cookieJarsQueryKey } from '../hooks/useCookieJars';
import { foldersQueryKey } from '../hooks/useFolders';
import { useGlobalCommands } from '../hooks/useGlobalCommands';
import { grpcConnectionsQueryKey } from '../hooks/useGrpcConnections';
import { grpcEventsQueryKey } from '../hooks/useGrpcEvents';
import { grpcRequestsQueryKey } from '../hooks/useGrpcRequests';
import { useHotKey } from '../hooks/useHotKey';
import { httpRequestsQueryKey } from '../hooks/useHttpRequests';
import { httpResponsesQueryKey } from '../hooks/useHttpResponses';
import { keyValueQueryKey } from '../hooks/useKeyValue';
import { useListenToTauriEvent } from '../hooks/useListenToTauriEvent';
import { useNotificationToast } from '../hooks/useNotificationToast';
import { useRecentEnvironments } from '../hooks/useRecentEnvironments';
import { useRecentRequests } from '../hooks/useRecentRequests';
import { useRecentWorkspaces } from '../hooks/useRecentWorkspaces';
import { useRequestUpdateKey } from '../hooks/useRequestUpdateKey';
import { settingsQueryKey, useSettings } from '../hooks/useSettings';
import { useSyncThemeToDocument } from '../hooks/useSyncThemeToDocument';
import { workspacesQueryKey } from '../hooks/useWorkspaces';
import { useZoom } from '../hooks/useZoom';
import type { Model } from '../lib/models';
import { modelsEq } from '../lib/models';

export function GlobalHooks() {
  // Include here so they always update, even if no component references them
  useRecentWorkspaces();
  useRecentEnvironments();
  useRecentRequests();

  // Other useful things
  useSyncThemeToDocument();
  useGlobalCommands();
  useCommandPalette();
  useNotificationToast();

  const queryClient = useQueryClient();
  const { wasUpdatedExternally } = useRequestUpdateKey(null);

  interface ModelPayload {
    model: Model;
    windowLabel: string;
  }

  useListenToTauriEvent<ModelPayload>('upserted_model', ({ payload }) => {
    const { model, windowLabel } = payload;
    const queryKey =
      model.model === 'http_request'
        ? httpRequestsQueryKey(model)
        : model.model === 'http_response'
        ? httpResponsesQueryKey(model)
        : model.model === 'folder'
        ? foldersQueryKey(model)
        : model.model === 'grpc_connection'
        ? grpcConnectionsQueryKey(model)
        : model.model === 'grpc_event'
        ? grpcEventsQueryKey(model)
        : model.model === 'grpc_request'
        ? grpcRequestsQueryKey(model)
        : model.model === 'workspace'
        ? workspacesQueryKey(model)
        : model.model === 'key_value'
        ? keyValueQueryKey(model)
        : model.model === 'cookie_jar'
        ? cookieJarsQueryKey(model)
        : model.model === 'settings'
        ? settingsQueryKey()
        : null;

    if (queryKey === null) {
      console.log('Unrecognized updated model:', model);
      return;
    }

    if (model.model === 'http_request' && windowLabel !== getCurrent().label) {
      wasUpdatedExternally(model.id);
    }

    const pushToFront = (['http_response', 'grpc_connection'] as Model['model'][]).includes(
      model.model,
    );

    if (shouldIgnoreModel(model)) return;

    queryClient.setQueryData<Model[]>(queryKey, (values = []) => {
      const index = values.findIndex((v) => modelsEq(v, model)) ?? -1;
      if (index >= 0) {
        // console.log('UPDATED', payload);
        return [...values.slice(0, index), model, ...values.slice(index + 1)];
      } else {
        // console.log('CREATED', payload);
        return pushToFront ? [model, ...(values ?? [])] : [...(values ?? []), model];
      }
    });
  });

  useListenToTauriEvent<ModelPayload>('deleted_model', ({ payload }) => {
    const { model } = payload;
    if (shouldIgnoreModel(model)) return;

    if (model.model === 'workspace') {
      queryClient.setQueryData(workspacesQueryKey(), removeById(model));
    } else if (model.model === 'http_request') {
      queryClient.setQueryData(httpRequestsQueryKey(model), removeById(model));
    } else if (model.model === 'http_response') {
      queryClient.setQueryData(httpResponsesQueryKey(model), removeById(model));
    } else if (model.model === 'folder') {
      queryClient.setQueryData(foldersQueryKey(model), removeById(model));
    } else if (model.model === 'grpc_request') {
      queryClient.setQueryData(grpcRequestsQueryKey(model), removeById(model));
    } else if (model.model === 'grpc_connection') {
      queryClient.setQueryData(grpcConnectionsQueryKey(model), removeById(model));
    } else if (model.model === 'grpc_event') {
      queryClient.setQueryData(grpcEventsQueryKey(model), removeById(model));
    } else if (model.model === 'key_value') {
      queryClient.setQueryData(keyValueQueryKey(model), undefined);
    } else if (model.model === 'cookie_jar') {
      queryClient.setQueryData(cookieJarsQueryKey(model), undefined);
    } else if (model.model === 'settings') {
      queryClient.setQueryData(settingsQueryKey(), undefined);
    }
  });

  const settings = useSettings();
  useEffect(() => {
    if (settings == null) {
      return;
    }

    const { interfaceScale, interfaceFontSize, editorFontSize } = settings;
    getCurrent().setZoom(interfaceScale).catch(console.error);
    document.documentElement.style.cssText = [
      `font-size: ${interfaceFontSize}px`,
      `--editor-font-size: ${editorFontSize}px`,
    ].join('; ');
  }, [settings]);

  // Handle Zoom. Note, Mac handles it in app menu, so need to also handle keyboard
  // shortcuts for Windows/Linux
  const zoom = useZoom();
  useHotKey('app.zoom_in', () => zoom.zoomIn);
  useListenToTauriEvent('zoom_in', () => zoom.zoomIn);
  useHotKey('app.zoom_out', () => zoom.zoomOut);
  useListenToTauriEvent('zoom_out', () => zoom.zoomOut);
  useHotKey('app.zoom_reset', () => zoom.zoomReset);
  useListenToTauriEvent('zoom_reset', () => zoom.zoomReset);

  return null;
}

function removeById<T extends { id: string }>(model: T) {
  return (entries: T[] | undefined) => entries?.filter((e) => e.id !== model.id);
}

const shouldIgnoreModel = (payload: Model) => {
  if (payload.model === 'key_value') {
    return payload.namespace === 'no_sync';
  }
  return false;
};
