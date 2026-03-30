import * as React from 'react';
import { ProjectCard } from './ProjectCard';
import type { ProjectPreview } from './types';

export interface ProjectGridProps {
    items: ProjectPreview[];
    className?: string;
}

export function ProjectGrid({ items, className }: ProjectGridProps) {
    return (
        <div
            className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${className ?? ''}`.trim()}
        >
            {items.map((item) => (
                <ProjectCard key={item.id} project={item} />
            ))}
        </div>
    );
}
