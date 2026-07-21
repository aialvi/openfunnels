import { router } from '@inertiajs/react';
import { AlertCircle, Check, Clipboard, Globe, Loader2, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface DomainMapping {
    id: number;
    domain: string;
    is_verified: boolean;
    ssl_status: string | null;
    created_at?: string;
}

interface DomainMappingSettings {
    cnameTarget: string;
    aRecordIp: string | null;
}

interface FlashProps {
    flash?: {
        success?: string | null;
        domain?: DomainMapping | null;
    };
}

interface FunnelSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    funnel: {
        id: number;
        name: string;
        is_published: boolean;
        domains: DomainMapping[];
    };
    domainMapping?: DomainMappingSettings;
}

const domainRegex = /^(?!:\/\/)(?=.{1,255}$)((.{1,63}\.){1,127}(?![0-9]*$)[a-z0-9-]+)$/i;

function normalizeDomain(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .replace(/\.$/, '');
}

function getDnsRecord(domain: string, domainMapping?: DomainMappingSettings) {
    const parts = domain.split('.');
    const isSubdomain = parts.length >= 3;

    if (isSubdomain) {
        return {
            type: 'CNAME',
            host: parts.slice(0, -2).join('.'),
            value: domainMapping?.cnameTarget || 'cname.openfunnels.com',
        };
    }

    return {
        type: 'A',
        host: '@',
        value: domainMapping?.aRecordIp || 'Set DOMAIN_MAPPING_A_RECORD_IP in your environment',
    };
}

export default function FunnelSettingsModal({ isOpen, onClose, funnel, domainMapping }: FunnelSettingsModalProps) {
    const [domainInput, setDomainInput] = useState('');
    const [step, setStep] = useState<1 | 2 | 3>(funnel.domains.length > 0 ? 2 : 1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [deletingDomainId, setDeletingDomainId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [selectedDomain, setSelectedDomain] = useState<DomainMapping | null>(funnel.domains[0] ?? null);

    const normalizedDomain = normalizeDomain(domainInput);
    const activeDomain = selectedDomain?.domain || normalizedDomain;
    const dnsRecord = useMemo(() => getDnsRecord(activeDomain, domainMapping), [activeDomain, domainMapping]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (!normalizedDomain || !domainRegex.test(normalizedDomain)) {
            setError('Enter a valid root domain or subdomain.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccessMsg(null);

        router.post(
            route('domains.store', funnel.id),
            { domain: normalizedDomain },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const flashDomain = (page.props as FlashProps).flash?.domain;
                    const createdDomain = flashDomain ?? { id: 0, domain: normalizedDomain, is_verified: false, ssl_status: 'pending' };

                    setIsSubmitting(false);
                    setSelectedDomain(createdDomain);
                    setDomainInput(createdDomain.domain);
                    setSuccessMsg((page.props as FlashProps).flash?.success ?? null);
                    setStep(2);
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    setError(typeof errors.domain === 'string' ? errors.domain : 'Failed to add domain. It may already be mapped.');
                },
            },
        );
    };

    const handleVerify = () => {
        if (!selectedDomain || selectedDomain.id === 0) {
            setError('Save the domain first, then verify it.');
            return;
        }

        setIsVerifying(true);
        setError(null);
        setSuccessMsg(null);

        router.post(
            route('domains.verify', { funnel: funnel.id, domain: selectedDomain.id }),
            {},
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const flash = (page.props as FlashProps).flash;
                    const verifiedDomain = flash?.domain;

                    setIsVerifying(false);
                    setSelectedDomain(verifiedDomain ?? { ...selectedDomain, is_verified: true, ssl_status: 'active' });
                    setSuccessMsg(flash?.success ?? 'Domain verified successfully.');
                    setStep(3);
                },
                onError: (errors) => {
                    setIsVerifying(false);
                    setError(typeof errors.domain === 'string' ? errors.domain : 'Verification failed. Please check your DNS settings.');
                },
            },
        );
    };

    const handleDelete = (domainId: number) => {
        setDeletingDomainId(domainId);
        setError(null);
        setSuccessMsg(null);

        router.delete(route('domains.destroy', domainId), {
            preserveScroll: true,
            onSuccess: (page) => {
                setDeletingDomainId(null);
                setSuccessMsg((page.props as FlashProps).flash?.success ?? 'Domain removed successfully.');

                if (selectedDomain?.id === domainId) {
                    setSelectedDomain(null);
                    setDomainInput('');
                    setStep(1);
                }
            },
            onError: () => {
                setDeletingDomainId(null);
                setError('Failed to remove domain.');
            },
        });
    };

    const copyValue = async (value: string) => {
        await navigator.clipboard.writeText(value);
        setSuccessMsg('Copied to clipboard.');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Globe className="h-5 w-5" />
                        Domain Mapping
                    </h2>
                    <button onClick={onClose} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-6">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-500">
                            <Check className="h-4 w-4 shrink-0" />
                            {successMsg}
                        </div>
                    )}

                    {funnel.domains.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-foreground">Mapped domains</h3>
                            {funnel.domains.map((mappedDomain) => (
                                <div
                                    key={mappedDomain.id}
                                    className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
                                >
                                    <button
                                        onClick={() => {
                                            setSelectedDomain(mappedDomain);
                                            setDomainInput(mappedDomain.domain);
                                            setStep(mappedDomain.is_verified ? 3 : 2);
                                            setError(null);
                                            setSuccessMsg(null);
                                        }}
                                        className="min-w-0 flex-1 text-left"
                                    >
                                        <div className="truncate text-sm font-medium text-foreground">{mappedDomain.domain}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {mappedDomain.is_verified ? 'Verified' : 'Pending verification'} | SSL{' '}
                                            {mappedDomain.ssl_status || 'pending'}
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(mappedDomain.id)}
                                        disabled={deletingDomainId === mappedDomain.id}
                                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:opacity-50"
                                        title="Remove domain"
                                    >
                                        {deletingDomainId === mappedDomain.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="mb-1 font-medium text-foreground">Add a Custom Domain</h3>
                                <p className="mb-4 text-sm text-muted-foreground">Connect a root domain or subdomain to {funnel.name}.</p>
                                <input
                                    type="text"
                                    placeholder="promo.yourbrand.com"
                                    value={domainInput}
                                    onChange={(event) => setDomainInput(event.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleNext}
                                    disabled={isSubmitting || !domainInput.trim()}
                                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Next step
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="mb-1 font-medium text-foreground">Configure DNS Records</h3>
                                <p className="text-sm text-muted-foreground">
                                    Add this DNS record at your domain registrar, then verify the connection.
                                </p>
                            </div>

                            <div className="space-y-3 rounded-lg border border-border bg-muted p-4 font-mono text-sm">
                                {[
                                    ['Type', dnsRecord.type],
                                    ['Name/Host', dnsRecord.host],
                                    ['Value/Target', dnsRecord.value],
                                ].map(([label, value]) => (
                                    <div key={label} className="grid grid-cols-[110px_minmax(0,1fr)_32px] items-center gap-2">
                                        <span className="text-muted-foreground">{label}:</span>
                                        <span className="truncate font-semibold text-foreground">{value}</span>
                                        <button
                                            onClick={() => copyValue(value)}
                                            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                                            title={`Copy ${label}`}
                                        >
                                            <Clipboard className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {!domainMapping?.aRecordIp && dnsRecord.type === 'A' && (
                                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-500">
                                    Configure `DOMAIN_MAPPING_A_RECORD_IP` before verifying root domains in production.
                                </div>
                            )}

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleVerify}
                                    disabled={isVerifying || !selectedDomain}
                                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {isVerifying && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Verify Connection
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="py-6 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                                <Check className="h-8 w-8" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-foreground">Domain Verified</h3>
                            <p className="mb-6 text-muted-foreground">
                                {selectedDomain?.domain} is mapped. SSL provisioning is handled by the platform and may take a few minutes.
                            </p>
                            <button
                                onClick={onClose}
                                className="rounded-lg bg-muted px-6 py-2 font-medium text-foreground transition-colors hover:bg-muted/80"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
