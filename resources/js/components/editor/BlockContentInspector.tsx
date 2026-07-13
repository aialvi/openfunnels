import { contentBoolean, contentNumber, contentString, getChartData, getSocialLinks, getTeamMembers } from '@/lib/block-content';
import type { Block, BlockType } from '@/types/editor';
import { Plus, Trash2 } from 'lucide-react';

interface BlockContentInspectorProps {
    block: Block;
    onUpdate: (updates: Partial<Block>) => void;
}

type FieldDefinition = {
    key: string;
    label: string;
    kind?: 'text' | 'url' | 'number' | 'color' | 'textarea' | 'select' | 'checkbox' | 'datetime-local';
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    rows?: number;
    min?: number;
    max?: number;
};

const alignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
];

const definitions: Partial<Record<BlockType, FieldDefinition[]>> = {
    text: [
        { key: 'text', label: 'Text', kind: 'textarea', rows: 6 },
        { key: 'fontSize', label: 'Font size', placeholder: '16px' },
        {
            key: 'fontWeight',
            label: 'Weight',
            kind: 'select',
            options: [
                { value: 'normal', label: 'Regular' },
                { value: '500', label: 'Medium' },
                { value: '600', label: 'Semibold' },
                { value: '700', label: 'Bold' },
                { value: '800', label: 'Extra bold' },
            ],
        },
        { key: 'textAlign', label: 'Alignment', kind: 'select', options: alignOptions },
        { key: 'color', label: 'Text color', kind: 'color' },
        { key: 'lineHeight', label: 'Line height', placeholder: '1.6' },
    ],
    image: [
        { key: 'src', label: 'Image URL', kind: 'url', placeholder: 'https://…' },
        { key: 'alt', label: 'Alternative text' },
        { key: 'width', label: 'Width', placeholder: '100%' },
        { key: 'maxHeight', label: 'Maximum height', placeholder: '500px' },
        {
            key: 'objectFit',
            label: 'Fit',
            kind: 'select',
            options: [
                { value: 'cover', label: 'Cover' },
                { value: 'contain', label: 'Contain' },
                { value: 'fill', label: 'Fill' },
            ],
        },
        { key: 'imageBorderRadius', label: 'Image radius', placeholder: '8px' },
        { key: 'linkUrl', label: 'Click URL', kind: 'url' },
        { key: 'newTab', label: 'Open link in new tab', kind: 'checkbox' },
    ],
    button: [
        { key: 'text', label: 'Button label' },
        { key: 'url', label: 'Destination URL', kind: 'url' },
        {
            key: 'variant',
            label: 'Style',
            kind: 'select',
            options: [
                { value: 'primary', label: 'Primary' },
                { value: 'secondary', label: 'Secondary' },
            ],
        },
        {
            key: 'size',
            label: 'Size',
            kind: 'select',
            options: [
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
            ],
        },
        { key: 'fullWidth', label: 'Full width', kind: 'checkbox' },
        { key: 'newTab', label: 'Open in new tab', kind: 'checkbox' },
    ],
    video: [
        { key: 'title', label: 'Accessible title' },
        { key: 'src', label: 'YouTube, Vimeo, or video URL', kind: 'url' },
        { key: 'poster', label: 'Poster image URL', kind: 'url' },
        { key: 'controls', label: 'Show controls', kind: 'checkbox' },
        { key: 'autoplay', label: 'Autoplay muted', kind: 'checkbox' },
    ],
    code: [
        {
            key: 'language',
            label: 'Language',
            kind: 'select',
            options: [
                { value: 'html', label: 'HTML' },
                { value: 'javascript', label: 'JavaScript embed' },
            ],
        },
        { key: 'code', label: 'Embed code', kind: 'textarea', rows: 12 },
    ],
    map: [
        { key: 'address', label: 'Address or place' },
        { key: 'zoom', label: 'Zoom', kind: 'number', min: 1, max: 20 },
        { key: 'height', label: 'Height', placeholder: '300px' },
    ],
    testimonial: [
        { key: 'quote', label: 'Quote', kind: 'textarea', rows: 4 },
        { key: 'author', label: 'Customer name' },
        { key: 'position', label: 'Role and company' },
        { key: 'avatar', label: 'Avatar URL', kind: 'url' },
        { key: 'rating', label: 'Rating', kind: 'number', min: 1, max: 5 },
    ],
    calendar: [
        { key: 'title', label: 'Calendar title' },
        { key: 'embedUrl', label: 'Scheduling embed URL', kind: 'url', placeholder: 'https://cal.com/…' },
        { key: 'height', label: 'Height', placeholder: '650px' },
    ],
    ecommerce: [
        { key: 'name', label: 'Product name' },
        { key: 'price', label: 'Price' },
        { key: 'image', label: 'Product image URL', kind: 'url' },
        { key: 'description', label: 'Description', kind: 'textarea', rows: 4 },
        { key: 'buyUrl', label: 'Checkout URL', kind: 'url' },
        { key: 'buttonText', label: 'Button label' },
    ],
    audio: [
        { key: 'title', label: 'Audio title' },
        { key: 'src', label: 'Audio URL', kind: 'url' },
        { key: 'controls', label: 'Show controls', kind: 'checkbox' },
        { key: 'autoplay', label: 'Autoplay', kind: 'checkbox' },
    ],
    countdown: [
        { key: 'title', label: 'Countdown title' },
        { key: 'targetDate', label: 'Target date', kind: 'datetime-local' },
        { key: 'showDays', label: 'Show days', kind: 'checkbox' },
        { key: 'showHours', label: 'Show hours', kind: 'checkbox' },
        { key: 'showMinutes', label: 'Show minutes', kind: 'checkbox' },
        { key: 'showSeconds', label: 'Show seconds', kind: 'checkbox' },
    ],
    spacer: [{ key: 'height', label: 'Height', placeholder: '50px' }],
    'woocommerce-product': [
        { key: 'productId', label: 'WooCommerce product ID' },
        { key: 'name', label: 'Product name' },
        { key: 'price', label: 'Price' },
        { key: 'image', label: 'Product image URL', kind: 'url' },
        { key: 'description', label: 'Description', kind: 'textarea', rows: 3 },
        { key: 'productUrl', label: 'Product URL', kind: 'url' },
        { key: 'buttonText', label: 'Button label' },
    ],
    'shopify-buy-button': [
        { key: 'shopDomain', label: 'Shop domain', placeholder: 'store.myshopify.com' },
        { key: 'productId', label: 'Product or variant ID' },
        { key: 'name', label: 'Product name' },
        { key: 'price', label: 'Price' },
        { key: 'image', label: 'Product image URL', kind: 'url' },
        { key: 'description', label: 'Description', kind: 'textarea', rows: 3 },
        { key: 'productUrl', label: 'Product or cart URL', kind: 'url' },
        { key: 'buttonText', label: 'Button label' },
    ],
};

const inputClass = 'w-full rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground';

export default function BlockContentInspector({ block, onUpdate }: BlockContentInspectorProps) {
    const updateContent = (updates: Record<string, unknown>) => onUpdate({ content: { ...block.content, ...updates } });

    const renderField = (field: FieldDefinition) => {
        const kind = field.kind || 'text';
        const label = <span className="mb-1 block text-xs font-medium text-muted-foreground">{field.label}</span>;

        if (kind === 'checkbox') {
            return (
                <label key={field.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                        type="checkbox"
                        checked={contentBoolean(block.content, field.key)}
                        onChange={(event) => updateContent({ [field.key]: event.target.checked })}
                        className="accent-primary"
                    />
                    {field.label}
                </label>
            );
        }

        if (kind === 'textarea') {
            return (
                <label key={field.key}>
                    {label}
                    <textarea
                        value={contentString(block.content, field.key)}
                        onChange={(event) => updateContent({ [field.key]: event.target.value })}
                        placeholder={field.placeholder}
                        rows={field.rows || 4}
                        className={inputClass}
                    />
                </label>
            );
        }

        if (kind === 'select') {
            return (
                <label key={field.key}>
                    {label}
                    <select
                        value={contentString(block.content, field.key)}
                        onChange={(event) => updateContent({ [field.key]: event.target.value })}
                        className={inputClass}
                    >
                        {(field.options || []).map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            );
        }

        if (kind === 'number') {
            return (
                <label key={field.key}>
                    {label}
                    <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        value={contentNumber(block.content, field.key)}
                        onChange={(event) => updateContent({ [field.key]: Number(event.target.value) })}
                        className={inputClass}
                    />
                </label>
            );
        }

        if (kind === 'datetime-local') {
            const value = contentString(block.content, field.key).slice(0, 16);
            return (
                <label key={field.key}>
                    {label}
                    <input
                        type="datetime-local"
                        value={value}
                        onChange={(event) => updateContent({ [field.key]: event.target.value })}
                        className={inputClass}
                    />
                </label>
            );
        }

        return (
            <label key={field.key}>
                {label}
                <input
                    type={kind}
                    value={contentString(block.content, field.key, kind === 'color' ? '#000000' : '')}
                    onChange={(event) => updateContent({ [field.key]: event.target.value })}
                    placeholder={field.placeholder}
                    className={inputClass}
                />
            </label>
        );
    };

    if (block.type === 'team') {
        const members = getTeamMembers(block.content);
        return (
            <div className="space-y-3 border-b border-border pb-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Team members</h4>
                    <button
                        type="button"
                        onClick={() => updateContent({ members: [...members, { name: 'New member', position: '', photo: '', bio: '' }] })}
                        className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
                    >
                        <Plus className="h-3 w-3" /> Add
                    </button>
                </div>
                {members.map((member, index) => (
                    <div key={`${member.name}-${index}`} className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex justify-between text-xs font-medium">
                            <span>Member {index + 1}</span>
                            <button
                                type="button"
                                onClick={() => updateContent({ members: members.filter((_, memberIndex) => memberIndex !== index) })}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        {(['name', 'position', 'photo', 'bio'] as const).map((key) => (
                            <label key={key}>
                                <span className="mb-1 block text-[11px] text-muted-foreground capitalize">{key}</span>
                                {key === 'bio' ? (
                                    <textarea
                                        rows={2}
                                        value={member[key]}
                                        onChange={(event) =>
                                            updateContent({
                                                members: members.map((item, memberIndex) =>
                                                    memberIndex === index ? { ...item, [key]: event.target.value } : item,
                                                ),
                                            })
                                        }
                                        className={inputClass}
                                    />
                                ) : (
                                    <input
                                        type={key === 'photo' ? 'url' : 'text'}
                                        value={member[key]}
                                        onChange={(event) =>
                                            updateContent({
                                                members: members.map((item, memberIndex) =>
                                                    memberIndex === index ? { ...item, [key]: event.target.value } : item,
                                                ),
                                            })
                                        }
                                        className={inputClass}
                                    />
                                )}
                            </label>
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    if (block.type === 'chart') {
        const data = getChartData(block.content);
        return (
            <div className="space-y-3 border-b border-border pb-4">
                {renderField({ key: 'title', label: 'Chart title' })}
                {renderField({ key: 'type', label: 'Chart style', kind: 'select', options: [{ value: 'bar', label: 'Horizontal bars' }] })}
                <label>
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">Data (Label: value)</span>
                    <textarea
                        rows={6}
                        value={data.map((datum) => `${datum.label}: ${datum.value}`).join('\n')}
                        onChange={(event) =>
                            updateContent({
                                data: event.target.value.split('\n').flatMap((line) => {
                                    const separator = line.lastIndexOf(':');
                                    if (separator < 0) return [];
                                    const value = Number(line.slice(separator + 1).trim());
                                    return Number.isFinite(value) ? [{ label: line.slice(0, separator).trim() || 'Item', value }] : [];
                                }),
                            })
                        }
                        placeholder={'Leads: 120\nSales: 38'}
                        className={inputClass}
                    />
                </label>
            </div>
        );
    }

    if (block.type === 'social') {
        const links = getSocialLinks(block.content);
        return (
            <div className="space-y-3 border-b border-border pb-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Social links</h4>
                    <button
                        type="button"
                        onClick={() => updateContent({ links: [...links, { platform: 'website', url: '' }] })}
                        className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
                    >
                        <Plus className="h-3 w-3" /> Add
                    </button>
                </div>
                {links.map((link, index) => (
                    <div key={`${link.platform}-${index}`} className="grid grid-cols-[90px_minmax(0,1fr)_auto] gap-1">
                        <input
                            value={link.platform}
                            onChange={(event) =>
                                updateContent({
                                    links: links.map((item, linkIndex) => (linkIndex === index ? { ...item, platform: event.target.value } : item)),
                                })
                            }
                            className={inputClass}
                        />
                        <input
                            type="url"
                            value={link.url}
                            onChange={(event) =>
                                updateContent({
                                    links: links.map((item, linkIndex) => (linkIndex === index ? { ...item, url: event.target.value } : item)),
                                })
                            }
                            placeholder="https://…"
                            className={inputClass}
                        />
                        <button
                            type="button"
                            onClick={() => updateContent({ links: links.filter((_, linkIndex) => linkIndex !== index) })}
                            className="px-1 text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        );
    }

    const fields = definitions[block.type];
    if (!fields) return null;

    return <div className="space-y-3 border-b border-border pb-4">{fields.map(renderField)}</div>;
}
