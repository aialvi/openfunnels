import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { 
    Type, 
    Image, 
    Square, 
    FileText, 
    Video,
    Code,
    Map,
    Star,
    Calendar,
    ShoppingCart,
    Users,
    BarChart3,
    Music,
    MessageSquare,
    Clock,
    Zap
} from 'lucide-react';

export interface ContentBlock {
    id: string;
    type: 'text' | 'image' | 'button' | 'form' | 'video' | 'code' | 'map' | 'testimonial' | 'calendar' | 'ecommerce' | 'team' | 'chart' | 'audio' | 'countdown' | 'social' | 'spacer';
    content: Record<string, unknown>;
    settings: {
        padding: string;
        margin: string;
        backgroundColor: string;
        borderRadius: string;
        animation?: string;
    };
}

const ItemTypes = {
    CONTENT_BLOCK: 'content_block',
};

// Content block templates
const CONTENT_BLOCKS = [
    {
        id: 'text',
        name: 'Text',
        icon: <Type className="w-5 h-5" />,
        description: 'Add headings, paragraphs, and text content',
        category: 'Basic',
        defaultContent: {
            text: 'Enter your text here',
            fontSize: '16px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#1f2937',
        }
    },
    {
        id: 'image',
        name: 'Image',
        icon: <Image className="w-5 h-5" />,
        description: 'Upload or link to images',
        category: 'Media',
        defaultContent: {
            src: 'https://via.placeholder.com/400x300',
            alt: 'Image',
            width: '100%',
            objectFit: 'cover',
        }
    },
    {
        id: 'button',
        name: 'Button',
        icon: <Square className="w-5 h-5" />,
        description: 'Call-to-action buttons with links',
        category: 'Interactive',
        defaultContent: {
            text: 'Click Me',
            url: '#',
            variant: 'primary',
            size: 'medium',
            fullWidth: false,
        }
    },
    {
        id: 'form',
        name: 'Form',
        icon: <FileText className="w-5 h-5" />,
        description: 'Contact forms and lead capture',
        category: 'Interactive',
        defaultContent: {
            title: 'Contact Us',
            fields: [
                { type: 'text', label: 'Name', required: true },
                { type: 'email', label: 'Email', required: true },
                { type: 'textarea', label: 'Message', required: false },
            ],
            buttonText: 'Submit',
        }
    },
    {
        id: 'video',
        name: 'Video',
        icon: <Video className="w-5 h-5" />,
        description: 'Embed YouTube, Vimeo, or upload videos',
        category: 'Media',
        defaultContent: {
            src: '',
            poster: '',
            autoplay: false,
            controls: true,
        }
    },
    {
        id: 'code',
        name: 'Code',
        icon: <Code className="w-5 h-5" />,
        description: 'HTML, CSS, or JavaScript code blocks',
        category: 'Advanced',
        defaultContent: {
            code: '<div>Hello World</div>',
            language: 'html',
        }
    },
    {
        id: 'map',
        name: 'Map',
        icon: <Map className="w-5 h-5" />,
        description: 'Interactive Google Maps',
        category: 'Advanced',
        defaultContent: {
            address: 'New York, NY',
            zoom: 12,
            height: '300px',
        }
    },
    {
        id: 'testimonial',
        name: 'Testimonial',
        icon: <Star className="w-5 h-5" />,
        description: 'Customer reviews and testimonials',
        category: 'Social Proof',
        defaultContent: {
            quote: 'This service is amazing! Highly recommended.',
            author: 'John Doe',
            position: 'CEO, Company Inc.',
            avatar: '',
            rating: 5,
        }
    },
    {
        id: 'calendar',
        name: 'Calendar',
        icon: <Calendar className="w-5 h-5" />,
        description: 'Event calendar and booking',
        category: 'Interactive',
        defaultContent: {
            type: 'booking',
            calendarId: '',
            timeSlots: [],
        }
    },
    {
        id: 'ecommerce',
        name: 'Product',
        icon: <ShoppingCart className="w-5 h-5" />,
        description: 'Product showcase and purchase buttons',
        category: 'E-commerce',
        defaultContent: {
            name: 'Product Name',
            price: '$99.99',
            image: 'https://via.placeholder.com/300x300',
            description: 'Product description here',
            buyUrl: '#',
        }
    },
    {
        id: 'team',
        name: 'Team',
        icon: <Users className="w-5 h-5" />,
        description: 'Team member profiles',
        category: 'About',
        defaultContent: {
            members: [
                {
                    name: 'Team Member',
                    position: 'Position',
                    photo: 'https://via.placeholder.com/200x200',
                    bio: 'Short bio here',
                }
            ]
        }
    },
    {
        id: 'chart',
        name: 'Chart',
        icon: <BarChart3 className="w-5 h-5" />,
        description: 'Data visualization and charts',
        category: 'Advanced',
        defaultContent: {
            type: 'bar',
            data: [],
            title: 'Chart Title',
        }
    },
    {
        id: 'audio',
        name: 'Audio',
        icon: <Music className="w-5 h-5" />,
        description: 'Audio players and podcasts',
        category: 'Media',
        defaultContent: {
            src: '',
            title: 'Audio Title',
            autoplay: false,
            controls: true,
        }
    },
    {
        id: 'countdown',
        name: 'Countdown',
        icon: <Clock className="w-5 h-5" />,
        description: 'Countdown timers for events',
        category: 'Interactive',
        defaultContent: {
            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Event Countdown',
            showDays: true,
            showHours: true,
            showMinutes: true,
            showSeconds: true,
        }
    },
    {
        id: 'social',
        name: 'Social',
        icon: <MessageSquare className="w-5 h-5" />,
        description: 'Social media feeds and buttons',
        category: 'Social Proof',
        defaultContent: {
            platforms: ['facebook', 'twitter', 'linkedin', 'instagram'],
            style: 'buttons',
        }
    },
    {
        id: 'spacer',
        name: 'Spacer',
        icon: <Zap className="w-5 h-5" />,
        description: 'Add spacing between elements',
        category: 'Layout',
        defaultContent: {
            height: '50px',
        }
    },
];

// Group blocks by category
const BLOCK_CATEGORIES = CONTENT_BLOCKS.reduce((acc, block) => {
    if (!acc[block.category]) {
        acc[block.category] = [];
    }
    acc[block.category].push(block);
    return acc;
}, {} as Record<string, typeof CONTENT_BLOCKS>);

// Draggable Content Block
function ContentBlockItem({ block }: { block: typeof CONTENT_BLOCKS[0] }) {
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
            className={`group p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-blue-400 hover:shadow-md transition-all ${
                isDragging ? 'opacity-50' : ''
            }`}
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-gray-600 group-hover:text-blue-600 transition-colors">
                    {block.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-900 transition-colors">
                        {block.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {block.description}
                    </p>
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
    onCategoryChange 
}: {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}) {
    const categories = ['All', ...Object.keys(BLOCK_CATEGORIES)];

    return (
        <div className="space-y-3 mb-4">
            <input
                type="text"
                placeholder="Search blocks..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex flex-wrap gap-1">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                            selectedCategory === category
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        const matchesSearch = block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            block.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || block.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="w-80 bg-white border-l border-gray-200 p-4 h-full overflow-y-auto">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Content Blocks</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Drag blocks into your layout columns to add content
                </p>

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
                    <div className="text-center text-gray-500 py-8">
                        <Type className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm">No blocks found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    filteredBlocks.map((block) => (
                        <ContentBlockItem key={block.id} block={block} />
                    ))
                )}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tips</h3>
                <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Drag blocks into layout columns</li>
                    <li>• Use spacers to add vertical spacing</li>
                    <li>• Customize each block in the properties panel</li>
                    <li>• Mix different block types for rich content</li>
                </ul>
            </div>
        </div>
    );
}
