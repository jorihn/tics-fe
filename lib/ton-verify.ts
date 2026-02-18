import { TonClient, Address } from '@ton/ton';
import { PaymentIntent } from '@/types/payment';
import { updatePaymentStatus } from './payment-db';

const TON_API_KEY = process.env.TON_API_KEY || '';
const TON_NETWORK = process.env.TON_NETWORK || 'testnet';

const endpoint = TON_NETWORK === 'mainnet' 
  ? 'https://toncenter.com/api/v2/jsonRPC'
  : 'https://testnet.toncenter.com/api/v2/jsonRPC';

export async function verifyTONPayment(intent: PaymentIntent): Promise<boolean> {
  try {
    const client = new TonClient({
      endpoint,
      apiKey: TON_API_KEY,
    });

    const address = Address.parse(intent.wallet_address);
    const transactions = await client.getTransactions(address, { limit: 100 });

    const intentCreatedAt = new Date(intent.created_at).getTime() / 1000;

    for (const tx of transactions) {
      if (tx.now < intentCreatedAt) continue;

      const inMsg = tx.inMessage;
      if (!inMsg || inMsg.info.type !== 'internal') continue;

      const amount = Number(inMsg.info.value.coins) / 1e9;
      const minAmount = intent.amount_expected * 0.98;

      if (amount < minAmount) continue;

      let payload = '';
      try {
        if (inMsg.body && typeof inMsg.body === 'object') {
          const bodySlice = inMsg.body.beginParse();
          payload = bodySlice.loadStringTail();
        }
      } catch (e) {
        continue;
      }

      if (payload.includes(intent.id)) {
        const txHash = tx.hash().toString('hex');
        
        updatePaymentStatus(intent.id, 'success', {
          tx_hash: txHash,
          paid_at: new Date(tx.now * 1000).toISOString(),
          user_wallet_address: inMsg.info.src?.toString(),
        });

        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error verifying TON payment:', error);
    return false;
  }
}

export async function verifyUSDTPayment(intent: PaymentIntent): Promise<boolean> {
  try {
    const client = new TonClient({
      endpoint,
      apiKey: TON_API_KEY,
    });

    const address = Address.parse(intent.wallet_address);
    const transactions = await client.getTransactions(address, { limit: 100 });

    const intentCreatedAt = new Date(intent.created_at).getTime() / 1000;
    const usdtMaster = process.env.USDT_JETTON_MASTER;

    if (!usdtMaster) {
      console.error('USDT_JETTON_MASTER not configured');
      return false;
    }

    for (const tx of transactions) {
      if (tx.now < intentCreatedAt) continue;

      const inMsg = tx.inMessage;
      if (!inMsg || inMsg.info.type !== 'internal') continue;

      if (inMsg.body && typeof inMsg.body === 'object') {
        try {
          const bodySlice = inMsg.body.beginParse();
          const op = bodySlice.loadUint(32);
          
          if (op === 0x7362d09c) {
            const queryId = bodySlice.loadUint(64);
            const amount = bodySlice.loadCoins();
            const jettonAmount = Number(amount) / 1e6;

            if (jettonAmount >= intent.amount_expected * 0.98) {
              const txHash = tx.hash().toString('hex');
              
              updatePaymentStatus(intent.id, 'success', {
                tx_hash: txHash,
                paid_at: new Date(tx.now * 1000).toISOString(),
                user_wallet_address: inMsg.info.src?.toString(),
              });

              return true;
            }
          }
        } catch (e) {
          continue;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error verifying USDT payment:', error);
    return false;
  }
}
