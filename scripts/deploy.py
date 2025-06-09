import click
from ape import networks, accounts, project

BRAVE_TEST_WALLET = "0xFC65A46ea323Ec049A568F7F39150C5b83f72305"


def deploy_songcoin(network_name, deployer):
    click.echo("--------SONGCOIN DEPLOYMENT--------")
    click.echo("Deploying Songcoin...")
    songcoin = project.mock_erc20.deploy(
        "SongCoin", "SONG", 18, 1000000, "SongCoin", "1.0.0", sender=deployer
    )
    click.echo(f"Songcoin deployed to {songcoin.address}")

    if network_name == "local":
        # Fund brave test wallet
        deployer.transfer(BRAVE_TEST_WALLET, int(1e18))
        songcoin.mint(BRAVE_TEST_WALLET, int(150e18), sender=deployer)

    return songcoin


def main():
    network_name = networks.provider.network.name
    if network_name == "local":
        deployer = accounts.test_accounts[0]
        deployer.balance += int(100e18)
        songcoin = deploy_songcoin(network_name, deployer)
    else:
        deployer = accounts.load("songcoin")
        songcoin = "0x0000000000000000000000000000000000000000"

    click.echo("--------SONGCOIN AUCTION DEPLOYMENT--------")
    click.echo("Deploying Auction...")
    auction = project.auction.deploy(songcoin, sender=deployer)
    click.echo(f"Auction deployed to {auction.address}")
