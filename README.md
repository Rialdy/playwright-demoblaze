# Playwright Demoblaze — E2E Test Automation Framework

End-to-end UI test automation for [Demoblaze](https://www.demoblaze.com/) (a public e-commerce demo site), built with **Playwright Test** + **TypeScript** using the **Page Object Model**.

> **Status:** 3/3 tests passing on Chromium (~23s).

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Tests](#running-the-tests)
- [Test Coverage](#test-coverage)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [Reporting & Debugging](#reporting--debugging)
- [Key Learnings / Tricky Behaviours of the AUT](#key-learnings--tricky-behaviours-of-the-aut)
- [Contributing](#contributing)

---

## Overview

This framework automates two critical user journeys against Demoblaze:

| Journey | Test | What it proves |
|---|---|---|
| **Authentication** | Successful Login with Valid Credentials | Credentials accepted, `Welcome <user>` rendered |
| **Authentication** | Unsuccessful Login with Invalid Credentials | Negative path — `Wrong password.` alert surfaced |
| **E-commerce** | Successful Checkout Process | Add 3 products → validate cart & total → place order → confirmation |

The framework separates **locators**, **page objects**, **tests**, and **configuration** so that UI changes are absorbed in one place instead of rippling across every test.

---

## Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Test runner | Playwright Test | `^1.64.1` |
| Language | TypeScript | via `@types/node` `^26.6.5` |
| Env management | dotenv | `^18.0.9` |
| Browsers | Chromium, Firefox | bundled with Playwright |
| Node.js | ≥ 20 | tested on `v20.14.0` |

---

## Project Structure

```
playwright-demoblaze/
│
├── playwright.config.ts        # Global config: timeouts, workers, browsers, baseURL, reporters
├── package.json                # Dependencies + npm scripts
├── .env                        # Secrets (git-ignored)
├── .env.example                # Template for local setup
├── .gitignore
│
├── tests/                      # Spec files — pure test intent, no selectors
│   ├── login.spec.ts           #   2 auth tests (positive + negative)
│   └── checkout.spec.ts        #   1 full checkout flow
│
├── pages/                      # Page Objects — encapsulate UI interactions
│   ├── basePage.ts             #   Shared primitives: click, type, getText, handleAlert
│   ├── loginPage.ts            #   Login modal
│   ├── productPage.ts          #   Product catalogue + add-to-cart
│   ├── cartPage.ts             #   Cart validation, cart reset, Place Order
│   └── placeOrderPage.ts       #   Order form + confirmation message
│
├── locators/                   # Selectors — single source of truth
│   ├── loginLocators.ts
│   ├── productLocators.ts
│   ├── cartLocators.ts
│   └── placeOrderLocators.ts
│
├── utils/
│   └── env.ts                  # Typed, validated access to process.env
│
├── test-results/               # Failure artifacts (git-ignored)
└── playwright-report/          # HTML report (git-ignored)
```

### Why this layout?

| Concern | Lives in | Rationale |
|---|---|---|
| *Where is the element?* | `locators/` | A CSS change is a one-line edit, not a code search |
| *How do I interact with it?* | `pages/` | Tests read as business steps, not selector soup |
| *What must be true?* | `tests/` | Reviewable by non-technical stakeholders |
| *How does it run?* | `playwright.config.ts` | Environment parity across local/CI |

---

## Prerequisites

- **Node.js** 20+
- **npm** 9+
- Internet access (Demoblaze is a live public site)

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/playwright-demoblaze.git
cd playwright-demoblaze

# 2. Install dependencies
npm install

# 3. Install browser binaries
npx playwright install

# 4. Create your local environment file
cp .env.example .env
```

---

## Configuration

All environment-driven values live in `.env` and are loaded through `utils/env.ts`, which **throws at startup** if a required variable is missing — so misconfiguration fails fast instead of mid-run.

```env
BASE_URL=https://www.demoblaze.com/
LOGIN_USERNAME=demo
LOGIN_PASSWORD=demo
```

| Variable | Purpose |
|---|---|
| `BASE_URL` | Resolved into Playwright's `baseURL`, letting tests call `page.goto('/')` |
| `LOGIN_USERNAME` | Credentials for the positive auth flow |
| `LOGIN_PASSWORD` | Credentials for the positive auth flow |

> ⚠️ `.env` is git-ignored. **Never commit real credentials.** Use `.env.example` as the shared template.

### Global timeouts (`playwright.config.ts`)

| Setting | Value | Why |
|---|---|---|
| `timeout` | `90000` | Demoblaze's API latency is highly variable (4–12s for a single login round-trip) |
| `expect.timeout` | `20000` | Web-first assertions need headroom before declaring failure |
| `mode: 'serial'` (in `checkout.spec.ts`) | serial | Both checkout tests share one server-side cart — see [learnings](#key-learnings--tricky-behaviours-of-the-aut) |
| `retries` | `2` on CI, `0` locally | Masks flakiness in CI only |
| `headless` | `false` | Visual debugging by default |

---

## Running the Tests

| Command | Description |
|---|---|
| `npm test` | Chromium (default browser) |
| `npm run test:all` | Chromium + Firefox |
| `npm run test:headed` | Watch the browser execute the flows |
| `npm run test:login` | Auth tests only |
| `npm run test:checkout` | Checkout test only |
| `npm run test:report` | Open the last HTML report |

<details>
<summary>Raw <code>npx playwright test</code> equivalents</summary>

```bash
# Everything on Chromium
npx playwright test --project=chromium

# Specific file
npx playwright test tests/checkout.spec.ts

# Single test by title
npx playwright test -g "Successful Checkout"

# Firefox
npx playwright test --project=firefox

# With trace recording for post-mortem debugging
npx playwright test --trace on
```
</details>

---

## Test Coverage

### 1. `tests/login.spec.ts` — Authentication

| # | Test | Type | Assertion |
|---|---|---|---|
| 1 | Successful Login with Valid Credentials | Positive | `#nameofuser` → `Welcome demo` |
| 2 | Unsuccessful Login with Invalid Credentials | Negative | Alert → `Wrong password.` |

### 2. `tests/checkout.spec.ts` — Checkout Flow

| Step | Action | Assertion |
|---|---|---|
| Setup | Login + reset server-side cart | `Welcome demo` present |
| 1 | Add Galaxy S6, Nexus 6, iPhone 6 32GB | Alert `Product added.` per item |
| 2 | Navigate to cart | 3 items visible |
| 3 | Validate total | `1800` (360 + 650 + 790) |
| 4 | Open Place Order, fill name + card | Form accepts input |
| 5 | Click Purchase | `.sweet-alert h2` → `Thank you for your purchase!` |

---

## Architecture & Design Decisions

### Page Object Model with a shared base class

```
BasePage  (click / type / getText / isElementVisible / handleAlert / navigateTo)
   ├── LoginPage
   ├── ProductPage
   ├── CartPage
   └── PlaceOrderPage
```

Adding a new page means extending `BasePage` and inheriting every primitive — no duplication, one place to fix a flaky interaction.

### Web-first assertions over imperative polling

```ts
// ❌ Not self-healing: returns false before rows render
expect(await cartPage.samsungGalaxyS6Exists()).toBe(true);

// ✅ Auto-retries until visible or timeout
await expect(cartPage.samsungGalaxyS6).toBeVisible();
```

`isVisible()` evaluates **once, immediately**. Cart rows are populated by an async `viewcart` call, so the naive form reliably failed. Page objects now expose `Locator` getters, letting Playwright's auto-retrying assertions do the work.

### Environment access is validated, not assumed

```ts
function getEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Environment variable ${name} is not defined`);
    return value;
}
```

Missing config surfaces as an explicit error at import time rather than `undefined` deep inside a test.

### Selector strategy

Prefer **semantic, stable** selectors in this order:

1. **ID** — `#login2`, `#cartur`, `#totalp`
2. **Attribute** — `a[onclick="addToCart(3)"]`, `a.hrefch[href="prod.html?idp_=3"]`
3. **Role + text** — `td:text-is("Nexus 6")`, `.sweet-alert h2`

Avoid absolute XPath and positional indexes.

---

## Reporting & Debugging

Reporters: **list** (console) + **html** (`playwright-report/`).

```bash
npm run test:report          # open HTML report
npx playwright show-trace test-results/<test-dir>/trace.zip
```

**On failure you get:**
- `error-context.md` — accessibility snapshot of the page at failure time
- `trace.zip` — full action timeline, DOM snapshots, network log
- Screenshots/screencasts when enabled

> **Tip:** The accessibility snapshot is often enough to diagnose a failure without re-running. It shows exactly what Playwright could see — e.g. a confirmation message rendered as an `<h2>` while the locator expected a `<td>`.

---

## Key Learnings / Tricky Behaviours of the AUT

These are non-obvious properties of Demoblaze discovered while stabilising the suite. Worth knowing before extending it.

| # | Behaviour | Impact | Resolution |
|---|---|---|---|
| 1 | **Per-product cart IDs.** Add-to-cart is `addToCart(1)` (S6), `addToCart(3)` (Nexus), `addToCart(5)` (iPhone) | A single shared `addToCart(1)` selector silently matches nothing on other product pages | Three explicit locators in `productLocators.ts` |
| 2 | **Cart is server-side, per-account** | Items persist across runs *and* across parallel workers — totals drift (observed 1800 → 45080) | `clearCart()` in `beforeEach` + `mode: 'serial'` |
| 3 | **`deletecart` vs `viewcart` credentials differ** | `viewcart` requires the base64 `tokenp_`; `deletecart` requires the plain username | `clearCart(username)` posts `{ cookie: username }` |
| 4 | **Highly variable API latency** (4–12s per login round-trip) | Default 5s `expect` timeout caused intermittent `Received: ""` on `Welcome demo` | `expect.timeout: 20000`, test `timeout: 90000` |
| 5 | **Confirmation is SweetAlert 1.x `<h2>`**, not a `<td>` | Assertion could *never* pass — burned the full 90s timeout | `.sweet-alert h2` locator |
| 6 | **`isVisible()` does not auto-wait** | Returned `false` before async cart rows rendered | Replaced with `expect(locator).toBeVisible()` |
| 7 | **Alerts fire on `addtocart` and failed login** | Unhandled dialogs can stall a flow | `handleAlert()` registers `waitForEvent('dialog')` *before* the triggering click |

> **Lesson:** a test that fails *after* the full timeout often indicates a structurally impossible assertion, not a slow one. Check the page snapshot first.

---

## Contributing

1. Keep selectors in `locators/`, never inline in tests.
2. Expose `Locator` getters on page objects; assert with `expect(...)` in specs.
3. Add new env vars to **both** `.env.example` and `utils/env.ts`.
4. If you add a test that mutates cart state, keep `mode: 'serial'` or reset state in `beforeEach`.
5. Run `npm test` before pushing.

---

## License

ISC
