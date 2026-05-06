import { Card } from '../../ui';

const faqs = [
  {
    question: 'How long does intake usually take?',
    answer: 'The form takes 5-10 minutes. I return a scoped plan document within 48 business hours.'
  },
  {
    question: 'What happens after I submit?',
    answer: 'I analyze your submission, ask clarifying questions if needed, then send back a detailed scope, timeline estimate, and rough budget range.'
  },
  {
    question: 'Do you work with specific budgets?',
    answer: 'I work with teams in the 20k-200k+ range. If your project is smaller or larger, I can suggest alternatives or partnerships.'
  },
  {
    question: 'What if I don\'t know the exact scope yet?',
    answer: 'That\'s completely normal. Describe what you\'re trying to achieve and what constraints you have. We figure out scope together.'
  }
];

export function ContactFaqSection() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h2 className="font-display text-2xl text-primary mb-8">Frequently Asked</h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <Card key={idx} title={faq.question} description={faq.answer} />
        ))}
      </div>
    </section>
  );
}
