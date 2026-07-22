import Navbar from "./Navbar";
import Footer from "./Footer";
import { Building, TrendingUp, Shield, Users, Coins, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
    const features = [
        {
            icon: Building,
            title: "Fractional Property Ownership",
            description: "Own a piece of premium real estate starting from as little as 105 bricks. Each brick represents a share in the property, making property investment accessible to everyone."
        },
        {
            icon: TrendingUp,
            title: "Passive Income",
            description: "Earn monthly rental returns directly to your wallet. Property income is automatically distributed to all brick holders based on their ownership percentage."
        },
        {
            icon: Shield,
            title: "Blockchain Security",
            description: "All transactions are secured on the blockchain, providing transparent, immutable records of ownership and ensuring your investment is protected."
        },
        {
            icon: Users,
            title: "Community Investment",
            description: "Join a community of investors co-owning premium properties. Vote on property decisions and participate in the future of real estate investment."
        },
        {
            icon: Coins,
            title: "Liquid Assets",
            description: "Trade your property bricks anytime on the secondary market. No more waiting months or years to sell your real estate investment."
        },
        {
            icon: FileText,
            title: "Full Transparency",
            description: "View detailed property information, tenant details, mortgage income, occupancy rates, and all financial data before investing."
        }
    ];

    const howItWorks = [
        {
            step: "1",
            title: "Browse Properties",
            description: "Explore our curated selection of premium residential and commercial properties across South Africa."
        },
        {
            step: "2",
            title: "Purchase Bricks",
            description: "Buy BRK tokens and exchange them for property NFTs. Each Property NFT represents fractional ownership in the property."
        },
        {
            step: "3",
            title: "Earn Returns",
            description: "Receive monthly mortgage income directly to your wallet, proportional to your brick ownership."
        },
        {
            step: "4",
            title: "Trade Anytime",
            description: "Sell your bricks or property NFTs on the Secondary marketplace whenever you want. Your investment stays liquid and accessible."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 w-full">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gray-50 pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                            The Future of Property Investment
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
                            FirstBrick is revolutionizing real estate by making premium properties accessible to everyone through blockchain technology.
                        </p>
                        <Link
                            to="/marketplace"
                            className="inline-flex items-center bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors"
                        >
                            Explore Properties
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Visual Investment Flow Section */}
            <div className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Invest Together, Grow Together</h2>
                        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                            Our model is simple. We bring investors together to co-own properties and share in the returns.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-1/2 border-t-2 border-dashed border-gray-300 hidden md:block"></div>
                        </div>
                        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                            {/* Step 1: Invest Together */}
                            <div className="bg-gray-50 rounded-2xl p-8 text-center shadow-sm">
                                <div className="flex justify-center items-center mb-6">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Users className="w-8 h-8 text-primary" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">1. Pool Capital</h3>
                                <p className="text-gray-600">
                                    Join forces with other investors (Individuals and Businesses) to purchase shares (bricks) in high-value properties.
                                </p>
                            </div>
                            {/* Step 2: Buy Property */}
                            <div className="bg-gray-50 rounded-2xl p-8 text-center shadow-sm">
                                <div className="flex justify-center items-center mb-6">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Building className="w-8 h-8 text-primary" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">2. Acquire Asset</h3>
                                <p className="text-gray-600">
                                    Your collective investment is used to acquire a premium, income-generating property.
                                </p>
                            </div>
                            {/* Step 3: Earn Returns */}
                            <div className="bg-gray-50 rounded-2xl p-8 text-center shadow-sm">
                                <div className="flex justify-center items-center mb-6">
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-8 h-8 text-green-500" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">3. Share Profits</h3>
                                <p className="text-gray-600">
                                    Earn your share of mortgage income. As the property value grows, so does your investment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
                    <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto text-center">
                        At FirstBrick, we believe property investment should be accessible to everyone, not just the wealthy few.
                        We're breaking down the barriers to real estate ownership by allowing you to invest in premium properties
                        with as little as R105. Through blockchain technology and fractional ownership, we're creating a new way
                        for South Africans to build wealth, earn passive income, and participate in the property market.
                    </p>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-gray-100 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Why Choose FirstBrick?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">A Simple Four-Step Process</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {howItWorks.map((item, index) => (
                            <div key={index} className="bg-gray-50 rounded-2xl p-8 text-center shadow-sm">
                                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mb-5 mx-auto">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 text-center">
                        <Link
                            to="/marketplace"
                            className="inline-flex items-center bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors"
                        >
                            Start Investing
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-primary text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">R242M+</div>
                            <div className="text-white/80">Property Value</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">2+</div>
                            <div className="text-white/80">Properties Listed</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">12.5%</div>
                            <div className="text-white/80">Avg. Annual Yield</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">100%</div>
                            <div className="text-white/80">Blockchain Secured</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Property Types Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Investment Opportunities</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Residential Card */}
                        <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Residential Properties</h3>
                                <p className="text-gray-600 mb-6">
                                    Premium apartments and homes in prime locations. Perfect for investors seeking stable rental yields and capital appreciation.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        Long-term tenants
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        8-10.5% annual yields
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        Property appreciation potential
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {/* Commercial Card */}
                        <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Commercial Properties</h3>
                                <p className="text-gray-600 mb-6">
                                    Shopping centres and retail spaces with multiple tenants. Higher yields from established businesses.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        Multiple revenue streams
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        10-13% annual yields
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        Professional management
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technology Section */}
            <div className="bg-gray-100 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
                        <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Built on a Foundation of Trust</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                            We use cutting-edge blockchain technology to ensure your investments are transparent, secure, and efficient.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                            <div>
                                <h3 className="text-xl font-bold text-primary mb-2">Smart Contracts</h3>
                                <p className="text-gray-600">Automated, trustless execution of agreements</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-primary mb-2">ERC1155 NFTs</h3>
                                <p className="text-gray-600">Efficient multi-token standard for property bricks</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-primary mb-2">IPFS Storage</h3>
                                <p className="text-gray-600">Decentralized storage for property metadata</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-6">
                        Start Building Your Property Portfolio
                    </h2>
                    <p className="text-xl text-gray-600 mb-10">
                        Join FirstBrick and start a journey of earning compounded passive income .
                    </p>
                    <Link
                        to="/marketplace"
                        className="inline-flex items-center justify-center bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors"
                    >
                        Browse Properties
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}
