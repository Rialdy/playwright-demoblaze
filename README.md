# Playwright Demoblaze

E2E UI testing with **Playwright Test** and **TypeScript** for [Demoblaze](https://www.demoblaze.com/) — a public e-commerce demo site.

Uses the Page Object Model so selectors, page logic and test steps stay separated.

---

## Test Scenarios

| File | Test | What it checks |
|---|---|---|
| `tests/login.spec.ts` | Successful Login with Valid Credentials | Shows `Welcome demo` after login |
| `tests/login.spec.ts` | Unsuccessful Login with Invalid Credentials | Shows `Wrong password.` alert |
| `tests/checkout.spec.ts` | Successful Checkout Process | Add 3 products → check cart & total → place order → confirmation message |

Total: **3 tests** (all passing on Chromium, ~24s)

---

## Project Structure

```
├── playwright.config.ts     # Timeout, browsers, baseURL, reporter
├── package.json
├── .env                     # Credentials (not committed)
├── .env.example
│
├── tests/                   # Test scripts
│   ├── login.spec.ts
│   └── checkout.spec.ts
│
├── pages/                   # Page Objects
│   ├── basePage.ts          # Shared methods (click, type, getText, handleAlert)
│   ├── loginPage.ts
│   ├── productPage.ts
│   ├── cartPage.ts
│   └── placeOrderPage.ts
│
├── locators/                # Selectors
│   ├── loginLocators.ts
│   ├── productLocators.ts
│   ├── cartLocators.ts
│   └── placeOrderLocators.ts
│
└── utils/
    └── env.ts               # Read .env variables
```

**Where to change things:**

- Element moved/renamed → edit `locators/`
- Interaction changed → edit `pages/`
- Assertion or flow changed → edit `tests/`
- Timeout / browser / URL → edit `playwright.config.ts`

---

## Setup

**Requirements:** Node.js 20+, internet access (Demoblaze is a live site)

```bash
npm install
npx playwright install
cp .env.example .env
```

### Environment (`.env`)

```
BASE_URL=https://www.demoblaze.com/
LOGIN_USERNAME=demo
LOGIN_PASSWORD=demo
```

`utils/env.ts` will throw an error at startup if any variable is missing.

---

## How to Run

| Command | Description |
|---|---|
| `npm test` | Run all tests on Chromium |
| `npm run test:all` | Run on Chromium + Firefox |
| `npm run test:headed` | Run with browser visible |
| `npm run test:login` | Login tests only |
| `npm run test:checkout` | Checkout test only |
| `npm run test:report` | Open HTML report |

Or use Playwright directly:

```bash
npx playwright test --project=chromium
npx playwright test tests/checkout.spec.ts
npx playwright test -g "Successful Checkout"
npx playwright test --trace on
```

---

## Timeouts

In `playwright.config.ts`:

```ts
timeout: 90000,
expect: { timeout: 20000 },
```

Demoblaze API response time varies a lot (4–12s just for login), so the default 5s expect timeout was too short.

The checkout test also uses `test.describe.configure({ mode: 'serial' })` because both tests share the same cart on the server.

---

## Reports & Debugging

```bash
npm run test:report
npx playwright show-trace test-results/<folder>/trace.zip
```

On failure you get:

- `error-context.md` — page snapshot at the moment it failed
- `trace.zip` — step-by-step action log, network requests, DOM snapshots

The snapshot is usually enough to see what went wrong without re-running.

---

## Notes About Demoblaze

Things worth knowing when adding or fixing tests:

1. **Each product has its own cart ID** — `addToCart(1)` for Galaxy S6, `addToCart(3)` for Nexus 6, `addToCart(5)` for iPhone. There are 3 separate locators in `productLocators.ts`.

2. **Cart is saved on the server per account** — items stay between runs and between parallel workers, so the total price keeps growing. `clearCart()` in `beforeEach` resets it.

3. **`clearCart` uses the username, not the token** — `deletecart` API wants `demo`, while `viewcart` wants the base64 token.

4. **Confirmation message is an `<h2>`** inside `.sweet-alert`, not a `<td>`.

5. **`isVisible()` does not wait** — it checks once immediately. For elements that load async (like cart rows), use `expect(locator).toBeVisible()` which retries automatically.

6. **Alerts appear** when adding to cart (`Product added.`) and on failed login. `handleAlert()` in `basePage.ts` listens for the dialog before triggering the click.
