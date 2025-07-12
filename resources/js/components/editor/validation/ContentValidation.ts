/**
 * Content Validation System
 * Defines which content blocks can be children of parent components
 */

export type ContentBlockType = 
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
    | 'accordion';

export type ParentType = 'section' | 'column' | ContentBlockType;

export interface ValidationRule {
    parent: ParentType;
    allowedChildren: ContentBlockType[];
    maxChildren?: number;
    minChildren?: number;
    description: string;
}

/**
 * Content validation rules
 */
export const CONTENT_VALIDATION_RULES: ValidationRule[] = [
    // Section rules
    {
        parent: 'section',
        allowedChildren: [], // Sections don't directly contain content blocks, only columns
        description: 'Sections can only contain columns'
    },
    
    // Column rules
    {
        parent: 'column',
        allowedChildren: [
            'text',
            'image', 
            'button',
            'form',
            'video',
            'code',
            'map',
            'testimonial',
            'calendar',
            'ecommerce',
            'team',
            'chart',
            'audio',
            'countdown',
            'social',
            'spacer',
            'container',
            'grid',
            'tabs',
            'accordion'
        ],
        description: 'Columns can contain most content blocks and layout containers'
    },

    // Container rules
    {
        parent: 'container',
        allowedChildren: [
            'text',
            'image',
            'button',
            'spacer',
            'social',
            'video',
            'audio'
        ],
        maxChildren: 10,
        description: 'Containers can hold basic content blocks with a limit of 10 items'
    },

    // Grid rules
    {
        parent: 'grid',
        allowedChildren: [
            'text',
            'image',
            'button',
            'ecommerce',
            'team',
            'testimonial'
        ],
        maxChildren: 12,
        description: 'Grids are best for displaying structured content like products or team members'
    },

    // Tabs rules
    {
        parent: 'tabs',
        allowedChildren: [
            'text',
            'image',
            'video',
            'chart',
            'form',
            'code'
        ],
        minChildren: 1,
        maxChildren: 8,
        description: 'Tabs can contain informational content with 1-8 tab panels'
    },

    // Accordion rules
    {
        parent: 'accordion',
        allowedChildren: [
            'text',
            'image',
            'video',
            'form'
        ],
        minChildren: 1,
        maxChildren: 10,
        description: 'Accordions work well with collapsible content sections'
    },

    // Form rules
    {
        parent: 'form',
        allowedChildren: [
            'text',
            'button'
        ],
        maxChildren: 1, // Only one submit button allowed
        description: 'Forms can contain explanatory text and one submit button'
    },

    // Team rules
    {
        parent: 'team',
        allowedChildren: [
            'text',
            'social'
        ],
        maxChildren: 5,
        description: 'Team blocks can include additional text and social links'
    },

    // Testimonial rules
    {
        parent: 'testimonial',
        allowedChildren: [
            'text',
            'social'
        ],
        maxChildren: 3,
        description: 'Testimonials can include additional quotes and social proof'
    },

    // Calendar rules
    {
        parent: 'calendar',
        allowedChildren: [
            'text',
            'button'
        ],
        maxChildren: 2,
        description: 'Calendars can have instructional text and action buttons'
    },

    // Chart rules
    {
        parent: 'chart',
        allowedChildren: [
            'text'
        ],
        maxChildren: 1,
        description: 'Charts can include a caption or description'
    },

    // E-commerce rules
    {
        parent: 'ecommerce',
        allowedChildren: [
            'text',
            'button',
            'image'
        ],
        maxChildren: 3,
        description: 'Product blocks can include additional images, descriptions, and action buttons'
    }
];

/**
 * Get validation rule for a parent type
 */
export function getValidationRule(parentType: ParentType): ValidationRule | null {
    return CONTENT_VALIDATION_RULES.find(rule => rule.parent === parentType) || null;
}

/**
 * Check if a content block type can be added as a child of a parent
 */
export function canAddChild(
    parentType: ParentType, 
    childType: ContentBlockType, 
    currentChildren: ContentBlockType[] = []
): { 
    allowed: boolean; 
    reason?: string; 
} {
    const rule = getValidationRule(parentType);
    
    if (!rule) {
        return { 
            allowed: false, 
            reason: `No validation rule found for parent type: ${parentType}` 
        };
    }

    // Check if child type is allowed
    if (!rule.allowedChildren.includes(childType)) {
        return { 
            allowed: false, 
            reason: `${childType} blocks are not allowed in ${parentType}. ${rule.description}` 
        };
    }

    // Check maximum children limit
    if (rule.maxChildren && currentChildren.length >= rule.maxChildren) {
        return { 
            allowed: false, 
            reason: `Maximum ${rule.maxChildren} children allowed in ${parentType}` 
        };
    }

    // Special validation for specific combinations
    if (parentType === 'form' && childType === 'button') {
        const hasButton = currentChildren.includes('button');
        if (hasButton) {
            return { 
                allowed: false, 
                reason: 'Forms can only have one button' 
            };
        }
    }

    return { allowed: true };
}

/**
 * Check if minimum children requirement is met
 */
export function validateMinChildren(
    parentType: ParentType, 
    currentChildren: ContentBlockType[]
): { 
    valid: boolean; 
    reason?: string; 
} {
    const rule = getValidationRule(parentType);
    
    if (!rule || !rule.minChildren) {
        return { valid: true };
    }

    if (currentChildren.length < rule.minChildren) {
        return { 
            valid: false, 
            reason: `${parentType} requires at least ${rule.minChildren} children` 
        };
    }

    return { valid: true };
}

/**
 * Get all allowed children for a parent type
 */
export function getAllowedChildren(parentType: ParentType): ContentBlockType[] {
    const rule = getValidationRule(parentType);
    return rule ? rule.allowedChildren : [];
}

/**
 * Get content validation summary for UI display
 */
export function getValidationSummary(parentType: ParentType): {
    allowedChildren: ContentBlockType[];
    maxChildren?: number;
    minChildren?: number;
    description: string;
} | null {
    const rule = getValidationRule(parentType);
    
    if (!rule) return null;

    return {
        allowedChildren: rule.allowedChildren,
        maxChildren: rule.maxChildren,
        minChildren: rule.minChildren,
        description: rule.description
    };
}

/**
 * Validate entire content structure
 */
export function validateContentStructure(structure: Record<string, unknown>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
} {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation - can be extended based on your specific structure
    if (!structure || typeof structure !== 'object') {
        errors.push('Invalid content structure provided');
    }

    // Add more validation logic here as needed
    // This would recursively validate the entire structure
    // Implementation depends on your data structure format

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Get suggested content blocks for a parent type
 */
export function getSuggestedBlocks(parentType: ParentType): {
    type: ContentBlockType;
    priority: 'high' | 'medium' | 'low';
    reason: string;
}[] {
    const suggestions: { [key in ParentType]?: { type: ContentBlockType; priority: 'high' | 'medium' | 'low'; reason: string; }[] } = {
        column: [
            { type: 'text', priority: 'high', reason: 'Most common content type' },
            { type: 'image', priority: 'high', reason: 'Visual content engages users' },
            { type: 'button', priority: 'medium', reason: 'Call-to-action elements' }
        ],
        container: [
            { type: 'text', priority: 'high', reason: 'Perfect for grouped content' },
            { type: 'button', priority: 'medium', reason: 'Action buttons work well in containers' }
        ],
        grid: [
            { type: 'ecommerce', priority: 'high', reason: 'Products display beautifully in grids' },
            { type: 'team', priority: 'high', reason: 'Team members work well in grid layout' },
            { type: 'testimonial', priority: 'medium', reason: 'Testimonials can be showcased in grids' }
        ],
        tabs: [
            { type: 'text', priority: 'high', reason: 'Text content works well in tabs' },
            { type: 'chart', priority: 'medium', reason: 'Data visualization for different tab views' },
            { type: 'form', priority: 'medium', reason: 'Different forms for different purposes' }
        ],
        accordion: [
            { type: 'text', priority: 'high', reason: 'Perfect for FAQ content' },
            { type: 'form', priority: 'medium', reason: 'Progressive forms in collapsible sections' }
        ]
    };

    return suggestions[parentType] || [];
}
