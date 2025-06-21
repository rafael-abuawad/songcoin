import click
from ape import accounts, project

BRAVE_TEST_WALLET = "0xFC65A46ea323Ec049A568F7F39150C5b83f72305"


def deploy_songcoin(deployer):
    click.echo("--------SONGCOIN DEPLOYMENT--------")
    click.echo("Deploying Songcoin...")
    songcoin = project.mock_erc20.deploy(
        "SongCoin", "SONG", 18, 1000000, "SongCoin", "1.0.0", sender=deployer
    )
    click.echo(f"Songcoin deployed to {songcoin.address}")

    # Fund test wallet
    deployer.transfer(BRAVE_TEST_WALLET, int(1e18))
    songcoin.mint(BRAVE_TEST_WALLET, int(150e18), sender=deployer)

    return songcoin


def main():
    deployer = accounts.load("songcoin")
    songcoin = "0x779a9cDd0D8527853be3b0047cEA866c8E5E7356"

    click.echo("--------SONGCOIN AUCTION DEPLOYMENT--------")
    click.echo("Deploying Auction...")
    duration = 60 * 5
    auction = project.auction.deploy(songcoin, duration, sender=deployer)
    click.echo(f"Auction deployed to {auction.address}")
