# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root — points at one `CONTEXT.md` per project. Read each one relevant to the topic.
- **`docs/adr/`** at the repo root — system-wide decisions. In this multi-context repo, also check `projects/<Project>/docs/adr/` and `packages/<package>/docs/adr/` for project-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

This is a multi-context repo — four independent projects plus one shared package, each with its own domain vocabulary:

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
├── projects/
│   ├── Boutaleb/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                  ← Boutaleb-specific decisions
│   ├── Maxconfort/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                  ← Maxconfort-specific decisions
│   ├── Qasidaty/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                  ← Qasidaty-specific decisions
│   └── Risala/
│       ├── CONTEXT.md
│       └── docs/adr/                  ← Risala-specific decisions
└── packages/
    └── ui/
        ├── CONTEXT.md                 ← shared component library context
        └── docs/adr/
```

Each `projects/<Name>/` contains its own `client/` and `server/` — the CONTEXT.md for a project should cover both sides of that project's stack.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant project's `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
