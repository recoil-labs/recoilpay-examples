# Widget landing page

A plain HTML landing page with RecoilPay built in: one `<script>` tag and one `<recoilpay-intent>` element. No build step, no framework. Visitors connect a wallet and type what they want: a cross-chain swap, a cash-out to their bank, or a purchase with a bank transfer.

## Run it

```bash
cp config.example.js config.js   # then add your Hugging Face token
npx serve .
```

Open the address `serve` prints, usually http://localhost:3000.

## What to look at

| File | |
|---|---|
| [`index.html`](./index.html) | The three steps: load the widget, place it, configure it and listen for events |
| [`config.example.js`](./config.example.js) | Your keys, kept out of the HTML |
| [`styles.css`](./styles.css) | The page's look. The widget is in Shadow DOM, so none of it leaks in |

The widget is loaded from jsDelivr, pinned to the `0.5` line: `@recoilpay/intent-widget@0.5`.

## Keys

- **Hugging Face token** (`hfAccessToken`): needed to understand typed sentences. It ships in your page, so create a fine-grained token with only "Make calls to Inference Providers", use it for nothing else, and rotate it if it's abused.
- **WalletConnect project id** (`walletConnectProjectId`): optional. Without it, browser wallets such as MetaMask still work.

## Try these

- `swap 1 USDC on OP Sepolia for USDC on Base Sepolia`
- `cash out 10 USDC on Base Sepolia to NGN`
- `buy ₦5,000 of USDC on Base Sepolia`

You'll need testnet tokens: see [Supported networks](https://docs.recoilpay.com/supported-networks). Cash-outs and purchases only go through when a solver is offering them.

## Learn more

- [Embed the widget](https://docs.recoilpay.com/integrate/widget): every attribute and event
- [Add cash-out and buy to your site](https://docs.recoilpay.com/integrate/guides/fiat-drop-in)
