import { formatSdl } from 'format-graphql';
import { useMemo } from 'react';
import { useUniqueKey } from '../../hooks/useUniqueKey';
import { Divider } from '../core/Divider';
import type { EditorProps } from '../core/Editor';
import { Editor } from '../core/Editor';

type Props = Pick<EditorProps, 'heightMode' | 'onChange' | 'defaultValue' | 'className'>;

interface GraphQLBody {
  query: string;
  variables?: Record<string, string | number | boolean | null>;
  operationName?: string;
}

export function GraphQLEditor({ defaultValue, onChange, ...extraEditorProps }: Props) {
  const queryKey = useUniqueKey();
  const { query, variables } = useMemo<GraphQLBody>(() => {
    if (!defaultValue) {
      return { query: '', variables: {} };
    }
    try {
      const p = JSON.parse(defaultValue ?? '{}');
      const query = p.query ?? '';
      const variables = p.variables;
      const operationName = p.operationName;
      return { query, variables, operationName };
    } catch (err) {
      return { query: 'failed to parse' };
    }
  }, [defaultValue]);

  const handleChange = (b: GraphQLBody) => {
    onChange?.(JSON.stringify(b, null, 2));
  };

  const handleChangeQuery = (query: string) => {
    handleChange({ query, variables });
  };

  const handleChangeVariables = (variables: string) => {
    try {
      handleChange({ query, variables: JSON.parse(variables) });
    } catch (e) {
      // Meh, not much we can do here
    }
  };

  return (
    <div className="pb-1 h-full grid grid-rows-[minmax(0,100%)_auto_auto_minmax(0,auto)]">
      <Editor
        key={queryKey.key}
        heightMode="auto"
        defaultValue={query ?? ''}
        onChange={handleChangeQuery}
        contentType="application/graphql"
        format={formatSdl}
        placeholder={`query { }`}
        {...extraEditorProps}
      />
      <Divider />
      <p className="pt-1 text-gray-500 text-sm">Variables</p>
      <Editor
        useTemplating
        heightMode="auto"
        defaultValue={JSON.stringify(variables, null, 2)}
        onChange={handleChangeVariables}
        contentType="application/json"
        {...extraEditorProps}
      />
    </div>
  );
}
