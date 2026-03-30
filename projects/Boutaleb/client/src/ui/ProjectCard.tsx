import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge, Button } from './index';
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
            className={`group overflow-hidden rounded-[20px] border border-border bg-surface shadow-soft hover:shadow-md transition-shadow ${className ?? ''}`.trim()}
        >
            <Link href={`/work/${project.slug}`} className="block">
                <div className="relative h-56 w-full overflow-hidden bg-bg">
                    <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                </div>

                <div className="space-y-3 p-5">
                    <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">
                            {project.industry} · {project.year}
                        </p>
                        <h3 className="font-display text-lg font-semibold text-primary line-clamp-2">
                            {project.title}
                        </h3>
                        <p className="text-sm text-muted line-clamp-2">{project.summary}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
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
                        <p className="text-xs font-semibold text-success">{project.resultMetric}</p>
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}
