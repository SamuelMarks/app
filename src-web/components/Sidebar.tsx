import classnames from 'classnames';
import type { ForwardedRef, KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import React, { forwardRef, Fragment, memo, useCallback, useMemo, useRef, useState } from 'react';
import type { XYCoord } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { useRequests } from '../hooks/useRequests';
import { useSidebarWidth } from '../hooks/useSidebarWidth';
import { useUpdateAnyRequest } from '../hooks/useUpdateAnyRequest';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import type { HttpRequest } from '../lib/models';
import { Button } from './core/Button';
import { IconButton } from './core/IconButton';
import { HStack, VStack } from './core/Stacks';
import { WindowDragRegion } from './core/WindowDragRegion';
import { DropMarker } from './DropMarker';
import { RequestSettingsDropdown } from './RequestSettingsDropdown';
import { ToggleThemeButton } from './ToggleThemeButton';

interface Props {
  className?: string;
}

enum ItemTypes {
  REQUEST = 'request',
}

export const Sidebar = memo(function Sidebar({ className }: Props) {
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const unorderedRequests = useRequests();
  const activeRequest = useActiveRequest();
  const createRequest = useCreateRequest({ navigateAfter: true });
  const width = useSidebarWidth();
  const requests = useMemo(
    () => [...unorderedRequests].sort((a, b) => a.sortPriority - b.sortPriority),
    [unorderedRequests],
  );

  const moveState = useRef<{ move: (e: MouseEvent) => void; up: (e: MouseEvent) => void } | null>(
    null,
  );
  const unsub = () => {
    if (moveState.current !== null) {
      document.documentElement.removeEventListener('mousemove', moveState.current.move);
      document.documentElement.removeEventListener('mouseup', moveState.current.up);
    }
  };

  const handleResizeStart = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (width.value === undefined) return;

      unsub();
      const mouseStartX = e.clientX;
      const startWidth = width.value;
      moveState.current = {
        move: (e: MouseEvent) => {
          e.preventDefault(); // Prevent text selection and things
          width.set(startWidth + (e.clientX - mouseStartX));
        },
        up: (e: MouseEvent) => {
          e.preventDefault();
          unsub();
          setIsResizing(false);
        },
      };
      document.documentElement.addEventListener('mousemove', moveState.current.move);
      document.documentElement.addEventListener('mouseup', moveState.current.up);
      setIsResizing(true);
    },
    [width.value],
  );

  const sidebarStyles = useMemo(() => ({ width: width.value }), [width.value]);

  return (
    <div className="relative">
      <ResizeBar isResizing={isResizing} onResizeStart={handleResizeStart} onReset={width.reset} />
      <div
        ref={sidebarRef}
        style={sidebarStyles}
        className={classnames(
          className,
          'bg-gray-100 h-full border-r border-highlight relative grid grid-rows-[auto_minmax(0,1fr)_auto]',
        )}
      >
        <HStack as={WindowDragRegion} alignItems="center" justifyContent="end">
          <IconButton
            size="sm"
            title="Add Request"
            className="mx-1"
            icon="plusCircle"
            onClick={async () => {
              const lastRequest = requests[requests.length - 1];
              await createRequest.mutate({
                name: 'Test Request',
                sortPriority: (lastRequest?.sortPriority ?? 0) + 1,
              });
            }}
          />
        </HStack>
        <VStack as="ul" className="relative py-3 overflow-auto" draggable={false}>
          <SidebarItems activeRequestId={activeRequest?.id} requests={requests} />
        </VStack>
        <HStack className="mx-1 pb-1" alignItems="center" justifyContent="end">
          <ToggleThemeButton />
        </HStack>
      </div>
    </div>
  );
});

function SidebarItems({
  requests,
  activeRequestId,
}: {
  requests: HttpRequest[];
  activeRequestId?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const updateRequest = useUpdateAnyRequest();

  const handleMove = useCallback<DraggableSidebarItemProps['onMove']>(
    (id, side) => {
      const dragIndex = requests.findIndex((r) => r.id === id);
      setHoveredIndex(side === 'above' ? dragIndex : dragIndex + 1);
    },
    [requests],
  );

  const handleEnd = useCallback<DraggableSidebarItemProps['onEnd']>(
    (requestId) => {
      if (hoveredIndex === null) return;
      setHoveredIndex(null);

      const index = requests.findIndex((r) => r.id === requestId);
      const request = requests[index];
      if (request === undefined) return;

      const newRequests = requests.filter((r) => r.id !== requestId);
      if (hoveredIndex > index) newRequests.splice(hoveredIndex - 1, 0, request);
      else newRequests.splice(hoveredIndex, 0, request);

      const beforePriority = newRequests[hoveredIndex - 1]?.sortPriority ?? 0;
      const afterPriority = newRequests[hoveredIndex + 1]?.sortPriority ?? 0;

      const shouldUpdateAll = afterPriority - beforePriority < 1;
      if (shouldUpdateAll) {
        newRequests.forEach((r, i) => {
          updateRequest.mutate({ id: r.id, sortPriority: i * 1000 });
        });
      } else {
        updateRequest.mutate({
          id: requestId,
          sortPriority: afterPriority - (afterPriority - beforePriority) / 2,
        });
      }
    },
    [hoveredIndex, requests],
  );

  return (
    <>
      {requests.map((r, i) => (
        <Fragment key={r.id}>
          {hoveredIndex === i && <DropMarker />}
          <DraggableSidebarItem
            key={r.id}
            requestId={r.id}
            requestName={r.name}
            workspaceId={r.workspaceId}
            active={r.id === activeRequestId}
            onMove={handleMove}
            onEnd={handleEnd}
          />
        </Fragment>
      ))}
      {hoveredIndex === requests.length && <DropMarker />}
    </>
  );
}

type SidebarItemProps = {
  className?: string;
  requestId: string;
  requestName: string;
  workspaceId: string;
  active?: boolean;
};

const _SidebarItem = forwardRef(function SidebarItem(
  { className, requestName, requestId, workspaceId, active }: SidebarItemProps,
  ref: ForwardedRef<HTMLLIElement>,
) {
  const updateRequest = useUpdateRequest(requestId);
  const [editing, setEditing] = useState<boolean>(false);

  const handleSubmitNameEdit = useCallback(async (el: HTMLInputElement) => {
    await updateRequest.mutate({ name: el.value });
    setEditing(false);
  }, []);

  const handleFocus = useCallback((el: HTMLInputElement | null) => {
    el?.focus();
    el?.select();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      // Hitting enter on active request during keyboard nav will start edit
      if (active && e.key === 'Enter') {
        e.preventDefault();
        setEditing(true);
      }
    },
    [active],
  );

  const handleInputKeyDown = useCallback(
    async (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Enter':
          await handleSubmitNameEdit(e.currentTarget);
          break;
        case 'Escape':
          setEditing(false);
          break;
      }
    },
    [active],
  );

  return (
    <li ref={ref} className={classnames(className, 'block group/item px-2 pb-0.5')}>
      <div className="relative">
        <Button
          color="custom"
          size="sm"
          to={`/workspaces/${workspaceId}/requests/${requestId}`}
          draggable={false} // Item should drag, not the link
          onDoubleClick={() => setEditing(true)}
          onClick={active ? () => setEditing(true) : undefined}
          justify="start"
          onKeyDown={handleKeyDown}
          className={classnames(
            editing && 'focus-within:border-focus',
            active
              ? 'bg-highlight text-gray-900'
              : 'text-gray-600 group-hover/item:text-gray-800 active:bg-highlightSecondary',
            // Move out of the way when trash is shown
            'group-hover/item:pr-7',
          )}
        >
          {editing ? (
            <input
              ref={handleFocus}
              defaultValue={requestName}
              className="bg-transparent outline-none w-full"
              onBlur={(e) => handleSubmitNameEdit(e.currentTarget)}
              onKeyDown={handleInputKeyDown}
            />
          ) : (
            <span className={classnames('truncate', !requestName && 'text-gray-400 italic')}>
              {requestName || 'New Request'}
            </span>
          )}
        </Button>
        <RequestSettingsDropdown requestId={requestId}>
          <IconButton
            color="custom"
            size="sm"
            title="Request Options"
            icon="dotsH"
            className={classnames(
              'absolute right-0 top-0 transition-opacity opacity-0',
              'group-hover/item:opacity-100 focus-visible:opacity-100',
            )}
          />
        </RequestSettingsDropdown>
      </div>
    </li>
  );
});
const SidebarItem = memo(_SidebarItem);

type DraggableSidebarItemProps = SidebarItemProps & {
  onMove: (id: string, side: 'above' | 'below') => void;
  onEnd: (id: string) => void;
};

type DragItem = {
  id: string;
  workspaceId: string;
  requestName: string;
};

const DraggableSidebarItem = memo(function DraggableSidebarItem({
  requestName,
  requestId,
  workspaceId,
  active,
  onMove,
  onEnd,
}: DraggableSidebarItemProps) {
  const ref = useRef<HTMLLIElement>(null);

  const [, connectDrop] = useDrop<DragItem, void>(
    {
      accept: ItemTypes.REQUEST,
      hover: (item, monitor) => {
        if (!ref.current) return;
        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
        onMove(requestId, hoverClientY < hoverMiddleY ? 'above' : 'below');
      },
    },
    [onMove],
  );

  const [{ isDragging }, connectDrag] = useDrag<DragItem, unknown, { isDragging: boolean }>(
    () => ({
      type: ItemTypes.REQUEST,
      item: () => ({ id: requestId, requestName, workspaceId }),
      collect: (m) => ({ isDragging: m.isDragging() }),
      options: { dropEffect: 'move' },
      end: () => onEnd(requestId),
    }),
    [onEnd],
  );

  connectDrag(ref);
  connectDrop(ref);

  return (
    <SidebarItem
      ref={ref}
      className={classnames(isDragging && 'opacity-20')}
      requestName={requestName}
      requestId={requestId}
      workspaceId={workspaceId}
      active={active}
    />
  );
});

interface ResizeBarProps {
  isResizing: boolean;
  onResizeStart: (e: ReactMouseEvent<HTMLDivElement>) => void;
  onReset: () => void;
}

function ResizeBar({ onResizeStart, onReset, isResizing }: ResizeBarProps) {
  return (
    <div
      aria-hidden
      draggable
      className="group absolute z-10 -right-0.5 w-3 top-0 bottom-0 flex justify-end cursor-ew-resize"
      onDragStart={onResizeStart}
      onDoubleClick={onReset}
    >
      {/* Show global overlay with cursor style to ensure cursor remains the same when moving quickly */}
      {isResizing && <div className="fixed inset-0 cursor-ew-resize" />}
      <div // drag-divider
        className={classnames(
          'transition-colors w-1 mr-0.5 group-hover:bg-highlight h-full pointer-events-none',
          isResizing && '!bg-blue-500/70',
        )}
      />
    </div>
  );
}
