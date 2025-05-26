import click
from ape import networks, accounts, project

BRAVE_TEST_WALLET = "0xFC65A46ea323Ec049A568F7F39150C5b83f72305"


def main():
    network_name = networks.provider.network.name
    if network_name == "local":
        deployer = accounts.test_accounts.generate_test_account()
        deployer.balance += int(100e18)
        songcoin = project.mock_erc20.deploy(
            "SongCoin", "SONG", 18, 1000000, "SongCoin", "1.0.0", sender=deployer
        )

        # Fund brave test wallet
        deployer.transfer(BRAVE_TEST_WALLET, int(1e18))
        songcoin.mint(BRAVE_TEST_WALLET, int(150e18), sender=deployer)
    else:
        deployer = accounts.load("songcoin")
        songcoin = "0x0000000000000000000000000000000000000000"

    click.echo("--------SONGCOIN DEPLOYMENT--------")
    click.echo(f"Signing transactions with {deployer}")
    click.echo(f"Songcoin token address: {songcoin}")

    click.echo("Deploying Auction...")
    auction = project.auction.deploy(songcoin, sender=deployer)
    click.echo(f"Auction deployed to {auction.address}")
