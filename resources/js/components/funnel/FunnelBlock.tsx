import FormFields from '@/components/funnel/FormFields';
import {
    contentBoolean,
    contentNumber,
    contentString,
    getChartData,
    getSocialLinks,
    getTeamMembers,
    isSafeHttpUrl,
    productCheckoutUrl,
    videoEmbedUrl,
} from '@/lib/block-content';
import { getFormFields } from '@/lib/form-fields';
import type { Block } from '@/types/editor';
import { CalendarDays, Code2, ExternalLink, MapPin, ShoppingCart, Star, Users } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';

interface FunnelBlockProps {
    block: Block;
    formDisabled?: boolean;
    formSubmitting?: boolean;
    formSubmitted?: boolean;
    onFormSubmit?: (event: FormEvent<HTMLFormElement>, block: Block) => void;
}

function EmptyBlock({ icon, message }: { icon: React.ReactNode; message: string }) {
    return (
        <div className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-sm text-gray-500">
            {icon}
            <span className="mt-2">{message}</span>
        </div>
    );
}

function CountdownBlock({ block }: { block: Block }) {
    const target = contentString(block.content, 'targetDate');
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const parts = useMemo(() => {
        const remaining = Math.max(0, new Date(target).getTime() - now);
        return {
            days: Math.floor(remaining / 86_400_000),
            hours: Math.floor((remaining / 3_600_000) % 24),
            minutes: Math.floor((remaining / 60_000) % 60),
            seconds: Math.floor((remaining / 1000) % 60),
        };
    }, [now, target]);

    const units = [
        { key: 'days', label: 'Days', show: contentBoolean(block.content, 'showDays', true) },
        { key: 'hours', label: 'Hours', show: contentBoolean(block.content, 'showHours', true) },
        { key: 'minutes', label: 'Minutes', show: contentBoolean(block.content, 'showMinutes', true) },
        { key: 'seconds', label: 'Seconds', show: contentBoolean(block.content, 'showSeconds', true) },
    ] as const;

    return (
        <div className="text-center">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">{contentString(block.content, 'title', 'Countdown')}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {units
                    .filter((unit) => unit.show)
                    .map((unit) => (
                        <div key={unit.key} className="rounded-lg bg-gray-900 px-3 py-4 text-white">
                            <div className="text-2xl font-bold tabular-nums">{String(parts[unit.key]).padStart(2, '0')}</div>
                            <div className="text-xs tracking-wide text-gray-300 uppercase">{unit.label}</div>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default function FunnelBlock({ block, formDisabled = false, formSubmitting = false, formSubmitted = false, onFormSubmit }: FunnelBlockProps) {
    const wrapperStyle: React.CSSProperties = {
        padding: block.settings.padding,
        margin: block.settings.margin,
        backgroundColor: block.settings.backgroundColor,
        borderRadius: block.settings.borderRadius,
    };

    const renderContent = () => {
        switch (block.type) {
            case 'text':
                return (
                    <div
                        className="whitespace-pre-wrap"
                        style={{
                            fontSize: contentString(block.content, 'fontSize', '16px'),
                            color: contentString(block.content, 'color', '#1f2937'),
                            textAlign: contentString(block.content, 'textAlign', 'left') as React.CSSProperties['textAlign'],
                            fontWeight: contentString(block.content, 'fontWeight', 'normal'),
                            lineHeight: contentString(block.content, 'lineHeight', '1.6'),
                        }}
                    >
                        {contentString(block.content, 'text', 'Enter your text here')}
                    </div>
                );

            case 'image': {
                const src = contentString(block.content, 'src');
                const image = src ? (
                    <img
                        src={src}
                        alt={contentString(block.content, 'alt', '')}
                        loading="lazy"
                        className="h-auto max-w-full"
                        style={{
                            width: contentString(block.content, 'width', '100%'),
                            maxHeight: contentString(block.content, 'maxHeight', 'none'),
                            objectFit: contentString(block.content, 'objectFit', 'cover') as React.CSSProperties['objectFit'],
                            borderRadius: contentString(block.content, 'imageBorderRadius', '8px'),
                        }}
                    />
                ) : (
                    <EmptyBlock icon={<ExternalLink className="h-5 w-5" />} message="Add an image URL" />
                );
                const link = contentString(block.content, 'linkUrl');
                return link && isSafeHttpUrl(link) ? (
                    <a href={link} target={contentBoolean(block.content, 'newTab', true) ? '_blank' : undefined} rel="noreferrer">
                        {image}
                    </a>
                ) : (
                    image
                );
            }

            case 'button': {
                const url = contentString(block.content, 'url', '#');
                const variant = contentString(block.content, 'variant', 'primary');
                const size = contentString(block.content, 'size', 'medium');
                return (
                    <a
                        href={isSafeHttpUrl(url) ? url : '#'}
                        target={contentBoolean(block.content, 'newTab') ? '_blank' : undefined}
                        rel="noreferrer"
                        className={`inline-flex items-center justify-center rounded-lg font-semibold transition-opacity hover:opacity-90 ${variant === 'secondary' ? 'bg-gray-200 text-gray-900' : 'bg-blue-600 text-white'} ${size === 'small' ? 'px-3 py-2 text-sm' : size === 'large' ? 'px-7 py-4 text-lg' : 'px-5 py-3'} ${contentBoolean(block.content, 'fullWidth') ? 'w-full' : ''}`}
                    >
                        {contentString(block.content, 'text', 'Learn more')}
                    </a>
                );
            }

            case 'form':
                return (
                    <form className="space-y-4" onSubmit={onFormSubmit ? (event) => onFormSubmit(event, block) : (event) => event.preventDefault()}>
                        <h3 className="font-semibold text-gray-900">{contentString(block.content, 'title', 'Contact us')}</h3>
                        <FormFields fields={getFormFields(block.content)} formId={`funnel-${block.id}`} disabled={formDisabled} />
                        <button
                            type="submit"
                            disabled={formDisabled || formSubmitting}
                            className="w-full rounded bg-blue-600 p-2 text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                        >
                            {formSubmitting ? 'Submitting...' : contentString(block.content, 'buttonText', 'Submit')}
                        </button>
                        {formSubmitted && (
                            <p className="text-sm font-medium text-green-600">
                                {contentString(block.content, 'successMessage', 'Thanks. Your information was submitted.')}
                            </p>
                        )}
                    </form>
                );

            case 'video': {
                const src = contentString(block.content, 'src');
                const embed = videoEmbedUrl(src);
                if (embed)
                    return (
                        <iframe
                            src={embed}
                            title={contentString(block.content, 'title', 'Video')}
                            loading="lazy"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            className="aspect-video w-full rounded-lg border-0"
                        />
                    );
                if (src)
                    return (
                        <video
                            src={src}
                            poster={contentString(block.content, 'poster') || undefined}
                            controls={contentBoolean(block.content, 'controls', true)}
                            autoPlay={contentBoolean(block.content, 'autoplay')}
                            muted={contentBoolean(block.content, 'autoplay')}
                            className="aspect-video w-full rounded-lg bg-black"
                        />
                    );
                return <EmptyBlock icon={<ExternalLink className="h-5 w-5" />} message="Add a YouTube, Vimeo, or video URL" />;
            }

            case 'code': {
                const code = contentString(block.content, 'code');
                return code ? (
                    <iframe
                        title="Custom code preview"
                        srcDoc={code}
                        sandbox="allow-forms allow-modals allow-popups allow-scripts"
                        className="min-h-40 w-full rounded border border-gray-200 bg-white"
                    />
                ) : (
                    <EmptyBlock icon={<Code2 className="h-5 w-5" />} message="Add HTML code" />
                );
            }

            case 'map': {
                const address = contentString(block.content, 'address');
                const zoom = Math.min(20, Math.max(1, contentNumber(block.content, 'zoom', 12)));
                return address ? (
                    <iframe
                        title={`Map of ${address}`}
                        src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&z=${zoom}&output=embed`}
                        loading="lazy"
                        className="w-full rounded-lg border-0"
                        style={{ height: contentString(block.content, 'height', '300px') }}
                    />
                ) : (
                    <EmptyBlock icon={<MapPin className="h-5 w-5" />} message="Add a map address" />
                );
            }

            case 'testimonial': {
                const rating = Math.min(5, Math.max(1, contentNumber(block.content, 'rating', 5)));
                const avatar = contentString(block.content, 'avatar');
                return (
                    <figure className="rounded-xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm">
                        <div className="mb-3 flex gap-1 text-amber-400">
                            {Array.from({ length: rating }, (_, index) => (
                                <Star key={index} className="h-4 w-4 fill-current" />
                            ))}
                        </div>
                        <blockquote className="text-lg leading-relaxed">
                            “{contentString(block.content, 'quote', 'A wonderful experience.')}”
                        </blockquote>
                        <figcaption className="mt-5 flex items-center gap-3">
                            {avatar ? (
                                <img src={avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                            ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
                                    <Users className="h-5 w-5 text-gray-500" />
                                </div>
                            )}
                            <div>
                                <div className="font-semibold">{contentString(block.content, 'author', 'Customer')}</div>
                                <div className="text-sm text-gray-500">{contentString(block.content, 'position')}</div>
                            </div>
                        </figcaption>
                    </figure>
                );
            }

            case 'calendar': {
                const embedUrl = contentString(block.content, 'embedUrl') || contentString(block.content, 'calendarId');
                return embedUrl && isSafeHttpUrl(embedUrl) ? (
                    <iframe
                        src={embedUrl}
                        title={contentString(block.content, 'title', 'Book a time')}
                        loading="lazy"
                        className="w-full rounded-lg border border-gray-200"
                        style={{ height: contentString(block.content, 'height', '650px') }}
                    />
                ) : (
                    <EmptyBlock icon={<CalendarDays className="h-5 w-5" />} message="Add a scheduling embed URL" />
                );
            }

            case 'ecommerce':
            case 'woocommerce-product':
            case 'shopify-buy-button': {
                const image = contentString(block.content, 'image');
                const name = contentString(
                    block.content,
                    'name',
                    block.type === 'ecommerce' ? 'Product name' : block.type === 'woocommerce-product' ? 'WooCommerce product' : 'Shopify product',
                );
                const url = productCheckoutUrl(block);
                return (
                    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm">
                        {image ? (
                            <img src={image} alt={name} loading="lazy" className="aspect-square w-full object-cover" />
                        ) : (
                            <div className="flex aspect-[2/1] items-center justify-center bg-gray-100">
                                <ShoppingCart className="h-8 w-8 text-gray-400" />
                            </div>
                        )}
                        <div className="p-5">
                            <h3 className="text-lg font-semibold">{name}</h3>
                            <div className="mt-1 font-medium text-gray-700">{contentString(block.content, 'price', '$99.00')}</div>
                            {contentString(block.content, 'description') && (
                                <p className="mt-3 text-sm text-gray-600">{contentString(block.content, 'description')}</p>
                            )}
                            <a
                                href={url}
                                className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white"
                            >
                                {contentString(block.content, 'buttonText', 'Buy now')}
                            </a>
                        </div>
                    </article>
                );
            }

            case 'team': {
                const members = getTeamMembers(block.content);
                return members.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {members.map((member, index) => (
                            <article
                                key={`${member.name}-${index}`}
                                className="rounded-xl border border-gray-200 bg-white p-5 text-center text-gray-900"
                            >
                                {member.photo ? (
                                    <img
                                        src={member.photo}
                                        alt={member.name}
                                        loading="lazy"
                                        className="mx-auto h-24 w-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                                        <Users className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                                <h3 className="mt-4 font-semibold">{member.name}</h3>
                                <p className="text-sm text-gray-500">{member.position}</p>
                                {member.bio && <p className="mt-3 text-sm text-gray-600">{member.bio}</p>}
                            </article>
                        ))}
                    </div>
                ) : (
                    <EmptyBlock icon={<Users className="h-5 w-5" />} message="Add team members" />
                );
            }

            case 'chart': {
                const data = getChartData(block.content);
                const max = Math.max(...data.map((datum) => datum.value), 1);
                return (
                    <div className="rounded-xl border border-gray-200 bg-white p-5 text-gray-900">
                        <h3 className="font-semibold">{contentString(block.content, 'title', 'Chart')}</h3>
                        {data.length ? (
                            <div className="mt-5 space-y-3">
                                {data.map((datum, index) => (
                                    <div key={`${datum.label}-${index}`}>
                                        <div className="mb-1 flex justify-between text-sm">
                                            <span>{datum.label}</span>
                                            <span className="font-medium">{datum.value}</span>
                                        </div>
                                        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full bg-blue-600"
                                                style={{ width: `${Math.max(2, (datum.value / max) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-3 text-sm text-gray-500">Add chart data in the inspector.</p>
                        )}
                    </div>
                );
            }

            case 'audio': {
                const src = contentString(block.content, 'src');
                return (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 text-gray-900">
                        <h3 className="mb-3 font-semibold">{contentString(block.content, 'title', 'Audio')}</h3>
                        {src ? (
                            <audio
                                src={src}
                                controls={contentBoolean(block.content, 'controls', true)}
                                autoPlay={contentBoolean(block.content, 'autoplay')}
                                className="w-full"
                            />
                        ) : (
                            <p className="text-sm text-gray-500">Add an audio URL.</p>
                        )}
                    </div>
                );
            }

            case 'countdown':
                return <CountdownBlock block={block} />;

            case 'social': {
                const links = getSocialLinks(block.content);
                return (
                    <div className="flex flex-wrap gap-2">
                        {links.map((link) =>
                            link.url && isSafeHttpUrl(link.url) ? (
                                <a
                                    key={link.platform}
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 capitalize hover:bg-gray-50"
                                >
                                    {link.platform}
                                </a>
                            ) : (
                                <span
                                    key={link.platform}
                                    className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400 capitalize"
                                >
                                    {link.platform}
                                </span>
                            ),
                        )}
                    </div>
                );
            }

            case 'spacer':
                return <div aria-hidden="true" style={{ height: contentString(block.content, 'height', '50px') }} />;

            default:
                return <EmptyBlock icon={<Code2 className="h-5 w-5" />} message={`${block.type} is not configured yet`} />;
        }
    };

    return (
        <div data-block-id={block.id} style={wrapperStyle}>
            {renderContent()}
        </div>
    );
}
