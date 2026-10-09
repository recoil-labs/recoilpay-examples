// From the guide "Build a cash-out flow": https://docs.recoilpay.com/integrate/guides/cash-out

import {
  createOfframpSession,
  FIAT_CORRIDORS,
  NG_BANKS,
  viemWallet,
  type OfframpRequest,
  type OfframpSession,
  type OfframpState,
} from '@recoilpay/intent-core';
import { getAddress, parseUnits, type WalletClient } from 'viem';

export const API_URL = 'https://api.recoilpay.com';

// ── Step 2: find where cash-outs run ─────────────────────────────────────
export interface CashOutChain {
  chainId: number;
  name: string;
  usdc: { address: `0x${string}`; decimals: number };
}

export async function cashOutChains(apiUrl = API_URL): Promise<CashOutChain[]> {
  const res = await fetch(`${apiUrl}/api/v1/chains`);
  const { data } = await res.json();
  return data
    .filter((c: any) => c.fiat_escrow)
    .flatMap((c: any) => {
      const usdc = c.tokens.find((t: any) => t.symbol === 'USDC');
      return usdc ? [{ chainId: c.chain_id, name: c.name, usdc: { address: getAddress(usdc.address), decimals: usdc.decimals } }] : [];
    });
}

// ── Step 3: describe the cash-out ────────────────────────────────────────
export function cashOutRequest(chain: CashOutChain, amount: string): OfframpRequest {
  return {
    chainId: chain.chainId,
    chainName: chain.name,
    asset: 'USDC',
    token: chain.usdc.address,
    decimals: chain.usdc.decimals,
    amount: parseUnits(amount, chain.usdc.decimals),
    corridor: FIAT_CORRIDORS.NGN,
  };
}

// ── Step 1 and 4: one session per cash-out ───────────────────────────────
export function startCashOut(walletClient: WalletClient, apiUrl = API_URL): OfframpSession {
  return createOfframpSession({ apiUrl, wallet: viemWallet(walletClient) });
}

// ── Step 5: the bank details form ────────────────────────────────────────
export const BANKS = NG_BANKS; // [{ code: '058', name: 'Guaranty Trust Bank' }, …]

export function bankDetailsProblem(account: string, name: string): string | null {
  if (!FIAT_CORRIDORS.NGN.accountPattern.test(account.trim())) return 'Enter the 10-digit account number (NUBAN).';
  if (name.trim().length < 2) return 'Enter the name on the account.';
  return null;
}

// ── Step 7: what to show for each phase ──────────────────────────────────
export function describe(state: OfframpState): string {
  const p = state.preview;
  switch (state.phase) {
    case 'quoting':
      return state.trade ? 'Loading your cash-out…' : 'Finding the best cash-out rate…';
    case 'quoted':
      return `You pay ${p!.payAmount} ${p!.paySymbol} on ${p!.chainName} and receive ${p!.currencySymbol}${p!.receiveAmount} (fee ${p!.currencySymbol}${p!.fee}).`;
    case 'switchingChain':
      return 'Switching network…';
    case 'approving':
      return `Approving ${p?.paySymbol} (first time only)…`;
    case 'opening':
    case 'signing':
      return 'Confirm in your wallet…';
    case 'locking':
      return 'Locking your USDC in escrow…';
    case 'awaitingFiat':
      return 'Your USDC is locked. The solver is paying you now.';
    case 'awaitingConfirmation':
      return `The solver says it sent the money (reference ${state.trade?.payment_reference}). Check your bank app, then confirm or dispute.`;
    case 'confirming':
    case 'disputing':
      return 'Confirm in your wallet…';
    case 'disputed':
      return 'An admin is reviewing this cash-out. Your USDC stays in escrow until they decide.';
    case 'settled':
      return 'Cashed out.';
    case 'refunded':
      return 'The solver did not pay in time. Your USDC was returned.';
    case 'failed':
      return 'The lock never landed, so nothing left your wallet.';
    case 'error':
      return state.error ?? 'Something went wrong.';
    default:
      return '';
  }
}

// ── Step 8: keep the trade id and the salt ───────────────────────────────
export function remember(state: OfframpState): void {
  if (state.trade && state.payeeSalt) {
    localStorage.setItem('recoilpay:cash-out', state.trade.id);
    localStorage.setItem(`recoilpay:cash-out:${state.trade.id}:salt`, state.payeeSalt);
  }
}
