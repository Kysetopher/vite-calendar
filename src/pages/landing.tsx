import {Card, CardContent} from "@/components/ui/safe-card";
import Login from "@/components/form/LoginForm";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import {
    MessageSquare,
    Calendar,
    LayoutPanelLeft,
    Zap,
    Lightbulb,
    Sparkles,
    MousePointerClick,
} from "lucide-react";
import liaizenLogo from "@assets/liaizen-logo.svg";
import {Link} from "wouter";
import {useEffect, useState, useRef} from "react";
import Beta from "@/components/ui/beta.tsx";


export default function Landing() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isAtTop, setIsAtTop] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [isNavVisible, setIsNavVisible] = useState(false);
    const [showLoginButtons, setShowLoginButtons] = useState(false);
    const [showBetaForm, setShowBetaForm] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        setIsNavVisible(true);
        
        // Check for invite token in URL and store it
        const urlParams = new URLSearchParams(window.location.search);
        const inviteToken = urlParams.get('invite');
        if (inviteToken) {
            sessionStorage.setItem('pendingInvite', inviteToken);
            // Automatically show login form when there's an invite
            setShowLoginButtons(true);
        }
    }, []);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        const handleScroll = () => {
            if (scrollContainer) {
                setIsAtTop(scrollContainer.scrollTop <= 10);
            }
        };
        scrollContainer?.addEventListener("scroll", handleScroll);
        return () => {
            scrollContainer?.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({top: 0, behavior: 'smooth'});
        }
    };

    const trustIndicators = [
        {
            icon: <MousePointerClick className="w-6 h-6 text-[#46bd92]"/>,
            label: "Easy to Use"
        },
        {
            icon: <Zap className="w-6 h-6 text-[#46bd92]"/>,
            label: "Reduces Friction"
        },
        {
            icon: <LayoutPanelLeft className="w-6 h-6 text-[#46bd92]"/>,
            label: "Modern Design"
        }
    ];

    const features = [
        {
            icon: <MessageSquare className="w-6 h-6 text-[#46bd92]"/>,
            title: "Respectful Messaging",
            description: "AI moderates conversations to ensure healthy communication habits and keep outcomes mutually beneficial."
        },
        {
            icon: <Calendar className="w-6 h-6 text-[#46bd92]"/>,
            title: "Seamless Coordination",
            description: "Shared calendars, expense tracking, and document storage keep both households aligned without the need for constant check-ins."
        },
        {
            icon: <Lightbulb className="w-6 h-6 text-[#46bd92]"/>,
            title: "Personalized Insights",
            description: "Discover how your strengths and blind spots ensure a positive impact on your child's future."
        }
    ];

    const benefits = [
        {label: "Reduce conflict by 80%"},
        {label: "Save $5,000+ on meditation costs"},
        {label: "Maintain your sanity"},
        {label: "Keep conversations practical and productive"},
    ];

    return (
        <div className="h-screen bg-gradient-to-br from-teal-50 via-white to-green-50 cursor-default
       flex flex-col relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#46BD92]/20 to-[#275559]/20 rounded-full blur-3xl animate-gentlePulse"></div>
                <div
                    className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#4DA8B0]/20 to-[#46BD92]/20 rounded-full blur-3xl animate-gentlePulse"
                    style={{animationDelay: '2s'}}></div>
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#275559]/10 to-[#4DA8B0]/10 rounded-full blur-2xl animate-breathing"></div>
            </div>
            {/* Main Content */}
            <main ref={scrollContainerRef} className="overflow-y-auto">
                <div className="font-sans flex flex-col items-center justify-center">
                    {/* Navbar */}
                    <header className={`sticky top-0 left-0 right-0 z-40 w-full transition-all duration-500 
                    ${isNavVisible ? 'translate-y-0' : '-translate-y-full'}
                    ${isAtTop ? '' : 'backdrop-blur-md shadow-md bg-white/50'}
                    `}>
                        <div className="px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center h-16">
                                {/* Logo and Brand */}
                                <div className="flex justify-start">
                                    <a href='https://liaizen.com/' target="_blank" className='flex w-fit px-4'>
                                        <div className="flex w-fit gap-3 items-center">
                                            <img
                                                src={liaizenLogo}
                                                alt="LiaiZen Logo"
                                                className="w-8 h-8 rounded-lg"
                                            />
                                            <span className="text-xl font-sans font-semibold text-gray-900 block">LiaiZen</span>
                                        </div>
                                    </a>
                                </div>
                                <div className='flex items items-center gap-6'>
                                    <button
                                        onClick={() => {
                                            scrollToTop();
                                            setShowBetaForm(true);
                                        }}
                                        className='text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors duration-200 whitespace-nowrap group'
                                    >
                                        Join Beta
                                    </button>
                                    <button
                                        onClick={() => {
                                            scrollToTop();
                                            setShowLoginButtons(true);
                                        }}
                                        className='text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors duration-200 whitespace-nowrap group'
                                    >
                                        Sign In
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>
                    {/* Hero Section */}
                    <div className='mb-28 mt-8'>
                        <img
                            src={liaizenLogo}
                            alt="LiaiZen Logo"
                            className="w-48 h-auto mx-auto m-3"
                        />
                        <div>
                            <div className={`text-center mb-8 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                                {/* Headings */}
                                <div
                                    className='flex flex-col gap-6'>
                                    <div
                                        className="text-4xl md:text-6xl lg:text-7xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light p-4">
                                        Is Co-parenting Stressful?
                                    </div>
                                    <div className="text-neutral-700 text-2xl md:text-3xl lg:text-4xl font-semibold">
                                        Try Zen Parenting with LiaiZen
                                    </div>
                                    <div className="text-lg text-neutral-600 max-w-2xl mx-auto p-4">
                                        AI-powered mediation and adaptive intelligence to support both parents in raising thriving children.
                                    </div>
                                </div>
                                {/* CTA Buttons */}
                                <div>
                                    <div className='flex flex-col justify-center p-4 gap-4 sm:flex-row'>
                                        <button
                                            onClick={() => {
                                                setShowBetaForm(true);
                                                scrollToTop();
                                            }}
                                            className="w-full sm:w-[200px] group whitespace-nowrap min-w-52 flex text-white items-center gap-3 justify-center px-8 py-4 text-lg font-semibold bg-brand hover:bg-brand-light rounded-2xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 active:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#46BD92]/20">
                                            <Sparkles className="text-white group-hover:animate-pulse"/>
                                            <span className='group-hover:animate-pulse'>Join Beta</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowLoginButtons(true);
                                                scrollToTop();
                                            }}
                                            className="w-full sm:w-[200px] group whitespace-nowrap min-w-52 flex items-center text-neutral-700 justify-center gap-3 px-8 py-4 text-lg font-semibold bg-white hover:bg-gray-200 rounded-2xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 active:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#46BD92]/20">
                                            Sign In
                                        </button>
                                    </div>
                                    {/* Trust Indicators */}
                                    <div
                                        className='flex flex-wrap justify-center gap-8 p-4 whitespace-nowrap sm:flex-row'>
                                        {trustIndicators.map((item, index) => (
                                            <div key={index} className="flex items-center justify-center gap-2 mt-4">
                                                {item.icon}
                                                <span className="text-sm text-neutral-500">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {showLoginButtons && <div className="fixed inset-0 bg-black/60 z-50"/>}
                            <Dialog modal={false} open={showLoginButtons} onOpenChange={setShowLoginButtons}>
                                <DialogContent>
                                    <Login/>
                                </DialogContent>
                            </Dialog>
                        </div>
                        {showBetaForm && <div className="fixed inset-0 bg-black/60 z-50"/>}
                        <div className=''>
                            <Dialog modal={false} open={showBetaForm} onOpenChange={setShowBetaForm}>
                                <DialogContent>
                                    <Beta/>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    {/* Features Section */}
                    <div className='flex flex-col items-center mb-24'>
                        <div className='text-center mb-8'>
                            <div
                                className='text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light p-2'>
                                Everything You Need for Mindful Co-Parenting
                            </div>
                            <div className='text-lg text-neutral-600 max-w-2xl mx-auto p-2'>
                                Features designed to reduce stress and promote collaboration.
                            </div>
                        </div>
                        <div
                            className={`flex flex-wrap max-w-5xl justify-center gap-8 p-4 md:p-0 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            {features.map((feature => (
                                <Card key={feature.title} className="w-full p-6 border-none md:max-w-xs">
                                    <CardContent className="text-center">
                                        <div
                                            className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-xl font-sans font-semibold mb-3">{feature.title}</h3>
                                        <p className="text-gray-600">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            )))}
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <div className='p-4'>
                        <Card className="text-center p-8 max-w-5xl">
                            <div className='text-center mb-8'>
                                <div
                                    className='text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light p-2'>
                                    Transform your co-parenting experience
                                </div>
                                <div className='text-lg text-neutral-600 max-w-2xl mx-auto'>
                                    Join thousands of families who've found peace through better communication
                                </div>
                            </div>
                            <div className='flex flex-wrap justify-center items-center gap-6'>
                                {benefits.map((benefit, index) => (
                                    <div key={index}
                                         className="flex w-full max-w-sm items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#46BD92]/10 to-[#275559]/10 border border-[#46BD92]/20">
                                        <span className="text-lg text-green-600 font-semibold">✓</span>
                                        <span className="text-gray-700 w-full text-start">{benefit.label}</span>
                                    </div>
                                ))}
                            </div>
                            <div className='flex justify-center'>
                                <button
                                    onClick={() => {
                                        scrollToTop();
                                        setShowBetaForm(true);
                                    }}
                                    className="w-full sm:w-[400px] group mt-8 whitespace-nowrap min-w-52 flex items-center text-white justify-center gap-3 px-8 py-4 text-lg font-semibold bg-brand hover:bg-brand-light rounded-2xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 active:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#46BD92]/20">
                                    <Sparkles className="text-white group-hover:animate-pulse"/>
                                    Become a Beta Tester
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mx-auto px-4 py-6 mt-16 border-t border-gray-200">
                    <div className="text-center text-neutral-400 gap-2 flex flex-col items-center">
                        <div className='flex flex-col-reverse justify-between items-center w-full md:flex-row gap-2'>
                            <p className='w-full flex justify-center whitespace-nowrap'>&copy; 2025 LiaiZen</p>
                            <p className='hidden w-full lg:flex justify-center whitespace-nowrap'>Made with ❤️ for
                                families everywhere.</p>
                            <div className='flex gap-6 w-full justify-around sm:justify-center'>
                                <Link href='/demo'
                                      className='relative overflow-hidden bg-gradient-shine-light bg-[length:200%_100%] text-transparent bg-clip-text animate-shine hover:text-neutral-700'>Demo</Link>
                                <Link href='/privacy' className='hover:text-neutral-700'>Privacy</Link>
                                <Link href='/terms' className='hover:text-neutral-700'>Terms</Link>
                                <Link href='/support' className='hover:text-neutral-700'>Support</Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
