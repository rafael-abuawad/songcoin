# pragma version ~=0.4.1
# @author @rabuawad_ (https://x.com/rabuawad_)
"""
@title Auction with Rounds
@license MIT
@notice This contract implements an auction system for songs with multiple rounds.
        Each round has a duration of 24 hours and allows users to bid on songs using SongCoin tokens.
@dev Key features:
     - Round-based auction system with 24-hour duration
     - Song bidding with Spotify embed URL validation
     - Automatic refund handling for outbid users
     - Latest bidded songs tracking
     - Gas-optimized state management
@custom:security The contract implements secure token transfers and refunds,
                 with no access control for round management.
"""

# @dev We import the `IERC20` interface.
from .interfaces import erc20 as IERC20


# @dev We import and initialise the `ownable` module.
from snekmate.auth import ownable as ow
initializes: ow


# @notice Structure representing a song in the auction
# @param title The title of the song (max 32 characters)
# @param artist The artist of the song (max 32 characters)
# @param iframe_hash Hash of the song's iframe for verification
# @param iframe_url URL of the song's iframe (must be a Spotify embed URL)
struct Song:
    title: String[32]
    artist: String[32]
    iframe_hash: bytes32
    iframe_url: String[256]


# @notice Structure representing an auction round
# @param id The unique identifier of the round
# @param highest_bidder The address of the current highest bidder
# @param highest_bid The amount of the highest bid in SongCoin tokens
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
# @param amount The amount of the bid in SongCoin tokens
# @param song The song being bid on
event SongBid:
    sender: address
    round_id: indexed(uint256)
    amount: indexed(uint256)
    song: Song


# @dev We define the `rounds` public variable.
# @notice Maps round IDs to their corresponding Round struct
# @return Round The round information for the given ID
rounds: public(HashMap[uint256, Round])


# @dev We define the `songcoin` public variable.
# @notice The address of the SongCoin token contract
# @return IERC20 The SongCoin token contract interface
songcoin: public(immutable(IERC20))


# @dev We define the `genesis_round_called` public variable.
# @notice Indicates if the genesis round has been initialized
# @return bool True if genesis round has been called, false otherwise
genesis_round_called: public(bool)


# @dev We define the `last_winning_round` public variable.
# @notice Stores information about the last completed round
# @return Round The last winning round's information
last_winning_round: public(Round)


# @dev We define the `MAX_NUMBER_OF_LATESTS_BIDDED_SONGS` constant.
# @notice Maximum number of latest bidded songs to track per round
MAX_NUMBER_OF_LATESTS_BIDDED_SONGS: constant(uint256) = 3


# @dev We define the `_latests_bidded_songs_index` public variable.
# @notice Tracks the current index for latest bidded songs per round
# @return uint256 The current index for the given round ID
_latests_bidded_songs_index: public(HashMap[uint256, uint256])


# @dev We define the `latests_bidded_songs` public variable.
# @notice Stores the latest bidded songs for each round
# @return Song[] Array of latest bidded songs for the given round ID
latests_bidded_songs: public(HashMap[uint256, Song[MAX_NUMBER_OF_LATESTS_BIDDED_SONGS]])


# @dev We define the `ROUND_DURATION` constant.
# @notice Duration of each round in seconds
ROUND_DURATION: immutable(uint256)


# @dev We define the `_id` private variable.
# @notice The current round ID
_id: uint256


# @dev We export all `external` functions
# from the `ownable` module.
exports: ow.__interface__


# @notice Creates a new auction contract
# @dev Initializes the contract with the SongCoin token address
#      and creates the genesis round
# @param _songcoin The address of the SongCoin token contract
@deploy
def __init__(_songcoin: address, _round_duration: uint256):
    """
    @dev Initializes the auction contract with the SongCoin token
         and creates the genesis round
    @param _songcoin The address of the SongCoin token contract
    @param _round_duration The duration of each round in seconds
    """
    songcoin = IERC20(_songcoin)
    ROUND_DURATION = _round_duration
    self._genesis_round()
    ow.__init__()


# @notice Creates the initial round of the auction
# @dev This function can only be called once during contract deployment
@internal
def _genesis_round():
    """
    @dev Creates the initial round of the auction
    @notice This function can only be called once during contract deployment
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
    """
    @dev Validates if the provided URL is a valid Spotify embed URL
    @param iframe_url The URL to validate
    @return bool True if the URL is a valid Spotify embed URL, false otherwise
    """
    spotify_url: String[256] = "https://open.spotify.com/embed/track/"
    if len(iframe_url) < len(spotify_url):
        return False
    return slice(iframe_url, 0, len(spotify_url)) == spotify_url


@internal
def _add_song_to_latests_bidded_songs(id: uint256, song: Song):
    """
    @dev Adds a song to the latest bidded songs list for a round
    @notice If the list is full, shifts all songs left and adds the new song at the end
    @param id The round ID
    @param song The song to add
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
def _end_round():
    """
    @dev Ends the current round and processes the winning bid
    @notice Can only be called when the round's end time has been reached
    """
    current_round_id: uint256 = self._id
    active_round: Round = self.rounds[current_round_id]

    # Check if round end time has been reached
    assert block.timestamp >= active_round.end_time, "auction: round has not ended"

    # Check if round has not already ended
    assert not active_round.ended, "auction: round has already ended"

    # Mark round as ended
    self.rounds[current_round_id].ended = True
    self.last_winning_round = self.rounds[current_round_id]

    # Burn the highest bid
    extcall songcoin.burn(active_round.highest_bid)


# @notice Starts a new round
# @dev Can only be called after the current round has ended
@internal
def _start_new_round():
    """
    @dev Initializes a new round after the current one has ended
    @notice Sets up a new round with a 24-hour duration
    """
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


# @notice Places a bid on the current round
# @param _amount The amount to bid in SongCoin tokens
# @param _song The song to bid on
@external
def bid(_amount: uint256, _song: Song):
    """
    @dev Places a bid on the current round
    @notice The bid must be higher than the current highest bid
    @param _amount The amount to bid in SongCoin tokens
    @param _song The song to bid on
    """
    # Get current round
    current_round_id: uint256 = self._id
    current_round: Round = self.rounds[current_round_id]

    # Check if round has started and is not over,
    # and if the bid is higher than the highest bid
    assert block.timestamp >= current_round.start_time, "auction: round has not started"
    assert block.timestamp < current_round.end_time, "auction: round is over"
    assert _amount > current_round.highest_bid, "auction: bid is too low"
    assert self._check_song_url(_song.iframe_url), "auction: invalid song url"

    # Transfer Songcoin from sender to contract
    assert extcall songcoin.transferFrom(msg.sender, self, _amount, default_return_value=False), "auction: transfer failed"

    # Refund previous high bidder
    if current_round.highest_bidder != empty(address):
        extcall songcoin.transfer(current_round.highest_bidder, current_round.highest_bid, default_return_value=False)

    # Update round with new high bid
    self.rounds[current_round_id].highest_bidder = msg.sender
    self.rounds[current_round_id].highest_bid = _amount
    self.rounds[current_round_id].song = _song

    # Emit SongBid event
    log SongBid(sender=msg.sender, round_id=current_round_id, amount=_amount, song=_song)

    # Add song to latests bidded songs
    self._add_song_to_latests_bidded_songs(current_round_id, _song)


@external
def end_round_and_start_new_round():
    """
    @dev Ends the current round and starts a new one
    @notice Can only be called when the current round has ended
    """
    self._end_round()
    self._start_new_round()


@external
@view
def get_current_round() -> Round:
    """
    @dev Returns the current round information
    @return Round The current round's information
    """
    return self.rounds[self._id]


@external
@view
def get_current_round_id() -> uint256:
    """
    @dev Returns the current round ID
    @return uint256 The current round ID
    """
    return self._id


@external
@view
def get_round_duration() -> uint256:
    """
    @dev Returns the duration of each round in seconds
    @return uint256 The round duration in seconds
    """
    return ROUND_DURATION


@external
@view
def get_round_highest_bidder(_id: uint256) -> address:
    """
    @dev Returns the highest bidder of a specific round
    @param _id The round ID to check
    @return address The address of the highest bidder
    """
    return self.rounds[_id].highest_bidder


@external
@view
def get_round_highest_bid(_id: uint256) -> uint256:
    """
    @dev Returns the highest bid amount of a specific round
    @param _id The round ID to check
    @return uint256 The highest bid amount
    """
    return self.rounds[_id].highest_bid


@external
@view
def get_round_ended(_id: uint256) -> bool:
    """
    @dev Returns whether a specific round has ended
    @param _id The round ID to check
    @return bool True if the round has ended, false otherwise
    """
    return self.rounds[_id].ended


@external
@view
def get_round_start_time(_id: uint256) -> uint256:
    """
    @dev Returns the start time of a specific round
    @param _id The round ID to check
    @return uint256 The start time of the round
    """
    return self.rounds[_id].start_time


@external
@view
def get_round_end_time(_id: uint256) -> uint256:
    """
    @dev Returns the end time of a specific round
    @param _id The round ID to check
    @return uint256 The end time of the round
    """
    return self.rounds[_id].end_time


@external
@view
def get_round_song(_id: uint256) -> Song:
    """
    @dev Returns the song being auctioned in a specific round
    @param _id The round ID to check
    @return Song The song being auctioned
    """
    return self.rounds[_id].song


@external
@pure
def check_song_url(iframe_url: String[256]) -> bool:
    """
    @dev Checks if a URL is a valid Spotify embed URL
    @param iframe_url The URL to check
    @return bool True if the URL is valid, false otherwise
    """
    return self._check_song_url(iframe_url)


@external
@view
def is_there_a_last_winning_round() -> bool:
    """
    @dev Checks if there is a last winning round
    @return bool True if there is a last winning round, false otherwise
    """
    return self.last_winning_round.highest_bidder != empty(address)


@external
@view
def get_latests_bidded_songs(_id: uint256) -> Song[MAX_NUMBER_OF_LATESTS_BIDDED_SONGS]:
    """
    @dev Returns the latest bidded songs for a specific round
    @param _id The round ID to check
    @return Song[] Array of latest bidded songs
    """
    return self.latests_bidded_songs[_id]
