export interface SeoFieldSource {
  manual?: string | null;
  aiSuggested?: string | null;
  aiSuggestedAccepted?: boolean;
  auto: string;
}

export function resolveSeoField(source: SeoFieldSource): string {
  if (source.manual && source.manual.trim() !== '') {
    return source.manual;
  }
  if (source.aiSuggestedAccepted && source.aiSuggested && source.aiSuggested.trim() !== '') {
    return source.aiSuggested;
  }
  return source.auto;
}
