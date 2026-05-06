import { SelectField, TextField, Button } from '../../ui';

export function ProjectsFiltersSection() {
  return (
    <section className="max-w-6xl mx-auto grid grid-cols-1 gap-4 px-6 md:grid-cols-4">
      <SelectField 
        label="Industry" 
        name="industry" 
        options={[{ label: 'All', value: 'all' }, { label: 'Retail', value: 'retail' }, { label: 'Logistics', value: 'logistics' }]} 
      />
      <SelectField 
        label="Module" 
        name="module" 
        options={[{ label: 'All', value: 'all' }, { label: 'ERP', value: 'erp' }, { label: 'Systems', value: 'systems' }]} 
      />
      <SelectField 
        label="Year" 
        name="year" 
        options={[{ label: 'All', value: 'all' }, { label: '2026', value: '2026' }, { label: '2025', value: '2025' }]} 
      />
      <div className="flex items-end gap-3">
        <TextField className="flex-1" label="Search" name="search" placeholder="Search by title or result" />
        <Button type="button" variant="secondary">Reset</Button>
      </div>
    </section>
  );
}
