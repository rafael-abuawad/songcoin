export const auctionAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        name: "round_id",
        type: "uint256",
      },
      {
        indexed: true,
        name: "amount",
        type: "uint256",
      },
      {
        components: [
          {
            name: "title",
            type: "string",
          },
          {
            name: "artist",
            type: "string",
          },
          {
            name: "iframe_hash",
            type: "bytes32",
          },
          {
            name: "iframe_url",
            type: "string",
          },
        ],
        indexed: false,
        name: "song",
        type: "tuple",
      },
    ],
    name: "SongBid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "previous_owner",
        type: "address",
      },
      {
        indexed: true,
        name: "new_owner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        name: "new_owner",
        type: "address",
      },
    ],
    name: "transfer_ownership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounce_ownership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "_amount",
        type: "uint256",
      },
      {
        components: [
          {
            name: "title",
            type: "string",
          },
          {
            name: "artist",
            type: "string",
          },
          {
            name: "iframe_hash",
            type: "bytes32",
          },
          {
            name: "iframe_url",
            type: "string",
          },
        ],
        name: "_song",
        type: "tuple",
      },
    ],
    name: "bid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "end_round_and_start_new_round",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "get_current_round",
    outputs: [
      {
        components: [
          {
            name: "id",
            type: "uint256",
          },
          {
            name: "highest_bidder",
            type: "address",
          },
          {
            name: "highest_bid",
            type: "uint256",
          },
          {
            name: "ended",
            type: "bool",
          },
          {
            name: "start_time",
            type: "uint256",
          },
          {
            name: "end_time",
            type: "uint256",
          },
          {
            components: [
              {
                name: "title",
                type: "string",
              },
              {
                name: "artist",
                type: "string",
              },
              {
                name: "iframe_hash",
                type: "bytes32",
              },
              {
                name: "iframe_url",
                type: "string",
              },
            ],
            name: "song",
            type: "tuple",
          },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "get_current_round_id",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "get_current_round_highest_bid",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "get_round_duration",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "_id",
        type: "uint256",
      },
    ],
    name: "get_round_highest_bidder",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "_id",
        type: "uint256",
      },
    ],
    name: "get_round_highest_bid",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "_id",
        type: "uint256",
      },
    ],
    name: "get_round_ended",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "_id",
        type: "uint256",
      },
    ],
    name: "get_round_start_time",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "_id",
        type: "uint256",
      },
    ],
    name: "get_round_end_time",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "_id",
        type: "uint256",
      },
    ],
    name: "get_round_song",
    outputs: [
      {
        components: [
          {
            name: "title",
            type: "string",
          },
          {
            name: "artist",
            type: "string",
          },
          {
            name: "iframe_hash",
            type: "bytes32",
          },
          {
            name: "iframe_url",
            type: "string",
          },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "iframe_url",
        type: "string",
      },
    ],
    name: "check_song_url",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "is_there_a_last_winning_round",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "_id",
        type: "uint256",
      },
    ],
    name: "get_latests_bidded_songs",
    outputs: [
      {
        components: [
          {
            name: "title",
            type: "string",
          },
          {
            name: "artist",
            type: "string",
          },
          {
            name: "iframe_hash",
            type: "bytes32",
          },
          {
            name: "iframe_url",
            type: "string",
          },
        ],
        name: "",
        type: "tuple[3]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "arg0",
        type: "uint256",
      },
    ],
    name: "rounds",
    outputs: [
      {
        components: [
          {
            name: "id",
            type: "uint256",
          },
          {
            name: "highest_bidder",
            type: "address",
          },
          {
            name: "highest_bid",
            type: "uint256",
          },
          {
            name: "ended",
            type: "bool",
          },
          {
            name: "start_time",
            type: "uint256",
          },
          {
            name: "end_time",
            type: "uint256",
          },
          {
            components: [
              {
                name: "title",
                type: "string",
              },
              {
                name: "artist",
                type: "string",
              },
              {
                name: "iframe_hash",
                type: "bytes32",
              },
              {
                name: "iframe_url",
                type: "string",
              },
            ],
            name: "song",
            type: "tuple",
          },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "songcoin",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "genesis_round_called",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "last_winning_round",
    outputs: [
      {
        components: [
          {
            name: "id",
            type: "uint256",
          },
          {
            name: "highest_bidder",
            type: "address",
          },
          {
            name: "highest_bid",
            type: "uint256",
          },
          {
            name: "ended",
            type: "bool",
          },
          {
            name: "start_time",
            type: "uint256",
          },
          {
            name: "end_time",
            type: "uint256",
          },
          {
            components: [
              {
                name: "title",
                type: "string",
              },
              {
                name: "artist",
                type: "string",
              },
              {
                name: "iframe_hash",
                type: "bytes32",
              },
              {
                name: "iframe_url",
                type: "string",
              },
            ],
            name: "song",
            type: "tuple",
          },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "arg0",
        type: "uint256",
      },
    ],
    name: "_latests_bidded_songs_index",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "arg0",
        type: "uint256",
      },
      {
        name: "arg1",
        type: "uint256",
      },
    ],
    name: "latests_bidded_songs",
    outputs: [
      {
        components: [
          {
            name: "title",
            type: "string",
          },
          {
            name: "artist",
            type: "string",
          },
          {
            name: "iframe_hash",
            type: "bytes32",
          },
          {
            name: "iframe_url",
            type: "string",
          },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "_songcoin",
        type: "address",
      },
      {
        name: "_round_duration",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
] as const;
