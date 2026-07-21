import type { FormField } from '@/types/editor';

interface FormFieldsProps {
    fields: FormField[];
    formId: string;
    disabled?: boolean;
    values?: Record<string, string>;
    onValueChange?: (name: string, value: string) => void;
    enforceRequired?: boolean;
}

const inputClass = 'w-full rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400 disabled:bg-gray-50';

export default function FormFields({ fields, formId, disabled = false, values = {}, onValueChange, enforceRequired = true }: FormFieldsProps) {
    return fields.map((field) => {
        const inputId = `${formId}-${field.id}`;

        if (field.type === 'hidden') {
            return <input key={field.id} name={field.name} type="hidden" value={field.defaultValue || ''} disabled={disabled} readOnly />;
        }

        if (field.type === 'checkbox') {
            return (
                <label key={field.id} htmlFor={inputId} className="flex items-start gap-2 text-sm text-gray-700">
                    <input
                        id={inputId}
                        name={field.name}
                        type="checkbox"
                        value={field.defaultValue || 'yes'}
                        required={field.required && enforceRequired}
                        onChange={(event) => onValueChange?.(field.name, event.target.checked ? event.target.value : '')}
                        disabled={disabled}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300"
                    />
                    <span>
                        {field.label}
                        {field.required ? ' *' : ''}
                    </span>
                </label>
            );
        }

        return (
            <label key={field.id} htmlFor={inputId} className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required ? ' *' : ''}
                </span>
                {field.type === 'textarea' ? (
                    <textarea
                        id={inputId}
                        name={field.name}
                        placeholder={field.placeholder}
                        required={field.required && enforceRequired}
                        disabled={disabled}
                        defaultValue={values[field.name] ?? field.defaultValue}
                        rows={4}
                        className={inputClass}
                        onChange={(event) => onValueChange?.(field.name, event.target.value)}
                    />
                ) : field.type === 'select' ? (
                    <select
                        id={inputId}
                        name={field.name}
                        required={field.required && enforceRequired}
                        disabled={disabled}
                        defaultValue={values[field.name] ?? field.defaultValue ?? ''}
                        className={inputClass}
                        onChange={(event) => onValueChange?.(field.name, event.target.value)}
                    >
                        <option value="" disabled={field.required}>
                            {field.placeholder || 'Select an option'}
                        </option>
                        {(field.options || []).map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        id={inputId}
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required && enforceRequired}
                        disabled={disabled}
                        defaultValue={values[field.name] ?? field.defaultValue}
                        className={inputClass}
                        onChange={(event) => onValueChange?.(field.name, event.target.value)}
                    />
                )}
            </label>
        );
    });
}
