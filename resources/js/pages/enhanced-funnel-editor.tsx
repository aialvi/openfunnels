import ContentBlockLibrary from '@/components/editor/ContentBlockLibrary';
import ExportModal from '@/components/editor/ExportModal';
import FunnelSettingsModal from '@/components/editor/FunnelSettingsModal';
import LayoutBuilder from '@/components/editor/LayoutBuilder';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    ClipboardList,
    Download,
    Eye,
    FilePlus2,
    FileText,
    Gift,
    Globe,
    GraduationCap,
    HeartHandshake,
    Home,
    Layout,
    Mail,
    MonitorPlay,
    MousePointerClick,
    Palette,
    PartyPopper,
    Redo,
    Rocket,
    Save,
    ShoppingBag,
    Sparkles,
    Undo,
    Wrench,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { useFunnelPersistence } from '@/hooks/useFunnelPersistence';
import { parseTemplateManifest, templateManifestToFunnel } from '@/lib/templates';
import { findBlockLocation, getSelectedBlock, getSelectedColumn, getSelectedSection, useFunnelStore } from '@/stores/funnelStore';
import type { Block, Funnel, Section } from '@/types/editor';

interface EnhancedFunnelEditorProps {
    funnel?: {
        id: number;
        name: string;
        slug: string;
        description?: string;
        content: Record<string, unknown>;
        settings: Funnel['settings'];
        status: string;
        is_published: boolean;
        public_url?: string | null;
        revision: number;
        updated_at?: string;
        domains: DomainMapping[];
    };
    domainMapping?: DomainMappingSettings;
}

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

type EditorMode = 'editor' | 'design';

type StarterTemplateId =
    | 'blank'
    | 'lead-magnet'
    | 'webinar'
    | 'product-launch'
    | 'consultation'
    | 'waitlist'
    | 'newsletter'
    | 'quote-request'
    | 'event-rsvp'
    | 'course'
    | 'local-service'
    | 'real-estate'
    | 'nonprofit'
    | 'ecommerce-promo'
    | 'case-study'
    | 'saas-demo';

interface StarterTemplate {
    id: StarterTemplateId;
    name: string;
    category: 'Lead capture' | 'Sales' | 'Events' | 'Services' | 'Industry';
    description: string;
    preview: 'split-form' | 'centered-form' | 'split-media' | 'proof-grid' | 'event' | 'metrics';
    icon: typeof Sparkles;
    funnelName: string;
    sections: Section[];
}

const baseSettings = {
    padding: '0px',
    margin: '0px',
    backgroundColor: 'transparent',
    borderRadius: '0px',
};

function block(id: string, type: Block['type'], content: Record<string, unknown>, settings: Partial<Block['settings']> = {}): Block {
    return {
        id,
        type,
        content,
        settings: {
            ...baseSettings,
            padding: '8px',
            ...settings,
        },
    };
}

function column(id: string, width: number, blocks: Block[]): Section['columns'][number] {
    return {
        id,
        type: 'column',
        width,
        blocks,
        settings: {
            padding: '12px',
            backgroundColor: 'transparent',
            verticalAlign: 'middle',
        },
    };
}

function section(id: string, layout: Section['layout'], columns: Section['columns'], settings: Partial<Section['settings']> = {}): Section {
    return {
        id,
        type: 'section',
        layout,
        columns,
        settings: {
            backgroundColor: '#ffffff',
            padding: '72px 48px',
            margin: '0px',
            minHeight: 'auto',
            fullWidth: false,
            ...settings,
        },
    };
}

const starterTemplates: StarterTemplate[] = [
    {
        id: 'lead-magnet',
        name: 'Lead Magnet',
        category: 'Lead capture',
        description: 'Headline, benefit bullets, opt-in form, and social proof.',
        preview: 'split-form',
        icon: Gift,
        funnelName: 'Lead Magnet Funnel',
        sections: [
            section('lead-hero', 'two-column-66-33', [
                column('lead-hero-copy', 62, [
                    block('lead-eyebrow', 'text', { text: 'Free Growth Guide', fontSize: '14px', color: '#f97316', fontWeight: '700' }),
                    block('lead-headline', 'text', {
                        text: 'Get the 7-step funnel checklist used by high-converting teams',
                        fontSize: '44px',
                        color: '#111827',
                        fontWeight: '800',
                    }),
                    block('lead-subhead', 'text', {
                        text: 'Capture better leads, fix conversion leaks, and launch faster without rebuilding your funnel from scratch.',
                        fontSize: '18px',
                        color: '#4b5563',
                    }),
                ]),
                column('lead-hero-form', 38, [
                    block(
                        'lead-form',
                        'form',
                        {
                            title: 'Send me the checklist',
                            placeholder: 'Work email',
                            namePlaceholder: 'Full name',
                            buttonText: 'Get the free guide',
                            successMessage: 'Check your inbox for the checklist.',
                        },
                        { padding: '28px', backgroundColor: '#f9fafb', borderRadius: '12px' },
                    ),
                ]),
            ]),
            section(
                'lead-proof',
                'three-column',
                [
                    column('lead-proof-1', 33.33, [
                        block('lead-proof-text-1', 'text', {
                            text: 'Clarify your offer in minutes',
                            fontSize: '18px',
                            color: '#111827',
                            fontWeight: '700',
                        }),
                    ]),
                    column('lead-proof-2', 33.33, [
                        block('lead-proof-text-2', 'text', {
                            text: 'Map every step from click to close',
                            fontSize: '18px',
                            color: '#111827',
                            fontWeight: '700',
                        }),
                    ]),
                    column('lead-proof-3', 33.33, [
                        block('lead-proof-text-3', 'text', {
                            text: 'Turn form fills into follow-up tasks',
                            fontSize: '18px',
                            color: '#111827',
                            fontWeight: '700',
                        }),
                    ]),
                ],
                { backgroundColor: '#f3f4f6', padding: '40px 48px' },
            ),
        ],
    },
    {
        id: 'webinar',
        name: 'Webinar Registration',
        category: 'Events',
        description: 'Event promise, agenda, speaker proof, and registration form.',
        preview: 'event',
        icon: CalendarDays,
        funnelName: 'Webinar Registration Funnel',
        sections: [
            section(
                'webinar-hero',
                'single',
                [
                    column('webinar-hero-copy', 100, [
                        block('webinar-eyebrow', 'text', {
                            text: 'Live Training',
                            fontSize: '14px',
                            color: '#f97316',
                            fontWeight: '700',
                            textAlign: 'center',
                        }),
                        block('webinar-headline', 'text', {
                            text: 'Build a funnel that turns cold traffic into booked calls',
                            fontSize: '42px',
                            color: '#111827',
                            fontWeight: '800',
                            textAlign: 'center',
                        }),
                        block('webinar-details', 'text', {
                            text: 'Thursday at 2:00 PM | 45-minute workshop plus live Q&A',
                            fontSize: '18px',
                            color: '#4b5563',
                            textAlign: 'center',
                        }),
                    ]),
                ],
                { padding: '80px 48px 40px' },
            ),
            section(
                'webinar-body',
                'two-column',
                [
                    column('webinar-agenda', 55, [
                        block('webinar-agenda-title', 'text', { text: 'What you will learn', fontSize: '28px', color: '#111827', fontWeight: '800' }),
                        block('webinar-agenda-copy', 'text', {
                            text: '1. Pick the right offer angle\n2. Capture qualified leads\n3. Follow up before interest goes cold\n4. Measure which source actually converts',
                            fontSize: '17px',
                            color: '#374151',
                        }),
                    ]),
                    column('webinar-form-column', 45, [
                        block(
                            'webinar-form',
                            'form',
                            {
                                title: 'Reserve your seat',
                                placeholder: 'Email address',
                                namePlaceholder: 'Full name',
                                buttonText: 'Register now',
                                successMessage: 'You are registered.',
                            },
                            { padding: '28px', backgroundColor: '#f9fafb', borderRadius: '12px' },
                        ),
                    ]),
                ],
                { padding: '48px' },
            ),
        ],
    },
    {
        id: 'product-launch',
        name: 'Product Launch',
        category: 'Sales',
        description: 'Launch hero, offer section, benefits, testimonials, and CTA.',
        preview: 'split-media',
        icon: Rocket,
        funnelName: 'Product Launch Funnel',
        sections: [
            section(
                'launch-hero',
                'two-column',
                [
                    column('launch-copy', 55, [
                        block('launch-eyebrow', 'text', { text: 'New Release', fontSize: '14px', color: '#f97316', fontWeight: '700' }),
                        block('launch-headline', 'text', {
                            text: 'Launch your next offer with a funnel that is ready to sell',
                            fontSize: '42px',
                            color: '#111827',
                            fontWeight: '800',
                        }),
                        block('launch-copy-text', 'text', {
                            text: 'Use this layout for productized services, digital products, templates, and limited-time campaigns.',
                            fontSize: '18px',
                            color: '#4b5563',
                        }),
                        block(
                            'launch-button',
                            'button',
                            { text: 'Join the waitlist', url: '#', backgroundColor: '#f97316', color: '#ffffff', borderRadius: '8px' },
                            { padding: '12px 18px' },
                        ),
                    ]),
                    column('launch-image', 45, [
                        block('launch-visual', 'image', {
                            src: 'https://via.placeholder.com/720x520?text=Product+Preview',
                            alt: 'Product preview',
                            width: '100%',
                            borderRadius: '16px',
                        }),
                    ]),
                ],
                { backgroundColor: '#fff7ed' },
            ),
            section('launch-benefits', 'three-column', [
                column('launch-benefit-1', 33.33, [
                    block('launch-benefit-copy-1', 'text', {
                        text: 'Clear offer positioning',
                        fontSize: '20px',
                        color: '#111827',
                        fontWeight: '800',
                    }),
                ]),
                column('launch-benefit-2', 33.33, [
                    block('launch-benefit-copy-2', 'text', {
                        text: 'Reusable launch sections',
                        fontSize: '20px',
                        color: '#111827',
                        fontWeight: '800',
                    }),
                ]),
                column('launch-benefit-3', 33.33, [
                    block('launch-benefit-copy-3', 'text', { text: 'Built-in lead capture', fontSize: '20px', color: '#111827', fontWeight: '800' }),
                ]),
            ]),
        ],
    },
    {
        id: 'consultation',
        name: 'Consultation Funnel',
        category: 'Services',
        description: 'Service pitch, qualification copy, and request-a-call form.',
        preview: 'split-form',
        icon: MousePointerClick,
        funnelName: 'Consultation Booking Funnel',
        sections: [
            section('consult-hero', 'two-column-66-33', [
                column('consult-copy', 62, [
                    block('consult-eyebrow', 'text', { text: 'Book a Strategy Call', fontSize: '14px', color: '#f97316', fontWeight: '700' }),
                    block('consult-headline', 'text', {
                        text: 'Find the fastest path from traffic to qualified sales conversations',
                        fontSize: '42px',
                        color: '#111827',
                        fontWeight: '800',
                    }),
                    block('consult-body', 'text', {
                        text: 'Use this page for agencies, consultants, coaches, and high-ticket service providers.',
                        fontSize: '18px',
                        color: '#4b5563',
                    }),
                ]),
                column('consult-form-column', 38, [
                    block(
                        'consult-form',
                        'form',
                        {
                            title: 'Request a call',
                            placeholder: 'Business email',
                            namePlaceholder: 'Full name',
                            showPhone: true,
                            phonePlaceholder: 'Phone number',
                            buttonText: 'Request consultation',
                            successMessage: 'Thanks. We will follow up shortly.',
                        },
                        { padding: '28px', backgroundColor: '#f9fafb', borderRadius: '12px' },
                    ),
                ]),
            ]),
            section(
                'consult-fit',
                'single',
                [
                    column('consult-fit-copy', 100, [
                        block('consult-fit-title', 'text', {
                            text: 'Best fit for teams that already have an offer and need more qualified pipeline.',
                            fontSize: '26px',
                            color: '#111827',
                            fontWeight: '800',
                            textAlign: 'center',
                        }),
                    ]),
                ],
                { backgroundColor: '#f3f4f6', padding: '44px 48px' },
            ),
        ],
    },
    {
        id: 'waitlist',
        name: 'Waitlist',
        category: 'Lead capture',
        description: 'Simple pre-launch signup page for products and SaaS ideas.',
        preview: 'split-form',
        icon: ClipboardList,
        funnelName: 'Waitlist Funnel',
        sections: [
            section(
                'waitlist-hero',
                'two-column',
                [
                    column('waitlist-copy', 58, [
                        block('waitlist-eyebrow', 'text', { text: 'Coming Soon', fontSize: '14px', color: '#f97316', fontWeight: '700' }),
                        block('waitlist-headline', 'text', {
                            text: 'Be first in line when we open early access',
                            fontSize: '44px',
                            color: '#111827',
                            fontWeight: '800',
                        }),
                        block('waitlist-subhead', 'text', {
                            text: 'Join the waitlist for product updates, private beta invites, and launch-only bonuses.',
                            fontSize: '18px',
                            color: '#4b5563',
                        }),
                    ]),
                    column('waitlist-form-column', 42, [
                        block(
                            'waitlist-form',
                            'form',
                            {
                                title: 'Join the waitlist',
                                placeholder: 'Email address',
                                namePlaceholder: 'Full name',
                                buttonText: 'Get early access',
                                successMessage: 'You are on the waitlist.',
                            },
                            { padding: '28px', backgroundColor: '#f9fafb', borderRadius: '12px' },
                        ),
                    ]),
                ],
                { backgroundColor: '#fff7ed' },
            ),
            section(
                'waitlist-proof',
                'three-column',
                [
                    column('waitlist-proof-1', 33.33, [
                        block('waitlist-proof-copy-1', 'text', { text: 'Early beta invites', fontSize: '18px', color: '#111827', fontWeight: '800' }),
                    ]),
                    column('waitlist-proof-2', 33.33, [
                        block('waitlist-proof-copy-2', 'text', {
                            text: 'Launch-only pricing',
                            fontSize: '18px',
                            color: '#111827',
                            fontWeight: '800',
                        }),
                    ]),
                    column('waitlist-proof-3', 33.33, [
                        block('waitlist-proof-copy-3', 'text', {
                            text: 'Behind-the-scenes updates',
                            fontSize: '18px',
                            color: '#111827',
                            fontWeight: '800',
                        }),
                    ]),
                ],
                { padding: '40px 48px' },
            ),
        ],
    },
    {
        id: 'newsletter',
        name: 'Newsletter Signup',
        category: 'Lead capture',
        description: 'Audience-building page with clear promise and opt-in.',
        preview: 'centered-form',
        icon: Mail,
        funnelName: 'Newsletter Signup Funnel',
        sections: [
            section(
                'newsletter-hero',
                'single',
                [
                    column('newsletter-copy', 100, [
                        block('newsletter-eyebrow', 'text', {
                            text: 'Weekly Briefing',
                            fontSize: '14px',
                            color: '#f97316',
                            fontWeight: '700',
                            textAlign: 'center',
                        }),
                        block('newsletter-headline', 'text', {
                            text: 'Get one practical growth idea every Monday',
                            fontSize: '42px',
                            color: '#111827',
                            fontWeight: '800',
                            textAlign: 'center',
                        }),
                        block('newsletter-subhead', 'text', {
                            text: 'No fluff. Just teardown-style lessons, funnel ideas, and experiments worth testing.',
                            fontSize: '18px',
                            color: '#4b5563',
                            textAlign: 'center',
                        }),
                    ]),
                ],
                { padding: '80px 48px 32px' },
            ),
            section(
                'newsletter-form-section',
                'single',
                [
                    column('newsletter-form-column', 100, [
                        block(
                            'newsletter-form',
                            'form',
                            {
                                title: 'Subscribe free',
                                placeholder: 'Email address',
                                showName: false,
                                buttonText: 'Subscribe',
                                successMessage: 'You are subscribed.',
                            },
                            { padding: '28px', backgroundColor: '#f9fafb', borderRadius: '12px' },
                        ),
                    ]),
                ],
                { padding: '24px 48px 72px' },
            ),
        ],
    },
    {
        id: 'quote-request',
        name: 'Quote Request',
        category: 'Services',
        description: 'Lead form for agencies, contractors, and service providers.',
        preview: 'split-form',
        icon: FileText,
        funnelName: 'Quote Request Funnel',
        sections: [
            section('quote-hero', 'two-column-66-33', [
                column('quote-copy', 62, [
                    block('quote-eyebrow', 'text', { text: 'Fast Estimate', fontSize: '14px', color: '#f97316', fontWeight: '700' }),
                    block('quote-headline', 'text', {
                        text: 'Tell us what you need and get a custom quote',
                        fontSize: '42px',
                        color: '#111827',
                        fontWeight: '800',
                    }),
                    block('quote-body', 'text', {
                        text: 'Use this layout when the next step is a sales conversation or scoped service estimate.',
                        fontSize: '18px',
                        color: '#4b5563',
                    }),
                ]),
                column('quote-form-column', 38, [
                    block(
                        'quote-form',
                        'form',
                        {
                            title: 'Request your quote',
                            placeholder: 'Email address',
                            namePlaceholder: 'Full name',
                            showPhone: true,
                            buttonText: 'Request quote',
                            successMessage: 'Your quote request was submitted.',
                        },
                        { padding: '28px', backgroundColor: '#f9fafb', borderRadius: '12px' },
                    ),
                ]),
            ]),
        ],
    },
    {
        id: 'event-rsvp',
        name: 'Event RSVP',
        category: 'Events',
        description: 'Event details, agenda, and attendance capture.',
        preview: 'event',
        icon: PartyPopper,
        funnelName: 'Event RSVP Funnel',
        sections: [
            section(
                'event-hero',
                'single',
                [
                    column('event-copy', 100, [
                        block('event-eyebrow', 'text', {
                            text: 'Private Event',
                            fontSize: '14px',
                            color: '#f97316',
                            fontWeight: '700',
                            textAlign: 'center',
                        }),
                        block('event-headline', 'text', {
                            text: 'Reserve your spot for the founder mixer',
                            fontSize: '42px',
                            color: '#111827',
                            fontWeight: '800',
                            textAlign: 'center',
                        }),
                        block('event-details', 'text', {
                            text: 'Friday at 6:30 PM | Downtown venue | Limited seats',
                            fontSize: '18px',
                            color: '#4b5563',
                            textAlign: 'center',
                        }),
                    ]),
                ],
                { backgroundColor: '#fff7ed' },
            ),
            section(
                'event-body',
                'two-column',
                [
                    column('event-agenda', 55, [
                        block('event-agenda-title', 'text', { text: 'What to expect', fontSize: '28px', color: '#111827', fontWeight: '800' }),
                        block('event-agenda-copy', 'text', {
                            text: 'Short talks, curated introductions, and practical conversations with operators in your market.',
                            fontSize: '17px',
                            color: '#374151',
                        }),
                    ]),
                    column('event-form-column', 45, [
                        block(
                            'event-form',
                            'form',
                            {
                                title: 'RSVP now',
                                placeholder: 'Email address',
                                namePlaceholder: 'Full name',
                                buttonText: 'Save my seat',
                                successMessage: 'Your RSVP is confirmed.',
                            },
                            { padding: '28px', backgroundColor: '#f9fafb', borderRadius: '12px' },
                        ),
                    ]),
                ],
                { padding: '48px' },
            ),
        ],
    },
    {
        id: 'course',
        name: 'Course Enrollment',
        category: 'Sales',
        description: 'Course promise, module preview, and enrollment interest form.',
        preview: 'proof-grid',
        icon: GraduationCap,
        funnelName: 'Course Enrollment Funnel',
        sections: [
            section('course-hero', 'two-column', [
                column('course-copy', 58, [
                    block('course-eyebrow', 'text', { text: 'Online Course', fontSize: '14px', color: '#f97316', fontWeight: '700' }),
                    block('course-headline', 'text', {
                        text: 'Learn the system behind profitable funnel launches',
                        fontSize: '42px',
                        color: '#111827',
                        fontWeight: '800',
                    }),
                    block('course-body', 'text', {
                        text: 'A practical program for founders, marketers, and agencies who want repeatable launch assets.',
                        fontSize: '18px',
                        color: '#4b5563',
                    }),
                    block(
                        'course-button',
                        'button',
                        { text: 'View curriculum', url: '#', backgroundColor: '#f97316', color: '#ffffff', borderRadius: '8px' },
                        { padding: '12px 18px' },
                    ),
                ]),
                column('course-form-column', 42, [
                    block(
                        'course-form',
                        'form',
                        {
                            title: 'Get enrollment details',
                            placeholder: 'Email address',
                            namePlaceholder: 'Full name',
                            buttonText: 'Send details',
                            successMessage: 'Course details are on the way.',
                        },
                        { padding: '28px', backgroundColor: '#f9fafb', borderRadius: '12px' },
                    ),
                ]),
            ]),
            section(
                'course-modules',
                'three-column',
                [
                    column('course-module-1', 33.33, [
                        block('course-module-copy-1', 'text', { text: 'Offer architecture', fontSize: '20px', color: '#111827', fontWeight: '800' }),
                    ]),
                    column('course-module-2', 33.33, [
                        block('course-module-copy-2', 'text', {
                            text: 'Landing page systems',
                            fontSize: '20px',
                            color: '#111827',
                            fontWeight: '800',
                        }),
                    ]),
                    column('course-module-3', 33.33, [
                        block('course-module-copy-3', 'text', { text: 'Follow-up sequences', fontSize: '20px', color: '#111827', fontWeight: '800' }),
                    ]),
                ],
                { backgroundColor: '#f3f4f6', padding: '44px 48px' },
            ),
        ],
    },
    {
        id: 'local-service',
        name: 'Local Service',
        category: 'Services',
        description: 'Conversion page for contractors, clinics, and local teams.',
        preview: 'split-form',
        icon: Wrench,
        funnelName: 'Local Service Funnel',
        sections: [
            section('service-hero', 'two-column-66-33', [
                column('service-copy', 62, [
                    block('service-eyebrow', 'text', { text: 'Same-week appointments', fontSize: '14px', color: '#f97316', fontWeight: '700' }),
                    block('service-headline', 'text', {
                        text: 'Reliable service from a local team you can reach',
                        fontSize: '42px',
                        color: '#111827',
                        fontWeight: '800',
                    }),
                    block('service-body', 'text', {
                        text: 'Use this page for home services, clinics, studios, repair shops, and local professional services.',
                        fontSize: '18px',
                        color: '#4b5563',
                    }),
                ]),
                column('service-form-column', 38, [
                    block(
                        'service-form',
                        'form',
                        {
                            title: 'Request service',
                            placeholder: 'Email address',
                            namePlaceholder: 'Full name',
                            showPhone: true,
                            buttonText: 'Request appointment',
                            successMessage: 'Your request was submitted.',
                        },
                        { padding: '28px', backgroundColor: '#f9fafb', borderRadius: '12px' },
                    ),
                ]),
            ]),
            section(
                'service-trust',
                'three-column',
                [
                    column('service-trust-1', 33.33, [
                        block('service-trust-copy-1', 'text', { text: 'Licensed team', fontSize: '18px', color: '#111827', fontWeight: '800' }),
                    ]),
                    column('service-trust-2', 33.33, [
                        block('service-trust-copy-2', 'text', { text: 'Transparent pricing', fontSize: '18px', color: '#111827', fontWeight: '800' }),
                    ]),
                    column('service-trust-3', 33.33, [
                        block('service-trust-copy-3', 'text', { text: 'Fast response', fontSize: '18px', color: '#111827', fontWeight: '800' }),
                    ]),
                ],
                { backgroundColor: '#f3f4f6', padding: '40px 48px' },
            ),
        ],
    },
    {
        id: 'real-estate',
        name: 'Real Estate Lead',
        category: 'Industry',
        description: 'Property or market report funnel for buyer/seller leads.',
        preview: 'split-form',
        icon: Home,
        funnelName: 'Real Estate Lead Funnel',
        sections: [
            section('estate-hero', 'two-column', [
                column('estate-copy', 55, [
                    block('estate-eyebrow', 'text', { text: 'Local Market Report', fontSize: '14px', color: '#f97316', fontWeight: '700' }),
                    block('estate-headline', 'text', {
                        text: 'Find out what homes like yours are selling for',
                        fontSize: '42px',
                        color: '#111827',
                        fontWeight: '800',
                    }),
                    block('estate-body', 'text', {
                        text: 'Capture seller leads with a simple report request and follow up from your CRM.',
                        fontSize: '18px',
                        color: '#4b5563',
                    }),
                ]),
                column('estate-form-column', 45, [
                    block(
                        'estate-form',
                        'form',
                        {
                            title: 'Get the report',
                            placeholder: 'Email address',
                            namePlaceholder: 'Full name',
                            showPhone: true,
                            buttonText: 'Send my report',
                            successMessage: 'Your report request was submitted.',
                        },
                        { padding: '28px', backgroundColor: '#f9fafb', borderRadius: '12px' },
                    ),
                ]),
            ]),
        ],
    },
    {
        id: 'nonprofit',
        name: 'Nonprofit Campaign',
        category: 'Industry',
        description: 'Cause story, impact proof, and supporter signup.',
        preview: 'centered-form',
        icon: HeartHandshake,
        funnelName: 'Nonprofit Campaign Funnel',
        sections: [
            section(
                'nonprofit-hero',
                'single',
                [
                    column('nonprofit-copy', 100, [
                        block('nonprofit-eyebrow', 'text', {
                            text: 'Community Campaign',
                            fontSize: '14px',
                            color: '#f97316',
                            fontWeight: '700',
                            textAlign: 'center',
                        }),
                        block('nonprofit-headline', 'text', {
                            text: 'Help fund the next 100 meals for local families',
                            fontSize: '42px',
                            color: '#111827',
                            fontWeight: '800',
                            textAlign: 'center',
                        }),
                        block('nonprofit-body', 'text', {
                            text: 'Tell the story, show the impact, and collect supporters for follow-up campaigns.',
                            fontSize: '18px',
                            color: '#4b5563',
                            textAlign: 'center',
                        }),
                    ]),
                ],
                { backgroundColor: '#fff7ed' },
            ),
            section(
                'nonprofit-form-section',
                'two-column',
                [
                    column('nonprofit-impact', 55, [
                        block('nonprofit-impact-title', 'text', {
                            text: 'Your support creates immediate impact',
                            fontSize: '28px',
                            color: '#111827',
                            fontWeight: '800',
                        }),
                        block('nonprofit-impact-body', 'text', {
                            text: '$25 can provide meals, supplies, and outreach support for families who need help this week.',
                            fontSize: '17px',
                            color: '#374151',
                        }),
                    ]),
                    column('nonprofit-form-column', 45, [
                        block(
                            'nonprofit-form',
                            'form',
                            {
                                title: 'Get campaign updates',
                                placeholder: 'Email address',
                                namePlaceholder: 'Full name',
                                buttonText: 'Join supporters',
                                successMessage: 'Thanks for joining.',
                            },
                            { padding: '28px', backgroundColor: '#f9fafb', borderRadius: '12px' },
                        ),
                    ]),
                ],
                { padding: '48px' },
            ),
        ],
    },
    {
        id: 'ecommerce-promo',
        name: 'Ecommerce Promo',
        category: 'Sales',
        description: 'Product promo page with benefits and email capture.',
        preview: 'split-media',
        icon: ShoppingBag,
        funnelName: 'Ecommerce Promotion Funnel',
        sections: [
            section(
                'shop-hero',
                'two-column',
                [
                    column('shop-copy', 55, [
                        block('shop-eyebrow', 'text', { text: 'Limited Offer', fontSize: '14px', color: '#f97316', fontWeight: '700' }),
                        block('shop-headline', 'text', {
                            text: 'Launch-week bundle for your best customers',
                            fontSize: '42px',
                            color: '#111827',
                            fontWeight: '800',
                        }),
                        block('shop-body', 'text', {
                            text: 'Use this funnel for product drops, seasonal promos, bundles, and coupon capture.',
                            fontSize: '18px',
                            color: '#4b5563',
                        }),
                        block(
                            'shop-button',
                            'button',
                            { text: 'Shop the offer', url: '#', backgroundColor: '#f97316', color: '#ffffff', borderRadius: '8px' },
                            { padding: '12px 18px' },
                        ),
                    ]),
                    column('shop-image-column', 45, [
                        block('shop-image', 'image', {
                            src: 'https://via.placeholder.com/720x520?text=Product+Bundle',
                            alt: 'Product bundle',
                            width: '100%',
                            borderRadius: '16px',
                        }),
                    ]),
                ],
                { backgroundColor: '#fff7ed' },
            ),
            section(
                'shop-form-section',
                'single',
                [
                    column('shop-form-column', 100, [
                        block(
                            'shop-form',
                            'form',
                            {
                                title: 'Get the promo code',
                                placeholder: 'Email address',
                                showName: false,
                                buttonText: 'Send my code',
                                successMessage: 'Your promo code is on the way.',
                            },
                            { padding: '28px', backgroundColor: '#f9fafb', borderRadius: '12px' },
                        ),
                    ]),
                ],
                { padding: '32px 48px 64px' },
            ),
        ],
    },
    {
        id: 'case-study',
        name: 'Case Study',
        category: 'Sales',
        description: 'Proof-first layout with results and CTA form.',
        preview: 'metrics',
        icon: FileText,
        funnelName: 'Case Study Funnel',
        sections: [
            section('case-hero', 'single', [
                column('case-copy', 100, [
                    block('case-eyebrow', 'text', {
                        text: 'Customer Story',
                        fontSize: '14px',
                        color: '#f97316',
                        fontWeight: '700',
                        textAlign: 'center',
                    }),
                    block('case-headline', 'text', {
                        text: 'How one team doubled qualified calls in 30 days',
                        fontSize: '42px',
                        color: '#111827',
                        fontWeight: '800',
                        textAlign: 'center',
                    }),
                    block('case-body', 'text', {
                        text: 'Turn proof into pipeline with a layout built around measurable outcomes.',
                        fontSize: '18px',
                        color: '#4b5563',
                        textAlign: 'center',
                    }),
                ]),
            ]),
            section(
                'case-results',
                'three-column',
                [
                    column('case-result-1', 33.33, [
                        block('case-result-copy-1', 'text', {
                            text: '+112% booked calls',
                            fontSize: '22px',
                            color: '#111827',
                            fontWeight: '800',
                            textAlign: 'center',
                        }),
                    ]),
                    column('case-result-2', 33.33, [
                        block('case-result-copy-2', 'text', {
                            text: '-38% cost per lead',
                            fontSize: '22px',
                            color: '#111827',
                            fontWeight: '800',
                            textAlign: 'center',
                        }),
                    ]),
                    column('case-result-3', 33.33, [
                        block('case-result-copy-3', 'text', {
                            text: '30-day launch',
                            fontSize: '22px',
                            color: '#111827',
                            fontWeight: '800',
                            textAlign: 'center',
                        }),
                    ]),
                ],
                { backgroundColor: '#f3f4f6', padding: '44px 48px' },
            ),
            section(
                'case-form-section',
                'single',
                [
                    column('case-form-column', 100, [
                        block(
                            'case-form',
                            'form',
                            {
                                title: 'Get the full breakdown',
                                placeholder: 'Work email',
                                namePlaceholder: 'Full name',
                                buttonText: 'Send the case study',
                                successMessage: 'The case study is on the way.',
                            },
                            { padding: '28px', backgroundColor: '#f9fafb', borderRadius: '12px' },
                        ),
                    ]),
                ],
                { padding: '40px 48px 72px' },
            ),
        ],
    },
    {
        id: 'saas-demo',
        name: 'SaaS Demo Request',
        category: 'Industry',
        description: 'B2B demo page with value prop, feature proof, and form.',
        preview: 'split-form',
        icon: MonitorPlay,
        funnelName: 'SaaS Demo Funnel',
        sections: [
            section('saas-hero', 'two-column-66-33', [
                column('saas-copy', 62, [
                    block('saas-eyebrow', 'text', { text: 'Product Demo', fontSize: '14px', color: '#f97316', fontWeight: '700' }),
                    block('saas-headline', 'text', {
                        text: 'See how your team can turn more traffic into pipeline',
                        fontSize: '42px',
                        color: '#111827',
                        fontWeight: '800',
                    }),
                    block('saas-body', 'text', {
                        text: 'Use this funnel for demo requests, sales-led SaaS offers, and high-intent product tours.',
                        fontSize: '18px',
                        color: '#4b5563',
                    }),
                ]),
                column('saas-form-column', 38, [
                    block(
                        'saas-form',
                        'form',
                        {
                            title: 'Book a demo',
                            placeholder: 'Work email',
                            namePlaceholder: 'Full name',
                            showPhone: true,
                            buttonText: 'Request demo',
                            successMessage: 'Your demo request was submitted.',
                        },
                        { padding: '28px', backgroundColor: '#f9fafb', borderRadius: '12px' },
                    ),
                ]),
            ]),
            section(
                'saas-features',
                'three-column',
                [
                    column('saas-feature-1', 33.33, [
                        block('saas-feature-copy-1', 'text', {
                            text: 'CRM-ready lead capture',
                            fontSize: '18px',
                            color: '#111827',
                            fontWeight: '800',
                        }),
                    ]),
                    column('saas-feature-2', 33.33, [
                        block('saas-feature-copy-2', 'text', { text: 'Custom domains', fontSize: '18px', color: '#111827', fontWeight: '800' }),
                    ]),
                    column('saas-feature-3', 33.33, [
                        block('saas-feature-copy-3', 'text', {
                            text: 'Fast launch templates',
                            fontSize: '18px',
                            color: '#111827',
                            fontWeight: '800',
                        }),
                    ]),
                ],
                { backgroundColor: '#f3f4f6', padding: '44px 48px' },
            ),
        ],
    },
];

const starterCategories = ['All', 'Lead capture', 'Sales', 'Events', 'Services', 'Industry'] as const;
type StarterCategory = (typeof starterCategories)[number];

function createBlankFunnel(): Funnel {
    return {
        name: 'Untitled Funnel',
        description: '',
        content: { sections: [] },
        settings: {
            backgroundColor: '#ffffff',
            maxWidth: '1200px',
            fontFamily: 'Inter, sans-serif',
        },
        status: 'draft',
        is_published: false,
    };
}

function createTemplateFunnel(template: StarterTemplate): Funnel {
    return {
        ...createBlankFunnel(),
        name: template.funnelName,
        content: {
            sections: JSON.parse(JSON.stringify(template.sections)) as Section[],
        },
    };
}

function StarterTemplatePreview({ variant }: { variant: StarterTemplate['preview'] }) {
    const line = 'rounded-full bg-foreground/20';

    if (variant === 'centered-form') {
        return (
            <div className="rounded-lg border border-border bg-muted/40 p-3">
                <div className="mx-auto mb-2 h-2 w-16 rounded-full bg-primary/60" />
                <div className={`mx-auto mb-2 h-3 w-32 ${line}`} />
                <div className={`mx-auto mb-4 h-2 w-44 ${line}`} />
                <div className="mx-auto h-12 w-40 rounded-md bg-background" />
            </div>
        );
    }

    if (variant === 'split-media') {
        return (
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-3">
                <div className="space-y-2">
                    <div className={`h-2 w-12 ${line}`} />
                    <div className={`h-3 w-24 ${line}`} />
                    <div className={`h-2 w-20 ${line}`} />
                    <div className="h-5 w-16 rounded bg-primary/70" />
                </div>
                <div className="rounded-md bg-primary/20" />
            </div>
        );
    }

    if (variant === 'proof-grid') {
        return (
            <div className="rounded-lg border border-border bg-muted/40 p-3">
                <div className={`mx-auto mb-3 h-3 w-32 ${line}`} />
                <div className="grid grid-cols-3 gap-2">
                    <div className="h-12 rounded-md bg-background" />
                    <div className="h-12 rounded-md bg-background" />
                    <div className="h-12 rounded-md bg-background" />
                </div>
            </div>
        );
    }

    if (variant === 'event') {
        return (
            <div className="rounded-lg border border-border bg-muted/40 p-3">
                <div className="mb-3 rounded-md bg-primary/20 p-3">
                    <div className={`mb-2 h-2 w-14 ${line}`} />
                    <div className={`h-3 w-36 ${line}`} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 rounded-md bg-background" />
                    <div className="h-12 rounded-md bg-background" />
                </div>
            </div>
        );
    }

    if (variant === 'metrics') {
        return (
            <div className="rounded-lg border border-border bg-muted/40 p-3">
                <div className={`mx-auto mb-3 h-3 w-36 ${line}`} />
                <div className="grid grid-cols-3 gap-2">
                    <div className="h-10 rounded-md bg-primary/20" />
                    <div className="h-10 rounded-md bg-primary/20" />
                    <div className="h-10 rounded-md bg-primary/20" />
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-[1.5fr_1fr] gap-2 rounded-lg border border-border bg-muted/40 p-3">
            <div className="space-y-2">
                <div className={`h-2 w-12 ${line}`} />
                <div className={`h-3 w-28 ${line}`} />
                <div className={`h-2 w-24 ${line}`} />
            </div>
            <div className="h-16 rounded-md bg-background" />
        </div>
    );
}

export default function EnhancedFunnelEditor({ funnel: initialFunnel, domainMapping }: EnhancedFunnelEditorProps) {
    // Editor state
    const [editorMode, setEditorMode] = useState<EditorMode>('editor');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isStarterOpen, setIsStarterOpen] = useState(!initialFunnel);
    const [starterStep, setStarterStep] = useState<'choice' | 'templates'>('choice');
    const [starterCategory, setStarterCategory] = useState<StarterCategory>('All');
    const [templateImportError, setTemplateImportError] = useState<string | null>(null);
    const templateInputRef = useRef<HTMLInputElement>(null);

    // Content block library state
    const [blockSearchQuery, setBlockSearchQuery] = useState('');
    const [blockCategory, setBlockCategory] = useState('All');

    // ── Store ─────────────────────────────────────────────────────────
    const funnel = useFunnelStore((s) => s.funnel);
    const isDirty = useFunnelStore((s) => s.isDirty);
    const isSaving = useFunnelStore((s) => s.isSaving);
    const selectedDevice = useFunnelStore((s) => s.selectedDevice);

    // Derived selections — always fresh from the live tree.
    const selectedSection = useFunnelStore(getSelectedSection);
    const selectedColumn = useFunnelStore(getSelectedColumn);
    const selectedBlock = useFunnelStore(getSelectedBlock);

    // Actions (stable references, won't cause re-renders)
    const setFunnel = useFunnelStore((s) => s.setFunnel);
    const updateFunnelName = useFunnelStore((s) => s.updateFunnelName);
    const undo = useFunnelStore((s) => s.undo);
    const redo = useFunnelStore((s) => s.redo);
    const canUndo = useFunnelStore((s) => s.canUndo);
    const canRedo = useFunnelStore((s) => s.canRedo);
    const markDirty = useFunnelStore((s) => s.markDirty);
    const selectSection = useFunnelStore((s) => s.selectSection);
    const selectColumn = useFunnelStore((s) => s.selectColumn);
    const selectBlock = useFunnelStore((s) => s.selectBlock);
    const selectDevice = useFunnelStore((s) => s.selectDevice);
    const setSections = useFunnelStore((s) => s.setSections);
    const addBlockAction = useFunnelStore((s) => s.addBlock);
    const updateBlockAction = useFunnelStore((s) => s.updateBlock);
    const deleteBlockAction = useFunnelStore((s) => s.deleteBlock);
    const updateSectionAction = useFunnelStore((s) => s.updateSection);
    const updateColumnAction = useFunnelStore((s) => s.updateColumn);

    const {
        saveFunnel,
        status: saveStatus,
        lastSaved,
        hasRecovery,
        restoreRecovery,
        discardRecovery,
        downloadRecovery,
    } = useFunnelPersistence(initialFunnel?.id, initialFunnel?.revision, initialFunnel?.updated_at);

    // Name editing state
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(funnel.name);
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Initialize funnel from props — runs once on mount.
    useEffect(() => {
        if (initialFunnel) {
            let contentObj;
            try {
                contentObj = typeof initialFunnel.content === 'string' ? JSON.parse(initialFunnel.content as string) : initialFunnel.content;
            } catch (e) {
                console.error('Error parsing content JSON:', e);
                contentObj = { sections: [] };
            }

            const sectionsArray = contentObj?.sections || [];

            setFunnel({
                id: initialFunnel.id,
                name: initialFunnel.name,
                description: initialFunnel.description || '',
                content: { sections: sectionsArray },
                settings: initialFunnel.settings,
                status: initialFunnel.status as 'draft' | 'published' | 'archived',
                is_published: initialFunnel.is_published,
                public_url: initialFunnel.public_url,
                revision: initialFunnel.revision,
            });
            setIsStarterOpen(false);
        } else {
            setFunnel(createBlankFunnel());
            setIsStarterOpen(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────

    const handleBlockAdd = useCallback(
        (sectionId: string, columnId: string, block: Block, index?: number) => {
            addBlockAction(sectionId, columnId, block, index);
        },
        [addBlockAction],
    );

    const handleBlockUpdate = useCallback(
        (blockId: string, updates: Partial<Block>) => {
            // Find the block location in the tree and write updates to the store.
            const state = useFunnelStore.getState();
            const loc = findBlockLocation(state, blockId);
            if (loc) {
                updateBlockAction(loc.sectionId, loc.columnId, blockId, updates);
            }
        },
        [updateBlockAction],
    );

    const handleBlockDelete = useCallback(
        (sectionId: string, columnId: string, blockId: string) => {
            deleteBlockAction(sectionId, columnId, blockId);
        },
        [deleteBlockAction],
    );

    // Name editing handlers
    const handleNameEdit = () => {
        setIsEditingName(true);
        setTempName(funnel.name);
        setTimeout(() => {
            nameInputRef.current?.focus();
            nameInputRef.current?.select();
        }, 0);
    };

    const handleNameSave = () => {
        if (tempName.trim() && tempName !== funnel.name) {
            updateFunnelName(tempName.trim());
        }
        setIsEditingName(false);
    };

    const handleNameCancel = () => {
        setTempName(funnel.name);
        setIsEditingName(false);
    };

    const handleNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleNameSave();
        } else if (e.key === 'Escape') {
            handleNameCancel();
        }
    };

    const handleStartBlank = () => {
        setFunnel(createBlankFunnel());
        markDirty();
        setIsStarterOpen(false);
    };

    const handleApplyTemplate = (template: StarterTemplate) => {
        setFunnel(createTemplateFunnel(template));
        markDirty();
        setIsStarterOpen(false);
        setStarterStep('choice');
    };

    const handleTemplateImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const manifest = parseTemplateManifest(await file.text());
            setFunnel(templateManifestToFunnel(manifest));
            markDirty();
            setTemplateImportError(null);
            setIsStarterOpen(false);
            setStarterStep('choice');
        } catch (error) {
            setTemplateImportError(error instanceof Error ? error.message : 'Unable to import this template.');
        } finally {
            event.target.value = '';
        }
    };

    const openStarterTemplates = () => {
        setStarterStep('templates');
        setStarterCategory('All');
    };

    const closeStarter = () => {
        setIsStarterOpen(false);
        setStarterStep('choice');
    };

    const visibleStarterTemplates =
        starterCategory === 'All' ? starterTemplates : starterTemplates.filter((template) => template.category === starterCategory);

    // Render editor mode content
    const renderEditorContent = () => {
        switch (editorMode) {
            case 'editor':
                return (
                    <div className="flex h-full">
                        {/* Main Canvas with LayoutBuilder */}
                        <div className="flex-1">
                            <LayoutBuilder
                                sections={funnel.content.sections}
                                onSectionsChange={(updatedSections) => {
                                    setSections(updatedSections);
                                }}
                                inspectorActive={Boolean(selectedSection || selectedColumn || selectedBlock)}
                                sidebarExtra={
                                    <PropertiesPanel
                                        embedded
                                        forceExpanded={Boolean(selectedSection || selectedColumn || selectedBlock)}
                                        selectedSection={selectedSection}
                                        selectedColumn={selectedColumn}
                                        selectedBlock={selectedBlock}
                                        selectedDevice={selectedDevice}
                                        onSectionUpdate={(sectionId, updates) => {
                                            updateSectionAction(sectionId, updates);
                                        }}
                                        onColumnUpdate={(sectionId, columnId, updates) => {
                                            updateColumnAction(sectionId, columnId, updates);
                                        }}
                                        onBlockUpdate={handleBlockUpdate}
                                        onDeviceChange={selectDevice}
                                    />
                                }
                                selectedSectionId={selectedSection?.id ?? null}
                                onSelectSection={(sectionId) => selectSection(sectionId)}
                                selectedColumnId={selectedColumn?.id ?? null}
                                onSelectColumn={(columnId) => selectColumn(columnId)}
                                selectedBlockId={selectedBlock?.id ?? null}
                                onSelectBlock={(blockId) => selectBlock(blockId)}
                                onBlockAdd={handleBlockAdd}
                                onBlockUpdate={handleBlockUpdate}
                                onBlockDelete={handleBlockDelete}
                            />
                        </div>

                        {/* Content Block Library Sidebar */}
                        <ContentBlockLibrary
                            searchQuery={blockSearchQuery}
                            onSearchChange={setBlockSearchQuery}
                            selectedCategory={blockCategory}
                            onCategoryChange={setBlockCategory}
                        />
                    </div>
                );

            case 'design':
                return (
                    <div className="flex h-full">
                        <div className="flex-1 p-4">
                            <div className="py-32 text-center text-muted-foreground">
                                <Palette className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                                <h3 className="mb-2 text-xl font-medium text-foreground">Design Mode</h3>
                                <p className="text-sm">Advanced styling and animation controls coming soon</p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <Head title={`Edit: ${funnel.name} - OpenFunnels`} />

            <div className="flex h-screen flex-col bg-background">
                {/* Top Toolbar */}
                <div className="border-b border-border bg-card px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('funnels.index')}
                                className="flex items-center space-x-2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to Funnels</span>
                            </Link>

                            {isEditingName ? (
                                <input
                                    ref={nameInputRef}
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    onBlur={handleNameSave}
                                    onKeyDown={handleNameKeyDown}
                                    className="border-none bg-transparent text-lg font-semibold text-foreground outline-none focus:rounded focus:border focus:border-primary focus:bg-muted focus:px-2 focus:py-1"
                                />
                            ) : (
                                <div
                                    className="cursor-pointer rounded px-2 py-1 text-lg font-semibold text-foreground transition-colors hover:bg-muted"
                                    onClick={handleNameEdit}
                                    title="Click to edit funnel name"
                                >
                                    {funnel.name}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Editor Mode Tabs */}
                            <div className="flex items-center rounded-lg bg-muted p-1">
                                <button
                                    onClick={() => setEditorMode('editor')}
                                    className={`flex items-center space-x-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
                                        editorMode === 'editor' ? 'bg-background text-primary shadow' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Layout className="h-4 w-4" />
                                    <span>Editor</span>
                                </button>
                                <button
                                    onClick={() => setEditorMode('design')}
                                    className={`flex items-center space-x-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
                                        editorMode === 'design' ? 'bg-background text-primary shadow' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Palette className="h-4 w-4" />
                                    <span>Design</span>
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={undo}
                                    disabled={!canUndo()}
                                    className={`p-2 transition-colors ${
                                        canUndo() ? 'text-muted-foreground hover:text-foreground' : 'cursor-not-allowed text-muted-foreground/50'
                                    }`}
                                    title="Undo"
                                >
                                    <Undo className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={redo}
                                    disabled={!canRedo()}
                                    className={`p-2 transition-colors ${
                                        canRedo() ? 'text-muted-foreground hover:text-foreground' : 'cursor-not-allowed text-muted-foreground/50'
                                    }`}
                                    title="Redo"
                                >
                                    <Redo className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (initialFunnel?.id) {
                                            window.open(`/funnel/${initialFunnel.id}/preview`, '_blank');
                                        }
                                    }}
                                    disabled={!initialFunnel?.id}
                                    className={`flex items-center space-x-2 rounded-lg bg-muted px-4 py-2 text-foreground transition-colors ${
                                        !initialFunnel?.id ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted/80'
                                    }`}
                                    title={initialFunnel?.id ? 'Preview funnel' : 'Save the funnel first to preview'}
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>Preview</span>
                                </button>
                                <button
                                    onClick={() => setIsExportModalOpen(true)}
                                    className="flex items-center space-x-2 rounded-lg bg-muted px-4 py-2 text-foreground hover:bg-muted/80"
                                    title="Export funnel code"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Export</span>
                                </button>
                                {!initialFunnel && (
                                    <button
                                        onClick={() => {
                                            setStarterStep('choice');
                                            setIsStarterOpen(true);
                                        }}
                                        className="flex items-center space-x-2 rounded-lg bg-muted px-4 py-2 text-foreground hover:bg-muted/80"
                                        title="Choose a starter layout"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        <span>Templates</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsSettingsModalOpen(true)}
                                    disabled={!initialFunnel?.id}
                                    className="flex items-center space-x-2 rounded-lg bg-muted px-4 py-2 text-foreground hover:bg-muted/80"
                                    title={initialFunnel?.id ? 'Domain Settings' : 'Save the funnel first to map a domain'}
                                >
                                    <Globe className="h-4 w-4" />
                                    <span>Domain Settings</span>
                                </button>
                                <button
                                    onClick={() => void saveFunnel()}
                                    disabled={isSaving}
                                    className={`flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors ${
                                        isSaving
                                            ? 'cursor-not-allowed bg-muted text-muted-foreground'
                                            : isDirty
                                              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                              : 'bg-chart-2 text-white hover:bg-chart-2/90'
                                    }`}
                                    title={
                                        saveStatus === 'conflict'
                                            ? 'Resolve the save conflict before continuing'
                                            : isDirty
                                              ? 'Save changes'
                                              : 'All changes saved'
                                    }
                                >
                                    <Save className="h-4 w-4" />
                                    <span>
                                        {isSaving
                                            ? 'Saving...'
                                            : saveStatus === 'offline'
                                              ? 'Offline'
                                              : saveStatus === 'error'
                                                ? 'Retry save'
                                                : saveStatus === 'conflict'
                                                  ? 'Conflict'
                                                  : isDirty
                                                    ? 'Save'
                                                    : 'Saved'}
                                    </span>
                                </button>

                                {/* Save Status */}
                                {lastSaved && saveStatus === 'saved' && (
                                    <div className="text-xs text-muted-foreground">Last saved: {lastSaved.toLocaleTimeString()}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {(hasRecovery || saveStatus === 'conflict') && (
                    <div className="flex items-center justify-between border-b border-amber-500/30 bg-amber-500/10 px-6 py-2 text-sm text-amber-700 dark:text-amber-300">
                        <span>
                            {saveStatus === 'conflict'
                                ? 'This funnel changed in another session. Download your local copy, then reload to review the server version.'
                                : 'A newer local recovery copy is available for this funnel.'}
                        </span>
                        <div className="flex items-center gap-2">
                            {hasRecovery && (
                                <button className="rounded bg-amber-500 px-3 py-1 font-medium text-black" onClick={restoreRecovery}>
                                    Restore
                                </button>
                            )}
                            <button className="rounded border border-amber-500/40 px-3 py-1" onClick={downloadRecovery}>
                                Download copy
                            </button>
                            {hasRecovery && (
                                <button className="px-2 py-1" onClick={discardRecovery}>
                                    Dismiss
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Editor Area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Editor Content */}
                    <div className="flex-1">{renderEditorContent()}</div>
                </div>
            </div>

            {isStarterOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-6 backdrop-blur-sm">
                    <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                        <div className="flex items-start justify-between border-b border-border px-6 py-5">
                            <div>
                                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                                    <Sparkles className="h-4 w-4" />
                                    Faster starts
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Choose how to start this funnel</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {starterStep === 'choice'
                                        ? 'Start with a blank canvas or browse proven funnel layouts.'
                                        : 'Pick a commonly used layout, then customize every section in the editor.'}
                                </p>
                            </div>
                            <button
                                onClick={closeStarter}
                                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                Skip
                            </button>
                        </div>

                        {starterStep === 'choice' ? (
                            <div className="grid gap-4 overflow-y-auto p-6 md:grid-cols-2">
                                <button
                                    onClick={handleStartBlank}
                                    className="group flex min-h-72 flex-col justify-between rounded-lg border border-border bg-background p-6 text-left transition-colors hover:border-primary/60 hover:bg-muted/40"
                                >
                                    <div>
                                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <FilePlus2 className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground">Build from scratch</h3>
                                        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                                            Open a clean canvas and create your own sections, columns, and blocks manually.
                                        </p>
                                    </div>
                                    <span className="mt-8 text-sm font-medium text-primary">Start blank</span>
                                </button>

                                <button
                                    onClick={openStarterTemplates}
                                    className="group flex min-h-72 flex-col justify-between rounded-lg border border-border bg-background p-6 text-left transition-colors hover:border-primary/60 hover:bg-muted/40"
                                >
                                    <div>
                                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground">Select a template</h3>
                                        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                                            Browse {starterTemplates.length} premade layouts for lead capture, sales, events, services, and industry
                                            pages.
                                        </p>
                                    </div>
                                    <span className="mt-8 text-sm font-medium text-primary">Browse templates</span>
                                </button>
                            </div>
                        ) : (
                            <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)] overflow-hidden">
                                <aside className="border-r border-border p-4">
                                    <button
                                        onClick={() => setStarterStep('choice')}
                                        className="mb-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Back
                                    </button>

                                    <div className="space-y-1">
                                        {starterCategories.map((category) => (
                                            <button
                                                key={category}
                                                onClick={() => setStarterCategory(category)}
                                                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                                                    starterCategory === category
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                            >
                                                <span>{category}</span>
                                                <span className="text-xs opacity-75">
                                                    {category === 'All'
                                                        ? starterTemplates.length
                                                        : starterTemplates.filter((template) => template.category === category).length}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </aside>

                                <div className="flex min-h-[560px] flex-col overflow-hidden p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground">{starterCategory} templates</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {visibleStarterTemplates.length} layout{visibleStarterTemplates.length === 1 ? '' : 's'} available
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {templateImportError && (
                                                <span className="max-w-56 text-right text-xs text-destructive">{templateImportError}</span>
                                            )}
                                            <input
                                                ref={templateInputRef}
                                                type="file"
                                                accept=".json,application/json"
                                                className="hidden"
                                                onChange={(event) => void handleTemplateImport(event)}
                                            />
                                            <button
                                                onClick={() => templateInputRef.current?.click()}
                                                className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                            >
                                                Import template
                                            </button>
                                        </div>
                                    </div>

                                    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                                        <div className="grid auto-rows-[minmax(176px,auto)] gap-4 lg:grid-cols-2">
                                            {visibleStarterTemplates.map((template) => {
                                                const Icon = template.icon;

                                                return (
                                                    <button
                                                        key={template.id}
                                                        onClick={() => handleApplyTemplate(template)}
                                                        className="group flex min-h-44 flex-col justify-between rounded-lg border border-border bg-background p-5 text-left transition-colors hover:border-primary/60 hover:bg-muted/40"
                                                    >
                                                        <div>
                                                            <StarterTemplatePreview variant={template.preview} />
                                                            <div className="mb-4 flex items-start justify-between gap-3">
                                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                                    <Icon className="h-5 w-5" />
                                                                </div>
                                                                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                                                    {template.category}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-lg font-semibold text-foreground">{template.name}</h3>
                                                            <p className="mt-2 text-sm text-muted-foreground">{template.description}</p>
                                                        </div>
                                                        <div className="mt-6 flex items-center justify-between text-sm">
                                                            <span className="font-medium text-primary">Use layout</span>
                                                            <span className="text-muted-foreground">{template.sections.length} sections</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} funnel={funnel} />
            {initialFunnel?.id && (
                <FunnelSettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                    funnel={{
                        id: initialFunnel.id,
                        name: initialFunnel.name,
                        is_published: initialFunnel.is_published,
                        domains: initialFunnel.domains,
                    }}
                    domainMapping={domainMapping}
                />
            )}
        </DndProvider>
    );
}
