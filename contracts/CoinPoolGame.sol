// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/**
 * @title CoinPoolGame
 * @notice A pooling game where players contribute 10 tokens each to a pool,
 *         when 100 tokens are reached (10 players), a winner is automatically selected
 *         Winner gets 95 tokens (95%), contract retains 5 tokens (5% fee)
 * @dev Uses gasless transactions via ERC2771 and randomness based on block hash
 */
contract CoinPoolGame is ReentrancyGuard, ERC2771Context {
    // Token contract address
    IERC20 public immutable token;

    // Game constants
    uint256 public constant BET_AMOUNT = 10 * 10**18; // 10 tokens (assuming 18 decimals)
    uint256 public constant WINNING_POOL_SIZE = 100 * 10**18; // 100 tokens (10 players)
    uint256 public constant HOUSE_FEE_PERCENT = 5; // 5% fee
    uint256 public constant WINNER_PERCENT = 95; // 95% to winner

    // Game state
    mapping(uint256 => address) public players; // Maps player index to address
    uint256 public playerCount = 0;
    uint256 public totalDeposited = 0;
    bool public winnerDrawn = false;
    address public winner;
    uint256 public winnerIndex;
    uint256 public randomSeed;
    uint256 public gameRound = 0; // Track which game round this is

    // Peer-to-peer game state
    struct PeerToPeerPool {
        address[4] players;
        uint256 betAmount;
        uint8 poolSize;
        uint256 playerCount;
        address winner;
        bool active;
        uint256 randomSeed;
        uint256 creationBlock;
    }

    uint256 public nextPoolId = 0;
    mapping(uint256 => PeerToPeerPool) internal peerToPeerPools;

    /**
     * @notice Get details of a specific peer-to-peer pool
     * @param poolId The ID of the pool to retrieve
     * @return players The array of player addresses
     * @return betAmount The bet amount for the pool
     * @return poolSize The maximum number of players in the pool
     * @return playerCount The current number of players in the pool
     * @return winner The address of the winner (if any)
     * @return active Whether the pool is still active
     * @return randomSeed The random seed used for winner selection
     * @return creationBlock The block number when the pool was created
     */
    function getPeerToPeerPool(uint256 poolId) external view returns (
        address[4] memory players,
        uint256 betAmount,
        uint8 poolSize,
        uint256 playerCount,
        address winner,
        bool active,
        uint256 randomSeed,
        uint256 creationBlock
    ) {
        PeerToPeerPool storage pool = peerToPeerPools[poolId];
        return (
            pool.players,
            pool.betAmount,
            pool.poolSize,
            pool.playerCount,
            pool.winner,
            pool.active,
            pool.randomSeed,
            pool.creationBlock
        );
    }

    // Events
    event PlayerJoined(address indexed player, uint256 playerIndex, uint256 gameRound);
    event PoolFilled(uint256 indexed gameRound, uint256 totalAmount);
    event WinnerSelected(address indexed winner, uint256 winnerIndex, uint256 randomSeed, uint256 gameRound);
    event PayoutSent(address indexed winner, uint256 amount, uint256 gameRound);
    event PeerToPeerPoolCreated(uint256 indexed poolId, address indexed creator, uint256 betAmount, uint8 poolSize);
    event PeerToPeerPlayerJoined(uint256 indexed poolId, address indexed player, uint256 playerCount);
    event PeerToPeerWinnerSelected(uint256 indexed poolId, address indexed winner, uint256 randomSeed);
    event PeerToPeerPayoutSent(uint256 indexed poolId, address indexed winner, uint256 amount);

    constructor(
        address _tokenAddress,
        address trustedForwarder
    ) ERC2771Context(trustedForwarder) {
        token = IERC20(_tokenAddress);
    }

    /**
     * @notice Join the pool by contributing exactly 10 tokens
     * @dev Automatically triggers winner draw when pool reaches 100 tokens
     */
    function joinPool() external nonReentrant {
        require(
            token.allowance(_msgSender(), address(this)) >= BET_AMOUNT,
            "Insufficient token allowance"
        );

        // Transfer tokens from player to this contract
        require(
            token.transferFrom(_msgSender(), address(this), BET_AMOUNT),
            "Token transfer failed"
        );

        // Add player to the pool
        players[playerCount] = _msgSender();
        playerCount++;
        totalDeposited += BET_AMOUNT;

        emit PlayerJoined(_msgSender(), playerCount - 1, gameRound);

        // Check if pool is full (100 tokens = 10 players * 10 tokens each)
        if (totalDeposited >= WINNING_POOL_SIZE) {
            _drawWinner();
        }
    }

    /**
     * @notice Create a peer-to-peer pool with a specified bet amount and pool size (2 or 4).
     * @param _betAmount The amount of tokens each player needs to bet to join the pool.
     * @param _poolSize The maximum number of players for this pool (2 or 4).
     */
    function createPeerToPeerPool(uint256 _betAmount, uint8 _poolSize) external nonReentrant {
        require(_poolSize == 2 || _poolSize == 4, "Pool size must be 2 or 4");
        require(_betAmount > 0, "Bet amount must be greater than 0");

        require(
            token.allowance(_msgSender(), address(this)) >= _betAmount,
            "Insufficient token allowance"
        );

        require(
            token.transferFrom(_msgSender(), address(this), _betAmount),
            "Token transfer failed"
        );

        PeerToPeerPool storage newPool = peerToPeerPools[nextPoolId];
        newPool.betAmount = _betAmount;
        newPool.poolSize = _poolSize;
        newPool.active = true;
        newPool.creationBlock = block.number;
        newPool.players[0] = _msgSender();
        newPool.playerCount = 1;

        emit PeerToPeerPoolCreated(nextPoolId, _msgSender(), _betAmount, _poolSize);

        nextPoolId++;
    }

    /**
     * @notice Allows a player to join an existing peer-to-peer pool.
     * @param _poolId The ID of the peer-to-peer pool to join.
     */
    function joinPeerToPeerPool(uint256 _poolId) external nonReentrant {
        PeerToPeerPool storage pool = peerToPeerPools[_poolId];
        require(pool.active, "Pool is not active");
        require(pool.playerCount < pool.poolSize, "Pool is already full");

        for (uint256 i = 0; i < pool.playerCount; i++) {
            require(pool.players[i] != _msgSender(), "Player already in this pool");
        }

        require(
            token.allowance(_msgSender(), address(this)) >= pool.betAmount,
            "Insufficient token allowance"
        );

        require(
            token.transferFrom(_msgSender(), address(this), pool.betAmount),
            "Token transfer failed"
        );

        pool.players[pool.playerCount] = _msgSender();
        pool.playerCount++;

        emit PeerToPeerPlayerJoined(_poolId, _msgSender(), pool.playerCount);

        if (pool.playerCount == pool.poolSize) {
            _drawPeerToPeerWinner(_poolId);
        }
    }

    /**
     * @dev Internal function to draw winner and distribute rewards for a peer-to-peer pool
     * @param _poolId The ID of the peer-to-peer pool
     */
    function _drawPeerToPeerWinner(uint256 _poolId) internal {
        PeerToPeerPool storage pool = peerToPeerPools[_poolId];
        require(pool.active, "Pool is not active");
        require(pool.playerCount == pool.poolSize, "Pool not full yet");
        require(pool.winner == address(0), "Winner already drawn for this pool");

        // Generate random seed
        pool.randomSeed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    blockhash(block.number - 1),
                    pool.playerCount,
                    _poolId
                )
            )
        );

        uint256 winnerIndex = pool.randomSeed % pool.poolSize;
        pool.winner = pool.players[winnerIndex];
        pool.active = false; // Deactivate pool after winner is drawn

        emit PeerToPeerWinnerSelected(_poolId, pool.winner, pool.randomSeed);

        // Calculate payouts
        uint256 totalPoolAmount = pool.betAmount * pool.poolSize;
        uint256 houseFee = (totalPoolAmount * HOUSE_FEE_PERCENT) / 100; // 5% fee
        uint256 winnerPayout = totalPoolAmount - houseFee; // 95% to winner

        // Transfer winner's share to winner
        require(
            token.transfer(pool.winner, winnerPayout),
            "Peer-to-peer winner payout failed"
        );

        emit PeerToPeerPayoutSent(_poolId, pool.winner, winnerPayout);
    }

    /**
     * @dev Internal function to draw winner and distribute rewards
     */
    function _drawWinner() internal {
        require(totalDeposited >= WINNING_POOL_SIZE, "Pool not full yet");
        require(!winnerDrawn, "Winner already drawn for this round");

        // Generate random seed using block hash, timestamp, and player count
        randomSeed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    blockhash(block.number - 1), // prevrandao equivalent
                    playerCount,
                    gameRound
                )
            )
        );

        // Select random winner index
        winnerIndex = randomSeed % playerCount;
        winner = players[winnerIndex];
        winnerDrawn = true;

        emit PoolFilled(gameRound, totalDeposited);

        // Calculate payouts
        uint256 houseFee = (totalDeposited * HOUSE_FEE_PERCENT) / 100; // 5% fee
        uint256 winnerPayout = totalDeposited - houseFee; // 95% to winner

        // Transfer winner's share to winner
        require(
            token.transfer(winner, winnerPayout),
            "Winner payout failed"
        );

        emit WinnerSelected(winner, winnerIndex, randomSeed, gameRound);
        emit PayoutSent(winner, winnerPayout, gameRound);

        // Reset for next round
        _resetForNextRound();
    }

    /**
     * @dev Internal function to reset the game state for the next round
     */
    function _resetForNextRound() internal {
        // Clear player mappings for next round
        for (uint256 i = 0; i < playerCount; i++) {
            delete players[i];
        }

        // Reset game state
        playerCount = 0;
        totalDeposited = 0;
        winnerDrawn = false;
        winner = address(0);
        winnerIndex = 0;
        randomSeed = 0;
        gameRound++; // Increment round counter
    }

    /**
     * @notice Get current players in the pool
     * @return Array of player addresses and current player count
     */
    function getPlayers() external view returns (address[] memory) {
        address[] memory result = new address[](playerCount);
        for (uint256 i = 0; i < playerCount; i++) {
            result[i] = players[i];
        }
        return result;
    }

    /**
     * @notice Get current pool size (number of players who have joined)
     * @return Number of players in the current pool
     */
    function getPoolSize() external view returns (uint256) {
        return playerCount;
    }

    /**
     * @notice Get the total amount deposited in the current pool
     * @return Total amount of tokens in the current pool
     */
    function getCurrentPoolAmount() external view returns (uint256) {
        return totalDeposited;
    }

    /**
     * @notice Get the amount needed to fill the pool
     * @return Amount of tokens still needed to fill the pool
     */
    function getAmountNeededToFillPool() external view returns (uint256) {
        if (totalDeposited >= WINNING_POOL_SIZE) {
            return 0;
        }
        return WINNING_POOL_SIZE - totalDeposited;
    }

    /**
     * @notice Check if a specific address has joined the current pool
     * @param player The address to check
     * @return True if the player has joined the current pool, false otherwise
     */
    function hasPlayerJoined(address player) external view returns (bool) {
        for (uint256 i = 0; i < playerCount; i++) {
            if (players[i] == player) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Get the current game round
     * @return Current game round number
     */
    function getCurrentGameRound() external view returns (uint256) {
        return gameRound;
    }

    /**
     * @notice Get the house fee percentage
     * @return House fee percentage (5%)
     */
    function getHouseFeePercent() external pure returns (uint256) {
        return HOUSE_FEE_PERCENT;
    }

    /**
     * @notice Get the winner percentage
     * @return Winner percentage (95%)
     */
    function getWinnerPercent() external pure returns (uint256) {
        return WINNER_PERCENT;
    }

    /**
     * @notice Get a list of all active peer-to-peer pools.
     * @return An array of active PeerToPeerPool structs.
     */
    function getActivePeerToPeerPools() external view returns (uint256[] memory) {
        // Handle edge case where no pools exist
        if (nextPoolId == 0) {
            return new uint256[](0);
        }

        // Create a temporary array that's large enough to hold all possible pool IDs
        uint256[] memory tempPoolIds = new uint256[](nextPoolId);
        uint256 activePoolCount = 0;

        // Collect active pool IDs
        for (uint256 i = 0; i < nextPoolId; i++) {
            if (peerToPeerPools[i].active) {
                tempPoolIds[activePoolCount] = i;
                activePoolCount++;
            }
        }

        // Create final array with exact size
        uint256[] memory activePoolIds = new uint256[](activePoolCount);

        // Copy active pool IDs to final array
        for (uint256 i = 0; i < activePoolCount; i++) {
            activePoolIds[i] = tempPoolIds[i];
        }

        return activePoolIds;
    }


    /**
     * @notice Check if the given forwarder is trusted
     * @param forwarder The address to check
     * @return True if the forwarder is trusted, false otherwise
     */
    function isTrustedForwarder(address forwarder) public view override returns (bool) {
        return ERC2771Context.isTrustedForwarder(forwarder);
    }

    /**
     * @notice Override _msgSender to use ERC2771 context for gasless transactions
     */
    function _msgSender() internal view virtual override returns (address) {
        return ERC2771Context._msgSender();
    }

    /**
     * @notice Override _msgData to use ERC2771 context for gasless transactions
     */
    function _msgData() internal view virtual override returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    /**
     * @notice Override _contextSuffixLength for ERC2771
     */
    function _contextSuffixLength() internal view virtual override returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }
}