from ape import accounts, project


def deploy_songcoin(deployer):
    songcoin = project.mock_erc20.deploy(
        "SongCoin", "SONG", 18, 1000000, "SongCoin", "1.0.0", sender=deployer
    )
    songcoin.mint(deployer, int(15_000e18), sender=deployer)
    return songcoin


def main():
    deployer = accounts.load("songcoin")
    songcoin = "0x5dfcf3458cc506be8d9d939d1fe1ddc0a54300a3"
    duration = 60 * 60 * 24  # 24 hours
    project.auction.deploy(songcoin, duration, sender=deployer, publish=True)
