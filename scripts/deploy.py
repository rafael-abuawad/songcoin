import click
from ape import networks, accounts, project


def main():
    network_name = networks.provider.network.name
    if network_name == "local":
        deployer = accounts.test_accounts.generate_test_account()
        deployer.balance += int(1e18)
        songcoin = project.mock_erc20.deploy(
            "SongCoin", "SONG", 18, 1000000, "SongCoin", "1.0.0", sender=deployer
        )
    else:
        deployer = accounts.load("songcoin")
        songcoin = "0x0000000000000000000000000000000000000000"

    click.echo("--------SONGCOIN DEPLOYMENT--------")
    click.echo(f"Signing transactions with {deployer}")
    click.echo(f"Songcoin token address: {songcoin}")

    click.echo("Deploying Auction...")
    auction = project.auction.deploy(songcoin, sender=deployer)
    click.echo(f"Auction deployed to {auction.address}")
