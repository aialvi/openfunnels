import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { FlaskConical } from 'lucide-react';

export default function DemoBanner() {
    const { demo } = usePage<SharedData>().props;
    if (!demo.active) return null;

    return (
        <div className="flex items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-center text-xs font-semibold text-black">
            <FlaskConical className="h-4 w-4" /> Guest sandbox: publishing, domains, account changes, AI, email, and webhooks are disabled. Data
            expires automatically.
        </div>
    );
}
