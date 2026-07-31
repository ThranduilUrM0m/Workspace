export interface ArticleJsonLdInput {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
}

export function buildArticleJsonLd(input: ArticleJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: input.url,
    image: input.imageUrl,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: { '@type': 'Person', name: input.authorName },
  };
}

export interface CreativeWorkJsonLdInput {
  name: string;
  description: string;
  url: string;
  imageUrl: string;
  creatorName: string;
}

export function buildCreativeWorkJsonLd(input: CreativeWorkJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: input.name,
    description: input.description,
    url: input.url,
    image: input.imageUrl,
    creator: { '@type': 'Person', name: input.creatorName },
  };
}

export interface PersonJsonLdInput {
  name: string;
  jobTitle: string;
  url: string;
  imageUrl: string;
  sameAs: string[];
}

export function buildPersonJsonLd(input: PersonJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    jobTitle: input.jobTitle,
    url: input.url,
    image: input.imageUrl,
    sameAs: input.sameAs,
  };
}

export interface ProfessionalServiceJsonLdInput {
  name: string;
  description: string;
  url: string;
  areaServed: string;
}

export function buildProfessionalServiceJsonLd(input: ProfessionalServiceJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: input.name,
    description: input.description,
    url: input.url,
    areaServed: input.areaServed,
  };
}
