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
  refetch: () => {},
};

export const CurrentRoundContext = createContext<{
  currentRound: Round | undefined;
  lastWinningRound: Round | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isThereALastWinningRound: boolean;
  refetch: () => void;
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
  });

  const { data: lastWinningRound, refetch: lastWinningRoundRefetch } =
    useReadContract({
      abi: auctionAbi,
      address: auctionAddress,
      functionName: "last_winning_round",
    });

  const {
    data: isThereALastWinningRound = false,
    refetch: isThereALastWinningRoundRefetch,
  } = useReadContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: "is_there_a_last_winning_round",
  });

  const refetch = () => {
    currentRoundRefetch();
    isThereALastWinningRoundRefetch();
    lastWinningRoundRefetch();
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
