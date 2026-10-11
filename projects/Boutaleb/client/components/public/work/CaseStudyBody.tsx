import { workCategoryLabel, type Project } from '@/content/work';

// Everything under the header of a case study (portfolio-detail-modal.html):
// hero, title, facts, story, tokens, detail shots. The dialog and the full
// page render the same body; only their header differs.

export function CaseStudyBody({ project, titleId }: { project: Project; titleId: string }) {
    const cs = project.caseStudy;
    const category = workCategoryLabel[project.category];

    return (
        <>
            <div className="ph hero" aria-hidden="true">
                {cs.hero}
            </div>

            <div className="m-body">
                <h1 className="m-title" id={titleId}>
                    {project.title}
                </h1>

                <aside className="side" aria-label="Project facts">
                    <div className="side-block">
                        <div className="k">Category</div>
                        <div className="v">{category}</div>
                    </div>
                    <div className="side-block">
                        <div className="k">Year</div>
                        <div className="v">{project.year}</div>
                    </div>
                    <div className="side-block wide">
                        <div className="k">Role</div>
                        <div className="v">{cs.role}</div>
                    </div>
                    <div className="side-block wide">
                        <div className="k">Tech &amp; tools</div>
                        <div className="tags">
                            {cs.tools.map((tool) => (
                                <span key={tool} className="pill">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>
                    {(cs.liveUrl || cs.pdfUrl) && (
                        <div className="acts">
                            {cs.liveUrl && (
                                <a className="btn btn-dark" href={cs.liveUrl} rel="noopener" target="_blank">
                                    View live site
                                </a>
                            )}
                            {cs.pdfUrl && (
                                <a className="btn btn-link" href={cs.pdfUrl}>
                                    Case study PDF
                                </a>
                            )}
                        </div>
                    )}
                </aside>

                <div className="main">
                    <h2 className="h">Overview</h2>
                    <p className="body-text">{cs.overview}</p>
                    <h2 className="h">The problem</h2>
                    <p className="body-text">{cs.problem}</p>
                    {cs.shots[0] && <Shot {...cs.shots[0]} />}
                    <h2 className="h">The solution</h2>
                    <p className="body-text">{cs.solution}</p>
                    {cs.shots.slice(1).map((shot) => (
                        <Shot key={shot.label} {...shot} />
                    ))}
                </div>
            </div>

            {(cs.tokens || cs.details) && (
                <div className="fullwidth">
                    {cs.tokens && (
                        <>
                            <h2 className="h">Design tokens</h2>
                            <div className="tokens-box">
                                <p className="sub">Color palette</p>
                                <div className="swatch-row">
                                    {cs.tokens.colors.map((c) => (
                                        <div key={c.hex} className="swatch">
                                            <div className="ph chip" style={{ background: c.hex }} />
                                            <div className="hex">{c.hex}</div>
                                            <div className="nm">{c.name}</div>
                                        </div>
                                    ))}
                                </div>
                                <p className="sub">Typography</p>
                                <div className="type-row">
                                    {cs.tokens.type.map((t) => (
                                        <div key={t.sample} className="type-sample">
                                            <span className="big" style={{ fontFamily: t.family }}>
                                                {t.sample}
                                            </span>
                                            <span className="lbl">
                                                {t.use[0]}
                                                <br />
                                                {t.use[1]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                    {cs.details && (
                        <>
                            <h2 className="h">Detail shots</h2>
                            <div className="detail-row">
                                {cs.details.map((d) => (
                                    <div key={d} className="ph" aria-hidden="true">
                                        {d}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}

function Shot({ label, caption }: { label: string; caption?: string }) {
    return (
        <>
            <div className="ph gal-img" aria-hidden="true">
                {label}
            </div>
            {caption && <p className="gal-caption">{caption}</p>}
        </>
    );
}
