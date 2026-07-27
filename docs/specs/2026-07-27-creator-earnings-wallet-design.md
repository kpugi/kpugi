# Design Specification: Creator Earnings & Wallet Portal

**Date**: 2026-07-27  
**Author**: Antigravity AI  
**Scope**: Creator Earnings & Wallet Management System (`/earnings` & `/wallet`)

---

## 1. Overview & Goals

The **Creator Earnings & Wallet Portal** provides creators with real-time financial tracking, escrow audit clearance monitoring, Paystack NUBAN bank account verification, and instant withdrawal capabilities.

### Key Performance Constraints
* **Minimum Withdrawal**: **₦10,000** (Strictly enforced client & server side).
* **Bank Verification**: Paystack Bank Resolution API (`/bank/resolve`) for instant NUBAN account name lookup.
* **Escrow Clearance**: Real-time breakdown of funds locked in active campaign view verification audits vs cleared funds.

---

## 2. Core Architecture & UI Components

### Component 1: Available Wallet Balance Hero Card
* **Main Stat**: Display cleared balance (`₦1,245,600.00`).
* **Growth Indicator**: `↗ +12% vs last month` emerald badge.
* **Action CTA**: `💳 Withdraw Funds` primary button (triggers withdrawal modal, disabled if balance < ₦10,000).
* **Sub-metrics**: `TOTAL WITHDRAWN`, `LAST WITHDRAWAL`, and `WALLET STATUS` (`• Active & Secure`).

### Component 2: Pending Clearance Countdown Card
* **Pending Value**: Sum of locked escrow funds across active campaign audits (`₦184,300.00`).
* **Release Countdown**: Live countdown timer box (`02 DAYS | 14 HRS | 55 MINS`) calculating time to next verification audit release.

### Component 3: Transaction History Ledger
* **Filter & Export Controls**: Filter by transaction type (`All`, `Payouts`, `Withdrawals`, `Escrow Locks`) and CSV Export button.
* **Table Columns**:
  1. `DATE`: Formatted transaction date (e.g. `May 24, 2024`).
  2. `CAMPAIGN / TYPE`: Campaign title for credits, or Transfer Reference ID for withdrawals.
  3. `AMOUNT (NGN)`: `+₦250,000.00` in emerald green for credits, `-₦50,000.00` for withdrawals.
  4. `STATUS`: Status badges (`Success` in emerald, `Processing` in amber, `Failed` in red).

### Component 4: Payout Methods Card
* **Linked Bank Accounts**: List of creator's verified NUBAN accounts (e.g., Zenith Bank PLC `**** 4492`, GTBank `**** 0128`).
* **Primary Account Badge**: `PRIMARY ACCOUNT` blue badge.
* **Add New Bank Account Modal**:
  - Bank Selector dropdown (Supported Nigerian Banks: GTBank, Zenith, Access, Kuda, OPay, Palmpay, First Bank, UBA).
  - 10-digit NUBAN Account Number input.
  - Automatic Paystack Account Name Resolution display (`Account Name: TUNDE KELANI ✓`).

### Component 5: Level & Verification Status Card
* Blue gradient feature card highlighting account verification level (`🛡️ LEVEL 3 CREATOR`).

---

## 3. Server Actions & Database Integration

### Paystack Bank Resolution & DB Caching Policy
When a creator enters their bank account number and Paystack resolves the account holder name, the verified details (`bank_code`, `bank_name`, `account_number`, `account_name`, `bank_recipient_code`) are **permanently saved into the database** on `creator_profiles`.
* **Zero Overhead**: Page loads fetch saved bank details directly from Supabase (`creator_profiles`). Paystack API resolution is invoked **ONLY ONCE** when adding or updating a bank account.

```typescript
// app/actions/creator.ts

export async function resolveAndSaveBankAccountAction(formData: FormData) {
  // 1. Calls Paystack API: GET https://api.paystack.co/bank/resolve?account_number=...&bank_code=...
  // 2. Extracts resolved account_name (e.g. "TUNDE KELANI")
  // 3. Permanently updates creator_profiles: { bank_code, bank_name, account_number, account_name }
  // 4. Revalidates path: /earnings
}

export async function requestPayoutAction(formData: FormData) {
  // 1. Enforces min withdrawal: ₦10,000
  // 2. Checks available balance on Supabase `wallets` table
  // 3. Deducts wallet balance and inserts a 'withdrawal' transaction in `wallet_transactions`
}
```

---

## 4. Verification & Validation Plan
1. **TypeScript Type Safety**: Run `npx tsc --noEmit` to confirm 0 errors.
2. **Form Validations**: Verify client & server enforce ₦10,000 minimum withdrawal requirement.
3. **UI Fidelity**: Ensure layout matches the provided screenshot design mockup pixel-for-pixel.
