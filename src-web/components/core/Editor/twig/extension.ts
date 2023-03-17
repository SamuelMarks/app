import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { parseMixed } from '@lezer/common';
import type { GenericCompletionOption } from '../genericCompletion';
import { genericCompletion } from '../genericCompletion';
import { placeholders } from '../widgets';
import { completions } from './completion';
import { parser as twigParser } from './twig';

export function twig(base?: LanguageSupport, autocompleteOptions?: GenericCompletionOption[]) {
  const language = mixedOrPlainLanguage(base);
  const additionalCompletion =
    autocompleteOptions && base
      ? [language.data.of({ autocomplete: genericCompletion({ options: autocompleteOptions }) })]
      : [];
  const completion = language.data.of({
    autocomplete: completions,
  });
  const languageSupport = new LanguageSupport(language, [completion, ...additionalCompletion]);

  if (base) {
    const completion2 = base.language.data.of({ autocomplete: completions });
    const languageSupport2 = new LanguageSupport(base.language, [completion2]);
    return [languageSupport, languageSupport2, placeholders, base.support];
  } else {
    return [languageSupport, placeholders];
  }
}

function mixedOrPlainLanguage(base?: LanguageSupport): LRLanguage {
  const name = 'twig';

  if (!base) {
    return LRLanguage.define({ name, parser: twigParser });
  }

  const parser = twigParser.configure({
    wrap: parseMixed(() => ({
      parser: base.language.parser,
      overlay: (node) => node.type.name === 'Text' || node.type.name === 'Template',
    })),
  });

  return LRLanguage.define({ name, parser });
}
