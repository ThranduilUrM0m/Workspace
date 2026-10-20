'use client';

import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { Mark, NavIcon } from './icons';
import { Avatar, ProfileText, useShell } from './Shell';

// One ERP page: its topbar, then its content. Every screen under /app
// renders through this, so the bar's title, kicker and search belong to
// the page that knows them.
//
// Not drawn yet: the bell and messages (parked features, HANDOFF §8). A
// control that opens nothing is a dead control; they arrive with their
// features.

export interface AppPageProps {
    title: string;
    /** The small line above the title: a date, a count, a parent. */
    kicker?: string;
    /** Opt-in, per page: a search box lies about its scope if it is global. */
    search?: { placeholder: string; value?: string; onChange?: (v: string) => void };
    /** The board: the page stops scrolling and its columns scroll instead. */
    frozen?: boolean;
    children: ReactNode;
}

export function AppPage({ title, kicker, search, frozen, children }: AppPageProps) {
    const { user, menu, setMenu, setFrozen, menuButton } = useShell();

    useEffect(() => {
        setFrozen(!!frozen);
        return () => setFrozen(false);
    }, [frozen, setFrozen]);

    return (
        <>
            <header className="topbar">
                <Link className="tb-mark" href="/app" aria-label="Boutaleb — Dashboard">
                    <Mark />
                </Link>
                <div className="greeting">
                    <span className="greeting-sub">{kicker}</span>
                    <h1>{title}</h1>
                </div>
                <div className="topbar-right">
                    {search && (
                        <label className="search-field">
                            <NavIcon name="search" />
                            <input
                                type="search"
                                placeholder={search.placeholder}
                                aria-label={search.placeholder}
                                value={search.value}
                                onChange={(e) => search.onChange?.(e.target.value)}
                            />
                        </label>
                    )}
                    <div className="profile-block">
                        <Avatar name={user.name} />
                        <ProfileText user={user} />
                    </div>
                    <button
                        ref={menuButton}
                        className="menu-btn"
                        type="button"
                        aria-controls="sidebar"
                        aria-expanded={menu}
                        aria-label={menu ? 'Close menu' : 'Open menu'}
                        onClick={() => setMenu(!menu)}
                    >
                        <span />
                        <span />
                    </button>
                </div>
            </header>
            <div className="content" id="content">
                {children}
            </div>
        </>
    );
}
