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
    inputs: [
      {
        name: "_round",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "end_round",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "start_new_round",
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
        name: "_user",
        type: "address",
      },
      {
        name: "_id",
        type: "uint256",
      },
    ],
    name: "get_pending_returns",
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
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
      {
        name: "arg1",
        type: "uint256",
      },
    ],
    name: "pending_returns",
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
        name: "_songcoin",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
] as const;
