# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Agent Workspace

A markdown-first multi-agent system with zero external dependencies — every agent is defined by plain `.md` files, scheduled via Claude Code crons, and coordinated through a shared journal.

## Creating a New Agent

1. Copy `agents/standard-agent/` → `agents/[your-agent-name]/` (lowercase, hyphen-separated)
2. Fill in `AGENT.md`: mission (one sentence), 2–4 goals with KPIs (baseline → target), non-goals, skills table
3. Write skills: one `.md` per skill in `skills/`, each must map to a goal in `AGENT.md`
4. Fill `HEARTBEAT.md`: schedule, 4-step cycle (read → assess → execute → log), weekly review, escalation rules
5. Leave `MEMORY.md` empty — it is populated by the agent from real data only
6. Define boundaries in `RULES.md`: CAN/CANNOT list, handoff rules
7. Register in `AGENT_REGISTRY.md`
8. Verify with `AGENT_CREATION_CHECKLIST.md` before activating

See `NEW_AGENT_BOOTSTRAP.md` for step-by-step detail and `examples/podcast-agent/` for a complete working reference.

## Architecture

```
Human → Orchestrator → Agents → journal/entries/ → Agents (next cycle)
```

**Four pillars every agent must have:**
- **Goals** — 2–4 KPIs with measurable baselines and targets
- **Skills** — every skill maps to a goal; no orphan skills
- **Heartbeat** — scheduled cycle (daily or weekly), not ad-hoc
- **Journal** — shared memory; the only cross-agent communication channel

**Read/write rules (strict):**
- `knowledge/` — static reference; agents **read only**, never edit; changes proposed via journal
- `journal/entries/` — living shared memory; agents and humans write here
- `agents/[name]/outputs/` — agent writes its own skill outputs here
- `agents/[name]/MEMORY.md` — agent updates in-place with confirmed patterns only
- An agent never touches another agent's files

**Orchestrator** (`orchestrator/`) routes tasks to agents, resolves conflicts, and escalates to the human when strategy is unclear or no existing agent fits. It does not perform specialist work.

## Agent Cycle (Heartbeat)

Each scheduled run follows four steps:
1. **Read Context** — journal entries, `knowledge/STRATEGY.md`, own `MEMORY.md`
2. **Assess State** — current KPI status, what is the highest-value action
3. **Execute Skill** — one skill per cycle; use decision tree in `HEARTBEAT.md` to pick
4. **Log to Journal** — what was done, findings, next steps (`journal/entries/YYYY-MM-DD_HHMM.md`)

Weekly review scores KPIs against targets, updates `MEMORY.md` with confirmed patterns (not hypotheses), and logs a summary to the journal.

## Conventions

| Item | Rule |
|------|------|
| Agent folders | `agents/[lowercase-hyphen]/` |
| Skill files | `skills/SKILL_NAME.md` (uppercase) |
| Output files | `YYYY-MM-DD_agent-name_description.md` |
| Journal entries | `journal/entries/YYYY-MM-DD_HHMM.md` |
| MEMORY.md | Updated in-place; never pre-fill with assumptions |
| Outputs | Date-prefixed; never overwrite existing outputs |

## Key Reference Files

- `CONVENTIONS.md` — full naming rules and the Four Pillar checklist
- `AGENT_CREATION_CHECKLIST.md` — pre-activation verification
- `examples/podcast-agent/` — complete implementation with two skills (RESEARCH, EPISODE_PLANNING)
- `templates/` — reusable formats for journal entries, task intake, and weekly reviews
- `orchestrator/IDENTITY.md` — what the orchestrator does and does not do
