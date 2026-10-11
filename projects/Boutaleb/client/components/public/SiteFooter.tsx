import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { business, type SocialProfile } from '@/lib/business';

// Ported from the locked public footer (Blueprinting/wireframes/public/legal.html).
// "Blog" sits under Navigation only — dropped from Resources, decided 2026-10-11.
// The form is markup until ticket T5.3 makes it send in place.

const SOCIAL_ICON: Record<SocialProfile['network'], { name: string; path: string }> = {
    github: {
        name: 'GitHub',
        path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
    },
    linkedin: {
        name: 'LinkedIn',
        path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    },
    x: {
        name: 'X',
        path: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
    },
};

const ICON = { fill: 'none', stroke: 'rgba(27,27,31,.4)', strokeWidth: 2 } as const;

export function SiteFooter() {
    const t = useTranslations('footer');
    const n = useTranslations('nav');
    const year = new Date().getFullYear();

    return (
        <footer className="site-foot" id="sec-footer">
            <div className="ft-card">
                <div className="ft-top">
                    <div className="ft-head">
                        <h2 className="fit-headline">{t('headline')}</h2>
                        <div className="ft-contact">
                            <div className="ft-cap">{t('contact')}</div>
                            <dl>
                                <div>
                                    <dt>{t('email')}</dt>
                                    <dd>
                                        <a href={`mailto:${business.email}`}>{business.email}</a>
                                    </dd>
                                </div>
                                <div>
                                    <dt>{t('basedIn')}</dt>
                                    <dd>{t('basedInValue')}</dd>
                                </div>
                                <div>
                                    <dt>{t('responseTime')}</dt>
                                    <dd>{t('responseTimeValue')}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                    <div className="ft-form">
                        <div className="ff-card">
                            <p className="ft-cap">{t('missedContact')}</p>
                            <form className="ff-form">
                                <div className="ff-pair">
                                    <div className="ff-field">
                                        <svg className="ff-icon" viewBox="0 0 24 24" aria-hidden="true" {...ICON}>
                                            <circle cx="12" cy="8" r="4" />
                                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                        </svg>
                                        <input type="text" id="ff-name" name="name" placeholder=" " autoComplete="name" />
                                        <label htmlFor="ff-name">{t('fullName')}</label>
                                    </div>
                                    <div className="ff-field">
                                        <svg className="ff-icon" viewBox="0 0 24 24" aria-hidden="true" {...ICON}>
                                            <rect x="3" y="5" width="18" height="14" rx="2" />
                                            <path d="M3 7l9 6 9-6" />
                                        </svg>
                                        <input type="email" id="ff-email" name="email" placeholder=" " autoComplete="email" />
                                        <label htmlFor="ff-email">{t('email')}</label>
                                    </div>
                                </div>
                                <div className="ff-field ff-field-static">
                                    <svg className="ff-icon" viewBox="0 0 24 24" aria-hidden="true" {...ICON}>
                                        <path d="M20 12l-8 8-9-9V4h7l10 8z" />
                                        <circle cx="7.5" cy="7.5" r="1" />
                                    </svg>
                                    <select id="ff-type" name="type">
                                        <option>{t('typeWebsite')}</option>
                                        <option>{t('typeErp')}</option>
                                        <option>{t('typeBoth')}</option>
                                        <option>{t('typeUnsure')}</option>
                                    </select>
                                    <label htmlFor="ff-type">{t('projectType')}</label>
                                </div>
                                <div className="ff-field ff-field-top">
                                    <svg className="ff-icon" viewBox="0 0 24 24" aria-hidden="true" {...ICON}>
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <textarea id="ff-msg" name="message" placeholder=" " />
                                    <label htmlFor="ff-msg">{t('message')}</label>
                                </div>
                                <input className="hp" type="text" name="nickname" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                                <div className="ff-send">
                                    <p>
                                        {t('usedOnlyToReply')} <Link href="/privacy">{t('privacyPolicy')}</Link>.
                                    </p>
                                    <Link className="ff-go" href="/contact">
                                        {t('start')}
                                        <svg className="flip-rtl" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B1B1F" strokeWidth="2" aria-hidden="true">
                                            <path d="M7 17L17 7M9 7h8v8" />
                                        </svg>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="ft-rule" />
                <div className="ft-links">
                    <div className="ft-id">
                        <div className="ft-brand" lang="en" translate="no">{business.brand}</div>
                        <p className="ft-about">{t('about')}</p>
                    </div>
                    <div className="ft-cols">
                        <div className="ft-grp-nav">
                            <div className="ft-cap">{t('navigation')}</div>
                            <ul>
                                <li><Link href="/">{t('home')}</Link></li>
                                <li><Link href="/services">{n('services')}</Link></li>
                                <li><Link href="/portfolio">{n('portfolio')}</Link></li>
                                <li><Link href="/blog">{n('blog')}</Link></li>
                                <li><Link href="/about">{n('about')}</Link></li>
                                <li><Link href="/contact">{n('contact')}</Link></li>
                            </ul>
                        </div>
                        <div className="ft-grp-res">
                            <div className="ft-cap">{t('resources')}</div>
                            <ul>
                                <li><Link href="/services#process">{n('process')}</Link></li>
                                <li><Link href="/services#questions">{n('faq')}</Link></li>
                            </ul>
                        </div>
                        {business.socialProfiles.length > 0 && (
                            <div className="ft-grp-soc">
                                <div className="ft-cap">{t('social')}</div>
                                <ul>
                                    {business.socialProfiles.map(({ network, url }) => (
                                        <li key={network}>
                                            <a href={url} rel="me noopener">
                                                <svg className="soc-ic" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path fill="currentColor" d={SOCIAL_ICON[network].path} />
                                                </svg>
                                                <span className="soc-txt">{SOCIAL_ICON[network].name}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <div className="ft-rule sm" />
                <div className="ft-base">
                    <span>
                        <span className="cr-long">{t('copyright')} </span>&copy; {year}{' '}
                        <span className="cr-long">{t('withLove')} </span>
                        <bdi className="cr-brand" lang="en" translate="no">{business.brand}</bdi>.
                    </span>
                    <a className="ft-top-link" href="#top">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1B1B1F" strokeWidth="2" aria-hidden="true">
                            <path d="M12 19V5M6 11l6-6 6 6" />
                        </svg>
                        <span className="ft-top-txt">{t('backToTop')}</span>
                    </a>
                    <nav aria-label={t('legal')}>
                        <Link href="/privacy">{t('privacyLong')}</Link>
                        <Link href="/terms">{t('termsLong')}</Link>
                        <Link href="/legal-notice">{t('legalNoticeLong')}</Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
