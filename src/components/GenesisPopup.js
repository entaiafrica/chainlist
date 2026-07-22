import { Link } from 'react-router-dom';

export default function GenesisPopup({ isOpen, onClose }) {
    if (!isOpen) return null;

    const GENESIS_LOGO = "https://rpc.firstbrick.cloud/ipfs/QmdScpRWNv2hKqou4y1KdgNMhZkcRBVTX1MDVFhndQaeE7";

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .animate-slideIn {
                    animation: slideIn 0.4s ease-out;
                }
            `}} />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/70 transition-opacity backdrop-blur-md"
                    onClick={onClose}
                ></div>

                {/* Popup - Compact Modern Design with enhanced mobile support */}
                <div className="relative bg-gradient-to-br from-gray-900/98 via-purple-900/95 to-black/98 rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-yellow-500/30 backdrop-blur-xl animate-slideIn">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 rounded-2xl blur opacity-20 animate-pulse"></div>

                {/* Close Button - Large touch target for mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-red-600/90 hover:bg-red-700 text-white rounded-full p-3 sm:p-2.5 transition-all transform hover:scale-110 active:scale-95 shadow-lg border-2 border-white/20"
                    aria-label="Close popup"
                    style={{ minWidth: '48px', minHeight: '48px' }}
                >
                    <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="relative p-4 sm:p-6 md:p-8">
                        {/* Compact Header with Side-by-Side Layout */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4">
                            {/* Left: Logo & Badge */}
                            <div className="flex-shrink-0 relative">
                                <img
                                    src={GENESIS_LOGO}
                                    alt="Genesis Brick"
                                    className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 drop-shadow-2xl"
                                />
                                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg animate-pulse">
                                    LIMITED
                                </div>
                            </div>

                            {/* Right: Title & Description */}
                            <div className="flex-1 text-center sm:text-left">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
                                    <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-transparent bg-clip-text">
                                        Genesis Brick
                                    </span>
                                </h2>
                                <p className="text-base sm:text-lg text-gray-200 mb-1">Own Equity in FirstBrick</p>
                                <p className="text-xs sm:text-sm text-gray-400">650 exclusive tokens • R23.7M valuation</p>
                            </div>
                        </div>

                        {/* Compact Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 my-4 sm:my-6">
                            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-2 sm:p-3 rounded-lg border border-yellow-500/20 text-center">
                                <div className="text-lg sm:text-xl font-bold text-yellow-400">R24K</div>
                                <div className="text-xs text-gray-400">Per Token</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 p-2 sm:p-3 rounded-lg border border-orange-500/20 text-center">
                                <div className="text-lg sm:text-xl font-bold text-orange-400">0.1%</div>
                                <div className="text-xs text-gray-400">Equity</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-2 sm:p-3 rounded-lg border border-purple-500/20 text-center">
                                <div className="text-lg sm:text-xl font-bold text-purple-400">30%</div>
                                <div className="text-xs text-gray-400">Revenue</div>
                            </div>
                            <div className="bg-gradient-to-br from-pink-900/30 to-red-900/30 p-2 sm:p-3 rounded-lg border border-pink-500/20 text-center">
                                <div className="text-lg sm:text-xl font-bold text-pink-400">200+</div>
                                <div className="text-xs text-gray-400">Board Seat</div>
                            </div>
                        </div>

                        {/* Compact Benefits - 2 Column Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 sm:mb-6">
                            <div className="flex items-center text-gray-200 text-xs sm:text-sm">
                                <svg className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Platform equity</span>
                            </div>
                            <div className="flex items-center text-gray-200 text-xs sm:text-sm">
                                <svg className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Revenue sharing</span>
                            </div>
                            <div className="flex items-center text-gray-200 text-xs sm:text-sm">
                                <svg className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Voting rights</span>
                            </div>
                            <div className="flex items-center text-gray-200 text-xs sm:text-sm">
                                <svg className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Trust secured</span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Link
                                to="/genesis-investor"
                                onClick={onClose}
                                className="flex-1 group bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-4 sm:px-6 rounded-lg text-center transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/30 text-sm sm:text-base"
                            >
                                <span className="flex items-center justify-center">
                                    Learn More
                                    <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </span>
                            </Link>

                            <button
                                onClick={onClose}
                                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 px-4 sm:px-6 rounded-lg transition-all active:scale-95 text-sm sm:text-base"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
