import React, {useState} from 'react';
import {CircleCheckBig, Mail, User, Users} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/safe-button.tsx";
import confetti from "canvas-confetti";
import {Link} from "wouter";

function Beta() {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const triggerConfetti = () => {
        // Trigger confetti
        confetti({
            particleCount: 150,
            spread: 70,
            origin: {y: 0.6},
        });

        // Additional confetti bursts
        confetti({
            particleCount: 150,
            spread: 100,
            origin: {y: 0.6},
            colors: ['#ff0000', '#00ff00', '#0000ff'],
        });
        confetti({
            particleCount: 150,
            spread: 160,
            origin: {y: 0.6},
            colors: ['#ffff00', '#ff00ff', '#00ffff'],
        });
    };

    const handleBetaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetch(`${API_BASE_URL}/api/beta_waitlist/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email})
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }).then(data => {
            console.log('Success:', data);
            setShowConfirmation(true);
            triggerConfetti();
        }).catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <div className='flex flex-col px-4 py-2 text-center mx-2'>
            {!showConfirmation ? (
                <div>
                    {/* Headings */}
                    <div
                        className="text-neutral-700 text-2xl md:text-3xl lg:text-4xl pb-2 font-semibold">
                        Co-Parent Like Never Before!
                    </div>
                    <div className="text-base text-neutral-600 mb-8 max-w-2xl mx-auto p-4">
                        We're almost ready to launch our beta program! Enter your email below to be
                        notified when we go
                        live
                        and get exclusive early access.
                    </div>
                    <form onSubmit={handleBetaSubmit} className="flex flex-col gap-3">
                        <div className='flex flex-col md:flex-row gap-3'>
                            <div className="relative w-full">
                                <User
                                    className="absolute z-10 left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                <Input
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className='pl-12 pr-8 py-4 border-gray-200 rounded-2xl shadow-sm focus:shadow-md transition-all bg-white/80 backdrop-blur-sm'
                                    required
                                />
                            </div>
                            <div className='relative w-full'>
                                <Users
                                    className="absolute z-10 left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                <Input
                                    type="text"
                                    placeholder="Last Name (Optional)"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className='pl-12 py-4 border-gray-200 rounded-2xl shadow-sm focus:shadow-md transition-all bg-white/80 backdrop-blur-sm'
                                />
                            </div>
                        </div>
                        <div className="relative w-full">
                            <Mail
                                className="absolute z-10 left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                            <Input
                                type="email"
                                placeholder="Enter Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-12 py-4 border-gray-200 rounded-2xl shadow-sm focus:shadow-md transition-all bg-white/80 backdrop-blur-sm"
                                required
                            />
                        </div>
                        <div className='flex justify-center gap-2 text-neutral-600 text-sm'>
                            <div>Have an access code?</div>
                            <Link
                                href="/signup"
                                className='underline underline-offset-2 hover:text-blue-500'
                            >Create an account!
                            </Link>
                        </div>
                        <Button
                            type="submit"
                            className="w-full whitespace-nowrap py-4 bg-[#275559] hover:bg-[#1e4144] text-white font-medium rounded-2xl transition-all shadow-sm hover:shadow-md"
                            loading={isLoading}
                        >
                            Join Beta
                        </Button>
                    </form>
                </div>
            ) : (
                <div>
                    <div className="text-base text-neutral-600 mb-8 max-w-2xl mx-auto p-4">
                        Thank you for joining our beta program! You're one step closer to experiencing a
                        co-parenting
                        journey like no other. We've added <strong>{email}</strong> to our mailing list.
                        You'll be among the first to know when LiaiZen launches.
                    </div>
                    <div className="flex items-center justify-center mb-6">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-[#46bd92]">
                            <CircleCheckBig size={48}/>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Beta;