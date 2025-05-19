# pragma version ~=0.4.2rc1
# @title Open Auction with Rounds

# @dev We import the `IERC20` interface, which is a
# built-in interface of the Vyper compiler.
from ethereum.ercs import IERC20


# @dev We import and initialise the `ownable` module.
from snekmate.auth import ownable as ow
initializes: ow


# @dev We define the `Song` struct
struct Song:
    title: String[32]
    artist: String[32]
    iframe_hash: bytes32


# @dev We define the ´Round´ struct.
struct Round:
    highest_bidder: address
    highest_bid: uint256
    ended: bool
    start_time: uint256
    end_time: uint256
    song: Song


# @dev We define the `SongBid` event.
# Event is emitted when a song is bid on.
event SongBid:
    sender: address
    r: indexed(uint256)
    amount: indexed(uint256)
    song: Song


# @dev We define the `rounds` public variable.
# It is a `HashMap` of `uint256` and `Round`.
rounds: public(HashMap[uint256, Round])


# @dev We define the `current_round` public variable.
current_round: public(uint256)


# @dev We define the `songcoin` public variable.
# It is an immutable `IERC20` token.
songcoin: public(immutable(IERC20))


# @dev We define the `genesis_round_called` public variable.
# to indicate if the genesis round has been called.
genesis_round_called: public(bool)


# @dev We define the `ROUND_DURATION` constant.
ROUND_DURATION: public(constant(uint256)) = 60 * 60 * 24 # 1 day


# @dev We define the `pending_returns` public variable.
# It is a `HashMap` of `address`, `uint256` and `uint256`.
# It keeps track of refunded bids per round.
# address -> round -> amount
pending_returns: public(HashMap[address, HashMap[uint256, uint256]])


# @dev We export all `external` functions
# from the `ownable` module.
exports: ow.__interface__


# @dev We create an auction with `_songcoin` address.
@deploy
def __init__(_songcoin: address):
    songcoin = IERC20(_songcoin)
    self._genesis_round()
    ow.__init__()


@internal
def _genesis_round():
    assert not self.genesis_round_called # auction::genesis_round_already_called
    self.genesis_round_called = True
    self.current_round = 0
    self.rounds[0] = Round(
        highest_bidder=empty(address),
        highest_bid=0,
        ended=False,
        start_time=block.timestamp,
        end_time=block.timestamp + ROUND_DURATION,
        song=Song(title="", artist="", iframe_hash=empty(bytes32))
    )
    assert block.timestamp < self.rounds[0].end_time  # auction::first_round_end_time_in_future


@internal
def _set_highest_bidder_pending_rewards_to_zero(_round: uint256):
    self.pending_returns[self.rounds[self.current_round].highest_bidder][_round] = 0


# @dev We define the `bid` external function.
# It is used to bid on the current round with the value sent.
@external
def bid(_amount: uint256, _song: Song):
    # Get current round
    current_round: uint256 = self.current_round
    r: Round = self.rounds[current_round]

    # Check if round has started and is not over,
    # and if the bid is higher than the highest bid
    assert block.timestamp >= r.start_time # auction::round_has_not_started
    assert block.timestamp < r.end_time # auction::round_is_over
    assert _amount > r.highest_bid # auction::bid_is_too_low

    # Transfer Songcoin from sender to contract
    assert extcall songcoin.transferFrom(msg.sender, self, _amount, default_return_value=False) # auction::transfer_failed

    # Track refund for previous high bidder in this round
    self.pending_returns[r.highest_bidder][current_round] += r.highest_bid

    # Update round with new high bid
    self.rounds[current_round].highest_bidder = msg.sender
    self.rounds[current_round].highest_bid = _amount
    self.rounds[current_round].song = _song

    # Emit SongBid event
    log SongBid(sender=msg.sender, r=current_round, amount=_amount, song=_song)


# @dev We define the `withdraw` external function.
# It is used to withdraw a previously refunded bid for a specific round.
@external
def withdraw(_round: uint256):
    r: Round = self.rounds[_round]
    pending_amount: uint256 = self.pending_returns[msg.sender][_round]

    # Check if round exists, is not current, and has pending returns
    assert _round < self.current_round # auction::round_does_not_exist
    assert _round != self.current_round # auction::round_is_current
    assert pending_amount > 0 # auction::no_refunds

    # Transfer Songcoin from contract to sender
    self.pending_returns[msg.sender][_round] = 0
    assert extcall songcoin.transfer(msg.sender, pending_amount, default_return_value=False) # auction::transfer_failed


@external
def end_round():
    current_round: uint256 = self.current_round
    active_round: Round = self.rounds[current_round]
    # Check if round end time has been reached
    assert block.timestamp >= active_round.end_time # auction::round_has_not_ended
    # Check if round has not already ended
    assert not active_round.ended # auction::round_has_ended
    # Mark round as ended
    self.rounds[current_round].ended = True
    self.rounds[current_round].highest_bidder = empty(address)


# Start a new round
@external
def start_new_round():
    current_round: uint256 = self.current_round
    # Ensure current round has ended
    assert self.rounds[current_round].ended # auction::round_has_not_ended
    # Increment round counter
    current_round += 1
    # Initialize new round
    new_start: uint256 = block.timestamp
    self.rounds[current_round] = Round(
        highest_bidder=empty(address),
        highest_bid=0,
        ended=False,
        start_time=new_start,
        end_time=new_start + ROUND_DURATION,
        song=Song(title="", artist="", iframe_hash=empty(bytes32))
    )
    assert block.timestamp < self.rounds[current_round].end_time # auction::round_end_time_in_future
    self._set_highest_bidder_pending_rewards_to_zero(current_round - 1)
    self.current_round = current_round


@external
@view
def get_active_round() -> Round:
    return self.rounds[self.current_round]


@external
@view
def get_round_duration() -> uint256:
    return ROUND_DURATION


@external
@view
def get_round_start_time() -> uint256:
    return self.rounds[self.current_round].start_time


@external
@view
def get_round_end_time() -> uint256:
    return self.rounds[self.current_round].end_time


@external
@view
def get_pending_returns(user: address, round: uint256) -> uint256:
    return self.pending_returns[user][round]


@external
@view
def get_round_highest_bidder(round: uint256) -> address:
    return self.rounds[round].highest_bidder
