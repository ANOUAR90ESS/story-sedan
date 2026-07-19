# Security Specification for History AI Studio

## Data Invariants
1. An Idea must have a valid `userId` matching the creator's UID.
2. Timestamps (`createdAt`, `updatedAt`) must be server-validated.
3. Users can only read, write, or delete their own Ideas.
4. User profiles are publicly readable but only writable by the owner.

## The "Dirty Dozen" Payloads (Denial Expected)
1. **Identity Spoofing**: Create an Idea with `userId` of another user.
2. **Shadow Field**: Update an Idea with `isVerified: true` (not in schema).
3. **Malicious ID**: Create a document at `/ideas/..%2F..%2Fsys_config`.
4. **State Injection**: Update `updatedAt` with a client-provided future date.
5. **PII Leak**: Read `/users/private_admin_uid` as a guest.
6. **Resource Exhaustion**: Write a 1MB string into a `visualPrompt` field.
7. **Type Poisoning**: Set `durationSeconds` to "30" (string) instead of 30 (number).
8. **Orphan Write**: Delete a User but keep their Ideas (Ideas rule checks for User existence).
9. **Bulk Scrape**: Query all Ideas without filtering by `userId`.
10. **Immutable Violation**: Change `createdAt` on an existing Idea.
11. **Malicious Regex**: Use document ID with 1024 characters.
12. **Cross-Tenant Write**: Write to another user's sub-collection (if we had any).

## Test Runner (Logic)
- `tests/firestore.rules.test.ts` will verify these rejections.
