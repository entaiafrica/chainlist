//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/**
 * @title BRKToken (FirstBrick Token)
 * @notice ERC20 token with ERC2771 support for gasless transactions
 * @dev Supports meta-transactions through trusted forwarder
 */
contract BRKToken is ERC20, ERC2771Context {
    address public owner;

    constructor(
        string memory name,
        string memory symbol,
        address trustedForwarder
    ) ERC20(name, symbol) ERC2771Context(trustedForwarder) {
        owner = msg.sender;
    }

    /**
     * @notice Mint new BRK tokens
     * @dev Only owner can mint
     */
    function mint(address to, uint256 amount) public {
        require(_msgSender() == owner, "Only owner can mint");
        _mint(to, amount);
    }

    /**
     * @notice Override _msgSender to use ERC2771 context
     */
    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    /**
     * @notice Override _msgData to use ERC2771 context
     */
    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    /**
     * @notice Override _contextSuffixLength for ERC2771
     */
    function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }
}
