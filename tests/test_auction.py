import pytest
import ape

from eth_pydantic_types import HexBytes


def test_initialization(auction, mock_erc20):
    """Test contract initialization"""
    assert auction.get_current_round_id() == 0
    assert auction.genesis_round_called() == True
    assert auction.songcoin() == mock_erc20.address

    # Check first round initialization
    current_round = auction.get_current_round()
    assert current_round.id == 0
    assert current_round.start_time > 0
    assert current_round.end_time > current_round.start_time
    assert current_round.highest_bidder == "0x0000000000000000000000000000000000000000"
    assert current_round.highest_bid == 0
    assert current_round.ended == False
    assert current_round.song.title == ""
    assert current_round.song.artist == ""
    assert current_round.song.iframe_hash == HexBytes(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    )


def test_bid_simple(auction, mock_erc20, bidder1, bidder2, song, song2, deployer):
    """Test bidding functionality"""
    # Mint tokens to bidders
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)
    mock_erc20.mint(bidder2, 100_0000, sender=deployer)

    # Approve tokens for bidders
    mock_erc20.approve(auction.address, 1000, sender=bidder1)
    mock_erc20.approve(auction.address, 1000, sender=bidder2)

    # Set round ID
    id = auction.get_current_round_id()

    # First bid
    auction.bid(100, song, sender=bidder1)
    round_data = auction.rounds(id)
    assert round_data.id == id
    assert round_data.highest_bidder == bidder1.address
    assert round_data.highest_bid == 100
    assert round_data.ended == False
    assert round_data.start_time == auction.get_current_round().start_time
    assert round_data.end_time == auction.get_current_round().end_time
    assert round_data.song.title == song["title"]
    assert round_data.song.artist == song["artist"]

    # Check pending returns for outbid bidder
    assert auction.get_pending_returns(bidder1, id) == 0
    assert auction.get_pending_returns(bidder2, id) == 0

    # Higher bid
    auction.bid(200, song, sender=bidder2)
    round_data = auction.rounds(id)
    assert round_data.id == id
    assert round_data.highest_bidder == bidder2.address
    assert round_data.highest_bid == 200
    assert round_data.ended == False
    assert round_data.start_time == auction.get_current_round().start_time
    assert round_data.end_time == auction.get_current_round().end_time
    assert round_data.song.title == song["title"]

    # Check pending returns for outbid bidder
    assert auction.get_pending_returns(bidder1, id) == 0
    assert auction.get_pending_returns(bidder2, id) == 0


def test_bid_validation(auction, mock_erc20, bidder1, song, deployer):
    """Test bid validation"""
    # Mint tokens to bidder
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)

    # Approve tokens for bidder
    mock_erc20.approve(auction.address, 1000, sender=bidder1)

    # Test bid too low
    auction.bid(100, song, sender=bidder1)
    with ape.reverts("auction: bid is too low"):
        auction.bid(50, song, sender=bidder1)


def test_withdraw_simple(chain, auction, mock_erc20, deployer, bidder1, bidder2, song):
    """Test withdrawal functionality"""
    # Mint tokens to bidders
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)
    mock_erc20.mint(bidder2, 100_0000, sender=deployer)

    # Set round ID
    id = auction.get_current_round_id()

    # Setup: Create a bid and get outbid
    mock_erc20.approve(auction.address, 1000, sender=bidder1)
    mock_erc20.approve(auction.address, 1000, sender=bidder2)

    auction.bid(100, song, sender=bidder1)
    auction.bid(200, song, sender=bidder2)

    # Test pending returns
    assert auction.get_pending_returns(bidder1, id) == 0
    assert auction.get_pending_returns(bidder2, id) == 0

    current_round = auction.get_current_round()
    # Set timestamp to end of round
    end_time = current_round.end_time
    chain.pending_timestamp += end_time
    chain.mine()

    # End round
    auction.end_round(sender=deployer)

    # Start new round
    auction.start_new_round(sender=deployer)

    # Withdraw
    pending_returns = auction.get_pending_returns(bidder1, id)
    assert pending_returns == 100

    initial_balance = mock_erc20.balanceOf(bidder1)
    auction.withdraw(id, sender=bidder1)
    final_balance = mock_erc20.balanceOf(bidder1)

    assert final_balance - initial_balance == pending_returns
    assert auction.get_pending_returns(bidder1, id) == 0

    # Highest bidder cannot withdraw
    with ape.reverts("auction: no refunds"):
        auction.withdraw(id, sender=bidder2)

    # Bidder 1 cannot withdraw again
    with ape.reverts("auction: no refunds"):
        auction.withdraw(id, sender=bidder1)


def test_end_round(chain, auction, mock_erc20, deployer, bidder1, song):
    """Test ending a round"""
    # Mint tokens to bidder
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)

    # Approve tokens for bidder
    mock_erc20.approve(auction.address, 1000, sender=bidder1)
    auction.bid(100, song, sender=bidder1)

    # Set round ID
    id = auction.get_current_round_id()

    # Set timestamp to end of round
    active_round = auction.get_current_round()
    end_time = active_round.end_time
    chain.pending_timestamp += end_time
    chain.mine()

    # End round
    auction.end_round(sender=deployer)

    round_data = auction.rounds(id)
    assert round_data.ended  # ended


def test_end_round_validation(chain, auction, mock_erc20, deployer, bidder1, song):
    """Test end round validation"""
    # Mint tokens to bidder
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)

    # Approve tokens for bidder
    mock_erc20.approve(auction.address, 1000, sender=bidder1)
    auction.bid(100, song, sender=bidder1)

    # Set round ID
    id = auction.get_current_round_id()

    # Set timestamp to end of round
    current_round = auction.get_current_round()
    end_time = current_round.end_time
    chain.pending_timestamp += end_time
    chain.mine()

    # End round
    auction.end_round(sender=deployer)

    # Check round data
    ended_round = auction.rounds(id)
    assert ended_round.ended
    assert ended_round.highest_bidder == bidder1.address
    assert ended_round.highest_bid == 100
    assert ended_round.song.title == song["title"]
    assert ended_round.song.artist == song["artist"]
    assert ended_round.song.iframe_hash == HexBytes(song["iframe_hash"])

    # Try to end round again
    with ape.reverts("auction: round has already ended"):
        auction.end_round(sender=deployer)


def test_start_new_round(chain, auction, mock_erc20, deployer, bidder1, song):
    """Test starting a new round"""
    # Mint tokens to bidder
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)

    # Set round ID
    id = auction.get_current_round_id()

    # Approve tokens for bidder
    mock_erc20.approve(auction.address, 1000, sender=bidder1)
    auction.bid(100, song, sender=bidder1)

    # Set timestamp to end of round
    current_round = auction.get_current_round()
    end_time = current_round.end_time
    chain.pending_timestamp += end_time
    chain.mine()

    # End current round
    auction.end_round(sender=deployer)

    # Start new round
    auction.start_new_round(sender=deployer)

    # Set round ID
    new_id = auction.get_current_round_id()
    assert new_id == id + 1

    # Check round data
    round_data = auction.get_current_round()
    assert round_data.id == new_id
    assert round_data.highest_bidder == "0x0000000000000000000000000000000000000000"
    assert round_data.highest_bid == 0
    assert round_data.ended == False
    assert round_data.start_time == auction.get_current_round().start_time
    assert round_data.end_time == auction.get_current_round().end_time
    assert round_data.song.title == ""
    assert round_data.song.artist == ""
    assert round_data.song.iframe_hash == HexBytes(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    )


def test_start_new_round_validation(auction, mock_erc20, deployer, bidder1, song):
    """Test start new round validation"""
    # Mint tokens to bidder
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)

    # Approve tokens for bidder
    mock_erc20.approve(auction.address, 1000, sender=bidder1)
    auction.bid(100, song, sender=bidder1)

    # Try to start new round before ending current round
    with ape.reverts("auction: round has not ended"):
        auction.start_new_round(sender=deployer)


def test_withdraw_validation(auction, mock_erc20, bidder1, song, deployer):
    """Test withdrawal validation"""
    # Mint tokens to bidder
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)

    # Approve tokens for bidder
    mock_erc20.approve(auction.address, 1000, sender=bidder1)
    auction.bid(100, song, sender=bidder1)

    # Set round ID
    id = auction.get_current_round_id()

    # Try to withdraw from current round
    with ape.reverts("auction: round cannot be current"):
        auction.withdraw(id, sender=bidder1)

    # Try to withdraw from non-existent round
    with ape.reverts("auction: round does not exist"):
        auction.withdraw(id + 1, sender=bidder1)


def test_song_bid_event(auction, mock_erc20, bidder1, song, deployer):
    """Test SongBid event emission"""
    # Mint tokens to bidder
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)
    mock_erc20.approve(auction.address, 1000, sender=bidder1)

    # Make a bid and check event
    tx = auction.bid(100, song, sender=bidder1)

    # Get the event
    event = tx.events[2]
    assert event.sender == bidder1.address
    assert event.r == 1  # First round
    assert event.amount == 100
    assert event.song[0] == song["name"]
    assert event.song[1] == song["artist"]
    assert event.song[2] == HexBytes(song["iframe_hash"])


def test_multiple_rounds(chain, auction, mock_erc20, deployer, bidder1, bidder2, song):
    """Test multiple rounds of bidding"""
    # Mint tokens to bidders
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)
    mock_erc20.mint(bidder2, 100_0000, sender=deployer)
    mock_erc20.approve(auction.address, 1000, sender=bidder1)
    mock_erc20.approve(auction.address, 1000, sender=bidder2)

    # Round 1
    auction.bid(100, song, sender=bidder1)
    auction.bid(200, song, sender=bidder2)

    # End round 1
    current_round = auction.get_active_round()
    chain.pending_timestamp += current_round.end_time
    chain.mine()
    auction.end_round(sender=deployer)

    # Start round 2
    auction.start_new_round(sender=deployer)

    # Round 2
    auction.bid(300, song, sender=bidder1)
    auction.bid(400, song, sender=bidder2)

    # Verify round 1 data
    round1 = auction.rounds(1)
    assert round1[0] == bidder2.address
    assert round1[1] == 200
    assert round1[3] == True  # ended

    # Verify round 2 data
    round2 = auction.rounds(2)
    assert round2[0] == bidder2.address
    assert round2[1] == 400
    assert round2[3] == False  # not ended


def test_bid_after_round_end(chain, auction, mock_erc20, deployer, bidder1, song):
    """Test bidding after round end time"""
    # Mint tokens to bidder
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)
    mock_erc20.approve(auction.address, 1000, sender=bidder1)

    # Set timestamp to after round end
    current_round = auction.get_active_round()
    chain.pending_timestamp += current_round.end_time + 1
    chain.mine()

    auction.end_round(sender=deployer)

    # Try to bid after round end
    with ape.reverts():
        auction.bid(100, song, sender=bidder1)


def test_withdraw_multiple_rounds(
    chain, auction, mock_erc20, deployer, bidder1, bidder2, song
):
    """Test withdrawing from multiple rounds"""
    # Mint tokens to bidders
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)
    mock_erc20.mint(bidder2, 100_0000, sender=deployer)
    mock_erc20.approve(auction.address, 1000, sender=bidder1)
    mock_erc20.approve(auction.address, 1000, sender=bidder2)

    # Round 1: bidder1 gets outbid
    auction.bid(100, song, sender=bidder1)
    auction.bid(200, song, sender=bidder2)

    # End round 1
    current_round = auction.get_active_round()
    chain.pending_timestamp += current_round.end_time
    chain.mine()
    auction.end_round(sender=deployer)

    # Start round 2
    auction.start_new_round(sender=deployer)

    # Round 2: bidder2 gets outbid
    auction.bid(300, song, sender=bidder1)
    auction.bid(400, song, sender=bidder2)

    # End round 2
    current_round = auction.get_active_round()
    chain.pending_timestamp += current_round.end_time
    chain.mine()
    auction.end_round(sender=deployer)

    # Start round 3
    auction.start_new_round(sender=deployer)

    # Withdraw from both rounds
    initial_balance = mock_erc20.balanceOf(bidder1)

    auction.withdraw(1, sender=bidder1)
    with ape.reverts():
        auction.withdraw(1, sender=bidder2)

    final_balance = mock_erc20.balanceOf(bidder1)

    assert final_balance - initial_balance == 100
    assert auction.pending_returns(bidder1, 1) == 0
    assert auction.pending_returns(bidder2, 1) == 0


def test_round_duration(auction):
    """Test round duration is correct"""
    round1 = auction.rounds(1)
    assert round1[5] - round1[4] == 60 * 60 * 24  # 1 day in seconds


def test_bid_with_insufficient_balance(auction, mock_erc20, bidder1, song, deployer):
    """Test bidding with insufficient token balance"""
    # Don't mint any tokens
    mock_erc20.approve(auction.address, 1000, sender=bidder1)

    # Try to bid without tokens
    with ape.reverts():
        auction.bid(100, song, sender=bidder1)


def test_bid_without_approval(auction, mock_erc20, bidder1, song, deployer):
    """Test bidding without token approval"""
    # Mint tokens but don't approve
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)

    # Try to bid without approval
    with ape.reverts():
        auction.bid(100, song, sender=bidder1)
