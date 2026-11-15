'use client';

import { PORTAL_LANGS, type PortalLang } from '@/lib/portal/copy';

/**
 * FR / AR / EN as three short codes on a thin grey line, solid under the one
 * in use. Shared by the questionnaire and the "email me my access link" page.
 */
export function LangSwitch({ lang, onPick }: { lang: PortalLang; onPick: (l: PortalLang) => void }) {
    return (
        <div className="pt-langs">
            {PORTAL_LANGS.map((l) => (
                <button
                    key={l.key}
                    type="button"
                    className={`pt-lang${lang === l.key ? ' is-on' : ''}`}
                    lang={l.key}
                    aria-label={l.label}
                    aria-current={lang === l.key ? 'true' : undefined}
                    onClick={() => onPick(l.key)}
                >
                    {l.key.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
