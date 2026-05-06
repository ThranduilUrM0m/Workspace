import React from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../layout';

export default function ProjectIntakePage(): React.ReactElement {
    const router = useRouter();
    const { id } = router.query;

    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold text-white">
                Intake{id != null ? ` · ${String(id)}` : ''}
            </h1>
            <p className="text-slate-400">Coming soon.</p>
        </DashboardLayout>
    );
}
