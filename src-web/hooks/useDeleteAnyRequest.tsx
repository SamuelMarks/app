import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { InlineCode } from '../components/core/InlineCode';
import { trackEvent } from '../lib/analytics';
import type { HttpRequest } from '../lib/models';
import { getRequest } from '../lib/store';
import { useConfirm } from './useConfirm';
import { requestsQueryKey } from './useRequests';
import { responsesQueryKey } from './useResponses';

export function useDeleteAnyRequest() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  return useMutation<HttpRequest | null, string, string>({
    mutationFn: async (id) => {
      const request = await getRequest(id);
      const confirmed = await confirm({
        title: 'Delete Request',
        variant: 'delete',
        description: (
          <>
            Permanently delete <InlineCode>{request?.name}</InlineCode>?
          </>
        ),
      });
      if (!confirmed) return null;
      return invoke('delete_request', { requestId: id });
    },
    onSettled: () => trackEvent('http_request', 'delete'),
    onSuccess: async (request) => {
      // Was it cancelled?
      if (request === null) return;

      const { workspaceId, id: requestId } = request;
      queryClient.setQueryData(responsesQueryKey({ requestId }), []); // Responses were deleted
      queryClient.setQueryData<HttpRequest[]>(requestsQueryKey({ workspaceId }), (requests) =>
        (requests ?? []).filter((r) => r.id !== requestId),
      );
    },
  });
}
