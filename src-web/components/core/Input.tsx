import classnames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import type { EditorProps } from './Editor';
import { Editor } from './Editor';
import { HStack, VStack } from './Stacks';

export type InputProps = Omit<HTMLAttributes<HTMLInputElement>, 'onChange' | 'onFocus'> &
  Pick<EditorProps, 'contentType' | 'useTemplating' | 'autocomplete'> & {
    name: string;
    label: string;
    hideLabel?: boolean;
    labelClassName?: string;
    containerClassName?: string;
    onChange?: (value: string) => void;
    onFocus?: () => void;
    defaultValue?: string;
    leftSlot?: ReactNode;
    rightSlot?: ReactNode;
    size?: 'sm' | 'md';
    className?: string;
    placeholder?: string;
    autoFocus?: boolean;
    validate?: (v: string) => boolean;
    require?: boolean;
  };

export function Input({
  label,
  hideLabel,
  className,
  containerClassName,
  labelClassName,
  onChange,
  placeholder,
  size = 'md',
  name,
  leftSlot,
  rightSlot,
  defaultValue,
  validate,
  require,
  ...props
}: InputProps) {
  const [currentValue, setCurrentValue] = useState(defaultValue ?? '');
  const id = `input-${name}`;
  const inputClassName = classnames(
    className,
    '!bg-transparent min-w-0 h-full w-full focus:outline-none placeholder:text-placeholder',
    // Bump things over if the slots are occupied
    leftSlot && 'pl-0.5 -ml-2',
    rightSlot && 'pr-0.5 -mr-2',
  );

  const isValid = useMemo(() => {
    if (require && !validateRequire(currentValue)) return false;
    if (validate && !validate(currentValue)) return false;
    return true;
  }, [currentValue, validate, require]);

  const handleChange = (value: string) => {
    setCurrentValue(value);
    onChange?.(value);
  };

  return (
    <VStack className="w-full">
      <label
        htmlFor={id}
        className={classnames(
          labelClassName,
          'font-semibold text-sm uppercase text-gray-700',
          hideLabel && 'sr-only',
        )}
      >
        {label}
      </label>
      <HStack
        alignItems="center"
        className={classnames(
          containerClassName,
          'relative w-full rounded-md text-gray-900',
          'border border-highlight focus-within:border-focus',
          !isValid && '!border-invalid',
          size === 'md' && 'h-md leading-md',
          size === 'sm' && 'h-sm leading-sm',
        )}
      >
        {leftSlot}
        <Editor
          id={id}
          singleLine
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={handleChange}
          className={inputClassName}
          {...props}
        />
        {rightSlot}
      </HStack>
    </VStack>
  );
}

function validateRequire(v: string) {
  return v.length > 0;
}
