# ABA PayWay QR checkout (payment-link flow): full implementation guide

Reusable guide for adding "pay with ABA QR" to a web shop: show a KHQR code, poll ABA for the payment status, create the order only after ABA confirms payment. Written from the working Laravel implementation in this project (phsarmarket). The examples are PHP/Laravel, but the flow is framework-agnostic.

> **Important:** this flow uses ABA's *payment link* API, the same API the public payment-link web page (`https://link.payway.com.kh/ABAPAY...`) uses in the browser. It is **not** the official, documented PayWay merchant API, so ABA can change or limit it without notice. Section 11 describes the official API as the fallback.

---

## 1. What you need

| Item | Notes |
|---|---|
| ABA PayWay **payment link** | Looks like `https://link.payway.com.kh/ABAPAYxxxxxxxxx`. The part after the last `/` is the **payment link ID**. It must accept an open amount (the amount is sent by your server). |
| Currency | USD. The flow was built and tested with USD only. |
| A QR renderer | Server side, e.g. `simplesoftwareio/simple-qrcode` in Laravel; any QR library works (the QR content is a plain string). |
| A checkout that can create an order after payment | The order must only be created once ABA reports "paid". |
| A cache with atomic locks | Used to avoid creating two orders when status polls overlap (Laravel: `Cache::lock`). |

## 2. The most important lesson: use the right API host

ABA has two hosts that serve the **same paths**:

| Host | Result from a server |
|---|---|
| `https://pwapp.ababank.com/api` (mobile-app host) | Worked in June 2026, then started returning a bare nginx `403 Forbidden` page for server requests (checkout showed "Failed to create ABA QR"). Do not use it. |
| `https://link.payway.com.kh/api` (what the payment-link web page uses; found in its JS bundle as `API_BASE_PUBLIC_URL`) | Works. Use this as `ABA_PAYWAY_API_BASE_URL`. |

How it was found: open the payment link page, download its `/_nuxt/*.js` bundles and search for `API_BASE`.

Other findings:
- `link.payway.com.kh` blocks some HTTP clients (`Python-urllib` got 403; curl, Guzzle, Java `HttpClient` work). Send a normal client User-Agent.
- It also returns an **occasional 403 for valid requests**. Retry the HTTP call (3 attempts, ~400 ms apart) before failing.

## 3. Configuration (`.env` + config file)

```env
ABA_PAYWAY_ENABLED=true
ABA_PAYWAY_API_BASE_URL=https://link.payway.com.kh/api
ABA_PAYWAY_PAYMENT_LINK_ID=ABAPAYxxxxxxxxx
ABA_PAYWAY_DEVICE_ID=
ABA_PAYWAY_MERCHANT_NAME=
ABA_PAYWAY_REWRITE_QR_NAME=false
ABA_PAYWAY_POLL_INTERVAL=3
ABA_PAYWAY_QR_EXPIRES_IN=180
```

```php
// config/aba_payway.php
return [
    'enabled' => env('ABA_PAYWAY_ENABLED', true),
    'api_base_url' => env('ABA_PAYWAY_API_BASE_URL', 'https://link.payway.com.kh/api'),
    'payment_link_id' => env('ABA_PAYWAY_PAYMENT_LINK_ID'),
    'device_id' => env('ABA_PAYWAY_DEVICE_ID'),            // optional; a random one is generated when blank
    'merchant_name' => env('ABA_PAYWAY_MERCHANT_NAME'),    // optional page label override
    'rewrite_qr_merchant_name' => (bool) env('ABA_PAYWAY_REWRITE_QR_NAME', false), // experimental, keep false
    'validate_path' => '/pw-app/v1/payment/gateway/validate-payment-link-v2',
    'options_path'  => '/pw-app/v1/payment/gateway/list-payment-options',
    'status_path'   => '/pw-app/v1/payment-link/check-payment-status',
    'poll_interval' => (int) env('ABA_PAYWAY_POLL_INTERVAL', 3),
    'default_expires_in' => (int) env('ABA_PAYWAY_QR_EXPIRES_IN', 180),
];
```

Show the ABA option only when `enabled` is true **and** `payment_link_id` is filled.

## 4. The three ABA calls

All calls: `POST`, JSON body, headers `Content-Type: application/json`, `Accept: application/json`, `language: en`. `request_time` = `YmdHis` (server clock, e.g. `20261023091500`); generate a fresh value for each call. Hashes are **SHA-512, lower-case hex**, plain concatenation, no separator.

### 4.1 Validate the payment link
`POST {base}/pw-app/v1/payment/gateway/validate-payment-link-v2`

```json
{ "instore_transaction_id": "<PAYMENT_LINK_ID>", "request_time": "<YmdHis>", "hash": "sha512(request_time + PAYMENT_LINK_ID)" }
```
Response (HTTP 200): `aba_data` (long opaque string, needed next), `transaction_summary.merchant.company`, `status.code == "00"`. Missing `aba_data` = failure.

### 4.2 Request the QR for an amount
`POST {base}/pw-app/v1/payment/gateway/list-payment-options`

```json
{
  "additional_fields": "{\"amount\":\"0.10\"}",
  "request_time": "<YmdHis>",
  "aba_data": "<aba_data from 4.1>",
  "hash": "sha512(request_time + aba_data + additional_fields)"
}
```
- `additional_fields` is a **JSON string** (not an object). Amount is a string with exactly two decimals (`0.10`, `12.50`); must be > 0.
- The hash uses the exact `additional_fields` string that is sent.

Response (HTTP 200): `qr_string` (KHQR text, starts `0002010102`), `token`, `client_id`, `expire_in_sec` (180), `token_time`, `status.code == "00"`. The QR key may also be `khqr`, `qr`, `qr_code` or `qrCode`; accept any. Missing QR, `token` or `client_id` = failure.

### 4.3 Check payment status
`POST {base}/pw-app/v1/payment-link/check-payment-status` with an extra header `token: <token from 4.2>`

```json
{ "device_id": "<device id>", "request_time": "<YmdHis>", "client_id": "<client_id from 4.2>", "hash": "sha512(client_id + device_id + request_time)" }
```
- `device_id`: any stable string for this checkout (10 random alphanumerics, or the configured value). Use the **same** value for every status call of one checkout.
- Unpaid response seen live: HTTP 200, `data.action = "request_qr"`, `status.code = "00"`.
- Map the result by looking at the `status`, `action` and `message` values at the top level and inside `data`:
  - **paid**: contains `paid`, `approved` or `completed` (whole word, case-insensitive)
  - **terminal (fail/expired)**: contains `expired`, `failed`, `declined` or `validation required`
  - anything else: **pending**
  - HTTP errors, timeouts, malformed JSON: **retryable verification error** (never create an order).
- Note: the "paid" response was taken from the original Java reference client, not captured live in this project. Capture one real $0.10 payment and confirm the wording before going live.

Reference client (Java) for all three calls: `PayWayFlowTest.java` in the repo root.

## 5. Application flow

```
Customer picks "ABA QR"  ->  POST /checkout-aba-qr   (show)
  validate address, cart, stock, minimum order
  amount = checkout total converted to USD, 2 decimals
  call 4.1 + 4.2 -> qr, token, client_id, expire_in_sec
  store session 'aba_qr_checkout'
  render QR page (QR, amount, countdown, status text)

QR page JS, every poll_interval seconds:
  POST /checkout-aba-qr/verify  { client_id }
    -> status 1            : redirect to success URL
    -> pending: true       : keep waiting
    -> terminal: true      : stop, show failure text
    -> expired: true       : redirect back to payment selection
    -> verification_error  : keep polling, show "unable to verify, keep page open"

verify (server):
  client_id must equal the session's client_id (else 422)
  if session.completed -> return success (idempotent)
  if expires_at < now -> clear session, return expired
  call 4.3 -> pending | terminal | paid | error
  paid -> lock('aba-qr-order:'+sha256(client_id), 15 s, wait 5 s):
            re-read session; if completed -> success
            re-validate checkout, stock, minimum order
            create order(s): payment_method=aba_qr, payment_status=paid,
                             order_status=confirmed, transaction_ref=ABA ref or client_id
            run post-order steps (referral bonus, clear cart/coupon, new-customer registration)
            session.completed=true, order_ids, transaction_ref
         -> return success
```

Session shape:
```php
session()->put('aba_qr_checkout', [
    'token' => ..., 'client_id' => ..., 'device_id' => ..., 'merchant_name' => ...,
    'amount' => '0.10', 'currency' => 'USD',
    'expires_at' => now()->addSeconds($expiresIn)->timestamp,
    'completed' => false, 'order_ids' => [],
]);
```
Keep `token` and the payment link ID **server-side only**. The browser only receives the QR text, `client_id`, amount and timings.

Routes (CSRF token sent by the page's `fetch` in `X-CSRF-TOKEN`):
```php
Route::post('checkout-aba-qr', [AbaQrPaymentController::class, 'show'])->name('checkout-aba-qr');
Route::post('checkout-aba-qr/verify', [AbaQrPaymentController::class, 'verify'])->name('checkout-aba-qr.verify');
```

Checkout page: a radio/button inside its own `<form method="post" action="{{ route('checkout-aba-qr') }}">` per payment method. Make sure only one method looks selected (separate forms mean separate radio groups).

## 6. Files in this project (copy these)

| File | Purpose |
|---|---|
| `config/aba_payway.php` | settings above |
| `app/Services/AbaPaywayService.php` | `createCheckout()`, `checkStatus()`, `generateDeviceId()`, `post()` with retry, hashing, status mapping, KHQR merchant-name parser |
| `app/Http/Controllers/Web/AbaQrPaymentController.php` | `show()`, `verify()`, order creation under a cache lock |
| `resources/themes/*/checkout/aba-qr-payment.blade.php` | QR page + polling JS |
| payment page blade | the "ABA QR" option form |
| `routes/web/routes.php` | the two routes |
| `resources/lang/en/new-messages.php` | texts (`Failed_to_create_ABA_QR`, `ABA_QR_has_expired`, ...) |
| `tests/Unit/AbaPaywayServiceTest.php`, `tests/Feature/AbaQrPaymentControllerTest.php` | HTTP-faked tests |

Service skeleton:

```php
private function post(string $path, array $payload, array $headers = []): array
{
    $response = Http::acceptJson()->asJson()
        ->withHeaders(array_merge(['language' => 'en'], $headers))
        ->timeout(20)->connectTimeout(10)
        ->retry(3, 400, throw: false)               // ABA sometimes returns a stray 403
        ->post(rtrim(config('aba_payway.api_base_url'), '/').'/'.ltrim($path, '/'), $payload);

    if (! $response->successful()) {
        Log::warning('ABA request rejected', ['path' => $path, 'status' => $response->status(), 'response_body' => $response->body()]);
        throw new RuntimeException('ABA request failed with HTTP status '.$response->status().'.');
    }
    $data = $response->json();
    if (! is_array($data)) throw new RuntimeException('ABA returned malformed response data.');
    return $data;
}
```

## 7. QR page (front end)

- Render `QrCode::size(140)->margin(1)->generate($qr)` server-side.
- Countdown from `expiresIn` seconds; at 0 stop polling and go back to payment selection.
- Poll with `fetch(verifyUrl, {method:'POST', headers:{'Content-Type':'application/json','X-CSRF-TOKEN':token,'Accept':'application/json'}, body: JSON.stringify({client_id})})`, handling the JSON cases listed in section 5.
- Show the amount (two decimals + `USD`) and a short instruction ("Scan with a mobile banking app that supports KHQR").

## 8. Merchant name on the screen and on the phone

- The merchant name is KHQR tag **59**. Parse the QR as TLV (2-digit tag, 2-digit length, value) to read it (`VOERN KIMSOER` here). The page label uses `ABA_PAYWAY_MERCHANT_NAME` if set, otherwise this name.
- **What the customer's phone shows is controlled by ABA.** ABA Mobile showed the registered account holder name and account number even after the QR's tag 59 was rewritten with a valid CRC16 (tag 63), and a rewritten QR may be rejected. Keep `ABA_PAYWAY_REWRITE_QR_NAME=false`. To show your shop name on the phone, ask ABA to change the merchant/outlet name on the payment link or to give you a business merchant profile.

## 9. Security and correctness checklist

- Create the order **only** in the paid branch of `verify`, inside the cache lock, and make it idempotent (`completed` flag).
- Re-run cart, stock and minimum-order validation before creating the order.
- The amount is fixed server-side in step 4.2; never accept an amount from the browser.
- Do not log `token`, hashes or full responses with secrets; log status code and message.
- Known limitation: the status response used here does not carry a paid amount that the code compares with the expected amount. Keep amounts fixed by the QR and check the ABA app/statement for real payments.
- `.env` should not be committed with real values.

## 10. Smoke test before building (run from the target server)

```bash
ID=ABAPAYxxxxxxxxx
RT=$(date +%Y%m%d%H%M%S)
H=$(printf '%s%s' "$RT" "$ID" | openssl dgst -sha512 -hex | awk '{print $NF}')
curl -s -w "\nHTTP %{http_code}\n" -X POST https://link.payway.com.kh/api/pw-app/v1/payment/gateway/validate-payment-link-v2 \
  -H 'Content-Type: application/json' -H 'language: en' \
  -d "{\"instore_transaction_id\":\"$ID\",\"request_time\":\"$RT\",\"hash\":\"$H\"}"
```
Expected: HTTP 200, `"code": "00"`, an `aba_data` value. A bare nginx `403 Forbidden` page means the host or your IP/client is blocked.

Troubleshooting:

| Symptom | Cause / fix |
|---|---|
| nginx `403 Forbidden` HTML on the first call | wrong host (`pwapp.ababank.com`) or blocked client; use `link.payway.com.kh/api`, normal User-Agent, retry |
| Intermittent 403 | add the retry (3 x, 400 ms) |
| JSON error with `status.code` not `00` | wrong hash input order, stale `request_time`, or wrong `additional_fields` string |
| QR appears but page never completes | check `device_id` is the same for every status call; check the paid wording (section 4.3) |
| Toast "Failed to create ABA QR" | read `storage/logs/laravel.log` for "ABA request rejected" |
| Changed `.env` has no effect | `php artisan config:clear`; restart the dev server |

## 11. Fallback: the official PayWay merchant API

Needs a **Merchant ID and API key** from ABA (sandbox: https://sandbox.payway.com.kh/register-sandbox/, production: paywaysales@ababank.com). Docs: https://developer.payway.com.kh (pages `qr-api-14530840e0.md`, `check-transaction-14530826e0.md`).
- Generate QR: `POST /api/payment-gateway/v1/payments/generate-qr` (required: `req_time` UTC `YmdHis`, `merchant_id`, `tran_id` <= 20 chars unique, `payment_option=abapay_khqr`, `amount`, `currency`, `lifetime` minutes >= 3, `qr_image_template`, `hash`). Hash = base64(HMAC-SHA512(req_time+merchant_id+tran_id+amount+items+first_name+last_name+email+phone+purchase_type+payment_option+callback_url+return_deeplink+currency+custom_fields+return_params+payout+lifetime+qr_image_template, api_key)). Response: `qrString`, `qrImage`, `abapay_deeplink`.
- Check Transaction: `POST /api/payment-gateway/v1/payments/check-transaction-2` with `req_time, merchant_id, tran_id, hash` (HMAC-SHA512 base64 of `req_time+merchant_id+tran_id`); `data.payment_status` is `APPROVED`, `PENDING`, `DECLINED`, `CANCELLED`, `REFUNDED` or `PRE-AUTH`.
- Sandbox base `https://checkout-sandbox.payway.com.kh`; the production host is not stated in the docs (ask ABA, believed `https://checkout.payway.com.kh`).

---

## 12. Prompt for an AI coding assistant (paste into the other project)

```text
Add "ABA QR" as a checkout payment option to this project. It shows a KHQR code, polls ABA for payment status, and creates the order ONLY after ABA reports the payment as paid. First read how existing payment methods and order creation work in this codebase and follow its conventions (routing, controllers/services, views, translations, tests). Do not change other payment methods.

CONFIG (env + config file; show the option only when enabled AND payment link ID is set)
ABA_PAYWAY_ENABLED=true
ABA_PAYWAY_API_BASE_URL=https://link.payway.com.kh/api      # NOT pwapp.ababank.com (it returns nginx 403)
ABA_PAYWAY_PAYMENT_LINK_ID=<id after the last "/" of https://link.payway.com.kh/ABAPAY...>
ABA_PAYWAY_DEVICE_ID=        # optional; generate 10 random alphanumerics per checkout when blank
ABA_PAYWAY_MERCHANT_NAME=    # optional page label; fallback = name parsed from the QR
ABA_PAYWAY_POLL_INTERVAL=3, ABA_PAYWAY_QR_EXPIRES_IN=180 (fallback when ABA gives no expiry)

ABA API (all POST, JSON, headers Accept: application/json, language: en; request_time = YmdHis, fresh per call; hashes = SHA-512 lower-case hex of the plain concatenation, no separators; HTTP client: timeout 20s, connect timeout 10s, retry 3 times 400 ms apart because ABA sometimes returns a stray 403; a non-2xx after retries or a non-JSON body is an error)
1) {base}/pw-app/v1/payment/gateway/validate-payment-link-v2
   body: instore_transaction_id=PAYMENT_LINK_ID, request_time, hash=sha512(request_time+PAYMENT_LINK_ID)
   response: aba_data (required)
2) {base}/pw-app/v1/payment/gateway/list-payment-options
   body: additional_fields = the JSON STRING {"amount":"<usd, exactly 2 decimals, >0>"}, request_time, aba_data, hash=sha512(request_time+aba_data+additional_fields)
   response: qr_string (also accept khqr, qr, qr_code, qrCode), token, client_id, expire_in_sec. Missing QR/token/client_id = failure.
3) {base}/pw-app/v1/payment-link/check-payment-status, extra header token: <token from step 2>
   body: device_id, request_time, client_id, hash=sha512(client_id+device_id+request_time)
   Same device_id for every status call of one checkout.
   State mapping over status/action/message at top level and inside data: whole word paid|approved|completed (case-insensitive) = paid; expired|failed|declined|"validation required" = terminal; anything else = pending. HTTP error/timeout/malformed = retryable verification error (never create an order).

SERVICE: AbaPaywayService with createCheckout(amount, deviceId) -> [qr, token, client_id, device_id, merchant_name, expires_in] and checkStatus(token, clientId, deviceId) -> [state, message, transaction_ref, payload]. Parse merchant_name from KHQR tag 59 (TLV: 2-digit tag, 2-digit length, value). Never log token or hashes.

FLOW
- POST /checkout-aba-qr (show): validate address, cart, stock, minimum order; amount = checkout total in USD with 2 decimals; call createCheckout; store session aba_qr_checkout {token, client_id, device_id, merchant_name, amount, currency=USD, expires_at, completed=false, order_ids=[]}; render the QR page (QR rendered server-side from qr_string, amount, countdown, status area). On failure log the error and redirect back to payment selection with the toast "Failed to create ABA QR". token and payment link ID never reach the browser.
- POST /checkout-aba-qr/verify (JSON, CSRF-protected): body client_id must equal the session client_id (else 422); if completed return success (idempotent); if expired clear the session and return expired + redirect; call checkStatus; pending -> {status:0,pending:true}; terminal -> {status:0,terminal:true,message}; error -> {status:0,verification_error:true}; paid -> take an atomic cache lock keyed by sha256(client_id) (15 s, wait up to 5 s), re-read the session (return success if already completed), re-validate checkout/stock/minimum order, create the order(s) with payment_method=aba_qr, payment_status=paid, order_status=confirmed, transaction_ref=ABA reference or client_id, run the project's normal post-order steps, then mark the session completed with order_ids, and return {status:1, redirect: success url}.
- Page JS: poll verify every poll_interval seconds with fetch + CSRF header; handle status 1 (redirect), pending, terminal (stop, show message), expired (redirect to payment page), verification_error (keep polling with a "keep this page open" message); countdown from expires_in then stop.
- Payment page: add an "ABA QR" option in its own form posting to /checkout-aba-qr; make sure only one method looks selected.

TESTS (HTTP faked; no live ABA calls): request payloads and hashes for the 3 calls; QR key fallbacks; missing aba_data/QR/token/client_id; a faked 403 then 200 succeeds via retry; status mapping paid/pending/terminal/error; verify rejects wrong client_id, returns expired, is idempotent after completion, and creates exactly one order under concurrent paid polls.

DELIVER: list the files you changed, the .env keys to add, and how to run the tests. Then tell me how to smoke-test step 1 with curl from the server.
```
