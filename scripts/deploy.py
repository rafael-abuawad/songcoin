from ape import accounts, project


def deploy_songcoin(deployer):
    songcoin = project.mock_erc20.deploy(
        "SongCoin", "SONG", 18, 1000000, "SongCoin", "1.0.0", sender=deployer
    )
    songcoin.mint(deployer, int(15_000e18), sender=deployer)
    return songcoin


def main():
    deployer = accounts.load("brave")
    songcoin = "0x3690a3Dd53f77D4F343ac8D263c5b2039c5234F8"
    duration = 60 * 5
    project.auction.deploy(songcoin, duration, sender=deployer)
