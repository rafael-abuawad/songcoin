import type { Round } from "@/lib/types";
import { createContext } from "react";
import { useReadContract } from "wagmi";
import { auctionAbi } from "@/lib/abi";
import { auctionAddress } from "@/lib/constants";

const initialState = {
  currentRound: undefined,
  lastWinningRound: undefined,
  isLoading: false,
  isFetching: false,
  isError: false,
  isThereALastWinningRound: false,
  refetch: async () => {},
};

export const CurrentRoundContext = createContext<{
  currentRound: Round | undefined;
  lastWinningRound: Round | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isThereALastWinningRound: boolean;
  refetch: () => Promise<void>;
}>(initialState);

export const CurrentRoundProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    data: currentRound,
    isLoading,
    isFetching,
    isError,
    refetch: currentRoundRefetch,
  } = useReadContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: "get_current_round",
    query: {
      staleTime: 30000, // 30 seconds
    },
  });

  const { data: lastWinningRound, refetch: lastWinningRoundRefetch } =
    useReadContract({
      abi: auctionAbi,
      address: auctionAddress,
      functionName: "last_winning_round",
      query: {
        staleTime: 30000, // 30 seconds
      },
    });

  const {
    data: isThereALastWinningRound = false,
    refetch: isThereALastWinningRoundRefetch,
  } = useReadContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: "is_there_a_last_winning_round",
    query: {
      staleTime: 30000, // 30 seconds
    },
  });

  const refetch = async () => {
    await currentRoundRefetch();
    await isThereALastWinningRoundRefetch();
    await lastWinningRoundRefetch();
  };

  return (
    <CurrentRoundContext.Provider
      value={{
        currentRound,
        lastWinningRound,
        isLoading,
        isFetching,
        isError,
        refetch,
        isThereALastWinningRound,
      }}
    >
      {children}
    </CurrentRoundContext.Provider>
  );
};
