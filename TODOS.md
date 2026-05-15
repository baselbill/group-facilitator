# TODOS

## P2 — Participant count in room badge

**What:** Add connection count tracking to the Partykit server and surface it in the RoomOverlay badge.

**Why:** The facilitator currently has no visibility into how many people joined the room. A count badge would confirm everyone is connected before starting.

**How:** Server broadcasts a `presence` message on each `onConnect`/`onClose` with the current connection count. `useRoom` hook listens and exposes `participantCount`. `RoomOverlay` badge displays it.

**Effort:** M (human ~half day) / S (CC ~15 min)

**Depends on:** Nothing

---

## P2 — End-of-session highlight summary

**What:** After the session ends, show a summary of the top highlighted words on the CompletionScreen.

**Why:** The heatmap is live-only today — highlights disappear when the session ends. A post-session summary ("your group highlighted 'comforted' 5 times") gives the discussion a concrete artifact to reference next week.

**How:** Pass the final `HighlightMap` from `useRoom` through to `CompletionScreen`. Aggregate word counts across all questions; show top 5-10 words with their counts. The `HighlightMap` shape is already correct for this aggregation.

**Effort:** M (human ~half day) / S (CC ~20 min)

**Depends on:** Nothing (HighlightMap is in-memory during session)

---

## P2 — Participant-only advance authorization

**What:** Prevent participants from advancing the session by sending an `advance` message. Currently any client can send `{type:"advance", questionIndex: N}` and it will broadcast to the whole group.

**Why:** A misbehaving client (accidental double-tap, bad actor) can drive the group's session forward or backward without the facilitator's intent. Only the host should be able to advance.

**How:** Add a `role` field to the WebSocket handshake (e.g., join URL query param `?role=host` signed by a short-lived token, or simply a room-scoped secret the host generates). Server checks `sender.id` or a role claim before broadcasting advance messages. Simplest approach: host sends a `claim-host` message on connect with a room secret from the join URL; server records the host connection ID and only advances from that connection.

**Effort:** M (human ~half day) / S (CC ~25 min)

**Depends on:** Room code URL persistence (already fixed)
