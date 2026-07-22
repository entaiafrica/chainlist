export default function InvestmentFlow() {
    return (
        <section className="investment-flow w-full py-8 md:py-12 px-4 md:px-8">
            <div className="flow-container max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4">
                    {/* Step 1 */}
                    <div className="flow-step flex-1 flex flex-col items-center text-center gap-3 min-w-[200px] w-full lg:w-auto">
                        <div className="step-icon w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex items-center justify-center bg-gradient-to-br from-orange-900/20 to-orange-600/10 rounded-2xl p-4 border border-orange-500/30">
                            <img
                                src="https://i.ibb.co/8DF5Ryw5/group.png"
                                alt="Citizens Unite"
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        </div>
                        <div className="step-number text-xs font-bold text-orange-500 uppercase tracking-wider">
                            Step 1
                        </div>
                        <h3 className="step-title text-base md:text-lg font-bold text-white leading-tight">
                            Citizens Unite
                        </h3>
                        <p className="step-description text-xs md:text-sm text-gray-400 leading-relaxed max-w-[220px]">
                            Collective property investment for anyone starting from R105 per 100 bricks
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="flow-arrow hidden lg:block text-orange-500 text-2xl flex-shrink-0 animate-pulse-arrow">
                        →
                    </div>

                    {/* Step 2 */}
                    <div className="flow-step flex-1 flex flex-col items-center text-center gap-3 min-w-[200px] w-full lg:w-auto">
                        <div className="step-icon w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-purple-600/10 rounded-2xl p-4 border border-purple-500/30">
                            <img
                                src="https://i.ibb.co/mCHqg11q/brickwall-1.png"
                                alt="Trust Fund"
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        </div>
                        <div className="step-number text-xs font-bold text-orange-500 uppercase tracking-wider">
                            Step 2
                        </div>
                        <h3 className="step-title text-base md:text-lg font-bold text-white leading-tight">
                            Trust Fund
                        </h3>
                        <p className="step-description text-xs md:text-sm text-gray-400 leading-relaxed max-w-[220px]">
                            Funds held securely until sufficient capital accumulates for property settlement
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="flow-arrow hidden lg:block text-orange-500 text-2xl flex-shrink-0 animate-pulse-arrow">
                        →
                    </div>

                    {/* Step 3 */}
                    <div className="flow-step flex-1 flex flex-col items-center text-center gap-3 min-w-[200px] w-full lg:w-auto">
                        <div className="step-icon w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-blue-600/10 rounded-2xl p-4 border border-blue-500/30">
                            <img
                                src="https://i.ibb.co/FLHwZ22B/house-removebg-preview-1.png"
                                alt="Property Purchase"
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        </div>
                        <div className="step-number text-xs font-bold text-orange-500 uppercase tracking-wider">
                            Step 3
                        </div>
                        <h3 className="step-title text-base md:text-lg font-bold text-white leading-tight">
                            Property Purchase
                        </h3>
                        <p className="step-description text-xs md:text-sm text-gray-400 leading-relaxed max-w-[220px]">
                            Appointed Bond Attorney handles transfer; investors receive copy of title deeds (Digital NFT twins) and Buyer gets occupation rights
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="flow-arrow hidden lg:block text-orange-500 text-2xl flex-shrink-0 animate-pulse-arrow">
                        →
                    </div>

                    {/* Step 4 */}
                    <div className="flow-step flex-1 flex flex-col items-center text-center gap-3 min-w-[200px] w-full lg:w-auto">
                        <div className="step-icon w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex items-center justify-center bg-gradient-to-br from-green-900/20 to-green-600/10 rounded-2xl p-4 border border-green-500/30">
                            <img
                                src="https://i.ibb.co/shQh0S1/goldbag.png"
                                alt="Monthly Returns"
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        </div>
                        <div className="step-number text-xs font-bold text-orange-500 uppercase tracking-wider">
                            Step 4
                        </div>
                        <h3 className="step-title text-base md:text-lg font-bold text-white leading-tight">
                            Monthly Returns
                        </h3>
                        <p className="step-description text-xs md:text-sm text-gray-400 leading-relaxed max-w-[220px]">
                            Bond payments distributed proportionally via blockchain smart contract over 15-20 years
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse-arrow {
                    0%, 100% {
                        opacity: 0.5;
                        transform: translateX(0);
                    }
                    50% {
                        opacity: 1;
                        transform: translateX(4px);
                    }
                }

                .animate-pulse-arrow {
                    animation: pulse-arrow 2s ease-in-out infinite;
                }

                @media (prefers-reduced-motion: reduce) {
                    .animate-pulse-arrow {
                        animation: none !important;
                    }
                }

                /* Mobile optimizations */
                @media (max-width: 1023px) {
                    .flow-step {
                        padding: 1.25rem;
                        background: linear-gradient(to bottom right, rgba(147, 51, 234, 0.05), rgba(236, 72, 153, 0.05));
                        border-radius: 1rem;
                        border: 1px solid rgba(147, 51, 234, 0.1);
                        transition: all 0.3s ease;
                    }

                    .flow-step:active {
                        background: linear-gradient(to bottom right, rgba(147, 51, 234, 0.15), rgba(236, 72, 153, 0.15));
                        border-color: rgba(147, 51, 234, 0.3);
                        transform: scale(0.98);
                    }
                }

                /* Icon glow effect */
                .step-icon {
                    transition: all 0.3s ease;
                }

                .step-icon:hover {
                    transform: scale(1.05);
                    box-shadow: 0 0 30px rgba(251, 146, 60, 0.4);
                }
            `}</style>
        </section>
    );
}
