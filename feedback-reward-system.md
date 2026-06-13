# Feedback Reward System Architecture

## Overview

The Feedback Reward System is designed to incentivize high-quality user feedback by offering a "Free Premium Unlock" to founding students. This program helps improve the AI engine and user experience while building early user loyalty.

## Core Logic

1.  **Submission**: User submits a detailed 5-field feedback form.
2.  **Validation**: System enforces a 100-character minimum and filters low-effort phrases (e.g., "good", "nice").
3.  **Admin Review**: Feedback enters a "PENDING" state for manual verification by an administrator.
4.  **Reward Grant**: Upon approval, the system:
    *   Marks feedback as `APPROVED`.
    *   Sets `reward_granted = 1`.
    *   Increments `user.free_generation_credits`.
5.  **Consumption**: User can unlock any project using 1 credit instead of paying ₹99.

## Database Entities

### Feedback Table
*   `rating`: 1-5 integer.
*   `what_was_useful`: String (Long).
*   `what_was_missing`: String (Long).
*   `what_confused_you`: String (Long).
*   `recommend`: Boolean.
*   `status`: PENDING | APPROVED | REJECTED.
*   `reward_granted`: Boolean (Prevents duplicate rewards).

### User Table
*   `free_generation_credits`: Integer (Tracks available free unlocks).

## Abuse Prevention

*   **One Reward Per Lifetime**: Each `user_id` can only have one feedback entry where `reward_granted = 1`.
*   **Manual Review**: Humans (Admins) verify that the feedback is genuine and useful before granting credits.
*   **Credit Consumption**: Credits are deducted immediately upon unlocking a project.
