'use client';

import { useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Mark, NavIcon } from './icons';
import { activeHref, FOOT, initials, NAV, type NavItem } from './nav';

// C24, the ERP shell (wireframes/shell/shell.js). The sidebar and the phone
// menu live here, once, in /app's layout; each page draws its own topbar
// through AppPage, which reads the person and the menu from this context.

export interface ShellUser {
    name: string;
    email: string;
}

interface ShellState {
    user: ShellUser;
    menu: boolean;
    setMenu: (open: boolean) => void;
    setFrozen: (frozen: boolean) => void;
    menuButton: React.RefObject<HTMLButtonElement | null>;
}

const Ctx = createContext<ShellState | null>(null);
export function useShell(): ShellState {
    const s = useContext(Ctx);
    if (!s) throw new Error('useShell outside <Shell>');
    return s;
}

export function Shell({ user, children }: { user: ShellUser; children: ReactNode }) {
    const [menu, setMenuState] = useState(false);
    const [frozen, setFrozen] = useState(false);
    const menuButton = useRef<HTMLButtonElement>(null);
    const sidebar = useRef<HTMLElement>(null);
    const main = useRef<HTMLElement>(null);
    const pathname = usePathname();

    // Open: the page behind goes inert, focus moves to the first link.
    // Closed by Esc, by the close control, by navigating, and by crossing
    // 48rem (past it the rail is back and there is no menu to be open).
    // Focus moves after the render that flips `inert`: the menu button
    // lives in the page, which is inert while the menu is open.
    const setMenu = (open: boolean) => {
        refocus.current = true;
        setMenuState(open);
    };
    const refocus = useRef(false);
    useEffect(() => {
        if (!refocus.current) return;
        refocus.current = false;
        if (menu) sidebar.current?.querySelector<HTMLElement>('.side-links a, .side-links button')?.focus({ preventScroll: true });
        else menuButton.current?.focus({ preventScroll: true });
    }, [menu]);

    useEffect(() => {
        if (!menu) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
        const wide = matchMedia('(min-width: 48rem)');
        const onWide = (e: MediaQueryListEvent) => e.matches && setMenuState(false);
        document.addEventListener('keydown', onKey);
        wide.addEventListener('change', onWide);
        return () => {
            document.removeEventListener('keydown', onKey);
            wide.removeEventListener('change', onWide);
        };
    }, [menu]);

    useEffect(() => setMenuState(false), [pathname]);

    useSidebarHeight(sidebar, main, frozen);

    return (
        <Ctx.Provider value={{ user, menu, setMenu, setFrozen, menuButton }}>
            <div className="b-shell" data-menu={menu ? '' : undefined} data-frozen={frozen ? '' : undefined}>
                <SkipLink />
                <Sidebar ref={sidebar} pathname={pathname} />
                <main className="main" id="main" ref={main} inert={menu}>
                    {children}
                </main>
            </div>
        </Ctx.Provider>
    );
}

/* First stop on Tab. Lands on the page's content block, a region, not a
   control, so it draws no ring there. */
function SkipLink() {
    return (
        <a
            className="b-skip"
            href="#content"
            onClick={(e) => {
                e.preventDefault();
                const t = document.getElementById('content');
                if (!t) return;
                t.setAttribute('tabindex', '-1');
                t.classList.add('b-skip-to');
                t.focus();
            }}
        >
            Skip to content
        </a>
    );
}

function Sidebar({ ref, pathname }: { ref: React.Ref<HTMLElement>; pathname: string }) {
    const { user, setMenu } = useShell();
    const { signOut } = useClerk();
    const active = activeHref(pathname);

    return (
        <nav className="sidebar" id="sidebar" aria-label="App" ref={ref}>
            <div className="sidebar-inner">
                <div className="sidebar-top">
                    <a className="brand" href="/" aria-label="Boutaleb — go to the public site">
                        <Mark className="mark-icon" />
                        <span className="brand-word label">
                            Boutaleb<span className="dot">.</span>
                        </span>
                    </a>
                    <button className="menu-btn side-close" type="button" aria-label="Close menu" onClick={() => setMenu(false)}>
                        <span />
                        <span />
                    </button>
                </div>
                <ul className="side-links">
                    {NAV.map((item, i) => (
                        <NavEntry key={i} item={item} active={active} />
                    ))}
                </ul>
                <ul className="side-links bottom-links">
                    {FOOT.map((item, i) => (
                        <NavEntry key={i} item={item} active={active} />
                    ))}
                    <li>
                        <button type="button" onClick={() => signOut({ redirectUrl: '/login' })}>
                            <NavIcon name="exit" />
                            <span className="label">Logout</span>
                        </button>
                    </li>
                </ul>
                <div className="side-me">
                    <Avatar name={user.name} />
                    <ProfileText user={user} />
                </div>
            </div>
        </nav>
    );
}

function NavEntry({ item, active }: { item: NavItem; active: string | undefined }) {
    const holdsActive = 'sub' in item && item.sub.some((s) => s.href === active);
    const [open, setOpen] = useState(holdsActive);
    useEffect(() => {
        if (holdsActive) setOpen(true);
    }, [holdsActive]);

    if ('group' in item) {
        return (
            <li className="nav-group">
                <span className="label">{item.group}</span>
            </li>
        );
    }
    if ('sub' in item) {
        return (
            <li className="has-sub" data-open={open ? '' : undefined}>
                <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                    <NavIcon name={item.icon} />
                    <span className="label">{item.label}</span>
                    <NavIcon name="caret" className="chevron label" />
                </button>
                <ul className="sub-links">
                    {item.sub.map((s) => (
                        <li key={s.href}>
                            <Link href={s.href} aria-current={s.href === active ? 'page' : undefined} tabIndex={open ? undefined : -1}>
                                <span className="label">{s.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </li>
        );
    }
    return (
        <li>
            <Link href={item.href} aria-current={item.href === active ? 'page' : undefined}>
                {item.icon && <NavIcon name={item.icon} />}
                <span className="label">{item.label}</span>
            </Link>
        </li>
    );
}

export function Avatar({ name }: { name: string }) {
    return (
        <div className="avatar" aria-hidden="true">
            {initials(name)}
        </div>
    );
}

export function ProfileText({ user }: { user: ShellUser }) {
    return (
        <div className="profile-text">
            <span className="hello">Hello, {user.name.split(/\s+/)[0]}</span>
            <span className="email">{user.email}</span>
        </div>
    );
}

/* The sidebar is taller than the viewport on purpose and hangs its bottom
   edge below the fold (top = 100dvh - --sidebar-h). On a page-scroll screen
   the real height is knowable, so it is measured, and re-measured whenever
   the page or the nav changes size (shell.js, fixed 2026-09-06):
   - the nav's own content is a floor, read with the rail collapsed to 0,
     because a box taller than its content reports the box;
   - a page shorter than the viewport gets 1.25 viewports, not 1.5;
   - otherwise the page's height, between 1 and 1.5 viewports.
   Frozen screens keep the 150dvh default: nothing scrolls there. */
function useSidebarHeight(sidebar: React.RefObject<HTMLElement | null>, main: React.RefObject<HTMLElement | null>, frozen: boolean) {
    useLayoutEffect(() => {
        const root = sidebar.current?.closest<HTMLElement>('.b-shell');
        const inner = sidebar.current?.querySelector<HTMLElement>('.sidebar-inner');
        const page = main.current;
        if (frozen || !root || !inner || !page) {
            root?.style.removeProperty('--sidebar-h');
            return;
        }
        let busy = false;
        const size = () => {
            if (busy) return;
            busy = true;
            const prev = root.style.getPropertyValue('--sidebar-h');
            root.style.setProperty('--sidebar-h', '0px');
            const need = inner.scrollHeight;
            if (prev) root.style.setProperty('--sidebar-h', prev);
            const vh = window.innerHeight;
            const h = page.scrollHeight <= vh ? Math.max(vh * 1.25, need) : Math.max(vh, Math.min(page.scrollHeight, vh * 1.5), need);
            root.style.setProperty('--sidebar-h', `${h}px`);
            busy = false;
        };
        size();
        const ro = new ResizeObserver(size);
        ro.observe(page);
        ro.observe(inner);
        window.addEventListener('resize', size);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', size);
        };
    }, [sidebar, main, frozen]);
}
