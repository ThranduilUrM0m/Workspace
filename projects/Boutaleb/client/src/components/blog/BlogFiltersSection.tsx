import { SelectField } from '../../ui';

export function BlogFiltersSection() {
  return (
    <section className="max-w-7xl mx-auto grid gap-4 px-6 pb-10 md:grid-cols-3">
      <SelectField
        label="Type"
        name="type"
        options={[
          { label: 'All', value: 'all' },
          { label: 'Tutorial', value: 'tutorial' },
          { label: 'Deep-dive', value: 'deep-dive' }
        ]}
      />
      <SelectField
        label="Audience"
        name="audience"
        options={[
          { label: 'All', value: 'all' },
          { label: 'Beginner', value: 'beginner' },
          { label: 'Advanced', value: 'advanced' }
        ]}
      />
      <SelectField
        label="Tag"
        name="tag"
        options={[
          { label: 'All', value: 'all' },
          { label: 'Architecture', value: 'architecture' },
          { label: 'Delivery', value: 'delivery' }
        ]}
      />
    </section>
  );
}
