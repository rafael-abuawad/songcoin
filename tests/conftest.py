import ape
import pytest


@pytest.fixture
def deployer(accounts):
    return accounts[0]


@pytest.fixture
def mock_erc20(project, deployer):
    mock_erc20 = project.mock_erc20.deploy(
        "SongCoin", "SONG", 18, 1000000, "SongCoin", "1.0.0", sender=deployer
    )
    return mock_erc20


@pytest.fixture
def auction(project, deployer):
    auction = project.acution.deploy(sender=deployer)
    return auction
