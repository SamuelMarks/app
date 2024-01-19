import classNames from 'classnames';
import type { EditorView } from 'codemirror';
import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import type { EditorProps } from './Editor';
import { Editor } from './Editor';
import { IconButton } from './IconButton';
import { HStack } from './Stacks';

export type InputProps = Omit<
  HTMLAttributes<HTMLInputElement>,
  'onChange' | 'onFocus' | 'onKeyDown'
> &
  Pick<
    EditorProps,
    | 'contentType'
    | 'useTemplating'
    | 'autocomplete'
    | 'forceUpdateKey'
    | 'autoFocus'
    | 'autoSelect'
    | 'autocompleteVariables'
    | 'onKeyDown'
  > & {
    name: string;
    type?: 'text' | 'password';
    label: string;
    hideLabel?: boolean;
    labelPosition?: 'top' | 'left';
    labelClassName?: string;
    containerClassName?: string;
    onChange?: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    defaultValue?: string;
    leftSlot?: ReactNode;
    rightSlot?: ReactNode;
    size?: 'xs' | 'sm' | 'md' | 'auto';
    className?: string;
    placeholder?: string;
    validate?: (v: string) => boolean;
    require?: boolean;
  };

export const Input = forwardRef<EditorView | undefined, InputProps>(function Input(
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
    placeholder,
    require,
    rightSlot,
    size = 'md',
    type = 'text',
    validate,
    ...props
  }: InputProps,
  ref,
) {
  const [obscured, setObscured] = useState(type === 'password');
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

  // Submit nearest form on Enter key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;

      const form = wrapperRef.current?.closest('form');
      if (!isValid || form == null) return;

      form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    },
    [isValid],
  );

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
          'text-sm text-gray-900 whitespace-nowrap',
          hideLabel && 'sr-only',
        )}
      >
        {label}
      </label>
      <HStack
        alignItems="stretch"
        className={classNames(
          containerClassName,
          'relative w-full rounded-md text-gray-900',
          'border',
          focused ? 'border-focus' : 'border-highlight',
          !isValid && '!border-invalid',
          size === 'md' && 'h-md',
          size === 'sm' && 'h-sm',
          size === 'xs' && 'h-xs',
          size === 'auto' && 'min-h-sm',
        )}
      >
        {leftSlot}
        <HStack
          alignItems="center"
          className={classNames(
            'w-full min-w-0',
            leftSlot && 'pl-0.5 -ml-2',
            rightSlot && 'pr-0.5 -mr-2',
          )}
        >
          <Editor
            ref={ref}
            id={id}
            singleLine
            wrapLines={size === 'auto'}
            onKeyDown={handleKeyDown}
            type={type === 'password' && !obscured ? 'text' : type}
            defaultValue={defaultValue}
            forceUpdateKey={forceUpdateKey}
            placeholder={placeholder}
            onChange={handleChange}
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
            className="mr-0.5"
            iconSize="sm"
            icon={obscured ? 'eyeClosed' : 'eye'}
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
