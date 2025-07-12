import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero animations
            gsap.fromTo('.hero-title', 
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
            );
            
            gsap.fromTo('.hero-subtitle', 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' }
            );
            
            gsap.fromTo('.hero-buttons', 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, delay: 0.4, ease: 'power3.out' }
            );

            gsap.fromTo('.hero-demo', 
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 1.2, delay: 0.6, ease: 'power3.out' }
            );

            // Feature cards animation
            gsap.fromTo('.feature-card', 
                { opacity: 0, y: 50 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.8, 
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.features-grid',
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Testimonial cards animation
            gsap.fromTo('.testimonial-card', 
                { opacity: 0, x: 50 },
                { 
                    opacity: 1, 
                    x: 0, 
                    duration: 0.8, 
                    stagger: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.testimonials-grid',
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Demo floating animation
            gsap.to('.demo-float', {
                y: -10,
                duration: 2,
                ease: 'power2.inOut',
                yoyo: true,
                repeat: -1
            });

        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <>
            <Head title="OpenFunnels - Build High-Converting Marketing Funnels">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>
            
            <div ref={heroRef} className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                {/* Navigation */}
                <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">OpenFunnels</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md font-medium dark:text-gray-300 dark:hover:text-white"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center">
                            <h1 className="hero-title text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
                                Build High-Converting <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                    Marketing Funnels
                                </span>
                            </h1>
                            <p className="hero-subtitle text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                                Create stunning landing pages, capture leads, and drive conversions with our intuitive drag-and-drop funnel builder. No coding required.
                            </p>
                            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                                {!auth.user && (
                                    <Link
                                        href={route('register')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105 shadow-lg"
                                    >
                                        Start Building Free
                                    </Link>
                                )}
                                <button className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold border border-gray-300 transition-all hover:scale-105 shadow-lg dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700">
                                    Watch Demo
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-16">
                                Free forever • No credit card required • Open source
                            </p>
                        </div>
                        
                        {/* Demo Preview */}
                        <div className="hero-demo max-w-6xl mx-auto">
                            <div className="demo-float relative">
                                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                                    <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2 dark:bg-gray-700">
                                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                        <div className="flex-1 text-center text-sm text-gray-600 dark:text-gray-300">
                                            openfunnels.com/editor
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2">
                                                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Live Preview</h3>
                                                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-6 dark:from-blue-900/20 dark:to-purple-900/20">
                                                    <div className="space-y-4">
                                                        <div className="h-4 bg-gray-300 rounded w-3/4 dark:bg-gray-600"></div>
                                                        <div className="h-4 bg-gray-300 rounded w-1/2 dark:bg-gray-600"></div>
                                                        <div className="h-8 bg-blue-300 rounded w-32 dark:bg-blue-700"></div>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">Interactive Demo</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">Click to explore the drag-and-drop editor</p>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Block Library</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                                                        <span className="text-lg">📝</span>
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Text Block</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                                                        <span className="text-lg">🖼️</span>
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Image Block</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                                                        <span className="text-lg">🔳</span>
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Button Block</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                                                        <span className="text-lg">📝</span>
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Form Block</span>
                                                    </div>
                                                </div>
                                                <div className="mt-6">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Properties</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Background:</span>
                                                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Font Size:</span>
                                                            <span className="text-gray-900 dark:text-white">18px</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Padding:</span>
                                                            <span className="text-gray-900 dark:text-white">16px</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 text-center">
                                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                                                Launch Demo
                                            </button>
                                            <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">
                                                * Interactive demo coming soon. The actual editor will be fully functional.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Demo Video Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            See OpenFunnels in Action
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                            Watch how easy it is to build professional funnels with our drag-and-drop editor
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Desktop</button>
                            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium dark:bg-gray-700 dark:text-gray-300">Tablet</button>
                            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium dark:bg-gray-700 dark:text-gray-300">Mobile</button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Everything You Need to Build Funnels
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300">
                                Powerful features that make funnel building fast, easy, and effective.
                            </p>
                        </div>
                        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="feature-card bg-white rounded-xl p-6 shadow-lg dark:bg-gray-900">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 dark:bg-blue-900">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Drag & Drop Builder</h3>
                                <p className="text-gray-600 dark:text-gray-300">Intuitive visual editor that makes funnel creation as easy as moving blocks around.</p>
                            </div>

                            <div className="feature-card bg-white rounded-xl p-6 shadow-lg dark:bg-gray-900">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 dark:bg-purple-900">
                                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Beautiful Templates</h3>
                                <p className="text-gray-600 dark:text-gray-300">Start with professionally designed templates optimized for conversions.</p>
                            </div>

                            <div className="feature-card bg-white rounded-xl p-6 shadow-lg dark:bg-gray-900">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 dark:bg-green-900">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Mobile Responsive</h3>
                                <p className="text-gray-600 dark:text-gray-300">All funnels automatically adapt to look perfect on any device or screen size.</p>
                            </div>

                            <div className="feature-card bg-white rounded-xl p-6 shadow-lg dark:bg-gray-900">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 dark:bg-yellow-900">
                                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Analytics & Tracking</h3>
                                <p className="text-gray-600 dark:text-gray-300">Built-in analytics to track conversions, page views, and funnel performance.</p>
                            </div>

                            <div className="feature-card bg-white rounded-xl p-6 shadow-lg dark:bg-gray-900">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 dark:bg-red-900">
                                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">A/B Testing</h3>
                                <p className="text-gray-600 dark:text-gray-300">Test different versions of your funnels to optimize for maximum conversions.</p>
                            </div>

                            <div className="feature-card bg-white rounded-xl p-6 shadow-lg dark:bg-gray-900">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 dark:bg-indigo-900">
                                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
                                <p className="text-gray-600 dark:text-gray-300">Optimized for speed with instant loading and smooth user experiences.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Loved by Marketing Teams
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300">
                                See what our users are saying about OpenFunnels
                            </p>
                        </div>
                        <div className="testimonials-grid grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="testimonial-card bg-gray-50 rounded-xl p-6 dark:bg-gray-800">
                                <div className="flex items-center mb-4">
                                    <img className="w-12 h-12 rounded-full mr-4" src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" alt="Sarah Johnson" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Sarah Johnson</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Marketing Director, TechStart Inc.</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 italic">
                                    "OpenFunnels transformed our lead generation. We saw a 300% increase in conversions within the first month."
                                </p>
                            </div>

                            <div className="testimonial-card bg-gray-50 rounded-xl p-6 dark:bg-gray-800">
                                <div className="flex items-center mb-4">
                                    <img className="w-12 h-12 rounded-full mr-4" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" alt="Mike Chen" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Mike Chen</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Founder, Growth Labs</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 italic">
                                    "The drag-and-drop interface is incredibly intuitive. I built my first funnel in under 30 minutes!"
                                </p>
                            </div>

                            <div className="testimonial-card bg-gray-50 rounded-xl p-6 dark:bg-gray-800">
                                <div className="flex items-center mb-4">
                                    <img className="w-12 h-12 rounded-full mr-4" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" alt="Emily Rodriguez" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Emily Rodriguez</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">E-commerce Manager, Retail Plus</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 italic">
                                    "Being open-source gives us the flexibility we need. The community support is amazing too."
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to Build Your First Funnel?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Join thousands of marketers who are already using OpenFunnels to create high-converting funnels. Start building for free today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {!auth.user && (
                                <Link
                                    href={route('register')}
                                    className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105 shadow-lg"
                                >
                                    Start Building Free
                                </Link>
                            )}
                            <a 
                                href="https://github.com/openfunnels/openfunnels" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105"
                            >
                                View on GitHub
                            </a>
                        </div>
                        <div className="mt-8">
                            <div className="flex items-center justify-center space-x-8 text-blue-100">
                                <div className="flex items-center">
                                    <span className="text-2xl mr-2">✨</span>
                                    <span>No Credit Card Required</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-2xl mr-2">🚀</span>
                                    <span>Deploy Anywhere</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-4">OpenFunnels</h3>
                                <p className="text-gray-400">
                                    The open-source funnel builder that helps you create high-converting marketing funnels without coding.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Product</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Resources</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Company</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                            <p>© 2025 OpenFunnels. All rights reserved. Built with ❤️ by the OpenFunnels community.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}



