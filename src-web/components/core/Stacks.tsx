import classnames from 'classnames';
import type { ComponentType, ForwardedRef, HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

const gapClasses = {
  0: 'gap-0',
  0.5: 'gap-0.5',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
};

interface HStackProps extends BaseStackProps {
  children?: ReactNode;
}

export const HStack = forwardRef(function HStack(
  { className, space, children, ...props }: HStackProps,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: ForwardedRef<any>,
) {
  return (
    <BaseStack
      ref={ref}
      className={classnames(className, 'flex-row', space && gapClasses[space])}
      {...props}
    >
      {children}
    </BaseStack>
  );
});

export type VStackProps = BaseStackProps & {
  children: ReactNode;
};

export const VStack = forwardRef(function VStack(
  { className, space, children, ...props }: VStackProps,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: ForwardedRef<any>,
) {
  return (
    <BaseStack
      ref={ref}
      className={classnames(className, 'flex-col', space && gapClasses[space])}
      {...props}
    >
      {children}
    </BaseStack>
  );
});

type BaseStackProps = HTMLAttributes<HTMLElement> & {
  as?: ComponentType | 'ul';
  space?: keyof typeof gapClasses;
  alignItems?: 'start' | 'center';
  justifyContent?: 'start' | 'center' | 'end';
};

const BaseStack = forwardRef(function BaseStack(
  { className, alignItems, justifyContent, children, as, ...props }: BaseStackProps,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: ForwardedRef<any>,
) {
  const Component = as ?? 'div';
  return (
    <Component
      ref={ref}
      className={classnames(
        className,
        'flex',
        alignItems === 'center' && 'items-center',
        alignItems === 'start' && 'items-start',
        justifyContent === 'start' && 'justify-start',
        justifyContent === 'center' && 'justify-center',
        justifyContent === 'end' && 'justify-end',
      )}
      {...props}
    >
      {children}
    </Component>
  );
});
