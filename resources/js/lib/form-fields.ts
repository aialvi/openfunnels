import type { FormField, FormFieldType } from '@/types/editor';

const FIELD_TYPES: FormFieldType[] = ['text', 'email', 'tel', 'number', 'url', 'textarea', 'select', 'checkbox', 'hidden'];

export const configurableFieldTypes: Array<{ value: FormFieldType; label: string }> = [
    { value: 'text', label: 'Short text' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'url', label: 'URL' },
    { value: 'textarea', label: 'Long text' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'hidden', label: 'Hidden value' },
];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFieldType(value: unknown): value is FormFieldType {
    return typeof value === 'string' && FIELD_TYPES.includes(value as FormFieldType);
}

export function normalizeFieldName(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 64);
}

function inferFieldName(field: Record<string, unknown>, index: number): string {
    if (typeof field.name === 'string' && normalizeFieldName(field.name)) return normalizeFieldName(field.name);

    const label = typeof field.label === 'string' ? field.label : '';
    const inferred = normalizeFieldName(label);

    if (field.type === 'email') return 'email';
    if (field.type === 'tel' && (!inferred || inferred === 'phone_number')) return 'phone';

    return inferred || `field_${index + 1}`;
}

function parseConfiguredFields(value: unknown): FormField[] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((item, index) => {
        if (!isRecord(item)) return [];

        const name = inferFieldName(item, index);
        const type = isFieldType(item.type) ? item.type : name === 'email' ? 'email' : 'text';
        const label = typeof item.label === 'string' && item.label.trim() ? item.label.trim() : name.replace(/_/g, ' ');

        return [
            {
                id: typeof item.id === 'string' && item.id ? item.id : `${name}-${index + 1}`,
                name,
                label,
                type,
                placeholder: typeof item.placeholder === 'string' ? item.placeholder : undefined,
                required: name === 'email' ? true : item.required === true,
                options: Array.isArray(item.options) ? item.options.filter((option): option is string => typeof option === 'string') : undefined,
                defaultValue: typeof item.defaultValue === 'string' ? item.defaultValue : undefined,
            } satisfies FormField,
        ];
    });
}

function legacyFields(content: Record<string, unknown>): FormField[] {
    const fields: FormField[] = [];

    if (content.showName !== false) {
        fields.push({
            id: 'name',
            name: 'name',
            label: 'Name',
            type: 'text',
            placeholder: typeof content.namePlaceholder === 'string' ? content.namePlaceholder : 'Your name',
            required: false,
        });
    }

    fields.push({
        id: 'email',
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: typeof content.placeholder === 'string' ? content.placeholder : 'Enter your email',
        required: true,
    });

    if (content.showPhone === true) {
        fields.push({
            id: 'phone',
            name: 'phone',
            label: 'Phone',
            type: 'tel',
            placeholder: typeof content.phonePlaceholder === 'string' ? content.phonePlaceholder : 'Phone number',
            required: false,
        });
    }

    return fields;
}

export function getFormFields(content: Record<string, unknown>): FormField[] {
    const configured = parseConfiguredFields(content.fields);
    const fields = configured.length > 0 ? configured : legacyFields(content);

    if (!fields.some((field) => field.name === 'email')) {
        fields.unshift({ id: 'email', name: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email', required: true });
    }

    return fields.map((field) => (field.name === 'email' ? { ...field, type: 'email', required: true } : field));
}

export function createFormField(fields: FormField[]): FormField {
    let suffix = fields.length + 1;
    let name = `custom_field_${suffix}`;

    while (fields.some((field) => field.name === name)) {
        suffix++;
        name = `custom_field_${suffix}`;
    }

    return {
        id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        label: 'Custom field',
        type: 'text',
        placeholder: 'Enter a value',
        required: false,
    };
}
