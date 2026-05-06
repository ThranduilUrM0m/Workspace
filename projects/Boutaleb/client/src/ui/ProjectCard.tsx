import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from './index';
import type { ProjectPreview } from './types';

export interface ProjectCardProps {
    project: ProjectPreview;
    className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
    return (
        <motion.article
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className={`group overflow-hidden rounded-[24px] border border-border/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] shadow-panel backdrop-blur-xl transition-shadow ${className ?? ''}`.trim()}
        >
            <Link href={`/work/${project.slug}`} className="block">
                <div className="relative h-60 w-full overflow-hidden bg-bg">
                    <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.58] via-primary/[0.10] to-transparent" />
                    <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-[0.72rem] uppercase tracking-[0.18em] text-surface/[0.78] backdrop-blur-xl">
                        <span>{project.industry}</span>
                        <span>{project.year}</span>
                    </div>
                </div>

                <div className="space-y-4 p-6">
                    <div className="space-y-2">
                        <h3 className="font-display text-lg font-semibold text-primary line-clamp-2">
                            {project.title}
                        </h3>
                        <p className="text-sm leading-6 text-muted line-clamp-3">
                            {project.summary}
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2">
                        <div className="flex flex-wrap gap-1.5">
                            {project.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="default" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {project.tags.length > 2 ? (
                                <Badge variant="default" className="text-xs">
                                    +{project.tags.length - 2}
                                </Badge>
                            ) : null}
                        </div>
                        <p className="whitespace-nowrap text-xs font-semibold text-success">
                            {project.resultMetric}
                        </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/65 pt-4">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                            Open case study
                        </span>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-bg text-primary transition group-hover:border-accent/35 group-hover:text-accent">
                            &rarr;
                        </span>
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}
