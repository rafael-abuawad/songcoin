from ape import accounts, project
from eth_pydantic_types import HexBytes


def main():
    # Get the latest deployments
    songcoin = project.mock_erc20.at("0x5FbDB2315678afecb367f032d93F642f64180aa3")
    auction = project.auction.at("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9")

    # Get the deployer account
    deployer = accounts.test_accounts[0]
    
    # Create a list of songs
    songs = [
        {
            "title": "Bunsen Burner",
            "artist": "CUTS",
            "iframe_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            "iframe_url": "https://open.spotify.com/embed/track/1IKnkAtTKion90wF8yxSgS?utm_source=generator",
        },
        {
            "title": "Sonne",
            "artist": "Rammstein",
            "iframe_hash": "0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef",
            "iframe_url": "https://open.spotify.com/embed/track/3gJhLZveDUDIxKdY0bFd7i?utm_source=generator",
        },
        {
            "title": "Bohemian Rhapsody",
            "artist": "Queen",
            "iframe_hash": "0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef",
            "iframe_url": "https://open.spotify.com/embed/track/6l8GvAyoUZwWDgF1e4822w?utm_source=generator",
        },
        {
            "title": "Starman",
            "artist": "David Bowie",
            "iframe_hash": "0x4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef",
            "iframe_url": "https://open.spotify.com/embed/track/0pQskrTITgmCMyr85tb9qq?utm_source=generator",
        },
        {
            "title": "Smells Like Teen Spirit",
            "artist": "Nirvana",
            "iframe_hash": "0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef",
            "iframe_url": "https://open.spotify.com/embed/track/5ghIJDpPoe3CfHMGu71E6T?utm_source=generator",
        }
    ]

    # Create 5 bids with increasing amounts
    bid_amounts = [int(20e18), int(40e18), int(60e18), int(90e18), int(120e18)]
    
    for i, (bid_amount, song) in enumerate(zip(bid_amounts, songs)):
        # Get a new bidder account for each bid
        bidder = accounts.test_accounts[i + 1]
        
        # Mint tokens to bidder
        mint_amount = int(10_000e18)
        songcoin.mint(bidder, mint_amount, sender=deployer)
        
        # Approve tokens for auction
        songcoin.approve(auction.address, bid_amount, sender=bidder)
        
        # Make a bid
        auction.bid(bid_amount, song, sender=bidder)
        
        print(f"Successfully created bid of {bid_amount} tokens for song: {song['title']} by {song['artist']} by bidder {i + 1}")
