import { DropdownMenuRadio } from './Dropdown';
import { Button } from './Button';
import { Input } from './Input';
import type { FormEvent } from 'react';
import { IconButton } from './IconButton';

interface Props {
  sendRequest: () => void;
  loading: boolean;
  method: string;
  url: string;
  onMethodChange: (method: string) => void;
  onUrlChange: (url: string) => void;
}

export function UrlBar({ sendRequest, loading, onMethodChange, method, onUrlChange, url }: Props) {
  const handleSendRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendRequest();
  };

  return (
    <form onSubmit={handleSendRequest} className="w-full flex items-center">
      <Input
        hideLabel
        useEditor={{ useTemplating: true, contentType: 'url' }}
        size="sm"
        className="font-mono px-0"
        name="url"
        label="Enter URL"
        containerClassName="shadow shadow-gray-100 dark:shadow-gray-0"
        onChange={onUrlChange}
        defaultValue={url}
        placeholder="Enter a URL..."
        leftSlot={
          <DropdownMenuRadio
            onValueChange={(v) => onMethodChange(v.value)}
            value={method.toUpperCase()}
            items={[
              { label: 'GET', value: 'GET' },
              { label: 'PUT', value: 'PUT' },
              { label: 'POST', value: 'POST' },
              { label: 'PATCH', value: 'PATCH' },
              { label: 'DELETE', value: 'DELETE' },
              { label: 'OPTIONS', value: 'OPTIONS' },
              { label: 'HEAD', value: 'HEAD' },
            ]}
          >
            <Button type="button" disabled={loading} size="xs" className="mx-0.5" justify="start">
              {method.toUpperCase()}
            </Button>
          </DropdownMenuRadio>
        }
        rightSlot={
          <IconButton
            type="submit"
            className="mr-0.5"
            size="xs"
            icon={loading ? 'update' : 'paperPlane'}
            spin={loading}
            disabled={loading}
            title="Send Request"
          />
        }
      />
    </form>
  );
}
