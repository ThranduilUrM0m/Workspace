import Image from 'next/image';
import { KeyRound, Lock } from 'lucide-react';
import courtyard from '@/public/images/home/approach-courtyard.jpg';

// The Approach section's picture, built in HTML instead of an image (developer pick,
// 2026-11-22, from Perchance sketch mwseuf4ixhh8xy): one browser window showing a sample
// client site, cut diagonally. The inline-start part is the pencil wireframe, the rest is
// the finished page, so the three promises read in one view: drawn before it is built
// (the split), in your language (the FR / AR / EN tabs), keys in your name (the key by
// the client's own domain). Real text, so it stays sharp and can be animated later
// (the wireframe wipes into the page). Decorative: the section's text says it all.

export type MockCopy = { site: string; domain: string; title: string; cta: string; active: 'fr' | 'ar' | 'en' };

const LANGS = [
    ['fr', 'FR'],
    ['ar', 'ع'],
    ['en', 'EN'],
] as const;

function Page({ copy, sketch }: { copy: MockCopy; sketch: boolean }) {
    return (
        <div className={sketch ? 'am-page am-sketch' : 'am-page am-built'}>
            <div className="am-nav">
                <span className="am-logo">{sketch ? '' : copy.site}</span>
                <span className="am-links">
                    <i />
                    <i />
                    <i />
                </span>
                <span className="am-langs">
                    {LANGS.map(([k, label]) => (
                        <span key={k} className={k === copy.active ? 'on' : undefined}>
                            {sketch ? '' : label}
                        </span>
                    ))}
                </span>
            </div>
            <div className="am-hero">
                {sketch ? (
                    <svg className="am-x" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                        <line x1="0" y1="0" x2="100" y2="100" />
                        <line x1="100" y1="0" x2="0" y2="100" />
                    </svg>
                ) : (
                    <Image src={courtyard} alt="" fill sizes="(min-width: 48rem) 40vw, 90vw" className="am-photo" />
                )}
                <div className="am-copy">
                    <span className="am-title">{sketch ? '' : copy.title}</span>
                    <span className="am-cta">{sketch ? '' : copy.cta}</span>
                </div>
            </div>
            <div className="am-cards">
                {[0, 1, 2].map((n) => (
                    <span key={n} className="am-card">
                        <i />
                        <b />
                        <b />
                    </span>
                ))}
            </div>
        </div>
    );
}

export function ApproachMock({ copy }: { copy: MockCopy }) {
    return (
        <div className="am" aria-hidden="true">
            <div className="am-window">
                <div className="am-bar">
                    <span className="am-dots">
                        <i />
                        <i />
                        <i />
                    </span>
                    <span className="am-url" dir="ltr">
                        <Lock className="am-lock" strokeWidth={1.75} />
                        {copy.domain}
                        <KeyRound className="am-key" strokeWidth={1.75} />
                    </span>
                </div>
                <div className="am-body">
                    <Page copy={copy} sketch={false} />
                    <Page copy={copy} sketch />
                    <svg className="am-cut" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <line x1="62" y1="0" x2="38" y2="100" />
                    </svg>
                </div>
            </div>
            <svg className="am-pencil" viewBox="0 0 120 12">
                <rect x="0" y="2" width="96" height="8" />
                <polygon points="96,2 112,6 96,10" />
                <polygon className="lead" points="108,5 112,6 108,7" />
            </svg>
        </div>
    );
}
