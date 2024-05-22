import classNames from 'classnames';
import type { HTMLAttributes } from 'react';

export function InlineCode({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <code
      className={classNames(
        className,
        'font-mono text-xs bg-background-highlight-secondary',
        'px-1.5 py-0.5 rounded text-fg shadow-inner',
      )}
      {...props}
    />
  );
}
