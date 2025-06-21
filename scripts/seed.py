import click
from ape import accounts, project
from eth_pydantic_types import HexBytes


BRAVE_TEST_WALLET = "0xC14fF56E720f79d08413CE00533256433D2ED929"
AUCTION_ADDRESS = "0xC0a0958b5597E53e3c4e9925518fc00F7e9daDCC"
SONGCOIN_ADDRESS = "0x779a9cDd0D8527853be3b0047cEA866c8E5E7356"


def main():
    # Get the latest deployments
    songcoin = project.mock_erc20.at(SONGCOIN_ADDRESS)
    auction = project.auction.at(AUCTION_ADDRESS)

    # Get the deployer account
    deployer = accounts.load("songcoin")
    deployer.set_autosign(True)

    # Mint testwallet
    songcoin.mint(BRAVE_TEST_WALLET, int(150e18), sender=deployer)

    # Create a list of songs
    songs = [
        {
            "title": "Bunsen Burner",
            "artist": "CUTS",
            "iframe_hash": HexBytes(
                "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
            ),
            "iframe_url": "https://open.spotify.com/embed/track/1IKnkAtTKion90wF8yxSgS?utm_source=generator",
        },
        {
            "title": "Sonne",
            "artist": "Rammstein",
            "iframe_hash": HexBytes(
                "0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef"
            ),
            "iframe_url": "https://open.spotify.com/embed/track/3gJhLZveDUDIxKdY0bFd7i?utm_source=generator",
        },
        {
            "title": "Bohemian Rhapsody",
            "artist": "Queen",
            "iframe_hash": HexBytes(
                "0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef"
            ),
            "iframe_url": "https://open.spotify.com/embed/track/6l8GvAyoUZwWDgF1e4822w?utm_source=generator",
        },
        {
            "title": "Starman",
            "artist": "David Bowie",
            "iframe_hash": HexBytes(
                "0x4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef"
            ),
            "iframe_url": "https://open.spotify.com/embed/track/0pQskrTITgmCMyr85tb9qq?utm_source=generator",
        },
        {
            "title": "Smells Like Teen Spirit",
            "artist": "Nirvana",
            "iframe_hash": HexBytes(
                "0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef"
            ),
            "iframe_url": "https://open.spotify.com/embed/track/5ghIJDpPoe3CfHMGu71E6T?utm_source=generator",
        },
    ]

    # Create 5 bids with increasing amounts
    bid_amounts = [int(20e18), int(40e18), int(60e18), int(90e18), int(120e18)]

    for i, (bid_amount, song) in enumerate(zip(bid_amounts, songs)):
        # Get a new bidder account for each bid
        # Mint tokens to bidder
        mint_amount = int(10_000e18)
        songcoin.mint(deployer, mint_amount, sender=deployer)

        # Approve tokens for auction
        songcoin.approve(auction.address, bid_amount, sender=deployer)

        # Make a bid
        auction.bid(bid_amount, song, sender=deployer)
        print(
            f"Successfully created bid of {bid_amount} tokens for song: {song['title']} by {song['artist']} by bidder {i + 1}"
        )
