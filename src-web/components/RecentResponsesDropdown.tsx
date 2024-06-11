import classNames from 'classnames';
import { useDeleteHttpResponse } from '../hooks/useDeleteHttpResponse';
import { useDeleteHttpResponses } from '../hooks/useDeleteHttpResponses';
import { useSaveResponse } from '../hooks/useSaveResponse';
import type { HttpResponse } from '../lib/models';
import { pluralize } from '../lib/pluralize';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { StatusTag } from './core/StatusTag';

interface Props {
  responses: HttpResponse[];
  activeResponse: HttpResponse;
  onPinnedResponseId: (id: string) => void;
  className?: string;
}

export const RecentResponsesDropdown = function ResponsePane({
  activeResponse,
  responses,
  onPinnedResponseId,
  className,
}: Props) {
  const deleteResponse = useDeleteHttpResponse(activeResponse?.id ?? null);
  const deleteAllResponses = useDeleteHttpResponses(activeResponse?.requestId);
  const latestResponseId = responses[0]?.id ?? 'n/a';
  const saveResponse = useSaveResponse(activeResponse);

  return (
    <Dropdown
      items={[
        {
          key: 'save',
          label: 'Save to File',
          onSelect: saveResponse.mutate,
          leftSlot: <Icon icon="save" />,
          hidden: responses.length === 0,
          disabled: responses.length === 0,
        },
        {
          key: 'clear-single',
          label: 'Delete',
          leftSlot: <Icon icon="trash" />,
          onSelect: deleteResponse.mutate,
          disabled: responses.length === 0,
        },
        {
          key: 'unpin',
          label: 'Unpin Response',
          onSelect: () => onPinnedResponseId(activeResponse.id),
          leftSlot: <Icon icon="unpin" />,
          hidden: latestResponseId === activeResponse.id,
          disabled: responses.length === 0,
        },
        { type: 'separator', label: 'History' },
        {
          key: 'clear-all',
          label: `Delete ${responses.length} ${pluralize('Response', responses.length)}`,
          onSelect: deleteAllResponses.mutate,
          hidden: responses.length <= 1,
          disabled: responses.length === 0,
        },
        { type: 'separator' },
        ...responses.slice(0, 20).map((r: HttpResponse) => ({
          key: r.id,
          label: (
            <HStack space={2}>
              <StatusTag className="text-sm" response={r} />
              <span className="text-fg-subtle">&rarr;</span>{' '}
              <span className="font-mono text-sm">{r.elapsed >= 0 ? `${r.elapsed}ms` : 'n/a'}</span>
            </HStack>
          ),
          leftSlot: activeResponse?.id === r.id ? <Icon icon="check" /> : <Icon icon="empty" />,
          onSelect: () => onPinnedResponseId(r.id),
        })),
      ]}
    >
      <IconButton
        title="Show response history"
        icon={activeResponse?.id === latestResponseId ? 'chevronDown' : 'pin'}
        className={classNames(className, 'm-0.5')}
        size="sm"
        iconSize="md"
      />
    </Dropdown>
  );
};
