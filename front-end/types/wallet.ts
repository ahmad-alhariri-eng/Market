// types/wallet.ts
export interface Wallet {
  id: number;
  user: string;
  balance: string;
  held_balance: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: number;
  wallet: string;
  amount: string;
  transaction_type: string;
  recipient: string | null;
  description: string;
  created_at: string;
  is_successful: boolean;
  reference: string;
}

export interface WalletResponse {
  wallet: Wallet;
  transactions: WalletTransaction[];
}
