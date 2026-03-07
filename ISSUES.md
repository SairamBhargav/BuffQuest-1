# BuffQuest Comprehensive Issue List (from README)

This list translates the project README into actionable implementation issues.

## Phase 1 — MVP Critical Path

### Repository & Scaffolding
- [ ] Initialize frontend application scaffold (React/Next.js + Tailwind + Vite assumptions from README)
- [ ] Initialize backend service scaffold (Node/Express or Python/FastAPI as selected by team)
- [ ] Add environment configuration loading for frontend and backend
- [ ] Add local development scripts for frontend, backend, and Supabase
- [ ] Add baseline CI workflow for lint, test, and build

### Authentication & User Access
- [ ] Implement auth flow with Supabase Auth integration
- [ ] Restrict registration/login to `@colorado.edu` email addresses
- [ ] Require verified email before full platform access
- [ ] Implement user profile bootstrap (`credits`, `notoriety`, base metadata)

### Location-Based Quest Boards
- [ ] Implement building zone model with geofence center/radius data
- [ ] Implement user zone resolution from current geolocation
- [ ] Show quests for current/nearby building zones only
- [ ] Add map/list UI to browse nearby quest boards

### Credit Economy
- [ ] Enforce credit cost on quest creation
- [ ] Enforce credit reward payout on quest verification
- [ ] Prevent negative balances and invalid debit operations
- [ ] Implement auditable credit transaction logging

### Quest Lifecycle & State Machine
- [ ] Implement canonical quest statuses (`Draft`, `ModerationPending`, `Posted`, `Claimed`, `Completed`, `Verified`, `Rewarded`, `Cancelled`, `Rejected`)
- [ ] Enforce server-side state transition rules
- [ ] Prevent creators from claiming their own quests
- [ ] Add quest expiration handling and cancellation behavior

### Atomic Claiming & Concurrency
- [ ] Implement atomic quest claim flow (single claimer guarantee)
- [ ] Add transactional lock/update logic to avoid race conditions
- [ ] Return deterministic API errors for already-claimed quests

### Quest APIs
- [ ] Implement quest create endpoint
- [ ] Implement quest list endpoint by zone/status filters
- [ ] Implement quest claim endpoint with atomic safeguards
- [ ] Implement quest completion submission endpoint
- [ ] Implement quest verification endpoint and reward trigger

### Attendance Rewards
- [ ] Implement attendance submission endpoint with schedule + photo proof metadata
- [ ] Validate location/time constraints for attendance reward eligibility
- [ ] Prevent duplicate attendance reward claims for same class window
- [ ] Store attendance moderation/review status and outcomes

### AI Moderation Pipeline
- [ ] Integrate AI moderation service for quest content screening
- [ ] Add moderation states and moderation result persistence
- [ ] Block or route flagged content before posting
- [ ] Implement fallback behavior for moderation API failure/timeouts
- [ ] Add configurable moderation thresholds/categories

### Messaging (Active Quest Chat)
- [ ] Implement `messages` table and relationships to quests/users
- [ ] Implement send/list message APIs scoped to active quest participants
- [ ] Enforce message access controls (creator/claimer only)
- [ ] Add basic moderation/reporting for abusive chat content

### Leaderboard & Reputation
- [ ] Implement notoriety score updates from completed/verified quests
- [ ] Implement leaderboard query endpoint
- [ ] Implement leaderboard frontend view with ranking and profile basics

### Data Model & Persistence
- [ ] Create `users` table and constraints per README schema
- [ ] Create `quests` table and constraints/indexes per README schema
- [ ] Create `messages` table and indexes per README schema
- [ ] Create `building_zones` table and geospatial lookup support
- [ ] Create `attendance_submissions` table and indexes
- [ ] Create `reward_logs` table for immutable audit trail
- [ ] Add foreign keys, cascade policies, and row-level security policies

### Realtime Events
- [ ] Implement realtime subscription for quest status updates
- [ ] Implement realtime chat message updates
- [ ] Implement realtime leaderboard refresh strategy

### Frontend Pages (README Suggested)
- [ ] Build authentication/login page
- [ ] Build location/quest board page
- [ ] Build quest creation page
- [ ] Build active quest detail + chat page
- [ ] Build attendance submission page
- [ ] Build profile + credits + notoriety page
- [ ] Build leaderboard page

### Security, Trust, and Guardrails
- [ ] Validate and sanitize all user-provided quest/message text
- [ ] Add API rate limiting for spam/abuse-prone endpoints
- [ ] Add authorization checks on all mutable quest actions
- [ ] Add anti-fraud checks for attendance and reward abuse

### Observability & Operations
- [ ] Add structured logging for critical quest and reward events
- [ ] Add monitoring/alerts for moderation failures and payout anomalies
- [ ] Add error tracking for frontend and backend

---

## Phase 2 — Post-MVP Enhancements

- [ ] Add richer moderation review queue with admin tooling
- [ ] Add push/in-app notifications for quest updates and chat
- [ ] Add trust badges and reliability scoring enhancements
- [ ] Improve geofencing accuracy and anti-spoofing checks
- [ ] Improve recommendation/sorting for relevant nearby quests

---

## Phase 3 — Advanced Features

- [ ] Add advanced fraud detection for location/photo spoofing patterns
- [ ] Add recurring quests and streak-based reward mechanics
- [ ] Add club/organization quest channels and event quests
- [ ] Add expanded analytics dashboards for engagement and safety
- [ ] Add long-term scalability hardening for peak campus usage

---

## Cross-Cutting Quality Issues

- [ ] Add unit tests for quest state transitions and claim atomicity
- [ ] Add integration tests for reward issuance and audit logging
- [ ] Add end-to-end tests for core user flows (post, claim, complete, verify)
- [ ] Add migration tests/validation for schema integrity
- [ ] Add documentation for API contracts and moderation behavior
- [ ] Add contribution/development guide aligned with local setup instructions
