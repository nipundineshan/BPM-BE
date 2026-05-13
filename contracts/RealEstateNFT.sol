// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RealEstateNFT
 * @dev Implementation of RWA Real Estate Tokenization
 */
contract RealEstateNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct Property {
        uint256 id;
        bool isVerified;
        uint256 price;
        string location;
        address currentOwner;
    }

    mapping(uint256 => Property) public properties;

    event PropertyMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event PropertyVerified(uint256 indexed tokenId);
    event PropertyTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

    constructor(address initialOwner) ERC721("RealEstateAsset", "REA") Ownable(initialOwner) {}

    /**
     * @dev Mint a new property NFT.
     * @param to Recipient address
     * @param uri IPFS metadata URI
     * @param price Property price in wei
     * @param location Property location string
     */
    function mintProperty(
        address to,
        string memory uri,
        uint256 price,
        string memory location
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        properties[tokenId] = Property({
            id: tokenId,
            isVerified: false,
            price: price,
            location: location,
            currentOwner: to
        });

        emit PropertyMinted(tokenId, to, uri);
        return tokenId;
    }

    /**
     * @dev Verify property by admin.
     * @param tokenId Token ID to verify
     */
    function verifyProperty(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Property does not exist");
        properties[tokenId].isVerified = true;
        emit PropertyVerified(tokenId);
    }

    /**
     * @dev Override transfer to update internal state and emit custom event.
     */
    function transferOwnership(address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        safeTransferFrom(msg.sender, to, tokenId);
        
        properties[tokenId].currentOwner = to;
        emit PropertyTransferred(tokenId, msg.sender, to);
    }

    /**
     * @dev Get property details.
     */
    function getProperty(uint256 tokenId) public view returns (Property memory) {
        require(_ownerOf(tokenId) != address(0), "Property does not exist");
        return properties[tokenId];
    }
}
