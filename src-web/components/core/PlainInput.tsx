import classNames from 'classnames';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { useStateWithDeps } from '../../hooks/useStateWithDeps';
import { IconButton } from './IconButton';
import type { InputProps } from './Input';
import { HStack } from './Stacks';

export type PlainInputProps = Omit<InputProps, 'wrapLines' | 'onKeyDown' | 'type'> & {
  type?: 'text' | 'password' | 'number';
  step?: number;
};

export const PlainInput = forwardRef<HTMLInputElement, PlainInputProps>(function Input(
  {
    className,
    containerClassName,
    defaultValue,
    forceUpdateKey,
    hideLabel,
    label,
    labelClassName,
    labelPosition = 'top',
    leftSlot,
    name,
    onBlur,
    onChange,
    onFocus,
    onPaste,
    placeholder,
    require,
    rightSlot,
    size = 'md',
    type = 'text',
    validate,
    ...props
  }: PlainInputProps,
  ref,
) {
  const [obscured, setObscured] = useStateWithDeps(type === 'password', [type]);
  const [currentValue, setCurrentValue] = useState(defaultValue ?? '');
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    onBlur?.();
  }, [onBlur]);

  const id = `input-${name}`;
  const inputClassName = classNames(
    className,
    '!bg-transparent min-w-0 h-auto w-full focus:outline-none placeholder:text-placeholder',
    'px-1.5 text-xs font-mono cursor-text',
  );

  const isValid = useMemo(() => {
    if (require && !validateRequire(currentValue)) return false;
    if (validate && !validate(currentValue)) return false;
    return true;
  }, [currentValue, validate, require]);

  const handleChange = useCallback(
    (value: string) => {
      setCurrentValue(value);
      onChange?.(value);
    },
    [onChange],
  );

  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={wrapperRef}
      className={classNames(
        'w-full',
        'pointer-events-auto', // Just in case we're placing in disabled parent
        labelPosition === 'left' && 'flex items-center gap-2',
        labelPosition === 'top' && 'flex-row gap-0.5',
      )}
    >
      <label
        htmlFor={id}
        className={classNames(
          labelClassName,
          'text-fg-subtle whitespace-nowrap',
          hideLabel && 'sr-only',
        )}
      >
        {label}
      </label>
      <HStack
        alignItems="stretch"
        className={classNames(
          containerClassName,
          'x-theme-input',
          'relative w-full rounded-md text-fg',
          'border',
          focused ? 'border-border-focus' : 'border-background-highlight',
          !isValid && '!border-fg-danger',
          size === 'md' && 'min-h-md',
          size === 'sm' && 'min-h-sm',
          size === 'xs' && 'min-h-xs',
        )}
      >
        {leftSlot}
        <HStack
          className={classNames(
            'w-full min-w-0',
            leftSlot && 'pl-0.5 -ml-2',
            rightSlot && 'pr-0.5 -mr-2',
          )}
        >
          <input
            ref={ref}
            key={forceUpdateKey}
            id={id}
            type={type === 'password' && !obscured ? 'text' : type}
            defaultValue={defaultValue}
            placeholder={placeholder}
            onChange={(e) => handleChange(e.target.value)}
            onPaste={(e) => onPaste?.(e.clipboardData.getData('Text'))}
            className={inputClassName}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </HStack>
        {type === 'password' && (
          <IconButton
            title={obscured ? `Show ${label}` : `Obscure ${label}`}
            size="xs"
            className="mr-0.5 group/obscure !h-auto my-0.5"
            iconClassName="text-fg-subtle group-hover/obscure:text-fg"
            iconSize="sm"
            icon={obscured ? 'eye' : 'eyeClosed'}
            onClick={() => setObscured((o) => !o)}
          />
        )}
        {rightSlot}
      </HStack>
    </div>
  );
});

function validateRequire(v: string) {
  return v.length > 0;
}
