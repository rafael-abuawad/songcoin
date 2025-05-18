import pytest

# Test data
SONG_NAME = "Test Song"
ARTIST_NAME = "Test Artist"
IFRAME_HASH = "0x1234567890123456789012345678901234567890123456789012345678901234"


@pytest.fixture(scope="module")
def bidder1(accounts):
    return accounts[1]


@pytest.fixture(scope="module")
def bidder2(accounts):
    return accounts[2]


@pytest.fixture(scope="module")
def bidder3(accounts):
    return accounts[3]


@pytest.fixture(scope="module")
def song():
    return {"name": SONG_NAME, "artist": ARTIST_NAME, "iframe_hash": IFRAME_HASH}


@pytest.fixture(scope="module")
def deployer(accounts):
    return accounts[0]


@pytest.fixture(scope="module")
def mock_erc20(project, deployer):
    mock_erc20 = project.mock_erc20.deploy(
        "SongCoin", "SONG", 18, 1000000, "SongCoin", "1.0.0", sender=deployer
    )
    return mock_erc20


@pytest.fixture(scope="module")
def auction(project, deployer, mock_erc20):
    auction = project.auction.deploy(mock_erc20.address, sender=deployer)
    return auction
