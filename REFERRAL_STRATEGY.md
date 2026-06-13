# Referral System Implementation Recommendation

## Current Status
- Screenshot-based manual verification.
- High friction for both user and admin.
- Hard to scale beyond 50 customers.

## Recommendation: Link-Based Verified Attribution

### 1. Referral Link Generation
- Each user gets a unique link: `reportready.in?ref=USER_ID`.
- When a new student signs up via this link, the `referred_by` field is populated in the `users` table automatically.

### 2. Verified Conversion Logic
- A referral is considered "Successful" only when the referred user makes a **Successful Payment**.
- This eliminates the need for "Proof of Group Share" which can be easily faked.

### 3. Incentives (The Growth Loop)
- **Referrer:** Gets 1 "Free Project Token" or ₹20 cashback for every 2 successful conversions.
- **Referred User:** Gets an instant ₹20 discount on their first project report.

### 4. Implementation Path
- **Step 1:** Update middleware to capture `ref` query param and store in session/cookie.
- **Step 2:** Update `/api/auth/otp/verify` to read the cookie and set `referred_by` on signup.
- **Step 3:** Add a `Referral Balance` section in the user dashboard.

## Implementation Choice for Phase 6
We will keep the referral code system but automate the discount application during the `/project/[id]/pay` flow if a valid `referred_by` exists.
