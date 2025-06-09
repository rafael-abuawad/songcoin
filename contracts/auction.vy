# pragma version ~=0.4.2rc1
# @title Open Auction with Rounds
# @author SongCoin Team
# @notice This contract implements an auction system for songs with multiple rounds
# @dev The contract allows users to bid on songs using SongCoin tokens. Each round has a duration of 24 hours.
# @dev The contract maintains a list of latest bidded songs and handles refunds for outbid users.

# @dev We import the `IERC20` interface, which is a
# built-in interface of the Vyper compiler.
from ethereum.ercs import IERC20


# @dev We import and initialise the `ownable` module.
from snekmate.auth import ownable as ow
initializes: ow


# @notice Structure representing a song in the auction
# @param title The title of the song
# @param artist The artist of the song
# @param iframe_hash Hash of the song's iframe
# @param iframe_url URL of the song's iframe (must be a Spotify embed URL)
struct Song:
    title: String[32]
    artist: String[32]
    iframe_hash: bytes32
    iframe_url: String[256]


# @notice Structure representing an auction round
# @param id The unique identifier of the round
# @param highest_bidder The address of the current highest bidder
# @param highest_bid The amount of the highest bid
# @param ended Whether the round has ended
# @param start_time The timestamp when the round started
# @param end_time The timestamp when the round will end
# @param song The song being auctioned in this round
struct Round:
    id: uint256
    highest_bidder: address
    highest_bid: uint256
    ended: bool
    start_time: uint256
    end_time: uint256
    song: Song


# @notice Event emitted when a new bid is placed
# @param sender The address of the bidder
# @param round_id The ID of the round being bid on
# @param amount The amount of the bid
# @param song The song being bid on
event SongBid:
    sender: address
    round_id: indexed(uint256)
    amount: indexed(uint256)
    song: Song


# @dev We define the `rounds` public variable.
# Round ID -> Round
rounds: public(HashMap[uint256, Round])


# @dev We define the `songcoin` public variable.
songcoin: public(immutable(IERC20))


# @dev We define the `genesis_round_called` public variable.
# to indicate if the genesis round has been called.
genesis_round_called: public(bool)


# @dev We define the `last_winning_round` public variable.
# It is the last winning round.
last_winning_round: public(Round)


# @dev We define the `MAX_NUMBER_OF_LATESTS_BIDDED_SONGS` constant.
MAX_NUMBER_OF_LATESTS_BIDDED_SONGS: constant(uint256) = 3


# @dev We define the `_latests_bidded_songs_index` public variable.
# Round ID -> Index of the latests bidded songs
_latests_bidded_songs_index: public(HashMap[uint256, uint256])


# @dev We define the `latests_bidded_songs` public variable.
# It is a `HashMap` of `uint256` and `Song[]`.
# It keeps track of the latest bidded songs for each round.
# Round ID -> Song[]
latests_bidded_songs: public(HashMap[uint256, Song[MAX_NUMBER_OF_LATESTS_BIDDED_SONGS]])


# @dev We define the `ROUND_DURATION` constant.
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


# @notice Creates a new auction contract
# @param _songcoin The address of the SongCoin token contract
@deploy
def __init__(_songcoin: address):
    songcoin = IERC20(_songcoin)
    self._genesis_round()
    ow.__init__()


# @notice Creates the initial round of the auction
# @dev This function can only be called once during contract deployment
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
        song=Song(title="", artist="", iframe_hash=empty(bytes32), iframe_url="")
    )


@internal
@pure
def _check_song_url(iframe_url: String[256]) -> bool:
    spotify_url: String[256] = "https://open.spotify.com/embed/track/"
    if len(iframe_url) < len(spotify_url):
        return False
    return slice(iframe_url, 0, len(spotify_url)) == spotify_url


@internal
def _add_song_to_latests_bidded_songs(id: uint256, song: Song):
    """
    Add a song to the top (end) of the list.
    If full, shift left (discard the first one) and add to end.
    """
    index: uint256 = self._latests_bidded_songs_index[id]

    if index < MAX_NUMBER_OF_LATESTS_BIDDED_SONGS:
        self.latests_bidded_songs[id][index] = song
        self._latests_bidded_songs_index[id] = index + 1
    else:
        # Shift all songs left by one to make room
        for i: uint256 in range(MAX_NUMBER_OF_LATESTS_BIDDED_SONGS - 1):
            self.latests_bidded_songs[id][i] = self.latests_bidded_songs[id][i + 1]
        self.latests_bidded_songs[id][MAX_NUMBER_OF_LATESTS_BIDDED_SONGS - 1] = song


@internal
def _withdraw(_round: uint256):
    """
    This function is used to withdraw a previously refunded bid for a specific round.
    """
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


# @notice Places a bid on the current round
# @param _amount The amount to bid
# @param _song The song to bid on
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
    assert self._check_song_url(_song.iframe_url), "auction: invalid song url"

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

    # Add song to latests bidded songs
    self._add_song_to_latests_bidded_songs(id, _song)


# @notice Withdraws a previously refunded bid for a specific round
# @param _round The round ID to withdraw from
@external
def withdraw(_round: uint256):
    self._withdraw(_round)


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
    self.last_winning_round = self.rounds[id]


# @notice Starts a new round
# @dev Can only be called after the current round has ended
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
        song=Song(title="", artist="", iframe_hash=empty(bytes32), iframe_url="")
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


@external
@pure
def check_song_url(iframe_url: String[256]) -> bool:
    return self._check_song_url(iframe_url)


@external
@view
def is_there_a_last_winning_round() -> bool:
    return self.last_winning_round.highest_bidder != empty(address)


@external
@view
def get_latests_bidded_songs(_id: uint256) -> Song[MAX_NUMBER_OF_LATESTS_BIDDED_SONGS]:
    return self.latests_bidded_songs[_id]


@external
@view
def get_total_pending_returns(_from: address) -> uint256:
    id: uint256 = self._id
    total: uint256 = 0
    for i: uint256 in range(id, bound=max_value(uint256)):
        total += self.pending_returns[_from][i]
    return total


@external
def claim_pending_returns() -> uint256:
    id: uint256 = self._id
    total: uint256 = 0
    for i: uint256 in range(id, bound=max_value(uint256)):
        pending_amount: uint256 = self.pending_returns[msg.sender][i]
        if pending_amount > 0:
            self._withdraw(i)
            total += pending_amount
    return total
