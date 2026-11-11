'use client';

import * as React from 'react';

/* C5's layout half, C7 the preview panel, C20 save failed and C22 the form
   soul (component map). Styles: form.css. A create screen is

     <FormShell>
       <Form className="fm-main"> FormHead, FormSection…, SaveFail, FormActions </Form>
       <Preview> PreviewHead, PreviewRows > PreviewRow…, PreviewNote </Preview>
     </FormShell>

   The preview is the same panel the success state would show, so the two
   cannot drift. It names what the create WRITES, including what the form
   does not ask for. */

/** The padded wrap and the two columns. Plays the entrance once: lifted on
 *  first paint, dropped on a timer or the first input. */
export function FormShell({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [entering, setEntering] = React.useState(true);
  React.useLayoutEffect(() => {
    // Reading order for the stagger: the form's own children, then the panel.
    ref.current?.querySelectorAll<HTMLElement>('.fm-main > *, .fm-side').forEach((el, i) => el.style.setProperty('--i', String(i)));
    const t = setTimeout(() => setEntering(false), 1400);
    return () => clearTimeout(t);
  }, []);
  const settle = entering ? () => setEntering(false) : undefined;
  return (
    <div ref={ref} className={entering ? 'fm-wrap fm-enter' : 'fm-wrap'} onInput={settle} onClick={settle}>
      <div className="fm-cols">{children}</div>
    </div>
  );
}

/** The heading, the lede, and the one-line message slot that never collapses. */
export function FormHead({ title, lede, msg, tone }: { title: string; lede?: React.ReactNode; msg?: React.ReactNode; tone?: 'err' }) {
  return (
    <>
      <h2 className="fm-title">{title}</h2>
      {lede && <p className="fm-lede">{lede}</p>}
      <p className="fm-msg" role="status" data-tone={tone}>
        {msg}
      </p>
    </>
  );
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  const id = React.useId();
  return (
    <section className="fm-sec" aria-labelledby={id}>
      <h3 className="fm-h" id={id}>
        {title}
      </h3>
      {children}
    </section>
  );
}

/** What a field means, or what a collision implies. */
export function FormNote({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <p className="fm-note" id={id}>
      {children}
    </p>
  );
}

/** One primary action, Cancel as words, and the requirement still missing
 *  beside them. The primary button is disabled while `req` is set. */
export function FormActions({ req, children }: { req?: string | null; children: React.ReactNode }) {
  return (
    <div className="fm-actions">
      {req && <span className="fm-req">{req}</span>}
      {children}
    </div>
  );
}

/** C20, failed: nothing was saved, and every entry is still in the form. */
export function SaveFail({ show, children }: { show: boolean; children?: React.ReactNode }) {
  if (!show) return null;
  return (
    <div className="fm-fail" role="alert">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M6.2 15.5h8.3a3 3 0 0 0 .7-5.9 4.6 4.6 0 0 0-8.6-1.4A3.7 3.7 0 0 0 6.2 15.5Z" />
        <path d="M3.5 3.5l13 13" />
      </svg>
      <p>
        {children ?? (
          <>
            <b>Not saved.</b> The server did not answer. Every entry is still in this form.
          </>
        )}
      </p>
    </div>
  );
}

/** The primary action sweeps once on the frame it becomes possible. */
export function useReady(ready: boolean) {
  const was = React.useRef(ready);
  const [fresh, setFresh] = React.useState(false);
  React.useEffect(() => {
    if (ready && !was.current) setFresh(true);
    if (!ready) setFresh(false);
    was.current = ready;
  }, [ready]);
  return fresh ? { 'data-ready': '' } : {};
}

/** C22: true for a moment after `value` changes (never on first render), so
 *  the thing showing it can flash. Layout never moves; only paint does. */
export function useChanged(value: unknown, ms = 1100) {
  const first = React.useRef(true);
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setOn(true);
    const t = setTimeout(() => setOn(false), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return on;
}

/** C7: the panel beside the form. Under it, on a phone, it needs a name. */
export function Preview({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="fm-side" aria-label={title}>
      <h2 className="fm-h fm-side-h">{title}</h2>
      {children}
    </aside>
  );
}

export function PreviewHead({ avatar, name, empty, sub }: { avatar: React.ReactNode; name?: string; empty: string; sub: React.ReactNode }) {
  // The avatar pops when the letters it would show change, not on every keystroke.
  const popped = useChanged((name ?? '').trim().split(/\s+/).slice(0, 2).map((w) => w[0] ?? '').join(''));
  return (
    <div className="fm-prev-head">
      <span data-new={popped ? '' : undefined}>{avatar}</span>
      <span style={{ minInlineSize: 0 }}>
        <span className="fm-prev-name" data-empty={name ? undefined : ''} style={{ display: 'block' }}>
          {name || empty}
        </span>
        <span className="fm-prev-sub" style={{ display: 'block' }}>
          {sub}
        </span>
      </span>
    </div>
  );
}

export function PreviewRows({ children }: { children: React.ReactNode }) {
  return <dl className="fm-prev-rows">{children}</dl>;
}

/** One fact the create will write. `empty` greys it: an em dash is a fact
 *  ("none yet"), never a gap. `watch` is what, when it changes, flashes it. */
export function PreviewRow({ k, empty, watch, children }: { k: string; empty?: boolean; watch?: unknown; children: React.ReactNode }) {
  // A plain-text value watches itself; anything richer says what to watch.
  const flash = useChanged(watch ?? (typeof children === 'string' ? children : undefined));
  return (
    <div className="fm-prev-row" data-empty={empty ? '' : undefined} data-new={flash ? '' : undefined}>
      <dt className="fm-prev-k">{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function PreviewNote({ children }: { children: React.ReactNode }) {
  return <p className="fm-prev-note">{children}</p>;
}
