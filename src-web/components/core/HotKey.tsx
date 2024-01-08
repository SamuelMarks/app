import classNames from 'classnames';
import type { HotkeyAction } from '../../hooks/useHotkey';
import { useFormattedHotkey } from '../../hooks/useHotkey';
import { useOsInfo } from '../../hooks/useOsInfo';

interface Props {
  action: HotkeyAction | null;
  className?: string;
  variant?: 'text' | 'with-bg';
}

export function HotKey({ action, className, variant }: Props) {
  const osInfo = useOsInfo();
  const label = useFormattedHotkey(action);
  if (label === null || osInfo == null) {
    return null;
  }

  return (
    <span
      className={classNames(
        className,
        variant === 'with-bg' && 'rounded border',
        'text-sm text-gray-1000 text-opacity-disabled',
      )}
    >
      {label}
    </span>
  );
}
