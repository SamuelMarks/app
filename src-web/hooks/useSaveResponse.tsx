import { useMutation } from '@tanstack/react-query';
import { save } from '@tauri-apps/plugin-dialog';
import mime from 'mime';
import slugify from 'slugify';
import { InlineCode } from '../components/core/InlineCode';
import { useToast } from '../components/ToastContext';
import type { HttpResponse } from '../lib/models';
import { getContentTypeHeader } from '../lib/models';
import { getHttpRequest } from '../lib/store';
import { invokeCmd } from '../lib/tauri';

export function useSaveResponse(response: HttpResponse) {
  const toast = useToast();

  return useMutation({
    mutationKey: ['save_response', response.id],
    mutationFn: async () => {
      const request = await getHttpRequest(response.requestId);
      if (request == null) return null;

      const contentType = getContentTypeHeader(response.headers) ?? 'unknown';
      const ext = mime.getExtension(contentType);
      const slug = slugify(request.name ?? 'response', { lower: true });
      const filepath = await save({
        defaultPath: ext ? `${slug}.${ext}` : slug,
        title: 'Save Response',
      });
      await invokeCmd('cmd_save_response', { responseId: response.id, filepath });
      toast.show({
        message: (
          <>
            Response saved to <InlineCode>{filepath}</InlineCode>
          </>
        ),
      });
    },
  });
}
