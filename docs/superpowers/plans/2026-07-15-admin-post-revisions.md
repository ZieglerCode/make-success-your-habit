# Admin Post Revisions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist the previous version of every meaningful post update and provide authenticated preview and restore controls.

**Architecture:** A provider-neutral revision API wraps provider-specific transactions. REST routes expose list/detail/restore, and the editor loads revision details only on demand.

**Tech Stack:** Next.js Route Handlers, React, Postgres, LibSQL/Turso, TypeScript assertion scripts.

## Global Constraints

- Keep at most 50 revisions per post.
- No-op saves create no revision.
- Restore snapshots the current state before replacement.
- Post deletion removes revisions.

---

### Task 1: Define revision snapshots and equality

**Files:** Create `lib/post-revisions.ts`, create `scripts/test-post-revisions.ts`, modify `package.json`.

**Interfaces:** Produces `PostRevision`, `revisionSnapshot(post)`, and `hasPostChanged(before, input)`.

- [ ] Write RED assertions covering all editable fields, ignored timestamps, and changed status/content.
- [ ] Implement explicit editable-field selection and stable equality without JSON property-order dependence.
- [ ] Verify GREEN.

### Task 2: Add revision schema and transactional updates

**Files:** Modify `lib/content-store.ts`, extend `scripts/test-post-revisions.ts`.

**Interfaces:** Produces `listPostRevisions`, `getPostRevision`, `restorePostRevision`; extends `updatePost(id, input, actor?)`.

- [ ] Add test-database assertions for first update, no-op, second update order, pruning to 50, deletion cascade, and restore snapshot.
- [ ] Verify tests fail before schema/store implementation.
- [ ] Create `post_revisions` for Postgres and LibSQL with indexed `postId` and `createdAt`; use JSON snapshot plus searchable title/slug/status fields to keep both providers consistent.
- [ ] Implement provider-specific transactions: insert revision, update post, prune old rows; roll back as one unit.
- [ ] Delete revisions with posts and implement restore through the same transactional path.
- [ ] Run revision and existing content tests.

### Task 3: Add authenticated revision APIs

**Files:** Create `app/api/posts/[id]/revisions/route.ts`, `app/api/posts/[id]/revisions/[revisionId]/route.ts`, `app/api/posts/[id]/revisions/[revisionId]/restore/route.ts`; modify post PATCH route to pass admin actor.

**Interfaces:** GET list/detail and POST restore, all returning `401`, `404`, `409`, or normalized JSON.

- [ ] Add direct route-handler tests for unauthenticated requests and store-level tests for wrong post/revision combinations and slug conflicts.
- [ ] Implement admin checks before any store access.
- [ ] Return compact list rows and full snapshot only from detail.
- [ ] Restore with actor metadata and explicit conflict response.
- [ ] Run route/store tests and TypeScript.

### Task 4: Add revision UI

**Files:** Create `components/post-revision-panel.tsx`, modify `components/blog-post-form.tsx`.

**Interfaces:** Panel accepts `postId`, `currentDraft`, and `onRestored(post)`.

- [ ] Implement on-demand list loading with loading, empty, and error states.
- [ ] Show time, status, title, action, and a field-level changed-name summary.
- [ ] Load a read-only detail preview and require confirmation before restore.
- [ ] On restore, replace draft/saved snapshot, clear local recovery, refresh router, and show success copy.
- [ ] Browser-test save → revision → preview → restore → reload on desktop and mobile.
