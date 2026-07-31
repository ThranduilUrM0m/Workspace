import { resolveSeoField } from './seo-fields.util';

describe('resolveSeoField', () => {
  it('returns the manual override when present', () => {
    const result = resolveSeoField({ manual: 'Manual Title', aiSuggested: 'AI Title', aiSuggestedAccepted: true, auto: 'Auto Title' });
    expect(result).toBe('Manual Title');
  });

  it('returns the AI suggestion when accepted and no manual value exists', () => {
    const result = resolveSeoField({ manual: null, aiSuggested: 'AI Title', aiSuggestedAccepted: true, auto: 'Auto Title' });
    expect(result).toBe('AI Title');
  });

  it('ignores the AI suggestion when not accepted', () => {
    const result = resolveSeoField({ manual: null, aiSuggested: 'AI Title', aiSuggestedAccepted: false, auto: 'Auto Title' });
    expect(result).toBe('Auto Title');
  });

  it('falls back to the auto-derived value when nothing else is set', () => {
    const result = resolveSeoField({ auto: 'Auto Title' });
    expect(result).toBe('Auto Title');
  });

  it('treats an empty-string manual value as unset', () => {
    const result = resolveSeoField({ manual: '  ', aiSuggested: 'AI Title', aiSuggestedAccepted: true, auto: 'Auto Title' });
    expect(result).toBe('AI Title');
  });
});
