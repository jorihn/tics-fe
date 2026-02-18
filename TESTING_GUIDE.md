# Testing Guide: TON Payment Integration

## ✅ Hoàn thành implementation

Đã tích hợp đầy đủ:
- ✅ TON Connect wallet integration
- ✅ Real-time TON/USD price conversion
- ✅ On-chain transaction verification
- ✅ Payment state management (idle → pending → success/failed)
- ✅ Quote expiration countdown

---

## 🧪 Cách test trên Testnet

### Bước 1: Chuẩn bị
1. **Cài ví TON testnet**:
   - Tonkeeper: https://tonkeeper.com
   - Hoặc Tonhub: https://tonhub.com
   - Chuyển sang testnet mode trong settings

2. **Lấy testnet TON**:
   - Vào https://t.me/testgiver_ton_bot
   - Gửi địa chỉ ví testnet của bạn
   - Nhận ~5 TON testnet miễn phí

### Bước 2: Test Payment Flow
1. Mở app: http://localhost:3000/agents
2. Chọn plan (Standard Plan - $30)
3. Click "Connect Wallet" → chọn ví testnet
4. Chọn payment method: **TON**
5. Click "Create Payment":
   - Thấy quote: `5.1 TON` (ví dụ nếu TON = $6)
   - Countdown timer: 10 phút
6. Click "Pay Now":
   - Ví TON mở popup xác nhận
   - Kiểm tra amount + destination
   - Confirm transaction
7. Đợi 5-10 giây → auto verify
8. Thấy "✅ Payment successful!"

### Bước 3: Verify trên Blockchain
- Vào https://testnet.tonscan.org
- Paste địa chỉ ví của bạn (từ `.env`)
- Thấy transaction với đúng amount + payload

---

## 🐛 Troubleshooting

### Lỗi: "Transaction not found on blockchain"
- **Nguyên nhân**: Transaction chưa được confirm (cần ~5-10s)
- **Giải pháp**: Đợi thêm 10s rồi click "Verify Payment" lại

### Lỗi: "Failed to connect wallet"
- **Nguyên nhân**: Ví chưa cài hoặc chưa chuyển sang testnet
- **Giải pháp**: Cài Tonkeeper và enable testnet mode

### Lỗi: "Quote expired"
- **Nguyên nhân**: Đã quá 10 phút kể từ lúc tạo quote
- **Giải pháp**: Click "Create Payment" lại để lấy quote mới

### Lỗi: "Insufficient balance"
- **Nguyên nhân**: Ví testnet không đủ TON
- **Giải pháp**: Lấy thêm TON từ @testgiver_ton_bot

---

## 📊 Kiểm tra Payment Intent trong LocalStorage

Mở DevTools → Application → Local Storage → `payment_intents`:
```json
{
  "intent_abc123": {
    "id": "intent_abc123",
    "status": "success",
    "tx_hash": "abc...",
    "amount_expected": 5.1,
    "paid_at": "2026-02-18T12:00:00Z"
  }
}
```

---

## 🚀 Deploy lên Production

### 1. Cập nhật .env cho mainnet
```env
TON_WALLET_ADDRESS=UQD...your-mainnet-wallet
TON_API_KEY=your-mainnet-api-key-from-@tonapibot
TON_NETWORK=mainnet
USDT_JETTON_MASTER=EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs
```

### 2. Tạo TON Connect manifest
Tạo file `public/tonconnect-manifest.json`:
```json
{
  "url": "https://your-production-domain.com",
  "name": "AI Assistant Payment",
  "iconUrl": "https://your-production-domain.com/icon-512.png"
}
```

Cập nhật `components/TonConnectProvider.tsx`:
```typescript
const manifestUrl = 'https://your-production-domain.com/tonconnect-manifest.json';
```

### 3. Security checklist
- [ ] Verify `.env` không bị commit vào git
- [ ] Rate limiting cho API endpoints
- [ ] Monitoring alerts cho stuck payments
- [ ] Backup payment intents sang database thực (thay localStorage)
- [ ] Idempotency protection cho webhooks

---

## 📈 Next Steps (Optional)

### Phase 2: USDT Jetton Support
Implement Jetton transfer trong `PaymentMethodSelector.tsx`:
```typescript
// Replace alert với real Jetton transfer
const jettonTransfer = {
  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [{
    address: usdtWalletAddress, // User's USDT wallet
    amount: '50000000', // 0.05 TON for gas
    payload: jettonTransferBody, // Jetton transfer OP
  }]
};
```

### Phase 3: Background Monitoring
Tạo cron job để auto-verify pending payments:
```typescript
// app/api/cron/verify-payments/route.ts
export async function GET() {
  const pending = getPendingIntents();
  for (const intent of pending) {
    await verifyPayment(intent.id);
  }
}
```

### Phase 4: Real Database
Migrate từ localStorage sang PostgreSQL/MongoDB:
- Persistent storage
- Multi-user support
- Transaction history
- Analytics

---

## 🎯 Current Status

✅ **MVP Complete**:
- TON native payment working
- Real blockchain verification
- Wallet connection via TON Connect
- Quote management with expiration
- Payment state machine

⏳ **Pending**:
- USDT Jetton transfer (có placeholder)
- Background monitoring job
- Production database migration
- Webhook integration (optional)

---

## 📞 Support

Nếu gặp vấn đề:
1. Check console logs trong DevTools
2. Verify transaction trên https://testnet.tonscan.org
3. Check payment intent trong localStorage
4. Verify `.env` config đúng
