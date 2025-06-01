from ape import accounts, project
from eth_pydantic_types import HexBytes


def main():
    # Get the latest deployments
    songcoin = project.mock_erc20.at("0x5FbDB2315678afecb367f032d93F642f64180aa3")
    auction = project.auction.at("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9")

    # Get the deployer account
    deployer = accounts.test_accounts[0]
    bidder = accounts.test_accounts[1]

    # Mint tokens to bidder
    mint_amount = int(10_000e18)
    songcoin.mint(bidder, mint_amount, sender=deployer)

    # Approve tokens for auction
    approve_amount = int(120e18)
    songcoin.approve(auction.address, approve_amount, sender=bidder)

    # Create a song object
    song = {
        "title": "Bunsen Burner",
        "artist": "CUTS",
        "iframe_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "iframe_url": "https://open.spotify.com/embed/track/1IKnkAtTKion90wF8yxSgS?utm_source=generator",
    }

    # Make a bid
    bid_amount = int(120e18)
    auction.bid(bid_amount, song, sender=bidder)

    print(f"Successfully created bid of {bid_amount} tokens for song: {song['title']}")
