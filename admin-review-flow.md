# Admin Review Flow: Feedback & Rewards

## 1. Inbox Management
Admins visit `/admin/feedback` to see a list of all submissions.
*   New submissions are marked as **PENDING**.
*   List is sorted by date (newest first).

## 2. Review Criteria
Admins evaluate feedback based on:
1.  **Specificity**: Does it mention specific project features or sections?
2.  **Actionability**: Can we use this to improve the product?
3.  **Authenticity**: Does it look like a real student's experience?

## 3. Decision Actions

### Approve & Reward
*   Triggers credit grant.
*   Notifies user (Future: Email/In-app notification).
*   Changes status to `APPROVED`.

### Reject
*   Silently rejects or provides a reason (Internal).
*   No reward granted.
*   Changes status to `REJECTED`.

## 4. Metrics Tracking
The dashboard tracks:
*   **Approval Rate**: Percentage of submissions that qualify for rewards.
*   **Total Rewards Granted**: Financial impact of the program.
*   **Common Issues**: Trends in "What confused you" fields.
