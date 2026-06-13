# Abuse Prevention Plan: Feedback Rewards

## Goal
Prevent users from exploiting the feedback system to gain multiple free project unlocks.

## Measures

### 1. Account Level Locking
Each user account is limited to **exactly one** rewarded feedback submission.
*   **Check**: Before processing a submission, the system queries for existing `reward_granted = 1` for the current `user_id`.
*   **Action**: Reject submission if a reward was already granted.

### 2. Quality Gating (Automated)
*   **Length Enforcement**: Combined feedback must exceed 100 characters.
*   **Phrase Filtering**: Submissions containing only generic phrases ("good", "great", "ok") are blocked at the API level.
*   **Duplicate Detection**: (Future) Check for high similarity with previously approved feedback.

### 3. Human-in-the-loop (Admin Review)
Credits are **not** granted automatically.
*   Admins review submissions in the `/admin/feedback` dashboard.
*   Admins check for copy-pasted content or gibberish.
*   Reward is only triggered by the `Approve` action.

### 4. Consumption Guard
*   Credits are bound to the `user_id`.
*   Transaction-safe decrement: `UPDATE users SET credits = credits - 1` inside a database transaction during project unlock.
