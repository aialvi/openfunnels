/**
 * Canonical type definitions for the funnel page builder.
 * All editor components should import from here — do NOT define
 * duplicate Section / Column / Block types elsewhere.
 */

// ---------------------------------------------------------------------------
// Block
// ---------------------------------------------------------------------------

export type BlockType =
    | 'text'
    | 'image'
    | 'button'
    | 'form'
    | 'video'
    | 'code'
    | 'map'
    | 'testimonial'
    | 'calendar'
    | 'ecommerce'
    | 'team'
    | 'chart'
    | 'audio'
    | 'countdown'
    | 'social'
    | 'spacer'
    | 'container'
    | 'grid'
    | 'tabs'
    | 'accordion'
    | 'woocommerce-product'
    | 'shopify-buy-button';

export interface BlockSettings {
    padding: string;
    margin: string;
    backgroundColor: string;
    borderRadius: string;
    animation?: string;
}

export type FormFieldType = 'text' | 'email' | 'tel' | 'number' | 'url' | 'textarea' | 'select' | 'checkbox' | 'hidden';

export interface FormField {
    id: string;
    name: string;
    label: string;
    type: FormFieldType;
    placeholder?: string;
    required: boolean;
    options?: string[];
    defaultValue?: string;
    step?: number;
    condition?: FormFieldCondition;
}

export type FormConditionOperator = 'equals' | 'not_equals' | 'contains';

export interface FormFieldCondition {
    field: string;
    operator: FormConditionOperator;
    value: string;
}

export type FormSuccessAction = { type: 'message' } | { type: 'redirect'; url: string } | { type: 'download'; url: string };

export interface Block {
    id: string;
    type: BlockType;
    content: Record<string, unknown>;
    settings: BlockSettings;
    children?: Block[];
}

// ---------------------------------------------------------------------------
// Column
// ---------------------------------------------------------------------------

export interface ColumnSettings {
    padding: string;
    backgroundColor: string;
    verticalAlign: 'top' | 'middle' | 'bottom';
}

export interface Column {
    id: string;
    type: 'column';
    width: number; // percentage
    blocks: Block[];
    settings: ColumnSettings;
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export type SectionLayout = 'single' | 'two-column' | 'three-column' | 'two-column-66-33' | 'two-column-33-66' | 'four-column' | 'custom';

export interface SectionSettings {
    backgroundColor: string;
    padding: string;
    margin: string;
    minHeight: string;
    fullWidth: boolean;
    backgroundImage?: string;
}

export interface Section {
    id: string;
    type: 'section';
    layout: SectionLayout;
    columns: Column[];
    settings: SectionSettings;
}

// ---------------------------------------------------------------------------
// Funnel
// ---------------------------------------------------------------------------

export interface FunnelSettings {
    backgroundColor: string;
    maxWidth: string;
    fontFamily?: string;
}

export interface Funnel {
    id?: number;
    revision?: number;
    name: string;
    description?: string;
    content: {
        sections: Section[];
    };
    settings: FunnelSettings;
    status: 'draft' | 'published' | 'archived';
    is_published: boolean;
    public_url?: string | null;
}

export interface TemplateManifest {
    kind: 'openfunnels-template';
    schemaVersion: 1;
    metadata: {
        name: string;
        description?: string;
        category: string;
        author?: string;
        tags: string[];
    };
    funnel: {
        content: Funnel['content'];
        settings: FunnelSettings;
    };
}
