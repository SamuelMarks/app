import classnames from 'classnames';
import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
} from 'react';
import { forwardRef } from 'react';
import { Icon } from './Icon';

const colorStyles = {
  default: 'hover:bg-gray-700/10 text-gray-700 hover:text-gray-1000',
  gray: 'text-gray-800 bg-gray-100 hover:bg-gray-500/20 hover:text-gray-1000',
  primary: 'bg-blue-400 text-white',
  secondary: 'bg-violet-400 text-white',
  warning: 'bg-orange-400 text-white',
  danger: 'bg-red-400 text-white',
};

export type ButtonProps<T extends ElementType> = ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: keyof typeof colorStyles;
  size?: 'xs' | 'sm' | 'md';
  justify?: 'start' | 'center';
  forDropdown?: boolean;
  as?: T;
};

export const Button = forwardRef(function Button<T extends ElementType>(
  {
    className,
    as,
    justify = 'center',
    children,
    size = 'md',
    forDropdown,
    color,
    ...props
  }: ButtonProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof ButtonProps<T>>,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const Component = as || 'button';
  return (
    <Component
      ref={ref}
      type="button"
      className={classnames(
        className,
        'outline-none',
        'border border-transparent focus-visible:border-blue-300',
        'transition-all rounded-md flex items-center',
        'bg-opacity-90 hover:bg-opacity-100',
        colorStyles[color || 'default'],
        justify === 'start' && 'justify-start',
        justify === 'center' && 'justify-center',
        size === 'md' && 'h-10 px-4',
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'xs' && 'h-7 px-2.5 text-sm',
      )}
      {...props}
    >
      {children}
      {forDropdown && <Icon icon="triangleDown" className="ml-1 -mr-1" />}
    </Component>
  );
});
