import { render } from '@react-email/render';
import { PortalLinkEmail, portalLinkSubject, type PortalLinkLanguage, type PortalLinkProps } from './PortalLinkEmail';
import { ReceiptEmail, receiptPreheader, receiptSubject, type ReceiptProps } from './ReceiptEmail';

export { ReceiptEmail, receiptPreheader, receiptSubject, type ReceiptProps };

/** The receipt as the Trigger.dev job sends it (public-forms.md §5): HTML
 *  for the mail body and its plain-text twin for clients that want one. */
export async function renderReceipt(props: ReceiptProps) {
    const element = ReceiptEmail(props);
    const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);
    return { subject: receiptSubject, html, text };
}

export { PortalLinkEmail, portalLinkSubject, type PortalLinkLanguage, type PortalLinkProps };

/** The magic-link email, as the Trigger.dev job sends it (T8.4). */
export async function renderPortalLink(props: PortalLinkProps) {
    const element = PortalLinkEmail(props);
    const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);
    return { subject: portalLinkSubject(props.language, props.project), html, text };
}

export { renderOwnerNotice, type OwnerNoticeProps } from './ownerNotice';
