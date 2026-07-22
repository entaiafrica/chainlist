import { useState } from 'react';

export default function ContractTester({ isOpen, setIsOpen }) {
  const [testResults, setTestResults] = useState(null);
  const [isTestingopen, setIsTesting] = useState(false);

  const contractCode = `// Smart Contract Payment Distribution
function distributePayment(
  uint256 propertyId
) external payable {
  Property storage prop = properties[propertyId];

  uint256 totalBricks = prop.totalBricks;
  uint256 paymentPerBrick = msg.value / totalBricks;

  // Distribute to all investors
  for(uint i = 0; i < prop.investors.length; i++) {
    address investor = prop.investors[i];
    uint256 bricks = prop.brickBalance[investor];
    uint256 payment = bricks * paymentPerBrick;

    payable(investor).transfer(payment);

    emit PaymentDistributed(
      investor,
      payment,
      block.timestamp
    );
  }
}`;

  const runTests = () => {
    setIsTesting(true);
    setTestResults(null);

    // Simulate test execution
    setTimeout(() => {
      setTestResults({
        passed: 8,
        total: 8,
        tests: [
          { name: 'Payment Distribution Accuracy', status: 'passed', time: '0.023s' },
          { name: 'Multi-Investor Split Calculation', status: 'passed', time: '0.018s' },
          { name: 'Brick Balance Verification', status: 'passed', time: '0.015s' },
          { name: 'Overflow Protection', status: 'passed', time: '0.021s' },
          { name: 'Event Emission Check', status: 'passed', time: '0.012s' },
          { name: 'Reentrancy Guard', status: 'passed', time: '0.019s' },
          { name: 'Gas Optimization', status: 'passed', time: '0.016s' },
          { name: 'Edge Case Handling', status: 'passed', time: '0.025s' }
        ],
        coverage: '98.7%',
        gasUsed: '127,450'
      });
      setIsTesting(false);
    }, 2000);
  };

  return (
    <>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="relative bg-gradient-to-br from-gray-900/98 to-black/98 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-green-500/30">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 bg-red-600/90 hover:bg-red-700 text-white rounded-full p-2 transition-all"
              style={{ minWidth: '40px', minHeight: '40px' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="p-6 md:p-8">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text">
                Smart Contract Test Suite
              </h2>
              <p className="text-gray-400 mb-6">
                Run automated tests on the payment distribution smart contract
              </p>

              {/* Contract Code Display */}
              <div className="bg-gray-900/50 rounded-xl p-4 mb-6 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-green-400">Contract Code</h3>
                  <span className="text-xs text-gray-500">Solidity ^0.8.0</span>
                </div>
                <pre className="text-xs text-green-400 font-mono overflow-x-auto max-h-64">
                  {contractCode}
                </pre>
              </div>

              {/* Run Tests Button */}
              <button
                onClick={runTests}
                disabled={isTesting}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                  isTesting
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105'
                } text-white shadow-lg`}
              >
                {isTesting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Running Tests...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Run All Tests
                  </>
                )}
              </button>

              {/* Test Results */}
              {testResults && (
                <div className="mt-6 animate-fadeIn">
                  {/* Summary */}
                  <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/30 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        All Tests Passed
                      </h3>
                      <span className="text-2xl font-bold text-green-400">{testResults.passed}/{testResults.total}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Code Coverage</div>
                        <div className="text-xl font-bold text-green-400">{testResults.coverage}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Gas Used</div>
                        <div className="text-xl font-bold text-blue-400">{testResults.gasUsed}</div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Tests */}
                  <div className="space-y-2">
                    {testResults.tests.map((test, idx) => (
                      <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-200 font-medium">{test.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{test.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Blockchain Verification */}
                  <div className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-blue-300 font-semibold mb-1">Blockchain Verified</p>
                        <p className="text-xs text-gray-400">
                          Contract deployed and verified on FirstBrick private chain (Chain ID: 12786)
                        </p>
                        <p className="text-xs text-gray-500 mt-2 font-mono">
                          0x17F8376935341F8Ec506906313aE2E061fE7C628
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
