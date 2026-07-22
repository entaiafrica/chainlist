import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <Building2 className="w-8 h-8 text-primary" />
                            <span className="text-2xl font-bold text-white">FirstBrick Explorer</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Blockchain explorer for the FirstBrick ecosystem.
                            Explore blocks, transactions, and token activity.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Explorer</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/blocks" className="text-gray-400 hover:text-primary transition-colors">
                                    Blocks
                                </Link>
                            </li>
                            <li>
                                <Link to="/transactions" className="text-gray-400 hover:text-primary transition-colors">
                                    Transactions
                                </Link>
                            </li>
                            <li>
                                <Link to="/tokens" className="text-gray-400 hover:text-primary transition-colors">
                                    Tokens
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Token Links */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Tokens</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/tokens/brk" className="text-gray-400 hover:text-primary transition-colors">
                                    BRK Token
                                </Link>
                            </li>
                            <li>
                                <Link to="/tokens/brkg" className="text-gray-400 hover:text-primary transition-colors">
                                    BRKG Token
                                </Link>
                            </li>
                            <li>
                                <Link to="/tokens/gbrk" className="text-gray-400 hover:text-primary transition-colors">
                                    GBRK Token
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-bold mb-4">FirstBrick</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <MapPin className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-400 text-sm">
                                    Johannesburg, South Africa
                                </span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="w-5 h-5 text-primary mr-2 flex-shrink-0" />
                                <a href="mailto:info@firstbrick.com" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                    info@firstbrick.com
                                </a>
                            </li>
                            <li className="flex items-center">
                                <Phone className="w-5 h-5 text-primary mr-2 flex-shrink-0" />
                                <span className="text-gray-400 text-sm">
                                    010 347 7827
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <p className="text-gray-400 text-sm">
                                &copy; {new Date().getFullYear()} FirstBrick. All rights reserved.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-6 justify-center">
                            <Link to="/disclaimer" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Terms & Conditions
                            </Link>
                            <Link to="/disclaimer" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Privacy Policy
                            </Link>
                            <Link to="/disclaimer" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                Risk Disclosure
                            </Link>
                        </div>
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-xs">
                            FirstBrick Explorer - Blockchain transparency for property tokenization.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;