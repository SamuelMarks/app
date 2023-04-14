import { useRouteError } from 'react-router-dom';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { Button } from './core/Button';
import { Heading } from './core/Heading';
import { VStack } from './core/Stacks';

export default function RouteError() {
  const error = useRouteError();
  const stringified = JSON.stringify(error);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const message = (error as any).message ?? stringified;
  const routes = useAppRoutes();
  return (
    <div className="flex items-center justify-center h-full">
      <VStack space={5} className="max-w-[30rem] !h-auto">
        <Heading>Route Error 🔥</Heading>
        <pre className="text-sm select-auto cursor-text bg-gray-100 p-3 rounded whitespace-normal">
          {message}
        </pre>
        <VStack space={2}>
          <Button
            color="primary"
            onClick={() => {
              routes.navigate('workspaces');
            }}
          >
            Go Home
          </Button>
          <Button color="secondary" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </VStack>
      </VStack>
    </div>
  );
}
