import {
    BarChart3,
    Calendar,
    Clock,
    Code,
    FileText,
    Image,
    Map,
    MessageSquare,
    Music,
    ShoppingCart,
    Square,
    Star,
    Type,
    Users,
    Video,
    Zap,
} from 'lucide-react';
import { useRef } from 'react';
import { useDrag } from 'react-dnd';

// Re-export canonical type for backwards compatibility.
export type { Block as ContentBlock } from '@/types/editor';

const ItemTypes = {
    CONTENT_BLOCK: 'content_block',
};

// Content block templates
const CONTENT_BLOCKS = [
    {
        id: 'text',
        name: 'Text',
        icon: <Type className="h-5 w-5" />,
        description: 'Add headings, paragraphs, and text content',
        category: 'Basic',
        defaultContent: {
            text: 'Enter your text here',
            fontSize: '16px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#1f2937',
        },
    },
    {
        id: 'image',
        name: 'Image',
        icon: <Image className="h-5 w-5" />,
        description: 'Upload or link to images',
        category: 'Media',
        defaultContent: {
            src: '',
            alt: 'Descriptive image text',
            width: '100%',
            maxHeight: '500px',
            objectFit: 'cover',
            imageBorderRadius: '8px',
            linkUrl: '',
            newTab: true,
        },
    },
    {
        id: 'button',
        name: 'Button',
        icon: <Square className="h-5 w-5" />,
        description: 'Call-to-action buttons with links',
        category: 'Interactive',
        defaultContent: {
            text: 'Click Me',
            url: '#',
            variant: 'primary',
            size: 'medium',
            fullWidth: false,
            newTab: false,
        },
    },
    {
        id: 'form',
        name: 'Form',
        icon: <FileText className="h-5 w-5" />,
        description: 'Contact forms and lead capture',
        category: 'Interactive',
        defaultContent: {
            title: 'Contact Us',
            fields: [
                { id: 'name', name: 'name', type: 'text', label: 'Name', placeholder: 'Your name', required: false },
                { id: 'email', name: 'email', type: 'email', label: 'Email', placeholder: 'you@example.com', required: true },
                { id: 'message', name: 'message', type: 'textarea', label: 'Message', placeholder: 'How can we help?', required: false },
            ],
            buttonText: 'Submit',
            successMessage: 'Thanks. Your information was submitted.',
        },
    },
    {
        id: 'video',
        name: 'Video',
        icon: <Video className="h-5 w-5" />,
        description: 'Embed YouTube, Vimeo, or upload videos',
        category: 'Media',
        defaultContent: {
            title: 'Featured video',
            src: '',
            poster: '',
            autoplay: false,
            controls: true,
        },
    },
    {
        id: 'code',
        name: 'Code',
        icon: <Code className="h-5 w-5" />,
        description: 'HTML, CSS, or JavaScript code blocks',
        category: 'Advanced',
        defaultContent: {
            code: '<div>Hello World</div>',
            language: 'html',
        },
    },
    {
        id: 'map',
        name: 'Map',
        icon: <Map className="h-5 w-5" />,
        description: 'Interactive Google Maps',
        category: 'Advanced',
        defaultContent: {
            address: 'New York, NY',
            zoom: 12,
            height: '300px',
        },
    },
    {
        id: 'testimonial',
        name: 'Testimonial',
        icon: <Star className="h-5 w-5" />,
        description: 'Customer reviews and testimonials',
        category: 'Social Proof',
        defaultContent: {
            quote: 'This service is amazing! Highly recommended.',
            author: 'John Doe',
            position: 'CEO, Company Inc.',
            avatar: '',
            rating: 5,
        },
    },
    {
        id: 'calendar',
        name: 'Calendar',
        icon: <Calendar className="h-5 w-5" />,
        description: 'Event calendar and booking',
        category: 'Interactive',
        defaultContent: {
            title: 'Book a time',
            embedUrl: '',
            height: '650px',
        },
    },
    {
        id: 'ecommerce',
        name: 'Product',
        icon: <ShoppingCart className="h-5 w-5" />,
        description: 'Product showcase and purchase buttons',
        category: 'E-commerce',
        defaultContent: {
            name: 'Product Name',
            price: '$99.99',
            image: '',
            description: 'Product description here',
            buyUrl: '#',
            buttonText: 'Buy now',
        },
    },
    {
        id: 'team',
        name: 'Team',
        icon: <Users className="h-5 w-5" />,
        description: 'Team member profiles',
        category: 'About',
        defaultContent: {
            members: [
                {
                    name: 'Team Member',
                    position: 'Position',
                    photo: '',
                    bio: 'Short bio here',
                },
            ],
        },
    },
    {
        id: 'chart',
        name: 'Chart',
        icon: <BarChart3 className="h-5 w-5" />,
        description: 'Data visualization and charts',
        category: 'Advanced',
        defaultContent: {
            type: 'bar',
            data: [
                { label: 'Visitors', value: 120 },
                { label: 'Leads', value: 48 },
                { label: 'Customers', value: 16 },
            ],
            title: 'Funnel performance',
        },
    },
    {
        id: 'audio',
        name: 'Audio',
        icon: <Music className="h-5 w-5" />,
        description: 'Audio players and podcasts',
        category: 'Media',
        defaultContent: {
            src: '',
            title: 'Audio Title',
            autoplay: false,
            controls: true,
        },
    },
    {
        id: 'countdown',
        name: 'Countdown',
        icon: <Clock className="h-5 w-5" />,
        description: 'Countdown timers for events',
        category: 'Interactive',
        defaultContent: {
            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Event Countdown',
            showDays: true,
            showHours: true,
            showMinutes: true,
            showSeconds: true,
        },
    },
    {
        id: 'social',
        name: 'Social',
        icon: <MessageSquare className="h-5 w-5" />,
        description: 'Social media feeds and buttons',
        category: 'Social Proof',
        defaultContent: {
            links: [
                { platform: 'facebook', url: '' },
                { platform: 'instagram', url: '' },
                { platform: 'linkedin', url: '' },
            ],
            style: 'buttons',
        },
    },
    {
        id: 'spacer',
        name: 'Spacer',
        icon: <Zap className="h-5 w-5" />,
        description: 'Add spacing between elements',
        category: 'Layout',
        defaultContent: {
            height: '50px',
        },
    },
    {
        id: 'woocommerce-product',
        name: 'WooCommerce Product',
        icon: <ShoppingCart className="h-5 w-5" />, // Reusing ShoppingCart for now
        description: 'Embed a WooCommerce product',
        category: 'E-commerce',
        defaultContent: {
            productId: '',
            name: 'WooCommerce product',
            price: '$99.00',
            image: '',
            description: 'Describe the product and why it is valuable.',
            productUrl: '',
            buttonText: 'View product',
        },
    },
    {
        id: 'shopify-buy-button',
        name: 'Shopify Buy Button',
        icon: <ShoppingCart className="h-5 w-5" />,
        description: 'Embed a Shopify Buy Button',
        category: 'E-commerce',
        defaultContent: {
            productId: '',
            shopDomain: '',
            name: 'Shopify product',
            price: '$99.00',
            image: '',
            description: 'Describe the product and why it is valuable.',
            productUrl: '',
            buttonText: 'Buy now',
        },
    },
];

// Group blocks by category
const BLOCK_CATEGORIES = CONTENT_BLOCKS.reduce(
    (acc, block) => {
        if (!acc[block.category]) {
            acc[block.category] = [];
        }
        acc[block.category].push(block);
        return acc;
    },
    {} as Record<string, typeof CONTENT_BLOCKS>,
);

// Draggable Content Block
function ContentBlockItem({ block }: { block: (typeof CONTENT_BLOCKS)[0] }) {
    const dragRef = useRef<HTMLDivElement>(null);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.CONTENT_BLOCK,
        item: {
            type: block.id,
            defaultContent: block.defaultContent,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    drag(dragRef);

    return (
        <div
            ref={dragRef}
            className={`group cursor-move rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-md ${
                isDragging ? 'opacity-50' : ''
            }`}
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary">{block.icon}</div>
                <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">{block.name}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{block.description}</p>
                </div>
            </div>
        </div>
    );
}

// Search and Filter Component
function BlockSearch({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
}: {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}) {
    const categories = ['All', ...Object.keys(BLOCK_CATEGORIES)];

    return (
        <div className="mb-4 space-y-3">
            <input
                type="text"
                placeholder="Search blocks..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <div className="flex flex-wrap gap-1">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={`rounded px-2 py-1 text-xs transition-colors ${
                            selectedCategory === category ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Main Content Block Library Component
export default function ContentBlockLibrary({
    searchQuery = '',
    onSearchChange,
    selectedCategory = 'All',
    onCategoryChange,
}: {
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    selectedCategory?: string;
    onCategoryChange?: (category: string) => void;
}) {
    // Filter blocks based on search and category
    const filteredBlocks = CONTENT_BLOCKS.filter((block) => {
        const matchesSearch =
            block.name.toLowerCase().includes(searchQuery.toLowerCase()) || block.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || block.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="h-full w-80 overflow-y-auto border-l border-border bg-card p-4">
            <div className="mb-6">
                <h2 className="mb-2 text-lg font-semibold text-foreground">Content Blocks</h2>
                <p className="mb-4 text-sm text-muted-foreground">Drag blocks into your layout columns to add content</p>

                {onSearchChange && onCategoryChange && (
                    <BlockSearch
                        searchQuery={searchQuery}
                        onSearchChange={onSearchChange}
                        selectedCategory={selectedCategory}
                        onCategoryChange={onCategoryChange}
                    />
                )}
            </div>

            <div className="space-y-3">
                {filteredBlocks.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <Type className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-sm">No blocks found</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    filteredBlocks.map((block) => <ContentBlockItem key={block.id} block={block} />)
                )}
            </div>

            <div className="mt-8 border-t border-border pt-4">
                <h3 className="mb-2 text-sm font-medium text-foreground">Tips</h3>
                <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Drag blocks into layout columns</li>
                    <li>• Use spacers to add vertical spacing</li>
                    <li>• Customize each block in the properties panel</li>
                    <li>• Mix different block types for rich content</li>
                </ul>
            </div>
        </div>
    );
}
