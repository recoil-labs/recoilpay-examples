# RecoilPay examples

Small apps that show how to add [RecoilPay](https://docs.recoilpay.com) to a product: users type what they want, such as a cross-chain swap, a cash-out to their bank or a purchase with a bank transfer, and RecoilPay finds a solver and settles it.

Each example is its own app. `cd` into one and follow its README.

| Example | Stack | Shows |
|---|---|---|
| [`widget-landing`](./widget-landing) | Plain HTML, no build | A landing page with the `<recoilpay-intent>` widget: one script tag, wallet connection included |
| [`react-landing`](./react-landing) | Vite, React, wagmi, RainbowKit | The same page with `<RecoilIntent />` in an app that already has wallet connection |
| [`sdk-custom-ui`](./sdk-custom-ui) | Vite, TypeScript | A cash-out flow with your own screens on the headless SDK |

```bash
git clone https://github.com/recoil-labs/recoilpay-examples.git
cd recoilpay-examples/widget-landing
cp config.example.js config.js   # add your Hugging Face token
npx serve .
```

## Before you start

- **Node.js 20 or later** for the Vite examples.
- **A browser wallet** such as MetaMask, on the testnets RecoilPay runs on: Base Sepolia, OP Sepolia, Ethereum Sepolia, Polygon Amoy and BNB Chain Testnet. Get testnet tokens from [Supported networks](https://docs.recoilpay.com/supported-networks).
- **A Hugging Face token** for the widget and React examples, so typed sentences can be understood. It ships to the browser: create a fine-grained token with only "Make calls to Inference Providers" and use it for nothing else.

## Testnet only

RecoilPay runs on public testnets. Tokens have no value. Cash-outs and purchases, though, settle with bank transfers in Nigerian naira, which can be real money: try them with small amounts.

## The packages

All three examples use the published packages, released together under one version:

- [`@recoilpay/intent-widget`](https://www.npmjs.com/package/@recoilpay/intent-widget): the drop-in web component
- [`@recoilpay/intent-react`](https://www.npmjs.com/package/@recoilpay/intent-react): the React component and hooks
- [`@recoilpay/intent-core`](https://www.npmjs.com/package/@recoilpay/intent-core): the headless SDK

## Learn more

- [Integrate RecoilPay](https://docs.recoilpay.com/integrate/): the developer docs
- [How-to guides](https://docs.recoilpay.com/integrate/guides/fiat-drop-in): step by step, with tested code

## License

[MIT](./LICENSE)
