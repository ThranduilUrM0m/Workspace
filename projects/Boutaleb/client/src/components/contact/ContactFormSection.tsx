import { useState } from 'react';
import { Card, Button, TextField, SelectField, TextareaField, UploadField, Alert } from '../../ui';

export function ContactFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
    }, 1000);
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-10">
      <Card title="Project Intake" description="Start with the essentials. The deeper questionnaire comes after this first contact.">
        {submitStatus === 'success' ? (
          <div className="py-6">
            <Alert className="bg-success/10 text-success border-success/20">
              Thank you! I received your intake and will respond with a scoped plan within 48 hours.
            </Alert>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit} aria-label="Project contact form">
            <TextField id="full_name" name="full_name" label="Full name" required />
            <TextField id="email" name="email" type="email" label="Email" required />
            <TextField id="company" name="company" label="Company" />
            <SelectField
              id="project_type"
              name="project_type"
              label="Project type"
              required
              options={[
                { label: 'Website + ERP Intake', value: 'website_erp' },
                { label: 'ERP System', value: 'erp' },
                { label: 'Custom Software', value: 'custom' },
                { label: 'Other', value: 'other' }
              ]}
            />
            <SelectField
              id="budget_range"
              name="budget_range"
              label="Budget range"
              required
              options={[
                { label: '20k-40k', value: '20k_40k' },
                { label: '40k-75k', value: '40k_75k' },
                { label: '75k+', value: '75k_plus' }
              ]}
            />
            <TextareaField
              id="project_summary"
              name="project_summary"
              label="Project summary"
              placeholder="What's your main challenge? What's the timeline?"
              required
              minLength={40}
            />
            <UploadField id="assets_upload" label="Assets or brief (optional)" accept=".pdf,.doc,.docx,.txt" />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Intake'}
              </Button>
              <Button type="button" variant="secondary">
                Schedule Discovery Call
              </Button>
            </div>
            <Alert>
              AI can organize responses, but the project plan is reviewed manually before anything moves forward.
            </Alert>
          </form>
        )}
      </Card>
    </section>
  );
}
