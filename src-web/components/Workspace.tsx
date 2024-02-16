import classNames from 'classnames';
import { motion } from 'framer-motion';
import type {
  CSSProperties,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowSize } from 'react-use';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useIsFullscreen } from '../hooks/useIsFullscreen';
import { useOsInfo } from '../hooks/useOsInfo';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { useSidebarWidth } from '../hooks/useSidebarWidth';
import { Button } from './core/Button';
import { HotKeyList } from './core/HotKeyList';
import { GrpcConnectionLayout } from './GrpcConnectionLayout';
import { HttpRequestLayout } from './HttpRequestLayout';
import { Overlay } from './Overlay';
import { ResizeHandle } from './ResizeHandle';
import { Sidebar } from './Sidebar';
import { SidebarActions } from './SidebarActions';
import { WorkspaceHeader } from './WorkspaceHeader';

const side = { gridArea: 'side' };
const head = { gridArea: 'head' };
const body = { gridArea: 'body' };
const drag = { gridArea: 'drag' };

const WINDOW_FLOATING_SIDEBAR_WIDTH = 600;

export default function Workspace() {
  const { setWidth, width, resetWidth } = useSidebarWidth();
  const { hide, show, hidden } = useSidebarHidden();
  const activeRequest = useActiveRequest();
  const windowSize = useWindowSize();
  const [floating, setFloating] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const moveState = useRef<{ move: (e: MouseEvent) => void; up: (e: MouseEvent) => void } | null>(
    null,
  );

  // float/un-float sidebar on window resize
  useEffect(() => {
    const shouldHide = windowSize.width <= WINDOW_FLOATING_SIDEBAR_WIDTH;
    if (shouldHide && !floating) {
      setFloating(true);
      hide().catch(console.error);
    } else if (!shouldHide && floating) {
      setFloating(false);
    }
  }, [floating, hide, windowSize.width]);

  const unsub = () => {
    if (moveState.current !== null) {
      document.documentElement.removeEventListener('mousemove', moveState.current.move);
      document.documentElement.removeEventListener('mouseup', moveState.current.up);
    }
  };

  const handleResizeStart = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (width === undefined) return;

      unsub();
      const mouseStartX = e.clientX;
      const startWidth = width;
      moveState.current = {
        move: async (e: MouseEvent) => {
          e.preventDefault(); // Prevent text selection and things
          const newWidth = startWidth + (e.clientX - mouseStartX);
          if (newWidth < 50) {
            await hide();
            resetWidth();
          } else {
            await show();
            setWidth(newWidth);
          }
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
    [setWidth, resetWidth, width, hide, show],
  );

  const sideWidth = hidden ? 0 : width;
  const styles = useMemo<CSSProperties>(
    () => ({
      gridTemplate: floating
        ? `
        ' ${head.gridArea}' auto
        ' ${body.gridArea}' minmax(0,1fr)
        / 1fr`
        : `
        ' ${head.gridArea} ${head.gridArea} ${head.gridArea}' auto
        ' ${side.gridArea} ${drag.gridArea} ${body.gridArea}' minmax(0,1fr)
        / ${sideWidth}px   0                1fr`,
    }),
    [sideWidth, floating],
  );

  if (windowSize.width <= 100) {
    return (
      <div>
        <Button>Send</Button>
      </div>
    );
  }

  return (
    <div
      style={styles}
      className={classNames(
        'grid w-full h-full',
        // Animate sidebar width changes but only when not resizing
        // because it's too slow to animate on mouse move
        !isResizing && 'transition-all',
      )}
    >
      {floating ? (
        <Overlay open={!hidden} portalName="sidebar" onClose={hide}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={classNames(
              'absolute top-0 left-0 bottom-0 bg-gray-100 border-r border-highlight w-[14rem]',
              'grid grid-rows-[auto_1fr]',
            )}
          >
            <HeaderSize className="border-transparent">
              <SidebarActions />
            </HeaderSize>
            <Sidebar />
          </motion.div>
        </Overlay>
      ) : (
        <>
          <div style={side} className={classNames('overflow-hidden bg-gray-100')}>
            <Sidebar className="border-r border-highlight" />
          </div>
          <ResizeHandle
            className="-translate-x-3"
            justify="end"
            side="right"
            isResizing={isResizing}
            onResizeStart={handleResizeStart}
            onReset={resetWidth}
          />
        </>
      )}
      <HeaderSize data-tauri-drag-region style={head}>
        <WorkspaceHeader className="pointer-events-none" />
      </HeaderSize>
      {activeRequest == null ? (
        <HotKeyList hotkeys={['http_request.create', 'sidebar.toggle', 'settings.show']} />
      ) : activeRequest.model === 'grpc_request' ? (
        <GrpcConnectionLayout style={body} />
      ) : (
        <HttpRequestLayout activeRequest={activeRequest} style={body} />
      )}
    </div>
  );
}

interface HeaderSizeProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function HeaderSize({ className, style, ...props }: HeaderSizeProps) {
  const platform = useOsInfo();
  const fullscreen = useIsFullscreen();
  const stoplightsVisible = platform?.osType === 'Darwin' && !fullscreen;
  return (
    <div
      style={style}
      className={classNames(
        className,
        'h-md pt-[1px] w-full border-b min-w-0',
        stoplightsVisible ? 'pl-20 pr-1' : 'pl-1',
      )}
    >
      {/* NOTE: This needs display:grid or else the element shrinks (even though scrollable) */}
      <div className="h-full w-full overflow-x-auto hide-scrollbars grid" {...props} />
    </div>
  );
}
