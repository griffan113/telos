# Context Limits

## File Size Limits

| File            | Max Tokens | ~Words | Warning At  |
| --------------- | ---------- | ------ | ----------- |
| PROJECT.md      | 2,000      | 1,200  | 1,600 (80%) |
| ROADMAP.md      | 3,000      | 1,800  | 2,400       |
| STATE.md        | 10,000     | 6,000  | 7,000 (70%) |
| spec.md         | 5,000      | 3,000  | 4,000       |
| design.md       | 8,000      | 4,800  | 6,400       |
| tasks.md (index)| 3,000      | 1,800  | 2,400       |
| TASK.md (per task) | 1,500   | 900    | 1,200       |
| STACK.md        | 2,000      | 1,200  | 1,600       |
| ARCHITECTURE.md | 4,000      | 2,400  | 3,200       |
| CONVENTIONS.md  | 3,000      | 1,800  | 2,400       |
| STRUCTURE.md    | 2,000      | 1,200  | 1,600       |
| TESTING.md      | 4,000      | 2,400  | 3,200       |
| INTEGRATIONS.md | 5,000      | 3,000  | 4,000       |

## Context Zones

🟢 **Healthy** (<40k total): Silent
🟡 **Moderate** (40-60k): Discrete footer note
🔴 **Critical** (>60k): Active warning, suggest optimization

## Monitoring

Display context status in footer when >40k:

```
📊 Context: 52k tokens (moderate)
  - STATE.md: 8k (yellow zone)
  - tasks.md (index): 2k (ok)
  - 3 × TASK.md loaded: 4k (ok)
  - Total: 52k / 200k (26%)
```

## Principles

**Target:** <40k tokens loaded (20% of window)
**Reserve:** 160k+ tokens for work, reasoning, outputs
