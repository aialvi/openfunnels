import { getFormFields } from '@/lib/form-fields';
import type { FormField } from '@/types/editor';

function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function attributes(field: FormField): string {
    return [
        `name="${escapeHtml(field.name)}"`,
        field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : '',
        field.required ? 'required' : '',
    ]
        .filter(Boolean)
        .join(' ');
}

function renderField(field: FormField, react: boolean): string {
    const classAttribute = react ? 'className' : 'class';
    const inputClass = `${classAttribute}="w-full rounded border border-gray-300 p-2"`;
    const close = react ? ' />' : '>';
    const valueAttribute = react ? 'defaultValue' : 'value';

    if (field.type === 'hidden') {
        return `<input type="hidden" name="${escapeHtml(field.name)}" ${valueAttribute}="${escapeHtml(field.defaultValue || '')}"${close}`;
    }

    if (field.type === 'checkbox') {
        return `<label ${classAttribute}="flex items-center gap-2"><input type="checkbox" ${attributes(field)} value="${escapeHtml(field.defaultValue || 'yes')}"${close}<span>${escapeHtml(field.label)}${field.required ? ' *' : ''}</span></label>`;
    }

    const label = `<span ${classAttribute}="mb-1 block text-sm font-medium">${escapeHtml(field.label)}${field.required ? ' *' : ''}</span>`;

    if (field.type === 'textarea') {
        return `<label>${label}<textarea ${attributes(field)} ${inputClass}>${escapeHtml(field.defaultValue || '')}</textarea></label>`;
    }

    if (field.type === 'select') {
        const options = (field.options || []).map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('');
        return `<label>${label}<select ${attributes(field)} ${inputClass}><option value="">${escapeHtml(field.placeholder || 'Select an option')}</option>${options}</select></label>`;
    }

    return `<label>${label}<input type="${field.type}" ${attributes(field)} ${valueAttribute}="${escapeHtml(field.defaultValue || '')}" ${inputClass}${close}</label>`;
}

export function renderFormMarkup(content: Record<string, unknown>, react = false): string {
    const classAttribute = react ? 'className' : 'class';
    const title = escapeHtml((content.title as string) || 'Contact us');
    const button = escapeHtml((content.buttonText as string) || 'Submit');
    const fields = getFormFields(content)
        .map((field) => renderField(field, react))
        .join('\n');

    return `<form ${classAttribute}="space-y-4">
<h3 ${classAttribute}="font-semibold">${title}</h3>
${fields}
<button type="submit" ${classAttribute}="w-full rounded bg-blue-600 p-2 text-white">${button}</button>
</form>`;
}
