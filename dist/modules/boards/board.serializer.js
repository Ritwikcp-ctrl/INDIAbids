export function serializeBoard(board) {
    return {
        id: board.id,
        key: board.key,
        name: board.name,
        scope: board.scope,
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
