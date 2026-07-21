import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero animations
            gsap.fromTo('.hero-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });

            gsap.fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' });

            gsap.fromTo('.hero-buttons', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, delay: 0.4, ease: 'power3.out' });

            gsap.fromTo('.hero-demo', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1.2, delay: 0.6, ease: 'power3.out' });

            // Feature cards animation
            gsap.fromTo(
                '.feature-card',
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
                        toggleActions: 'play none none reverse',
                    },
                },
            );

            // Testimonial cards animation
            gsap.fromTo(
                '.testimonial-card',
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
                        toggleActions: 'play none none reverse',
                    },
                },
            );

            // Demo floating animation
            gsap.to('.demo-float', {
                y: -10,
                duration: 2,
                ease: 'power2.inOut',
                yoyo: true,
                repeat: -1,
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

            <div ref={heroRef} className="min-h-screen bg-background text-foreground">
                {/* Navigation */}
                <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl font-bold text-foreground">OpenFunnels</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-md px-3 py-2 font-medium text-muted-foreground hover:text-foreground"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
                <section className="bg-gradient-to-b from-background to-background/50 px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h1 className="hero-title mb-6 text-5xl font-bold text-foreground md:text-7xl">
                                Build High-Converting <br />
                                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Marketing Funnels</span>
                            </h1>
                            <p className="hero-subtitle mx-auto mb-8 max-w-3xl text-xl text-muted-foreground md:text-2xl">
                                Create stunning landing pages, capture leads, and drive conversions with our intuitive drag-and-drop funnel builder.
                                No coding required.
                            </p>
                            <div className="hero-buttons mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                {!auth.user && (
                                    <Link
                                        href={route('register')}
                                        className="rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90"
                                    >
                                        Start Building Free
                                    </Link>
                                )}
                                <button className="rounded-lg border border-border bg-secondary px-8 py-4 text-lg font-semibold text-secondary-foreground shadow-lg transition-all hover:scale-105 hover:bg-secondary/80">
                                    Watch Demo
                                </button>
                            </div>
                            <p className="mb-16 text-sm text-muted-foreground">Free forever • No credit card required • Open source</p>
                        </div>

                        {/* Demo Preview */}
                        <div className="hero-demo mx-auto max-w-6xl">
                            <div className="demo-float relative">
                                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                                    <div className="flex items-center space-x-2 bg-muted px-4 py-3">
                                        <div className="h-3 w-3 rounded-full bg-red-500/50"></div>
                                        <div className="h-3 w-3 rounded-full bg-yellow-500/50"></div>
                                        <div className="h-3 w-3 rounded-full bg-green-500/50"></div>
                                        <div className="flex-1 text-center text-sm text-muted-foreground">openfunnels.com/editor</div>
                                    </div>
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                            <div className="lg:col-span-2">
                                                <h3 className="mb-4 text-xl font-semibold text-foreground">Live Preview</h3>
                                                <div className="rounded-lg border border-border bg-secondary/50 p-6">
                                                    <div className="space-y-4">
                                                        <div className="h-4 w-3/4 rounded bg-muted-foreground/20"></div>
                                                        <div className="h-4 w-1/2 rounded bg-muted-foreground/20"></div>
                                                        <div className="h-8 w-32 rounded bg-primary/20"></div>
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-sm text-muted-foreground">Interactive Demo</p>
                                                <p className="text-xs text-muted-foreground/60">Click to explore the drag-and-drop editor</p>
                                            </div>
                                            <div>
                                                <h3 className="mb-4 text-xl font-semibold text-foreground">Block Library</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3 rounded-lg border border-border bg-secondary p-3">
                                                        <span className="text-lg">📝</span>
                                                        <span className="text-sm font-medium text-foreground">Text Block</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3 rounded-lg border border-border bg-secondary p-3">
                                                        <span className="text-lg">🖼️</span>
                                                        <span className="text-sm font-medium text-foreground">Image Block</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3 rounded-lg border border-border bg-secondary p-3">
                                                        <span className="text-lg">🔳</span>
                                                        <span className="text-sm font-medium text-foreground">Button Block</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3 rounded-lg border border-border bg-secondary p-3">
                                                        <span className="text-lg">📝</span>
                                                        <span className="text-sm font-medium text-foreground">Form Block</span>
                                                    </div>
                                                </div>
                                                <div className="mt-6">
                                                    <h4 className="mb-2 font-semibold text-foreground">Properties</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Background:</span>
                                                            <div className="h-4 w-4 rounded bg-primary"></div>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Font Size:</span>
                                                            <span className="text-foreground">18px</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Padding:</span>
                                                            <span className="text-foreground">16px</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 text-center">
                                            <Link
                                                href={route('demo')}
                                                className="inline-flex rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                            >
                                                Launch Demo
                                            </Link>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Open an isolated, editable sandbox. No signup required.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Demo Video Section */}
                <section className="border-y border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl text-center">
                        <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">See OpenFunnels in Action</h2>
                        <p className="mb-8 text-xl text-muted-foreground">
                            Watch how easy it is to build professional funnels with our drag-and-drop editor
                        </p>
                        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <button className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground">Desktop</button>
                            <button className="rounded-lg border border-border bg-secondary px-4 py-2 font-medium text-secondary-foreground">
                                Tablet
                            </button>
                            <button className="rounded-lg border border-border bg-secondary px-4 py-2 font-medium text-secondary-foreground">
                                Mobile
                            </button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-background px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Everything You Need to Build Funnels</h2>
                            <p className="text-xl text-muted-foreground">Powerful features that make funnel building fast, easy, and effective.</p>
                        </div>
                        <div className="features-grid grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <div className="feature-card group rounded-xl border border-border bg-card p-6 shadow-lg transition-colors hover:border-primary/50">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-foreground">Drag & Drop Builder</h3>
                                <p className="text-muted-foreground">
                                    Intuitive visual editor that makes funnel creation as easy as moving blocks around.
                                </p>
                            </div>

                            <div className="feature-card group rounded-xl border border-border bg-card p-6 shadow-lg transition-colors hover:border-primary/50">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-foreground">Beautiful Templates</h3>
                                <p className="text-muted-foreground">Start with professionally designed templates optimized for conversions.</p>
                            </div>

                            <div className="feature-card group rounded-xl border border-border bg-card p-6 shadow-lg transition-colors hover:border-primary/50">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-foreground">Mobile Responsive</h3>
                                <p className="text-muted-foreground">All funnels automatically adapt to look perfect on any device or screen size.</p>
                            </div>

                            <div className="feature-card group rounded-xl border border-border bg-card p-6 shadow-lg transition-colors hover:border-primary/50">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-foreground">Analytics & Tracking</h3>
                                <p className="text-muted-foreground">Built-in analytics to track conversions, page views, and funnel performance.</p>
                            </div>

                            <div className="feature-card group rounded-xl border border-border bg-card p-6 shadow-lg transition-colors hover:border-primary/50">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-foreground">A/B Testing</h3>
                                <p className="text-muted-foreground">Test different versions of your funnels to optimize for maximum conversions.</p>
                            </div>

                            <div className="feature-card group rounded-xl border border-border bg-card p-6 shadow-lg transition-colors hover:border-primary/50">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-foreground">Lightning Fast</h3>
                                <p className="text-muted-foreground">Optimized for speed with instant loading and smooth user experiences.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="border-y border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Loved by Marketing Teams</h2>
                            <p className="text-xl text-muted-foreground">See what our users are saying about OpenFunnels</p>
                        </div>
                        <div className="testimonials-grid grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="testimonial-card rounded-xl border border-border bg-secondary/30 p-6">
                                <div className="mb-4 flex items-center">
                                    <img
                                        className="mr-4 h-12 w-12 rounded-full border border-border"
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80"
                                        alt="Sarah Johnson"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-foreground">Sarah Johnson</h4>
                                        <p className="text-sm text-muted-foreground">Marketing Director, TechStart Inc.</p>
                                    </div>
                                </div>
                                <p className="text-muted-foreground italic">
                                    "OpenFunnels transformed our lead generation. We saw a 300% increase in conversions within the first month."
                                </p>
                            </div>

                            <div className="testimonial-card rounded-xl border border-border bg-secondary/30 p-6">
                                <div className="mb-4 flex items-center">
                                    <img
                                        className="mr-4 h-12 w-12 rounded-full border border-border"
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                                        alt="Mike Chen"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-foreground">Mike Chen</h4>
                                        <p className="text-sm text-muted-foreground">Founder, Growth Labs</p>
                                    </div>
                                </div>
                                <p className="text-muted-foreground italic">
                                    "The drag-and-drop interface is incredibly intuitive. I built my first funnel in under 30 minutes!"
                                </p>
                            </div>

                            <div className="testimonial-card rounded-xl border border-border bg-secondary/30 p-6">
                                <div className="mb-4 flex items-center">
                                    <img
                                        className="mr-4 h-12 w-12 rounded-full border border-border"
                                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                                        alt="Emily Rodriguez"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-foreground">Emily Rodriguez</h4>
                                        <p className="text-sm text-muted-foreground">E-commerce Manager, Retail Plus</p>
                                    </div>
                                </div>
                                <p className="text-muted-foreground italic">
                                    "Being open-source gives us the flexibility we need. The community support is amazing too."
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-primary/90 to-primary px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">Ready to Build Your First Funnel?</h2>
                        <p className="mb-8 text-xl text-primary-foreground/90">
                            Join thousands of marketers who are already using OpenFunnels to create high-converting funnels. Start building for free
                            today.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            {!auth.user && (
                                <Link
                                    href={route('register')}
                                    className="rounded-lg bg-background px-8 py-4 text-lg font-semibold text-foreground shadow-lg transition-all hover:scale-105 hover:bg-background/90"
                                >
                                    Start Building Free
                                </Link>
                            )}
                            <a
                                href="https://github.com/openfunnels/openfunnels"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg border-2 border-primary-foreground bg-transparent px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary-foreground hover:text-primary"
                            >
                                View on GitHub
                            </a>
                        </div>
                        <div className="mt-8">
                            <div className="flex items-center justify-center space-x-8 text-primary-foreground/80">
                                <div className="flex items-center">
                                    <span className="mr-2 text-2xl">✨</span>
                                    <span>No Credit Card Required</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-2 text-2xl">🚀</span>
                                    <span>Deploy Anywhere</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border bg-background py-16 text-foreground">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                            <div>
                                <h3 className="mb-4 text-2xl font-bold">OpenFunnels</h3>
                                <p className="text-muted-foreground">
                                    The open-source funnel builder that helps you create high-converting marketing funnels without coding.
                                </p>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold">Product</h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>
                                        <a href="#" className="transition-colors hover:text-primary">
                                            Features
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors hover:text-primary">
                                            Templates
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors hover:text-primary">
                                            Pricing
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors hover:text-primary">
                                            Changelog
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold">Resources</h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>
                                        <a href="#" className="transition-colors hover:text-primary">
                                            Documentation
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors hover:text-primary">
                                            Blog
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors hover:text-primary">
                                            Community
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors hover:text-primary">
                                            Support
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold">Company</h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>
                                        <a href="#" className="transition-colors hover:text-primary">
                                            About
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors hover:text-primary">
                                            Careers
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors hover:text-primary">
                                            Privacy
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors hover:text-primary">
                                            Terms
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-12 border-t border-border pt-8 text-center text-muted-foreground">
                            <p>© 2025 OpenFunnels. All rights reserved. Built with ❤️ by the OpenFunnels community.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
