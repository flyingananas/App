# Prompt D v3 — Project Management Outline (Full Specification)

This document is the source-of-truth specification for the Prompt D project companion app. It describes the behaviour and data model the application must implement. Build the app as a private, local-only desktop application (Electron + React + TypeScript, data in a local SQLite file). The AI features described below are optional and OFF by default.

---

## 1. Overview

Prompt D is a project companion with a full logging layer. It tracks threads, logs items, and keeps load-bearing details from being compressed or lost. It maintains a live running outline plus dedicated registers and appendices.

---

## 2. Modes — NEW vs ONGOING

The app supports two startup modes.

**NEW project.** On first run with no project, ask in sequence:
1. "What is the project name for this session?"
2. "Would you like to set status labels for your `[context]` register? I can suggest some based on your project, or you can define your own — or skip for now."

Then create the document structure (all sections present, empty, each pre-populated with headers).

**ONGOING (transcript sweep).** Before sweeping a pasted prior conversation, ask:
1. "Is there anything in this conversation you want me to treat with particular care, or flag if compression seems unavoidable?"
2. "Are there any documents, decisions, or named references you consider load-bearing that I should prioritise?"

Then run the sweep with those answers as active context, prioritising breadth over compression. During the sweep, specifically identify and log `[context]`, `[doc]`, `[resolved]`, and `[decision]` items. After the sweep, ask for status-label preferences for the `[context]` register, then present the result for review before continuing.

---

## 3. Cue Words & Commands

A full phrase OR its triple-letter code produces an identical response.

| Full phrase / code | Function |
|---|---|
| `drop:` / `drp` | Log silently. Reply "noted". Auto-timestamp. No help unless asked. |
| `assist:` / `hlp:` / `ast` / `hlp` | Log AND help immediately. Four triggers, one response. |
| `idea:` / `ida` | Log as an idea worth developing. Reply "noted". Timestamp it. |
| `action:` / `act` | Activate a specific logged item by natural-language match. |
| `log hours` / `lgh` | Four-question work-block log: date, items, duration, notes. |
| `mark this` / `mth` | Add the current point to the outline immediately. |
| `mark this as [x]` / `mta` | Add to the outline with an explicit item type. |
| `park this` / `pth` | Manually park the current thread. |
| `return to parked` / `rtp` | Resume a parked thread. |
| `watch my threads closely today` / `wmc` | Activate thread watch + inferred logging. |
| `relax thread watch` / `rtw` | Return to silent mode. Inferred logging off. |
| `system check` / `syc` | Self-assessment — fires at 200 entries or anytime manually. |
| `?[code]` or `?[full phrase]` | "What is this?" — one-line explanation. Ends: "type ?codes or ??? for the full list." |
| `?codes` / `???` | "What are all of these?" — full inline glossary of all active codes. |

A message without a cue word is an ordinary chat message and is NOT logged, unless inferred logging is active (see below).

---

## 4. Item Types

| Marker | Meaning |
|---|---|
| `[insight]` | Key idea or conclusion |
| `[decision]` | Choice made or agreed on |
| `[?]` | Open question or unresolved thread |
| `[action]` | Next step or follow-up |
| `[ref]` | Source, reference, or name — passing mention only |
| `[parked]` | Thread set aside — intentionally open, return expected |
| `[resolved]` | Definitively closed — brief conclusion summary required |
| `[context]` | Named person / event / anecdote — load-bearing, NEVER compressed |
| `[doc]` | Document: name \| type \| version \| location — auto-populates Appendix A |
| `[condensed]` | Item summarised — pointer must specify document name + version + section |
| `[thought]` | Reflection, observation, or loose idea |
| `[task]` | Something that needs to be done |
| `[idea]` | Something worth developing |

**Key distinction:** `[parked]` = set aside, return expected. `[resolved]` = closed, no return. Never conflate the two. A `[condensed]` pointer must name document + version + section; "check original" alone is insufficient.

---

## 5. `[context]` — Load-Bearing Detail Rule

Any named person, event, anecdote, or biographical detail must be logged immediately as `[context]`. It is never deprioritised during compression and lives in the outline, not in chat history. A context scan fires at every checkpoint and when starting any new document or deliverable.

**Status filter.** Status labels are user-defined at setup, not hardcoded. In NEW mode the app asks for label preferences (or suggests based on project type). In ONGOING mode it infers labels from the sweep and proposes them for confirmation.

---

## 6. Content Removal Rule (Integrity Rule 8)

Before removing any proper noun, named reference, or personal anecdote from any draft — flag and ask. Never act unilaterally.

---

## 7. Project Development Track — `log hours` / `lgh`

A four-question work-block log. Ask in sequence:
1. **Date?** Pre-fill today if the same day as the last entry — confirm or correct.
2. **Items worked on?** Brief description of the session work.
3. **Duration?** Any format: 2hrs, 90min, 2.5h.
4. **Notes?** Optional. Type "none" to skip.

One completed flow → one row in the project development track. Used for billable hours and grants.

---

## 8. System Check / `syc` — Self-Assessment

| Trigger | Condition |
|---|---|
| Hard | After 200 deliberately logged entries (passive queries and checkpoint confirmations excluded). |
| Soft | At any checkpoint if pattern drift is detected. |
| Manual | "system check" or "syc" at any time. |

The hard trigger opens with: "This is your 200-entry system check. Is now a good time? You can also adjust the threshold — keep at 200, increase, or decrease."

Assessment — four questions, answered honestly:
1. What is working as designed?
2. What is being used differently — better or worse?
3. What keeps being worked around?
4. What rule has drifted or is applied inconsistently? (Include the app's own compliance failures.)

Do not summarise positively. Flag problems clearly.

---

## 9. The `?` Family

| Trigger | Response |
|---|---|
| `?[code]` or `?[full phrase]` | One-line explanation of that code. Ends: "type ?codes or ??? for the full list." |
| `?codes` / `???` | Full inline glossary of all active codes. Always reflects the current ruleset. |

Visual logic: one `?` = one answer; three `???` = everything. `???` is self-referential — the only code that is its own explanation. Readable without documentation.

---

## 10. Document Structure

Each section is its own view/page, pre-populated with headers and empty at the start.

| Section | Content |
|---|---|
| Cover / session info | Project name, date, mode, version |
| Index | Sections and navigation |
| Project development track | `lgh` entries: date \| items \| duration \| notes |
| Outline | Live running outline |
| `[context]` register | Dedicated screen: named details with user-defined status labels; add/edit/filter by status |
| `[doc]` register | Dedicated screen: name \| type \| version \| location; add/edit inline |
| History / archive | Active/history split |
| Appendix A | Cross-reference: all `[context]` and `[doc]` items, alphabetical, linked to where they appear |
| Appendix B | Glossary of all cue words and codes |
| Appendix C | Version history |

---

## 11. Checkpoint Structure

A checkpoint fires when **15 or more new items** have been logged since the last checkpoint (count of logged items, not exchanges). Suggest it — wait for confirmation before recording. Each update must include:
1. Threads not resolved or parked.
2. Assumptions not examined.
3. Context scan — `[context]` items relevant to current work.
4. Logged-items summary — items logged since the last checkpoint.
5. `[doc]` items — untouched or unlinked documents.

A context scan also runs before starting any new document or deliverable.

---

## 12. Inferred Logging — OFF by default

Only active when `wmc` (watch my threads) is on. When active, a message without a cue word that looks like a log item is auto-logged as `[thought]` or `[task]`, with the reply "noted (inferred)", and is flagged at the next checkpoint for audit. `rtw` turns it off.

---

## 13. Thread Tracking

Maintain a live threads section. When the topic shifts and a prior thread still has an unresolved `[?]` or `[action]`, mark it `[parked]`. `pth` parks manually; `rtp` resumes a parked thread.

---

## 14. Integrity Rules

Flag violations with `[integrity flag]` before proceeding.
1. Never drop a logged item without flagging.
2. Never compress without a `[condensed]` pointer (document + version + section).
3. Never auto-resolve — only the user confirms `[resolved]`.
4. Never conflate `[parked]` and `[resolved]`.
5. Never over-infer a `[doc]` purpose — flag ambiguity.
6. Flag context pressure if the session grows very long.
7. Flag instruction conflicts rather than silently complying.
8. Before removing proper nouns or personal anecdotes from any draft — flag and ask. Never act unilaterally.

---

## 15. Version History

| Version | Changes |
|---|---|
| v1 | Initial build — base logging layer (drop/assist/idea/action). |
| v2 | NEW/ONGOING toggle, `lgh`, blank outline + user guide, full codes, index + appendices. |
| v3 | `[resolved]`, `[doc]`, checkpoint cadence at 15+ items, `[condensed]` pointer precision, ONGOING pre-briefing, `syc` 200-entry self-assessment, the `?` family, user-defined `[context]` status filter, inferred logging locked OFF by default. |
