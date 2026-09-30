import { BidScalarFieldEnum } from "../../generated/prisma/internal/prismaNamespace";

type BoardWithMoney = {
  id: string;
  key: string;
  name: string;

  country: string | null;
  state: string | null;
  city: string | null;

  minBidPaise: bigint;
  bidIncrementPaise: bigint;

  status: string;

  category: {
    id: string;
    name: string;
    slug: string;
  };

  createdAt: Date;
  updatedAt: Date;
};

export function serializeBoard(board: BoardWithMoney) {
  return {
    id: board.id,
    key: board.key,
    name: board.name,

    country: board.country,
    state: board.state,
    city: board.city,

    minBidPaise: board.minBidPaise.toString(),

    bidIncrementPaise: board.bidIncrementPaise.toString(),

    status: board.status,

    category: {
      id: board.category.id,
      name: board.category.name,
      slug: board.category.slug,
    },

    createdAt: board.createdAt.toISOString(),

    updatedAt: board.updatedAt.toISOString(),
  };
}
