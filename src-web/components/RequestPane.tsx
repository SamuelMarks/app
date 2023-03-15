import classnames from 'classnames';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useSendRequest } from '../hooks/useSendRequest';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import { Editor } from './core/Editor';
import { TabContent, Tabs } from './core/Tabs/Tabs';
import { GraphQLEditor } from './editors/GraphQLEditor';
import { PairEditor } from './core/PairEditor';
import { UrlBar } from './UrlBar';

interface Props {
  fullHeight: boolean;
  className?: string;
}

export function RequestPane({ fullHeight, className }: Props) {
  const activeRequest = useActiveRequest();
  const updateRequest = useUpdateRequest(activeRequest);
  const sendRequest = useSendRequest(activeRequest);

  if (activeRequest === null) return null;

  return (
    <div className={classnames(className, 'p-2 grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1')}>
      <UrlBar
        key={activeRequest.id}
        method={activeRequest.method}
        url={activeRequest.url}
        loading={sendRequest.isLoading}
        onMethodChange={(method) => updateRequest.mutate({ method })}
        onUrlChange={(url) => updateRequest.mutate({ url })}
        sendRequest={sendRequest.mutate}
      />
      <Tabs
        tabs={[
          {
            value: 'body',
            label: activeRequest.bodyType ?? 'NoBody',
            options: {
              onValueChange: (bodyType) => updateRequest.mutate({ bodyType: bodyType.value }),
              value: activeRequest.bodyType ?? 'nobody',
              items: [
                { label: 'No Body', value: 'nobody' },
                { label: 'JSON', value: 'json' },
                { label: 'GraphQL', value: 'graphql' },
              ],
            },
          },
          { value: 'params', label: 'Params' },
          { value: 'headers', label: 'Headers' },
          { value: 'auth', label: 'Auth' },
        ]}
        className="mt-2"
        defaultValue="body"
        label="Request body"
      >
        <TabContent value="headers" className="pl-2">
          <PairEditor
            key={activeRequest.id}
            pairs={activeRequest.headers}
            onChange={(headers) => updateRequest.mutate({ headers })}
          />
        </TabContent>
        <TabContent value="body">
          {activeRequest.bodyType === 'json' ? (
            <Editor
              key={activeRequest.id}
              useTemplating
              className="!bg-gray-50"
              heightMode={fullHeight ? 'full' : 'auto'}
              defaultValue={activeRequest.body ?? ''}
              contentType="application/json"
              onChange={(body) => updateRequest.mutate({ body })}
            />
          ) : activeRequest.bodyType === 'graphql' ? (
            <GraphQLEditor
              key={activeRequest.id}
              className="!bg-gray-50"
              defaultValue={activeRequest?.body ?? ''}
              onChange={(body) => updateRequest.mutate({ body })}
            />
          ) : (
            <div className="h-full text-gray-400 flex items-center justify-center">No Body</div>
          )}
        </TabContent>
      </Tabs>
    </div>
  );
}
