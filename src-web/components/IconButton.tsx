import classnames from 'classnames';
import { forwardRef } from 'preact/compat';
import type { ButtonProps } from './Button';
import { Button } from './Button';
import type { IconProps } from './Icon';
import { Icon } from './Icon';

type Props = IconProps & ButtonProps & { iconClassName?: string; iconSize?: IconProps['size'] };

export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { icon, spin, className, iconClassName, size = 'md', iconSize, ...props }: Props,
  ref,
) {
  return (
    <Button
      ref={ref}
      className={classnames(
        className,
        'group',
        '!px-0',
        size === 'md' && 'w-9',
        size === 'sm' && 'w-9',
      )}
      size={size}
      {...props}
    >
      <Icon
        size={iconSize}
        icon={icon}
        spin={spin}
        className={classnames(
          iconClassName,
          'text-gray-700 group-hover:text-gray-1000',
          props.disabled && 'opacity-70',
        )}
      />
    </Button>
  );
});
