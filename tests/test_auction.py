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
    assert current_round.song.iframe_url == ""


def test_bid_simple(auction, mock_erc20, bidder1, bidder2, song, deployer):
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
    assert round_data.song.iframe_hash == HexBytes(song["iframe_hash"])
    assert round_data.song.iframe_url == song["iframe_url"]

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
    assert round_data.song.artist == song["artist"]
    assert round_data.song.iframe_hash == HexBytes(song["iframe_hash"])
    assert round_data.song.iframe_url == song["iframe_url"]

    # Check pending returns for outbid bidder
    assert auction.get_pending_returns(bidder1, id) == 100
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
    assert auction.get_pending_returns(bidder1, id) == 100
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
    assert ended_round.song.iframe_url == song["iframe_url"]

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
    assert round_data.song.iframe_url == ""


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
    approve_amount = 1000
    mock_erc20.approve(auction.address, approve_amount, sender=bidder1)

    # Make a bid and check event
    amount = 100
    tx = auction.bid(100, song, sender=bidder1)

    # Get the event
    approval_event = tx.events[0]
    assert approval_event.owner == bidder1
    assert approval_event.spender == auction.address
    assert (
        approval_event.value == approve_amount - amount
    )  # amount of tokens approved for auction

    transfer_event = tx.events[1]
    assert transfer_event.sender == bidder1
    assert transfer_event.receiver == auction.address
    assert transfer_event.value == amount

    song_bid_event = tx.events[2]
    assert song_bid_event.sender == bidder1
    assert song_bid_event.round_id == auction.get_current_round_id()
    assert song_bid_event.amount == amount
    assert song_bid_event.song[0] == song["title"]  # title
    assert song_bid_event.song[1] == song["artist"]  # artist
    assert song_bid_event.song[2] == HexBytes(song["iframe_hash"])  # iframe_hash
    assert song_bid_event.song[3] == song["iframe_url"]  # iframe_url


def test_multiple_rounds(chain, auction, mock_erc20, deployer, bidder1, bidder2, song):
    """Test multiple rounds of bidding"""
    # Mint tokens to bidders
    mint_amount = 100_0000
    mock_erc20.mint(bidder1, mint_amount, sender=deployer)
    mock_erc20.mint(bidder2, mint_amount, sender=deployer)

    approve_amount = 1000
    mock_erc20.approve(auction.address, approve_amount, sender=bidder1)
    mock_erc20.approve(auction.address, approve_amount, sender=bidder2)

    # Round 1
    bidder1_bid1 = 100
    bidder2_bid1 = 200
    auction.bid(bidder1_bid1, song, sender=bidder1)
    auction.bid(bidder2_bid1, song, sender=bidder2)

    id = auction.get_current_round_id()

    # End round 1
    current_round = auction.get_current_round()
    chain.pending_timestamp += current_round.end_time
    chain.mine()
    auction.end_round(sender=deployer)

    # Start round 2
    auction.start_new_round(sender=deployer)

    # Round 2
    bidder1_bid2 = 300
    bidder2_bid2 = 400
    auction.bid(bidder1_bid2, song, sender=bidder1)
    auction.bid(bidder2_bid2, song, sender=bidder2)

    # Verify round 1 data
    round1 = auction.rounds(id)
    assert round1.highest_bidder == bidder2.address
    assert round1.highest_bid == bidder2_bid1
    assert round1.ended  # ended

    # Verify round 2 data
    round2 = auction.rounds(id + 1)
    assert round2.highest_bidder == bidder2.address
    assert round2.highest_bid == bidder2_bid2
    assert not round2.ended  # not ended


def test_bid_after_round_end(chain, auction, mock_erc20, deployer, bidder1, song):
    """Test bidding after round end time"""
    # Mint tokens to bidder
    mint_amount = 100_0000
    mock_erc20.mint(bidder1, mint_amount, sender=deployer)
    approve_amount = 1000
    mock_erc20.approve(auction.address, approve_amount, sender=bidder1)

    # Set timestamp to after round end
    current_round = auction.get_current_round()
    chain.pending_timestamp += current_round.end_time + 1
    chain.mine()

    auction.end_round(sender=deployer)

    # Try to bid after round end
    with ape.reverts("auction: round is over"):
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
    bidder1_bid1 = 100
    auction.bid(bidder1_bid1, song, sender=bidder1)
    bidder2_bid1 = 200
    auction.bid(bidder2_bid1, song, sender=bidder2)

    # Set round ID
    round1_id = auction.get_current_round_id()

    # End round 1
    current_round = auction.get_current_round()
    chain.pending_timestamp += current_round.end_time
    chain.mine()
    auction.end_round(sender=deployer)

    round1 = auction.rounds(round1_id)
    assert round1.highest_bidder == bidder2.address
    assert round1.highest_bid == bidder2_bid1
    assert round1.ended

    # Start round 2
    auction.start_new_round(sender=deployer)

    # Cehck round 1 pending returns
    assert auction.get_pending_returns(bidder1, round1_id) == bidder1_bid1
    assert auction.get_pending_returns(bidder2, round1_id) == 0

    # Round 2: bidder1 gets outbid
    bidder1_bid2 = 300
    auction.bid(bidder1_bid2, song, sender=bidder1)
    bidder2_bid2 = 400
    auction.bid(bidder2_bid2, song, sender=bidder2)

    # End round 2
    current_round = auction.get_current_round()
    chain.pending_timestamp += current_round.end_time
    chain.mine()
    auction.end_round(sender=deployer)

    # Set round ID
    round2_id = auction.get_current_round_id()

    round2 = auction.rounds(round2_id)
    assert round2.highest_bidder == bidder2.address
    assert round2.highest_bid == bidder2_bid2
    assert round2.ended

    # Start round 3
    auction.start_new_round(sender=deployer)

    # Cehck pending returns
    assert auction.get_pending_returns(bidder1, round1_id) == bidder1_bid1
    assert auction.get_pending_returns(bidder1, round2_id) == bidder1_bid2
    assert auction.get_pending_returns(bidder2, round1_id) == 0
    assert auction.get_pending_returns(bidder2, round2_id) == 0


def test_round_duration(auction):
    """Test round duration is correct"""
    current_round = auction.get_current_round()
    assert (
        current_round.end_time - current_round.start_time == 60 * 60 * 24
    )  # 1 day in seconds


def test_bid_with_insufficient_balance(auction, mock_erc20, bidder1, song, deployer):
    """Test bidding with insufficient token balance"""
    # Don't mint any tokens
    mock_erc20.approve(auction.address, 1000, sender=bidder1)

    # Try to bid without tokens
    with ape.reverts("erc20: transfer amount exceeds balance"):
        auction.bid(100, song, sender=bidder1)


def test_bid_without_approval(auction, mock_erc20, bidder1, song, deployer):
    """Test bidding without token approval"""
    # Mint tokens but don't approve
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)

    # Try to bid without approval
    with ape.reverts("erc20: insufficient allowance"):
        auction.bid(100, song, sender=bidder1)


def test_check_song_url(auction, mock_erc20, bidder1, bidder2, song, deployer):
    """Test check song url"""
    # Mint tokens to bidders
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)
    mock_erc20.mint(bidder2, 100_0000, sender=deployer)

    # Approve tokens for bidders
    mock_erc20.approve(auction.address, 1000, sender=bidder1)
    mock_erc20.approve(auction.address, 1000, sender=bidder2)

    # Set round ID
    id = auction.get_current_round_id()
    song_copy = song.copy()

    song_copy["iframe_url"] = "https://hack.com"
    print(song_copy)
    with ape.reverts("auction: invalid song url"):
        auction.bid(100, song_copy, sender=bidder1)


def test_check_song_url_invalid(auction, song):
    assert auction.check_song_url(song["iframe_url"])
    assert not auction.check_song_url("https://hack.com")
    assert not auction.check_song_url(
        "https://track/1IKnkAtTKion90wF8yxSgS?utm_source=generator"
    )
    assert not auction.check_song_url(
        "https://steal.com/track/1IKnkAtTKion90wF8yxSgS?utm_source=generator/"
    )
    assert not auction.check_song_url(
        "https://com/track/1IKnkAtTKion90wF8yxSgS?utm_source=generator"
    )


def test_last_winning_round(
    chain, auction, mock_erc20, deployer, bidder1, bidder2, song
):
    # Mint tokens to bidders
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)
    mock_erc20.mint(bidder2, 100_0000, sender=deployer)

    # Approve tokens for bidders
    mock_erc20.approve(auction.address, 1000, sender=bidder1)
    mock_erc20.approve(auction.address, 1000, sender=bidder2)

    # Round 1: bidder1 gets outbid
    bidder1_bid1 = 100
    auction.bid(bidder1_bid1, song, sender=bidder1)
    bidder2_bid1 = 200
    auction.bid(bidder2_bid1, song, sender=bidder2)

    # Set round ID
    round1_id = auction.get_current_round_id()

    # End round 1
    current_round = auction.get_current_round()
    chain.pending_timestamp += current_round.end_time
    chain.mine()
    auction.end_round(sender=deployer)

    # Check last winning round after round 1
    last_winning_round = auction.last_winning_round()
    assert last_winning_round.id == round1_id
    assert last_winning_round.highest_bidder == bidder2.address
    assert last_winning_round.highest_bid == bidder2_bid1
    assert last_winning_round.ended
    assert last_winning_round.song.title == song["title"]
    assert last_winning_round.song.artist == song["artist"]
    assert last_winning_round.song.iframe_hash == HexBytes(song["iframe_hash"])
    assert last_winning_round.song.iframe_url == song["iframe_url"]

    # Start round 2
    auction.start_new_round(sender=deployer)

    # Round 2: bidder1 gets outbid again
    bidder1_bid2 = 300
    auction.bid(bidder1_bid2, song, sender=bidder1)
    bidder2_bid2 = 400
    auction.bid(bidder2_bid2, song, sender=bidder2)

    # End round 2
    current_round = auction.get_current_round()
    chain.pending_timestamp += current_round.end_time
    chain.mine()
    auction.end_round(sender=deployer)

    # Check last winning round after round 2
    last_winning_round = auction.last_winning_round()
    assert last_winning_round.id == round1_id + 1
    assert last_winning_round.highest_bidder == bidder2.address
    assert last_winning_round.highest_bid == bidder2_bid2
    assert last_winning_round.ended
    assert last_winning_round.song.title == song["title"]
    assert last_winning_round.song.artist == song["artist"]
    assert last_winning_round.song.iframe_hash == HexBytes(song["iframe_hash"])
    assert last_winning_round.song.iframe_url == song["iframe_url"]


def test_get_latests_bids(chain, auction, mock_erc20, deployer, bidder1, song):
    # Mint tokens to bidders
    mock_erc20.mint(bidder1, int(100e18), sender=deployer)

    # Approve tokens for bidders
    mock_erc20.approve(auction.address, int(100e18), sender=bidder1)

    # Set round ID
    round_id = auction.get_current_round_id()

    # Make 5 bids (2 more than MAX_NUMBER_OF_LATESTS_BIDDED_SONGS)
    # 0,1,2 -> 1,2,3 -> 2,3,4
    for i in range(5):
        # Create a unique song for each bid
        current_song = song.copy()
        current_song["title"] = f"Song {i}"
        current_song["artist"] = f"Artist {i}"
        current_song["iframe_hash"] = HexBytes(
            "0x0000000000000000000000000000000000000000000000000000000000000000"
        )
        current_song["iframe_url"] = f"https://open.spotify.com/embed/track/{i}"

        # Make bid with increasing amounts
        auction.bid(100 + (i * 10), current_song, sender=bidder1)

    # Get latest bidded songs
    latest_bidded_songs = auction.get_latests_bidded_songs(round_id)
    # Should only have MAX_NUMBER_OF_LATESTS_BIDDED_SONGS (3) songs
    assert len(latest_bidded_songs) == 3

    # 2,3,4 are the latest bidded songs
    bidded_songs = [2, 3, 4]
    for i in range(3):
        latest_bidded_song = latest_bidded_songs[i]
        assert latest_bidded_song.title == f"Song {bidded_songs[i]}"
        assert latest_bidded_song.artist == f"Artist {bidded_songs[i]}"
        assert latest_bidded_song.iframe_hash == HexBytes(
            "0x0000000000000000000000000000000000000000000000000000000000000000"
        )
        assert (
            latest_bidded_song.iframe_url
            == f"https://open.spotify.com/embed/track/{bidded_songs[i]}"
        )

    # 2,3,4 -> 3,4,5
    auction.bid(100000, song, sender=bidder1)
    latest_bidded_songs = auction.get_latests_bidded_songs(round_id)
    assert len(latest_bidded_songs) == 3
    assert latest_bidded_songs[0].title == f"Song {3}"
    assert latest_bidded_songs[0].artist == f"Artist {3}"
    assert latest_bidded_songs[0].iframe_hash == HexBytes(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    )
    assert (
        latest_bidded_songs[0].iframe_url == f"https://open.spotify.com/embed/track/{3}"
    )


def test_get_total_pending_returns(
    chain, auction, mock_erc20, deployer, bidder1, bidder2, song
):
    """Test getting total pending returns across multiple rounds"""
    # Mint tokens to bidders
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)
    mock_erc20.mint(bidder2, 100_0000, sender=deployer)

    # Approve tokens for bidders
    mock_erc20.approve(auction.address, 1000, sender=bidder1)
    mock_erc20.approve(auction.address, 1000, sender=bidder2)

    # Round 1: bidder1 gets outbid
    bidder1_bid1 = 100
    auction.bid(bidder1_bid1, song, sender=bidder1)
    bidder2_bid1 = 200
    auction.bid(bidder2_bid1, song, sender=bidder2)

    # End round 1
    current_round = auction.get_current_round()
    chain.pending_timestamp += current_round.end_time
    chain.mine()
    auction.end_round(sender=deployer)

    # Start round 2
    auction.start_new_round(sender=deployer)

    # Round 2: bidder1 gets outbid again
    bidder1_bid2 = 300
    auction.bid(bidder1_bid2, song, sender=bidder1)
    bidder2_bid2 = 400
    auction.bid(bidder2_bid2, song, sender=bidder2)

    # End round 2
    current_round = auction.get_current_round()
    chain.pending_timestamp += current_round.end_time
    chain.mine()
    auction.end_round(sender=deployer)

    # Start round 3
    auction.start_new_round(sender=deployer)

    # Check total pending returns for bidder1
    total_pending = auction.get_total_pending_returns(bidder1)
    assert total_pending == bidder1_bid1 + bidder1_bid2  # Should be sum of both bids

    # Check total pending returns for bidder2 (should be 0 as they won both rounds)
    total_pending = auction.get_total_pending_returns(bidder2)
    assert total_pending == 0

    # Check total pending returns for deployer (should be 0 as they didn't bid)
    total_pending = auction.get_total_pending_returns(deployer)
    assert total_pending == 0


def test_claim_pending_returns(
    chain, auction, mock_erc20, deployer, bidder1, bidder2, song
):
    """Test claiming all pending returns across multiple rounds"""
    # Mint tokens to bidders
    mock_erc20.mint(bidder1, 100_0000, sender=deployer)
    mock_erc20.mint(bidder2, 100_0000, sender=deployer)

    # Approve tokens for bidders
    mock_erc20.approve(auction.address, 1000, sender=bidder1)
    mock_erc20.approve(auction.address, 1000, sender=bidder2)

    # Round 1: bidder1 gets outbid
    bidder1_bid1 = 100
    auction.bid(bidder1_bid1, song, sender=bidder1)
    bidder2_bid1 = 200
    auction.bid(bidder2_bid1, song, sender=bidder2)

    # End round 1
    current_round = auction.get_current_round()
    chain.pending_timestamp += current_round.end_time
    chain.mine()
    auction.end_round(sender=deployer)

    # Start round 2
    auction.start_new_round(sender=deployer)

    # Round 2: bidder1 gets outbid again
    bidder1_bid2 = 300
    auction.bid(bidder1_bid2, song, sender=bidder1)
    bidder2_bid2 = 400
    auction.bid(bidder2_bid2, song, sender=bidder2)

    # End round 2
    current_round = auction.get_current_round()
    chain.pending_timestamp += current_round.end_time
    chain.mine()
    auction.end_round(sender=deployer)

    # Start round 3
    auction.start_new_round(sender=deployer)

    # Get initial balance of bidder1
    initial_balance = mock_erc20.balanceOf(bidder1)

    # Claim all pending returns
    total_pending_returns = auction.get_total_pending_returns(bidder1)
    initial_balance = mock_erc20.balanceOf(bidder1)
    auction.claim_pending_returns(sender=bidder1)

    # Verify total claimed amount
    assert total_pending_returns == bidder1_bid1 + bidder1_bid2

    # Verify final balance
    final_balance = mock_erc20.balanceOf(bidder1)
    assert final_balance - initial_balance == total_pending_returns

    # Verify no more pending returns
    assert auction.get_total_pending_returns(bidder1) == 0

    # Try to claim again (should return 0)
    auction.claim_pending_returns(sender=bidder1)
    current_balance = mock_erc20.balanceOf(bidder1)
    assert current_balance == final_balance
