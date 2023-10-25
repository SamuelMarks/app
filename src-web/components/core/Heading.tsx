import classNames from 'classnames';
import type { HTMLAttributes } from 'react';

export function Heading({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 className={classNames(className, 'text-2xl font-semibold text-gray-900 mb-3')} {...props}>
      {children}
    </h1>
  );
}
