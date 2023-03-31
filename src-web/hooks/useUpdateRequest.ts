import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { getRequest } from '../lib/store';
import { requestsQueryKey } from './useRequests';

export function useUpdateRequest(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, Partial<HttpRequest> | ((r: HttpRequest) => HttpRequest)>({
    mutationFn: async (v) => {
      const request = await getRequest(id);
      if (request == null) {
        throw new Error("Can't update a null request");
      }

      const newRequest = typeof v === 'function' ? v(request) : { ...request, ...v };
      await invoke('update_request', { request: newRequest });
    },
    onMutate: async (v) => {
      const request = await getRequest(id);
      if (request === null) return;

      const newRequest = typeof v === 'function' ? v(request) : { ...request, ...v };
      queryClient.setQueryData<HttpRequest[]>(requestsQueryKey(request), (requests) =>
        (requests ?? []).map((r) => (r.id === newRequest.id ? newRequest : r)),
      );
    },
  });
}
