# Phase 0: Payload-First Security TDD

## Data Invariants:
1. `users` collection: A user document can only be created, read, or modified by the user whose ID matches the document ID.

## The "Dirty Dozen" Payloads:
1. Create user document with wrong user ID.
2. Create user document missing required fields (e.g. createdAt).
3. Create user document with too large string field.
4. Update user document missing validation helper (shadow update with ghost field).
5. Value poisoning: update currentLevel with a boolean instead of a string.
6. Identity spoofing: try to change ID to someone else's.
7. Read another user's document.
8. Temporal Integrity: setting createdAt to a date in the past.
9. Array bounding: completedLessons with more than 500 items.
10. Update locked fields: trying to update createdAt.
11. List query: fetching all users in the system without `userId == request.auth.uid`.
12. Creating a document while not authenticated.
