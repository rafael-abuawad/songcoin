import type { Address, Hex } from "viem";

export interface Song {
  title: string;
  artist: string;
  iframe_hash: Hex;
  iframe_url: string;
}

export interface Round {
  id: bigint;
  highest_bidder: Address;
  highest_bid: bigint;
  ended: boolean;
  start_time: bigint;
  end_time: bigint;
  song: Song;
}

export interface SongBidEvent {
  sender: Address;
  round_id: bigint;
  amount: bigint;
  song: Song;
}

export interface PendingReturns {
  [userAddress: Address]: {
    [roundId: string]: bigint;
  };
}

export interface BidParams {
  amount: bigint;
  song: Song;
}

export interface ContractState {
  rounds: { [key: string]: Round };
  songcoin: string;
  genesis_round_called: boolean;
  current_round_id: bigint;
  pending_returns: PendingReturns;
}
