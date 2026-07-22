import { Link } from 'react-router-dom';
import { Building2, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <Building2 className="w-8 h-8 text-primary" />
                            <span className="text-2xl font-bold text-white">FirstBrick</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Democratizing property investment through blockchain technology.
                            Own premium real estate starting from R105.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/about" className="text-gray-400 hover:text-primary transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/marketplace" className="text-gray-400 hover:text-primary transition-colors">
                                    Marketplace
                                </Link>
                            </li>
                            <li>
                                <Link to="/buy-bricks" className="text-gray-400 hover:text-primary transition-colors">
                                    Buy BRK Tokens
                                </Link>
                            </li>
                            <li>
                                <Link to="/genesis-investor" className="text-gray-400 hover:text-primary transition-colors">
                                    Genesis Investor
                                </Link>
                            </li>
                            <li>
                                <a href="https://explorer.firstbrick.cloud" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                                    Blockchain Explorer
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/profile" className="text-gray-400 hover:text-primary transition-colors">
                                    My Portfolio
                                </Link>
                            </li>
                            <li>
                                <Link to="/sellNFT" className="text-gray-400 hover:text-primary transition-colors">
                                    Finance Property
                                </Link>
                            </li>
                            <li>
                                <Link to="/disclaimer" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                    Disclaimer
                                </Link>
                            </li>
                            <li>
                                <Link to="/troubleshooting" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                    Troubleshooting & FAQ
                                </Link>
                            </li>
                            <li>
                                <a href="/brand-guide.html" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                    Brand Guide
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Contact</h3>
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
                            FirstBrick is a blockchain-based property investment platform. All investments carry risk.
                            Please read our disclaimer carefully before investing.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
