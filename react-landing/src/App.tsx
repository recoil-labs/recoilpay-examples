import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { RecoilIntent } from '@recoilpay/intent-react';
import { useWagmiIntentWallet } from '@recoilpay/intent-react/wagmi';
import { useState } from 'react';

const HF_TOKEN = import.meta.env.VITE_HF_ACCESS_TOKEN || null;
const API_URL = import.meta.env.VITE_RECOILPAY_API_URL || undefined;

const EXAMPLES = [
  { label: 'Swap 1 USDC', sentence: 'swap 1 USDC on OP Sepolia for USDC on Base Sepolia' },
  { label: 'Cash out 10 USDC', sentence: 'cash out 10 USDC on Base Sepolia to NGN' },
  { label: 'Buy ₦5,000 of USDC', sentence: 'buy ₦5,000 of USDC on Base Sepolia' },
];

// A cash-out or purchase can outlast a visit: the user comes back to confirm
// the money arrived, or to pay. Keep its id so the component can show it again.
const read = (key: string) => localStorage.getItem(key);
const save = (key: string, id: string | null) => (id ? localStorage.setItem(key, id) : localStorage.removeItem(key));

export function App() {
  const wallet = useWagmiIntentWallet();
  const { openConnectModal } = useConnectModal();
  const [cashOut] = useState(() => read('recoilpay:cash-out'));
  const [purchase] = useState(() => read('recoilpay:purchase'));
  const [activity, setActivity] = useState<string[]>([]);
  const note = (line: string) => setActivity((a) => [`${new Date().toLocaleTimeString()}  ${line}`, ...a].slice(0, 20));

  return (
    <>
      <header className="nav">
        <span className="logo">Lumen</span>
        <ConnectButton chainStatus="icon" showBalance={false} />
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Example app · testnet</p>
            <h1>Move money in one sentence.</h1>
            <p className="lede">
              Swap across chains, cash out to your bank, or buy crypto with a bank transfer. Type what you want; RecoilPay finds a solver and
              settles it.
            </p>
          </div>

          <RecoilIntent
            hfAccessToken={HF_TOKEN}
            apiUrl={API_URL}
            wallet={wallet}
            onConnectWallet={openConnectModal}
            examples={EXAMPLES}
            theme={{ mode: 'dark', accent: '#7c5cff' }}
            onOrderSubmitted={(orderId) => note(`swap submitted: ${orderId}`)}
            onComplete={(state) => note(`swap finished: ${state.status ?? 'done'}`)}
            onError={(message) => note(`error: ${message}`)}
            resumeCashOut={cashOut}
            onCashOutStarted={(id) => {
              save('recoilpay:cash-out', id);
              note(`cash-out started: ${id}`);
            }}
            onCashOutEnded={(trade) => {
              save('recoilpay:cash-out', null);
              note(`cash-out ended: ${trade.state}`);
            }}
            resumePurchase={purchase}
            onPurchaseStarted={(id) => {
              save('recoilpay:purchase', id);
              note(`purchase started: ${id}`);
            }}
            onPurchaseEnded={(trade) => {
              save('recoilpay:purchase', null);
              note(`purchase ended: ${trade.state}`);
            }}
          />
        </section>

        <section className="how">
          <article>
            <h2>Swap</h2>
            <p>Any supported chain to any other. A solver delivers on the destination chain from its own funds.</p>
          </article>
          <article>
            <h2>Cash out</h2>
            <p>USDC to a Nigerian bank account. Your USDC waits in escrow until you confirm the naira arrived.</p>
          </article>
          <article>
            <h2>Buy</h2>
            <p>Pay naira by bank transfer, receive USDC. The solver's USDC is locked for you before you're shown where to pay.</p>
          </article>
        </section>

        <section className="events">
          <h2>Activity</h2>
          <p>The component's callbacks, as your app would receive them.</p>
          <pre>{activity.length ? activity.join('\n') : '(nothing yet)'}</pre>
        </section>
      </main>

      <footer>
        Example only. Testnet tokens have no value; a bank transfer can be real naira. Built with <a href="https://docs.recoilpay.com">RecoilPay</a>.
      </footer>
    </>
  );
}
