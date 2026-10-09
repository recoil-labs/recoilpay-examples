import './styles.css';

import { createOfframpSession, viemWallet, type IntentWallet, type OfframpSession, type OfframpState } from '@recoilpay/intent-core';
import { createWalletClient, custom, type Chain, type EIP1193Provider, type WalletClient } from 'viem';
import { baseSepolia, bscTestnet } from 'viem/chains';
import {
  API_URL,
  bankDetailsProblem,
  BANKS,
  cashOutChains,
  cashOutRequest,
  describe,
  remember,
  type CashOutChain,
} from './cash-out';

const apiUrl = import.meta.env.VITE_RECOILPAY_API_URL || API_URL;
const SAVED = 'recoilpay:cash-out';
// Chains a wallet may not know yet; added on the first switch if so.
const KNOWN_CHAINS: Record<number, Chain> = { [baseSepolia.id]: baseSepolia, [bscTestnet.id]: bscTestnet };

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const show = (id: string, on: boolean) => ($(id).hidden = !on);

let walletClient: WalletClient | null = null;
let session: OfframpSession | null = null;
let chains: CashOutChain[] = [];

// ── Wallet ──────────────────────────────────────────────────────────────────

function ethereum(): EIP1193Provider | null {
  return (window as unknown as { ethereum?: EIP1193Provider }).ethereum ?? null;
}

/** viemWallet, plus adding a testnet the wallet doesn't know before switching to it. */
function walletFor(client: WalletClient): IntentWallet {
  const wallet = viemWallet(client);
  return {
    ...wallet,
    async switchChain(id) {
      try {
        await client.switchChain({ id });
      } catch (e) {
        const chain = KNOWN_CHAINS[id];
        if ((e as { code?: number }).code !== 4902 || !chain) throw e;
        await client.addChain({ chain });
        await client.switchChain({ id });
      }
    },
  };
}

async function connect() {
  const provider = ethereum();
  if (!provider) return fail('No browser wallet found. Install one, such as MetaMask, and reload.');
  const [account] = await provider.request({ method: 'eth_requestAccounts' });
  walletClient = createWalletClient({ account, transport: custom(provider) });
  $('connect').textContent = `${account.slice(0, 6)}…${account.slice(-4)}`;

  // A cash-out left mid-way on a previous visit: pick it up again.
  const saved = localStorage.getItem(SAVED);
  if (saved) {
    newSession();
    await session!.resume(saved);
  }
}

// ── Session ─────────────────────────────────────────────────────────────────

function newSession() {
  session?.destroy();
  session = createOfframpSession({ apiUrl, wallet: walletFor(walletClient!) });
  session.subscribe(render);
  session.subscribe(remember);
}

function render(state: OfframpState) {
  show('message', false);
  const working = ['switchingChain', 'approving', 'opening', 'signing', 'locking'].includes(state.phase);
  show('amount-form', !state.trade && !working && state.phase !== 'quoted');
  show('bank-form', state.phase === 'quoted');
  show('progress', !!state.trade || working);

  if (state.phase === 'quoted') {
    $('offer').textContent = describe(state);
    $('cash-out').textContent = state.needsApproval ? `Approve ${state.preview!.paySymbol} and cash out` : 'Cash out';
  }
  if (state.phase === 'error' && !state.trade) fail(describe(state));

  $('status').textContent = describe(state);
  $('progress-title').textContent = state.trade ? `Cash-out ${state.preview?.currencySymbol ?? ''}${state.preview?.receiveAmount ?? ''}`.trim() : 'Cash-out';
  const answering = state.phase === 'awaitingConfirmation';
  if (answering && state.preview) $('received').textContent = `I received ${state.preview.currencySymbol}${state.preview.receiveAmount}`;
  show('answer', answering && $('dispute-form').hidden === true);
  if (!answering) show('dispute-form', false);

  const done = state.phase === 'settled' || state.phase === 'refunded' || state.phase === 'failed';
  show('again', done);
  if (done) localStorage.removeItem(SAVED);

  // The receipt: what the user needs if anything is ever disputed.
  const t = state.trade;
  show('receipt', !!t);
  if (t) {
    const salt = localStorage.getItem(`${SAVED}:${t.id}:salt`);
    const rows = [
      ['Trade', t.id],
      ['Payment reference', t.payment_reference],
      ['Bank details proof', salt],
    ].filter((row): row is [string, string] => !!row[1]);
    $('receipt').replaceChildren(
      ...rows.map(([label, value]) => {
        const row = document.createElement('div');
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = label;
        dd.textContent = value;
        row.append(dt, dd);
        return row;
      }),
    );
  }
}

function fail(message: string) {
  $('message').textContent = message;
  show('message', true);
}

// ── Screens ─────────────────────────────────────────────────────────────────

async function loadChains() {
  chains = await cashOutChains(apiUrl);
  $<HTMLSelectElement>('chain').innerHTML = chains.map((c, i) => `<option value="${i}">${c.name}</option>`).join('');
  $<HTMLSelectElement>('bank').innerHTML += BANKS.map((b) => `<option value="${b.code}">${b.name}</option>`).join('');
}

$('connect').addEventListener('click', () => void connect().catch((e) => fail(e.message)));

$('amount-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!walletClient) await connect();
  if (!walletClient) return;
  newSession();
  const chain = chains[Number($<HTMLSelectElement>('chain').value)];
  await session!.quote(cashOutRequest(chain, $<HTMLInputElement>('amount').value.trim()));
});

$('bank-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const bankCode = $<HTMLSelectElement>('bank').value;
  const account = $<HTMLInputElement>('account').value.trim();
  const name = $<HTMLInputElement>('name').value.trim();
  const problem = !bankCode ? 'Choose your bank.' : bankDetailsProblem(account, name);
  $('bank-error').textContent = problem ?? '';
  show('bank-error', !!problem);
  if (problem) return;
  await session!.confirm({ rail: 'ng.nip', bankCode, account, name });
});

$('cancel').addEventListener('click', () => session?.reset());
$('received').addEventListener('click', () => void session?.confirmReceived());
$('not-arrived').addEventListener('click', () => {
  show('answer', false);
  show('dispute-form', true);
});
$('dispute-cancel').addEventListener('click', () => {
  show('dispute-form', false);
  show('answer', true);
});
$('dispute-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const reason = $<HTMLInputElement>('reason').value.trim();
  if (reason) void session?.dispute(reason);
}); 
$('again').addEventListener('click', () => {
  session?.reset();
  render(session!.getState());
});

loadChains().catch(() => fail('Could not reach RecoilPay. Check your connection and reload.'));
