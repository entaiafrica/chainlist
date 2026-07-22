import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from "./Footer";
import { Shield, AlertTriangle, FileText } from 'lucide-react';

function Disclaimer() {
    const sections = [
        {
            title: "Investment Disclaimer",
            icon: AlertTriangle,
            content: [
                "Brick tokens represent fractional equity ownership in a property listed on the FirstBrick platform. By purchasing Brick tokens, you are acquiring a proportional stake in the property's funding arrangement.",
                "<strong>Returns and Projections:</strong> All returns are dependent on platform growth, transaction volume, and the homebuyer's ability to make consistent monthly payments. Projected returns are estimates based on current mortgage rates and platform fees, and are not guaranteed.",
                "<strong>Risk Warning:</strong> Cryptocurrency and tokenized investments carry inherent risks including but not limited to: market volatility, loss of principal, regulatory changes, and smart contract vulnerabilities. Only invest what you can afford to lose.",
                "<strong>No Financial Advice:</strong> Nothing on this platform constitutes financial, investment, legal, or tax advice. You should consult with qualified professionals before making any investment decisions.",
            ]
        },
        {
            title: "Trust Account & Fund Security",
            icon: Shield,
            content: [
                "All investor funds are held in a registered trust account managed by licensed conveyancers in accordance with applicable financial regulations. Trust accounts are audited quarterly by independent auditors to ensure compliance and transparency.",
                "<strong>Trust Details:</strong><ul><li class='ml-4'>- Trust funds are segregated from operational accounts.</li><li class='ml-4'>- Regular third-party audits ensure fund security.</li><li class='ml-4'>- Licensed conveyancers oversee fund management.</li></ul>"
            ]
        },
        {
            title: "Blockchain Information",
            icon: FileText,
            content: [
                "FirstBrick operates on our own private Ethereum blockchain, providing enhanced security, faster transaction speeds, and greater control over the network while maintaining full Ethereum compatibility.",
                "<strong>Private Chain Benefits:</strong><ul><li class='ml-4'>- Enhanced security through controlled network access.</li><li class='ml-4'>- Faster transaction confirmation times.</li><li class='ml-4'>- Lower transaction fees compared to public networks.</li></ul>",
                "<strong>Smart Contract Address:</strong><br /><span class='font-mono text-sm break-all'>0x17F8376935341F8Ec506906313aE2E061fE7C628</span>"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100 w-full">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        Legal Disclaimer
                    </h1>
                    <p className="text-lg text-gray-600">
                        Important information about using the FirstBrick platform.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
                    <div className="space-y-10">
                        {sections.map((section) => (
                            <div key={section.title}>
                                <div className="flex items-center mb-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <section.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h2 className="ml-4 text-2xl font-bold text-gray-900">{section.title}</h2>
                                </div>
                                <div className="prose prose-lg text-gray-600 max-w-none space-y-4">
                                    {section.content.map((text, index) => (
                                        <p key={index} dangerouslySetInnerHTML={{ __html: text }} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link
                        to="/"
                        className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-all"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Disclaimer;
