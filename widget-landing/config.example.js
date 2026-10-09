// Copy this file to config.js and fill it in. config.js is gitignored.
//
// Both values end up in the page, so anyone who loads it can read them:
// use keys made for this purpose (see README.md).
window.RECOILPAY_CONFIG = {
  // Hugging Face token for plain-English input. Without it, typed sentences
  // aren't understood. https://huggingface.co/settings/tokens
  hfAccessToken: '',

  // Reown (WalletConnect) project id, for mobile wallets. Optional: browser
  // wallets such as MetaMask work without it. https://cloud.reown.com
  walletConnectProjectId: '',

  // Leave empty for RecoilPay's API. Only set it if we gave you another URL.
  apiUrl: '',
};
