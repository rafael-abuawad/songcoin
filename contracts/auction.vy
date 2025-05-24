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
    id: uint256
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
    round_id: indexed(uint256)
    amount: indexed(uint256)
    song: Song


# @dev We define the `rounds` public variable.
# It is a `HashMap` of `uint256` and `Round`.
rounds: public(HashMap[uint256, Round])


# @dev We define the `songcoin` public variable.
# It is an immutable `IERC20` token.
songcoin: public(immutable(IERC20))


# @dev We define the `genesis_round_called` public variable.
# to indicate if the genesis round has been called.
genesis_round_called: public(bool)


# @dev We define the `ROUND_DURATION` constant.
# It is the duration of a round in seconds.
ROUND_DURATION: constant(uint256) = 60 * 60 * 24 # 1 day


# @dev We define the `pending_returns` public variable.
# It is a `HashMap` of `address`, `uint256` and `uint256`.
# It keeps track of refunded bids per round.
# address -> round -> amount
pending_returns: public(HashMap[address, HashMap[uint256, uint256]])


# @dev We define the `_id` private variable.
# It is the current round id.
_id: uint256


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
    """
    This function is used to create the genesis round.
    """
    assert not self.genesis_round_called, "auction: genesis round already called"
    self.genesis_round_called = True

    # Current round id to 0
    id: uint256 = 0
    self._id = id

    # Set start and end times for genesis round
    start_time: uint256 = block.timestamp
    end_time: uint256 = start_time + ROUND_DURATION
    self.rounds[id] = Round(
        id=id,
        highest_bidder=empty(address),
        highest_bid=0,
        ended=False,
        start_time=start_time,
        end_time=end_time,
        song=Song(title="", artist="", iframe_hash=empty(bytes32))
    )


# @dev We define the `bid` external function.
# It is used to bid on the current round with the value sent.
@external
def bid(_amount: uint256, _song: Song):
    # Get current round
    id: uint256 = self._id
    r: Round = self.rounds[id]

    # Check if round has started and is not over,
    # and if the bid is higher than the highest bid
    assert block.timestamp >= r.start_time, "auction: round has not started"
    assert block.timestamp < r.end_time, "auction: round is over"
    assert _amount > r.highest_bid, "auction: bid is too low"

    # Transfer Songcoin from sender to contract
    assert extcall songcoin.transferFrom(msg.sender, self, _amount, default_return_value=False), "auction: transfer failed"

    # Track refund for previous high bidder in this round
    if r.highest_bidder != empty(address):
        self.pending_returns[r.highest_bidder][id] += r.highest_bid

    # Update round with new high bid
    self.rounds[id].highest_bidder = msg.sender
    self.rounds[id].highest_bid = _amount
    self.rounds[id].song = _song

    # Emit SongBid event
    log SongBid(sender=msg.sender, round_id=id, amount=_amount, song=_song)


# @dev We define the `withdraw` external function.
# It is used to withdraw a previously refunded bid for a specific round.
@external
def withdraw(_round: uint256):
    # Check if round exists and is not the current round
    id: uint256 = self._id
    assert _round != id, "auction: round cannot be current"
    assert _round < id, "auction: round does not exist"

    r: Round = self.rounds[_round]
    pending_amount: uint256 = self.pending_returns[msg.sender][_round]

    # Check if round has pending returns and is not the current round
    assert pending_amount > 0, "auction: no refunds"
    assert r.highest_bidder != msg.sender, "auction: highest bidder cannot withdraw"

    # Transfer Songcoin from contract to sender
    self.pending_returns[msg.sender][_round] = 0
    assert extcall songcoin.transfer(msg.sender, pending_amount, default_return_value=False), "auction: transfer failed"


@external
def end_round():
    """
    This function is used to end the current round.
    """
    ow._check_owner()

    id: uint256 = self._id
    active_round: Round = self.rounds[id]

    # Check if round end time has been reached
    assert block.timestamp >= active_round.end_time, "auction: round has not ended"

    # Check if round has not already ended
    assert not active_round.ended, "auction: round has already ended"

    # Mark round as ended
    self.rounds[id].ended = True
    self.pending_returns[active_round.highest_bidder][id] = 0


# Start a new round
@external
def start_new_round():
    # Ensure current round has ended
    assert self.rounds[self._id].ended, "auction: round has not ended"

    # Increment round counter
    self._id += 1
    id: uint256 = self._id

    # Initialize new round
    start_time: uint256 = block.timestamp
    end_time: uint256 = start_time + ROUND_DURATION
    self.rounds[id] = Round(
        id=id,
        highest_bidder=empty(address),
        highest_bid=0,
        ended=False,
        start_time=start_time,
        end_time=end_time,
        song=Song(title="", artist="", iframe_hash=empty(bytes32))
    )


@external
@view
def get_current_round() -> Round:
    return self.rounds[self._id]


@external
@view
def get_current_round_id() -> uint256:
    return self._id


@external
@view
def get_round_duration() -> uint256:
    return ROUND_DURATION


@external
@view
def get_pending_returns(_user: address, _id: uint256) -> uint256:
    if self.rounds[_id].highest_bidder == _user:
        return 0
    return self.pending_returns[_user][_id]


@external
@view
def get_round_highest_bidder(_id: uint256) -> address:
    return self.rounds[_id].highest_bidder


@external
@view
def get_round_highest_bid(_id: uint256) -> uint256:
    return self.rounds[_id].highest_bid


@external
@view
def get_round_ended(_id: uint256) -> bool:
    return self.rounds[_id].ended


@external
@view
def get_round_start_time(_id: uint256) -> uint256:
    return self.rounds[_id].start_time


@external
@view
def get_round_end_time(_id: uint256) -> uint256:
    return self.rounds[_id].end_time


@external
@view
def get_round_song(_id: uint256) -> Song:
    return self.rounds[_id].song
