# Cash out with your own UI

A cash-out page where every screen is the app's own HTML, built on RecoilPay's headless SDK, `@recoilpay/intent-core`. No framework and no RecoilPay components: the SDK finds the best offer, seals the bank details for the solver, runs the escrow and follows the payout, and the app renders each step.

It's the finished version of the guide [Build a cash-out flow](https://docs.recoilpay.com/integrate/guides/cash-out).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173 in a browser with a wallet such as MetaMask. No keys are needed: there's no plain-English input, so no Hugging Face token.

## What to look at

| File | |
|---|---|
| [`src/cash-out.ts`](./src/cash-out.ts) | The guide's module: chains, the request, the session, bank details checks, what to show per phase, remembering the trade |
| [`src/main.ts`](./src/main.ts) | The app: connecting a wallet, the three screens, confirm or dispute, picking a trade back up after a reload |
| [`index.html`](./index.html) | The screens |

## The flow

1. **What to cash out:** a chain from `GET /api/v1/chains` (every chain with a `fiat_escrow`) and an amount.
2. **The offer and your bank:** `session.quote()` ranks solvers; the user picks their bank and enters their account.
3. **Approve and sign:** `session.confirm()` handles the network switch, the one-time Permit2 approval and the lock signature.
4. **The payout:** the solver pays; the user answers `I received ₦…` (`confirmReceived()`) or `It hasn't arrived` (`dispute()`).

The trade id and the bank details proof are kept in `localStorage`, so a reload brings the trade back, and the receipt shows what the user needs if anything is disputed.

## Try it

You need testnet USDC on Base Sepolia or BNB Chain Testnet: see [Supported networks](https://docs.recoilpay.com/supported-networks). A cash-out only goes through when a solver is offering one; otherwise the offer step says no solver is cashing out right now.

The USDC is testnet USDC, but the solver's bank transfer to you can be real naira.

## Learn more

- [Build a cash-out flow](https://docs.recoilpay.com/integrate/guides/cash-out): the same code, step by step
- [Fiat ramps reference](https://docs.recoilpay.com/integrate/fiat-ramps): states, clocks and the API underneath
