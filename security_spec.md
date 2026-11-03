# Security Specification & Threat Model: Usem Nnyin Platform

## 1. Data Invariants

1. **User Identity Boundary**: A user document at `/users/{userId}` can only be read and written by the authenticated user whose `request.auth.uid == userId`.
2. **Subcollection Relational Integrity**: All sub-resources (`/users/{userId}/progress/{lessonId}` and `/users/{userId}/achievements/{achievementId}`) strictly require that `request.auth.uid == userId`.
3. **Public Dictionary Protection**: Verified dictionary entries at `/dictionary_entries/{entryId}` are readable by anyone (public access for learning), but strictly immutable by standard clients (write denied).
4. **No Privilege Escalation**: Users cannot modify roles, admin flags, or inject arbitrary untyped payloads.
5. **Timestamp & Numeric Bounds**: XP, score, and streaks must be non-negative integers; string inputs must adhere to size limits.

## 2. The Dirty Dozen Attack Payloads & Test Assertions

1. **Spoofed User Profile Creation**: Attempting to create `/users/victim_user` when authenticated as `attacker_user`. (Result: PERMISSION_DENIED)
2. **Ghost Field Injection**: Attempting to update user profile with unauthorized `{ isAdmin: true, role: 'superadmin' }`. (Result: PERMISSION_DENIED)
3. **Cross-User Progress Mutation**: User B attempting to write completion or falsify score to User A's `/users/user_A/progress/ibi-mod-1`. (Result: PERMISSION_DENIED)
4. **Unauthenticated Progress Read**: Reading another user's private progress records without authentication. (Result: PERMISSION_DENIED)
5. **Dictionary Defacement Write**: Attempting to delete or modify `/dictionary_entries/dict-1` as an arbitrary client. (Result: PERMISSION_DENIED)
6. **Negative XP Injection**: Setting `total_xp: -5000` or arbitrary strings. (Result: PERMISSION_DENIED)
7. **Negative Score Exploit**: Setting `score: 999999` or non-integer. (Result: PERMISSION_DENIED)
8. **Path Variable ID Poisoning**: Using a malicious 2KB string as `userId`. (Result: PERMISSION_DENIED)
9. **Blanket Query Scraping**: Attempting a collectionGroup query across all users' private progress without filter. (Result: PERMISSION_DENIED)
10. **Achievement Spoofing on Other Learner**: Writing to `/users/user_B/achievements/ach-1` as user_A. (Result: PERMISSION_DENIED)
11. **Excessive String Payload**: Writing a display_name > 150 characters. (Result: PERMISSION_DENIED)
12. **Unauthenticated Profile Read**: Attempting to list or fetch all registered user emails. (Result: PERMISSION_DENIED)
