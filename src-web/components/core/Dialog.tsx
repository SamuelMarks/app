import classnames from 'classnames';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useKeyPressEvent } from 'react-use';
import { Overlay } from '../Overlay';
import { Heading } from './Heading';
import { IconButton } from './IconButton';

export interface DialogProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'full' | 'dynamic';
  hideX?: boolean;
}

export function Dialog({
  children,
  className,
  size = 'full',
  open,
  onClose,
  title,
  description,
  hideX,
}: DialogProps) {
  const titleId = useMemo(() => Math.random().toString(36).slice(2), []);
  const descriptionId = useMemo(
    () => (description ? Math.random().toString(36).slice(2) : undefined),
    [description],
  );

  useKeyPressEvent('Escape', (e) => {
    e.preventDefault();
    onClose();
  });

  return (
    <Overlay open={open} onClose={onClose} portalName="dialog">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          role="dialog"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="pointer-events-auto"
        >
          <motion.div
            initial={{ top: 5, scale: 0.97 }}
            animate={{ top: 0, scale: 1 }}
            className={classnames(
              className,
              'relative bg-gray-50 pointer-events-auto',
              'max-h-[80vh] p-5 rounded-lg overflow-auto',
              'dark:border border-gray-200 shadow-md shadow-black/10',
              size === 'sm' && 'w-[25rem]',
              size === 'md' && 'w-[45rem]',
              size === 'full' && 'w-[80vw]',
              size === 'dynamic' && 'min-w-[30vw] max-w-[80vw]',
            )}
          >
            {!hideX && (
              <IconButton
                onClick={onClose}
                title="Close dialog"
                aria-label="Close"
                icon="x"
                size="sm"
                className="ml-auto absolute right-1 top-1"
              />
            )}
            <Heading className="text-xl font-semibold w-full" id={titleId}>
              {title}
            </Heading>
            {description && <p id={descriptionId}>{description}</p>}
            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      </div>
    </Overlay>
  );
}
