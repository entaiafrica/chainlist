//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IBrickMarketplace {
    function getInvestorList(uint256 tokenId) external view returns (address[] memory);
    function calculateInvestorPayment(uint256 tokenId, address investor, uint256 totalAmount)
        external view returns (uint256);
    function getInvestorBricks(uint256 tokenId, address investor) external view returns (uint256);
    function isBuyer(uint256 tokenId, address account) external view returns (bool);
    function getBuyer(uint256 tokenId) external view returns (address);
    function isFunded(uint256 tokenId) external view returns (bool);
}

contract PaymentDistributor is ReentrancyGuard {
    address public platformWallet = 0x8da6CE40Bf4F1c5333D7316e789c755384c290d5;
    address public nftMarketplaceAddress;
    address public owner;

    IERC20 public brkToken;

    // Track pending distributions
    mapping(address => uint256) public investorBalances;

    uint256 public platformFeePercent = 10; // 10%

    event PaymentReceived(uint256 amount, uint256 platformFee, uint256 investorPool);
    event PaymentDistributed(uint256 indexed tokenId, uint256 totalAmount, uint256 investorCount);
    event Withdrawal(address indexed investor, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _nftMarketplaceAddress, address _brkTokenAddress) {
        nftMarketplaceAddress = _nftMarketplaceAddress;
        brkToken = IERC20(_brkTokenAddress);
        owner = msg.sender;
    }

    // Receive BRK token payments (only for FUNDED properties)
    function receivePayment(uint256 amount, uint256 tokenId) external nonReentrant {
        require(amount > 0, "Amount must be > 0");

        // CRITICAL: Only accept payments for fully funded properties
        IBrickMarketplace marketplace = IBrickMarketplace(nftMarketplaceAddress);
        require(marketplace.isFunded(tokenId), "Property not fully funded - no payments yet");

        require(brkToken.allowance(msg.sender, address(this)) >= amount,
                "Insufficient allowance");

        brkToken.transferFrom(msg.sender, address(this), amount);

        // Calculate splits
        uint256 platformFee = (amount * platformFeePercent) / 100;
        uint256 investorPool = amount - platformFee;

        // Send platform fee
        brkToken.transfer(platformWallet, platformFee);

        // Distribute to investors
        distributeToInvestors(tokenId, investorPool);

        emit PaymentReceived(amount, platformFee, investorPool);
    }

    function distributeToInvestors(uint256 tokenId, uint256 totalAmount) private {
        IBrickMarketplace marketplace = IBrickMarketplace(nftMarketplaceAddress);
        address[] memory investors = marketplace.getInvestorList(tokenId);
        address buyer = marketplace.getBuyer(tokenId);

        require(investors.length > 0, "No investors");

        uint256 investorCount = 0;
        uint256 totalInvestorBricks = 0;

        // Calculate total bricks held by investors (excluding buyer)
        for (uint i = 0; i < investors.length; i++) {
            if (investors[i] != buyer) {
                uint256 bricks = marketplace.getInvestorBricks(tokenId, investors[i]);
                totalInvestorBricks += bricks;
            }
        }

        require(totalInvestorBricks > 0, "No investor bricks");

        // Distribute payments proportionally to investors only (buyer excluded)
        for (uint i = 0; i < investors.length; i++) {
            // Skip the buyer - they don't receive payments!
            if (investors[i] == buyer) {
                continue;
            }

            uint256 investorBricks = marketplace.getInvestorBricks(tokenId, investors[i]);
            if (investorBricks > 0) {
                // Calculate payment based on investor's share of total investor bricks
                uint256 payment = (totalAmount * investorBricks) / totalInvestorBricks;

                if (payment > 0) {
                    investorBalances[investors[i]] += payment;
                    investorCount++;
                }
            }
        }

        emit PaymentDistributed(tokenId, totalAmount, investorCount);
    }

    // Pull payment pattern for safety
    function withdraw() external nonReentrant {
        uint256 amount = investorBalances[msg.sender];
        require(amount > 0, "No balance to withdraw");

        investorBalances[msg.sender] = 0;
        brkToken.transfer(msg.sender, amount);

        emit Withdrawal(msg.sender, amount);
    }

    function setPlatformFeePercent(uint256 _percent) external onlyOwner {
        require(_percent <= 20, "Fee too high"); // Max 20%
        platformFeePercent = _percent;
    }

    function getBalance(address investor) external view returns (uint256) {
        return investorBalances[investor];
    }
}
