# React landing page

A React landing page with RecoilPay built in. `<RecoilIntent />` plugs into the wallet connection the app already has (wagmi + RainbowKit), so visitors connect once in your header and use RecoilPay with the same wallet: cross-chain swaps, cash-outs to their bank, and purchases with a bank transfer.

## Run it

```bash
npm install
cp .env.example .env   # then add your Hugging Face token
npm run dev
```

Open http://localhost:5173.

## What to look at

| File | |
|---|---|
| [`src/App.tsx`](./src/App.tsx) | `<RecoilIntent />` with your wallet, examples, theme, and every callback, including resuming a cash-out or purchase after a reload |
| [`src/wagmi.ts`](./src/wagmi.ts) | The wagmi config: RecoilPay's testnets, with or without WalletConnect |
| [`src/main.tsx`](./src/main.tsx) | Providers, and the component's stylesheet (`@recoilpay/intent-react/styles.css`) |

`useWagmiIntentWallet()` (from `@recoilpay/intent-react/wagmi`) turns the connected wagmi wallet into the one the component uses. When the component needs a wallet, `onConnectWallet` opens RainbowKit's modal.

## Keys

| Variable | |
|---|---|
| `VITE_HF_ACCESS_TOKEN` | Needed to understand typed sentences. It ships in your bundle, so use a fine-grained token with only "Make calls to Inference Providers", for nothing else. |
| `VITE_WALLETCONNECT_PROJECT_ID` | Optional. Without it, only browser wallets such as MetaMask are offered. |
| `VITE_RECOILPAY_API_URL` | Leave empty for RecoilPay's API. |

## Cash-outs and purchases outlast a visit

A cash-out waits for the user to confirm the money arrived; a purchase waits for them to pay. [`App.tsx`](./src/App.tsx) saves the trade id from `onCashOutStarted` / `onPurchaseStarted` and passes it back as `resumeCashOut` / `resumePurchase`, so a user who reloads lands back on their trade.

If your site sends a Content-Security-Policy, allow `https://widget.dojah.io` (`script-src`) and `https://identity.dojah.io` (`frame-src`) for the identity check a first purchase needs.

## Try these

- `swap 1 USDC on OP Sepolia for USDC on Base Sepolia`
- `cash out 10 USDC on Base Sepolia to NGN`
- `buy ₦5,000 of USDC on Base Sepolia`

You'll need testnet tokens: see [Supported networks](https://docs.recoilpay.com/supported-networks). Cash-outs and purchases only go through when a solver is offering them.

## Learn more

- [React component](https://docs.recoilpay.com/integrate/react): every prop
- [Add cash-out and buy to your site](https://docs.recoilpay.com/integrate/guides/fiat-drop-in)
