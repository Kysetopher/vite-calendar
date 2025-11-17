import React, {useEffect, useRef, useState} from 'react';
import { Card } from "@/components/ui/safe-card.tsx";
import { Button } from "@/components/ui/safe-button.tsx";
import liaizenLogo from "@assets/liaizen-logo.svg";

function Demo() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
    setIsVisible(true);
  }, []);

    return (
        <div className="h-screen justify-center items-center bg-gradient-to-br from-teal-50 via-white to-green-50 cursor-default flex flex-col relative">
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
            <main ref={scrollContainerRef} className="overflow-y-auto w-full h-full flex items-center justify-center max-w-7xl">
                <div className="font-sans flex flex-col items-center justify-center w-full">
                    <div className='flex flex-col w-full items-center gap-12'>
                        {/* Logo */}
                        <div className='flex flex-col items-center gap-4'>
                            <img
                                src={liaizenLogo}
                                alt="LiaiZen Logo"
                                className="w-48 bg-white border border-gray-400 rounded-full p-4 shadow-lg"
                            />
                            <div>
                                <div className='flex justify-center items-center text-neutral-700 text-3xl font-semibold'>LiaiZen</div>
                                <div className='text-2xl text-neutral-600 text-center'>Collaborative Coparenting</div>
                            </div>
                        </div>
                        {/* Selection Component */}
                        <div className={`flex flex-col w-full items-center max-w-lg gap-2 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <Card className='flex flex-col p-6 w-full'>
                                <div
                                    className='mb-6 text-xl text-center relative overflow-hidden bg-gradient-shine-neutral bg-[length:200%_100%] text-transparent bg-clip-text animate-shine font-semibold'>
                                    Choose your adventure
                                </div>
                                {/* Options */}
                                <div className='flex w-full justify-around gap-6'>
                                    <Button size='lg' variant='outline'
                                            className='w-full text-md text-neutral-700'>Mom</Button>
                                    <Button size='lg' variant='outline'
                                            className='w-full text-md text-neutral-700'>Dad</Button>
                                </div>
                            </Card>
                            <Button size='default' variant='link' className='text-gray-500 gap-3'
                                    onClick={() => {
                                        window.location.href = '/';
                                    }}>
                                {/*<MoveLeft/>*/}
                                go back
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
);
}

export default Demo;