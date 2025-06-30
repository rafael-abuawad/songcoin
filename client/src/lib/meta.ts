/**
 * Utility functions for managing Open Graph meta tags and SEO
 */

export interface MetaConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
}

export interface OpenGraphConfig extends MetaConfig {
  siteName?: string;
  imageWidth?: string;
  imageHeight?: string;
  imageAlt?: string;
}

export interface TwitterConfig extends MetaConfig {
  card?: string;
}

/**
 * Default meta configuration for the Songcoin application
 */
export const DEFAULT_META: MetaConfig = {
  title: "Songcoin - The best place to get the attention your content deserves",
  description:
    "Songcoin is a decentralized auction platform where you can bid to feature your Spotify content. Win auctions to showcase your music for 24 hours.",
  keywords:
    "songcoin, music, auction, spotify, web3, blockchain, decentralized, bidding",
  image: "https://songcoin.fun/songcoin.png",
  url: "https://songcoin.fun",
  type: "website",
  author: "Songcoin Team",
};

/**
 * Default Open Graph configuration
 */
export const DEFAULT_OG: OpenGraphConfig = {
  ...DEFAULT_META,
  siteName: "Songcoin",
  imageWidth: "1200",
  imageHeight: "630",
  imageAlt: "Songcoin - Decentralized Music Auction Platform",
};

/**
 * Default Twitter Card configuration
 */
export const DEFAULT_TWITTER: TwitterConfig = {
  ...DEFAULT_META,
  card: "summary_large_image",
};

/**
 * Generate meta tags for a route based on configuration
 */
export function generateMetaTags(config: MetaConfig = {}) {
  const meta = { ...DEFAULT_META, ...config };
  const og = { ...DEFAULT_OG, ...config };
  const twitter = { ...DEFAULT_TWITTER, ...config };

  return [
    // Basic meta tags
    {
      name: "description",
      content: meta.description,
    },
    {
      name: "keywords",
      content: meta.keywords,
    },
    {
      name: "author",
      content: meta.author,
    },
    // Open Graph meta tags
    {
      property: "og:title",
      content: og.title,
    },
    {
      property: "og:description",
      content: og.description,
    },
    {
      property: "og:type",
      content: og.type,
    },
    {
      property: "og:url",
      content: og.url,
    },
    {
      property: "og:image",
      content: og.image,
    },
    {
      property: "og:image:width",
      content: og.imageWidth,
    },
    {
      property: "og:image:height",
      content: og.imageHeight,
    },
    {
      property: "og:image:alt",
      content: og.imageAlt,
    },
    {
      property: "og:site_name",
      content: og.siteName,
    },
    // Twitter Card meta tags
    {
      name: "twitter:card",
      content: twitter.card,
    },
    {
      name: "twitter:title",
      content: twitter.title,
    },
    {
      name: "twitter:description",
      content: twitter.description,
    },
    {
      name: "twitter:image",
      content: twitter.image,
    },
    {
      name: "twitter:image:alt",
      content: og.imageAlt,
    },
    // Additional meta tags
    {
      name: "robots",
      content: "index, follow",
    },
    {
      name: "theme-color",
      content: "#000000",
    },
  ];
}

/**
 * Generate default links for the application
 */
export function generateDefaultLinks() {
  return [
    {
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      href: "/favicon/apple-touch-icon.png",
    },
    {
      rel: "manifest",
      href: "/favicon/site.webmanifest",
    },
  ];
}

/**
 * Create a head configuration for TanStack Router
 */
export function createHeadConfig(config: MetaConfig = {}) {
  return {
    title: config.title || DEFAULT_META.title,
    meta: generateMetaTags(config),
    links: generateDefaultLinks(),
  };
}

/**
 * Create dynamic head configuration that can be updated based on route data
 */
export function createDynamicHeadConfig(
  baseConfig: MetaConfig = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dynamicData?: Record<string, any>,
) {
  let config = { ...baseConfig };

  // If we have dynamic data, we can customize the meta tags
  if (dynamicData) {
    // Example: If we have current song data, we can customize the meta tags
    if (dynamicData.currentSong) {
      const song = dynamicData.currentSong;
      config = {
        ...config,
        title: `${song.title} by ${song.artist} - Current Song on Songcoin`,
        description: `Currently featured on Songcoin: ${song.title} by ${song.artist}. Place your bid to feature your own music next!`,
        image: song.albumArt || config.image,
      };
    }

    // Example: If we have current bid data, we can customize the meta tags
    if (dynamicData.currentBid) {
      const bid = dynamicData.currentBid;
      config = {
        ...config,
        title: `Current Bid: ${bid.amount} ETH - Songcoin`,
        description: `Current highest bid is ${bid.amount} ETH. Place your bid to feature your Spotify content on Songcoin!`,
      };
    }
  }

  return createHeadConfig(config);
}

/**
 * Predefined meta configurations for different routes
 */
export const ROUTE_META = {
  home: {
    title:
      "Songcoin - The best place to get the attention your content deserves",
    description:
      "Bid to feature your Spotify content on Songcoin. Win auctions to showcase your music for 24 hours in our decentralized auction platform.",
  },
  about: {
    title: "About Songcoin - How It Works",
    description:
      "Learn how Songcoin works. Place bids to feature your Spotify content, get refunds if you don't win, and understand our decentralized auction system.",
  },
  bid: {
    title: "Place Your Bid - Songcoin",
    description:
      "Place your bid to feature your Spotify content on Songcoin. Join the auction and compete to showcase your music for 24 hours.",
  },
} as const;

/**
 * Helper function to generate meta tags for auction-related content
 */
export function generateAuctionMetaTags(auctionData: {
  currentSong?: { title: string; artist: string; albumArt?: string };
  currentBid?: { amount: string; bidder?: string };
  timeRemaining?: string;
}) {
  const config: MetaConfig = { ...ROUTE_META.home };

  if (auctionData.currentSong) {
    const song = auctionData.currentSong;
    config.title = `${song.title} by ${song.artist} - Featured on Songcoin`;
    config.description = `Currently featured: ${song.title} by ${song.artist}. Place your bid to feature your own music next!`;
    if (song.albumArt) {
      config.image = song.albumArt;
    }
  }

  if (auctionData.currentBid) {
    const bid = auctionData.currentBid;
    config.description = `Current bid: ${bid.amount} ETH${bid.bidder ? ` by ${bid.bidder}` : ""}. ${config.description}`;
  }

  if (auctionData.timeRemaining) {
    config.description = `${config.description} Time remaining: ${auctionData.timeRemaining}.`;
  }

  return createHeadConfig(config);
}
