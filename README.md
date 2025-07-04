# SongCoin 🎵

A decentralized auction platform for songs built with Vyper smart contracts and a modern frontend.

## 🚀 Features

- **Round-based Auction System**: 24-hour auction rounds for songs
- **Spotify Integration**: Embed songs directly from Spotify
- **Real-time Bidding**: Live bidding with automatic refunds for outbid users
- **Latest Songs Tracking**: Keep track of the most recent bidded songs
- **Modern UI**: Beautiful, responsive interface built with shadcn/ui components
- **Web3 Integration**: Seamless wallet connection with ConnectKit and Wagmi

## 🛠️ Tech Stack

### Backend (Smart Contracts)
- **Vyper**: Smart contract language for Ethereum
- **Apeworx**: Development framework for Ethereum
- **Snekmate**: Vyper development utilities
- **uv**: Fast Python package manager

### Frontend
- **Vite**: Fast build tool and dev server
- **React 19**: Latest React with concurrent features
- **TanStack Router**: Type-safe routing
- **TanStack Query**: Server state management
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Beautiful, accessible UI components
- **ConnectKit**: Wallet connection UI
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript interface for Ethereum

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- uv (Python package manager)
- Apeworx CLI
- MetaMask or compatible Web3 wallet

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd songcoin
```

### 2. Backend Setup

Install Python dependencies using uv:

```bash
# Install uv if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install project dependencies
uv sync

# Install Apeworx plugins
ape plugins install .
```

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
songcoin/
├── contracts/                 # Vyper smart contracts
│   ├── auction.vy            # Main auction contract
│   ├── interfaces/           # Contract interfaces
│   └── mocks/               # Mock contracts for testing
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── routes/          # TanStack Router routes
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and constants
│   │   └── context/         # React context providers
│   └── public/              # Static assets
├── scripts/                  # Deployment and utility scripts
├── tests/                    # Contract tests
├── ape-config.yaml          # Apeworx configuration
└── pyproject.toml           # Python project configuration
```

## 🔧 Development

### Smart Contract Development

```bash
# Compile contracts
ape compile

# Run tests
ape test

# Deploy to local network
ape run scripts/deploy.py

# Seed data
ape run scripts/seed.py
```

### Frontend Development

```bash
cd client

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## 🧪 Testing

### Smart Contract Tests

```bash
# Run all tests
ape test

# Run specific test file
ape test tests/test_auction.py

# Run with verbose output
ape test -v
```

### Frontend Tests

```bash
cd client

# Run tests (if configured)
npm test
```

## 🚀 Deployment

### Smart Contract Deployment

1. Configure your network in `ape-config.yaml`
2. Set up your private key or use a wallet provider
3. Deploy using the deployment script:

```bash
ape run scripts/deploy.py --network <network-name>
```

### Frontend Deployment

```bash
cd client

# Build for production
npm run build

# Deploy to your preferred hosting service
# (Vercel, Netlify, etc.)
```

## 📚 API Reference

### Smart Contract Functions

#### `start_new_round(song: Song)`
Start a new auction round with a song.

#### `bid(round_id: uint256, amount: uint256)`
Place a bid on the current round.

#### `end_round(round_id: uint256)`
End the current round and determine the winner.

### Frontend Components

#### `AuctionProvider`
Context provider for auction state management.

#### `BiddingForm`
Form component for placing bids.

#### `CurrentBid`
Displays current highest bid information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Apeworx](https://docs.apeworx.io/) for the Ethereum development framework
- [Vyper](https://vyper.readthedocs.io/) for the smart contract language
- [TanStack](https://tanstack.com/) for the excellent React libraries
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or reach out to the maintainers.

---

Built with ❤️ by the [Rafael Abuawad](https://github.com/rafael-abuawad)
