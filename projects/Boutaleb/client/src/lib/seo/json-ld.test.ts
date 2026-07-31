import {
  buildArticleJsonLd,
  buildCreativeWorkJsonLd,
  buildPersonJsonLd,
  buildProfessionalServiceJsonLd,
} from './json-ld';

describe('buildArticleJsonLd', () => {
  it('builds a schema.org Article node', () => {
    const result = buildArticleJsonLd({
      title: 'Post Title',
      description: 'Post description',
      url: 'https://example.com/blog/post',
      imageUrl: 'https://example.com/post.jpg',
      datePublished: '2026-01-01',
      dateModified: '2026-01-02',
      authorName: 'Zakariae',
    });
    expect(result['@type']).toBe('Article');
    expect(result.headline).toBe('Post Title');
    expect(result.author).toEqual({ '@type': 'Person', name: 'Zakariae' });
  });
});

describe('buildCreativeWorkJsonLd', () => {
  it('builds a schema.org CreativeWork node', () => {
    const result = buildCreativeWorkJsonLd({
      name: 'Project Name',
      description: 'Project description',
      url: 'https://example.com/portfolio/project',
      imageUrl: 'https://example.com/project.jpg',
      creatorName: 'Zakariae',
    });
    expect(result['@type']).toBe('CreativeWork');
    expect(result.creator).toEqual({ '@type': 'Person', name: 'Zakariae' });
  });
});

describe('buildPersonJsonLd', () => {
  it('builds a schema.org Person node', () => {
    const result = buildPersonJsonLd({
      name: 'Zakariae',
      jobTitle: 'Freelance Developer',
      url: 'https://example.com',
      imageUrl: 'https://example.com/avatar.jpg',
      sameAs: ['https://github.com/zakariae'],
    });
    expect(result['@type']).toBe('Person');
    expect(result.sameAs).toEqual(['https://github.com/zakariae']);
  });
});

describe('buildProfessionalServiceJsonLd', () => {
  it('builds a schema.org ProfessionalService node', () => {
    const result = buildProfessionalServiceJsonLd({
      name: 'Boutaleb',
      description: 'Freelance development services',
      url: 'https://example.com',
      areaServed: 'Remote',
    });
    expect(result['@type']).toBe('ProfessionalService');
    expect(result.areaServed).toBe('Remote');
  });
});
