# pragma version ~=0.4.2rc1
# @title Open Auction with Rounds

# interfaces
from ethereum.ercs import IERC20

# @dev We import and initialise the `ownable` module.
from snekmate.auth import ownable as ow
initializes: ow

# Structs
struct Song:
    name: String[32]
    artist: String[32]
    iframe_hash: bytes32

struct Round:
    highest_bidder: address
    highest_bid: uint256
    song: Song
    ended: bool
    start_time: uint256
    end_time: uint256

# Events
event SongBid:
    sender: address
    r: indexed(uint256)
    amount: indexed(uint256)
    song: Song

# Track rounds
rounds: public(HashMap[uint256, Round])
current_round: public(uint256)

# Token
SONGCOIN: immutable(IERC20)

# Auction params
ROUND_DURATION: constant(uint256) = 60 * 60 * 24 # 1 day

# Keep track of refunded bids per round
# address -> round -> amount
pending_returns: public(HashMap[address, HashMap[uint256, uint256]])


# @dev We export all `external` functions
# from the `ownable` module.
exports: ow.__interface__


# Create an auction with `_auction_start` and `_round_duration` seconds per round
@deploy
def __init__(_songcoin: address):
    self.current_round = 1
    SONGCOIN = IERC20(_songcoin)
    # Initialize first round
    auction_start: uint256 = block.timestamp
    self.rounds[1] = Round(
        highest_bidder=empty(address),
        highest_bid=0,
        song=Song(name="", artist="", iframe_hash=empty(bytes32)),
        ended=False,
        start_time=auction_start,
        end_time=auction_start + ROUND_DURATION
    )
    assert block.timestamp < self.rounds[1].end_time  # First round end time in future
    ow.__init__()


# Bid on the current round with the value sent
@external
def bid(_amount: uint256, _song: Song):
    # Get current round
    current_round: uint256 = self.current_round
    r: Round = self.rounds[current_round]

    # Check if round has started
    assert block.timestamp >= r.start_time # Round hasn't started

    # Check if round is not over
    assert block.timestamp < r.end_time # Round is over

    # Check if bid is high enough
    assert _amount > r.highest_bid # Bid is too low

    # Transfer SONGCOIN from sender to contract
    assert extcall SONGCOIN.transferFrom(msg.sender, self, _amount) # Transfer failed

    # Track refund for previous high bidder in this round
    self.pending_returns[r.highest_bidder][current_round] += r.highest_bid

    # Update round with new high bid
    self.rounds[current_round].highest_bidder = msg.sender
    self.rounds[current_round].highest_bid = _amount
    self.rounds[current_round].song = _song

    log SongBid(sender=msg.sender, r=current_round, amount=_amount, song=_song)


# Withdraw a previously refunded bid for a specific round
@external
def withdraw(_round: uint256):
    active_round: Round = self.rounds[self.current_round]
    pending_amount: uint256 = self.pending_returns[msg.sender][_round]

    assert _round < self.current_round # Can't withdraw from a round that doesn't exist
    assert _round != self.current_round # Can't withdraw from the current round
    assert pending_amount > 0 # No refunds if no bid
    assert active_round.highest_bidder != msg.sender # Can't withdraw active bid

    self.pending_returns[msg.sender][_round] = 0
    extcall SONGCOIN.transfer(msg.sender, pending_amount)


# End the current round and send the highest bid to the beneficiary
@external
def end_round():
    active_round: Round = self.rounds[self.current_round]
    # Check if round end time has been reached
    assert block.timestamp >= active_round.end_time
    # Check if round has not already ended
    assert not active_round.ended
    # Mark round as ended
    self.rounds[self.current_round].ended = True


# Start a new round
@external
def start_new_round():
    # Ensure current round has ended
    assert self.rounds[self.current_round].ended
    # Increment round counter
    self.current_round += 1
    # Initialize new round
    new_start: uint256 = self.rounds[self.current_round - 1].end_time
    self.rounds[self.current_round] = Round(
        highest_bidder=empty(address),
        highest_bid=0,
        song=Song(name="", artist="", iframe_hash=empty(bytes32)),
        ended=False,
        start_time=new_start,
        end_time=new_start + ROUND_DURATION
    )
    assert block.timestamp < self.rounds[self.current_round].end_time