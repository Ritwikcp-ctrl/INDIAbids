export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = {
  success: false;
  error: { code: string; message: string };
};
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type PaiseString = string;

export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";

export type User = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  status: UserStatus;
};

export type AuthTokens = {
  accessToken: string;
  accessTokenExpiresAt?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type Business = {
  id: string;
  ownerId: string | null;
  manageTokenHash?: string | null;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  categoryId: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
};

export type Scope = "NATIONAL" | "STATE";
export type BoardStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";
export type BusinessStatus = "ACTIVE" | "SUSPENDED" | "PENDING";

export interface ScopedBoard {
  id: string;
  key: string;
  name: string;
  categoryId: string;
  scope: Scope;
  state: string | null;
  minBidPaise: PaiseString;
  bidIncrementPaise: PaiseString;
  status: BoardStatus;
}

export type Board = ScopedBoard;

export type BoardMembership = {
  id: string;
  boardId: string;
  businessId: string;
  totalSpendPaise: PaiseString;
  lastBidAt: string | null;
  rank?: number | null;
  board?: ScopedBoard;
};

export type Quote = {
  board: { id: string; key: string; name: string; scope: Scope; state: string | null };
  business: { id: string; name: string } | null;
  currentSpend: { paise: PaiseString; inr: string };
  competitor: {
    businessId: string;
    businessName: string;
    totalSpend: { paise: PaiseString; inr: string };
  } | null;
  alreadyLeading: boolean;
  minimumAdditionalBid: { paise: PaiseString; inr: string };
  rules: {
    minimumFirstBidPaise: PaiseString;
    bidIncrementPaise: PaiseString;
  };
};

export type LeaderboardEntry = {
  rank: number;
  business: {
    id: string;
    name: string;
    slug: string;
    website?: string | null;
    description?: string | null;
  };
  totalSpend: {
    paise: PaiseString;
    inr: string;
  };
  lastBidAt: string | null;
};

export type PaymentStatus =
  | "CREATED"
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUND_PENDING"
  | "REFUNDED";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; name: string | null; role: "USER" | "ADMIN" };
}

export interface CheckoutInput {
  name?: string;
  description?: string;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
  categorySlug?: string;
  boardId?: string;
  scope: Scope;
  state?: string;
  amountPaise: string;
  businessId?: string;
  manageToken?: string;
}

export interface CheckoutResponse {
  paymentId: string;
  orderId: string;
  keyId: string;
  amountPaise: string;
  currency: string;
  businessId: string;
  boardId: string;
  manageToken?: string;
}

export interface LeaderboardResponse {
  board: ScopedBoard;
  leaderboard: LeaderboardEntry[];
}

export interface PaymentVerifyResult {
  id?: string;
  paymentId: string;
  status: "CREATED" | "PENDING" | "SUCCEEDED" | "FAILED";
  amountPaise?: string;
  businessId?: string;
}

export interface ManagedBusinessResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  country: string;
  state: string | null;
  city: string | null;
  status: string;
  ownerId: string | null;
  category: { id: string; name: string; slug: string };
  memberships: Array<{
    id: string;
    totalSpendPaise: string;
    lastBidAt: string | null;
    rank: number | null;
    board: {
      id: string;
      name: string;
      key: string;
      scope: Scope;
      state: string | null;
      minBidPaise: string;
      bidIncrementPaise: string;
    };
  }>;
}
