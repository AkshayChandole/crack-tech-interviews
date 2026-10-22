# Content Model

> Status: **Approved** · Last updated: 2026-10-23 (revised in roadmap step 7: `module` is lesson-only; category file is `category.yaml`; module and category file schemas added. Step 8: validation rules made precise)
>
> This document defines how content in CrackTechInterviews is structured, validated, linked, and addressed. It is the source of truth for the content schema; the build-time validation (Velite) implements it.

## Goals

1. **Extensible** — adding a new category (LLD, DSA, AI System Design, …) is a content change, not a platform rewrite.
2. **Consistent** — every lesson and problem follows a predictable structure, enforced at build time.
3. **Connected** — concepts, prerequisites, and related content form a graph that supports deep understanding.
4. **Stable** — URLs never break when content is reorganized.
5. **Trustworthy** — AI-assisted content cannot be published without human review.

---

## 1. Three layers

Content is organized in three independent layers. Separating *where content lives* from *how learners traverse it* lets us reorganize navigation and add curated journeys without moving files or breaking links.

| Layer | Purpose | Example |
|---|---|---|
| **Structure** | Where content lives: category → module → item | System Design → Data Storage → Sharding |
| **Paths** | Curated, ordered journeys across items (and categories) | "Staff loop in 4 weeks" |
| **Concept graph** | Small, reusable concepts linked from anywhere | `consistent-hashing`, `quorum`, `idempotency` |

## 2. Hierarchy

```
Category        system-design            (future: lld, dsa, ai-system-design, …)
 ├─ Module      data-storage             (ordered grouping of lessons, navigation only)
 │   └─ Lesson  sharding
 └─ Problem     url-shortener            (listed directly on the category, in order)
Path            staff-loop-4-weeks       (ordered list of item ids, any category)
Concept         consistent-hashing       (glossary entry, optionally backed by a lesson)
```

The hierarchy is intentionally limited to three levels.

---

## 3. Content types

All items share a **base schema**. Each type extends it. Future categories add new types (e.g. `dsa-problem`, `lld-problem`, `quiz`) on the same base.

### 3.1 Base schema (all items)

```yaml
id: sharding                    # stable, permanent, unique within the category
title: Sharding & Partitioning
summary: How to split data across machines without creating hotspots.
category: system-design
type: lesson                    # lesson | problem
difficulty: intermediate        # foundational | intermediate | advanced
seniority: [senior, staff]      # who this matters most for in interviews
prerequisites: [replication, consistent-hashing]   # item ids
related: [design-key-value-store]                  # item ids
concepts: [hotspot, rebalancing, consistent-hashing]  # concept ids
tags: [databases, scalability]
status: published               # draft | in-review | published
authors: [akshay]
review:
  by: akshay
  date: 2026-10-23
updated: 2026-10-23
```

**Computed at build time (never hand-written):** reading time, table of contents, backlinks ("referenced by"), word count.

**Validation rules** (per-file rules in `src/lib/content/schema.ts`; cross-content rules in `src/lib/content/validate.ts`, run during every content build):

- `id` is unique: lessons and problems share one namespace (prerequisites, related links, and paths can point to either); concepts, paths, modules, and categories each have their own. Ids must never change after publication (use `redirects.yaml` if a rename is unavoidable).
- All references must resolve, or the build fails: `prerequisites`, `related`, `concepts`, a concept's `lesson`, path items, module items, and category modules and problems.
- Every lesson is listed in the `items` of the module it names, every module in its category's `modules`, and every problem in its category's `problems`.
- Prerequisite references must not form a cycle.
- **Review gate:** an item with `status: published` must have a complete `review` block, and may only list published items as `prerequisites` or `related`. Drafts and in-review items are excluded from production by the content query layer (`lib/content`).

### 3.2 `lesson`

Additional fields:

```yaml
module: data-storage            # module id; lessons only (problems are listed on the category)
kind: building-block            # concept | building-block | pattern
```

| Kind | Examples |
|---|---|
| `concept` | CAP & PACELC, consistency models |
| `building-block` | Load balancers, caches, message queues |
| `pattern` | Sagas, CQRS, fan-out on write vs. read |

**Standard sections** (rendered as consistent UI blocks):

1. Why it matters
2. Core idea
3. How it works
4. Trade-offs
5. In interviews
6. Common mistakes
7. Key takeaways

### 3.3 `problem`

Additional fields:

```yaml
companies: [google, meta, amazon]   # where it is commonly asked
estimatedInterviewTime: 45          # minutes
focusAreas: [sharding, caching, consistency]
```

**Required sections, in order** (validated at build time). Each is an `##` heading whose text must match exactly; the list lives in `requiredProblemSections` in `src/lib/content/validate.ts`. Notes in parentheses below are guidance, not part of the heading.

1. Problem statement & clarifying questions
2. Functional & non-functional requirements
3. Back-of-the-envelope estimates
4. API design
5. Data model
6. High-level design
7. Deep dives (2–3 critical components)
8. Bottlenecks & failure modes
9. Trade-offs & alternatives considered
10. Senior vs. staff: what a staff-level answer adds
11. Follow-up questions
12. 45-minute interview timeline

### 3.4 `concept`

A small, reusable definition that powers hover cards, the glossary, and search.

```yaml
id: consistent-hashing
term: Consistent Hashing
aliases: [hash ring]
definition: >
  A hashing scheme that maps keys and nodes onto the same ring so that adding
  or removing a node only remaps a small fraction of keys.
lesson: consistent-hashing       # optional: full lesson that covers it in depth
```

Authors reference concepts inline in MDX (e.g. `<Concept id="consistent-hashing" />`), which renders a hover card linking to the concept page or lesson.

### 3.5 `path`

```yaml
id: staff-loop-4-weeks
title: Staff Loop in 4 Weeks
audience: Engineers preparing for staff-level system design loops
description: A focused journey through the highest-leverage topics.
groups:
  - title: Week 1 — Foundations
    items: [how-to-run-a-system-design-interview, scaling-fundamentals, load-balancing]
  - title: Week 2 — Data
    items: [replication, sharding, consistent-hashing]
```

---

## 4. Diagrams

Diagrams are first-class, registered assets — not loose images.

### 4.1 Static diagrams

```
diagrams/
  load-balancer-overview/
    source.excalidraw     # editable source, committed
    light.svg
    dark.svg
    meta.yaml
```

```yaml
# meta.yaml
id: load-balancer-overview
alt: Clients send requests to a load balancer that distributes them across three servers.
caption: A load balancer distributing traffic across a server pool.
```

Rules: SVG only (no PNG), light and dark variants, `alt` text required. Usage in MDX: `<Diagram id="load-balancer-overview" />`.

### 4.2 Interactive / animated scenarios

Authors describe an animation as **data**; a single scenario engine renders all of them with play / pause / step controls, narration, dark mode, and a `prefers-reduced-motion` fallback.

```yaml
id: lb-round-robin
title: Round-robin load balancing with a failed server
nodes: [client, lb, server-a, server-b, server-c]
steps:
  - request: client -> lb
    narration: The client sends a request to the load balancer.
  - route: lb -> server-a
    narration: Round robin picks the next server in rotation.
  - fail: server-b
    narration: A health check marks server B as unhealthy.
  - route: lb -> server-c
    narration: Traffic skips B and goes to C.
```

Usage in MDX: `<Scenario id="lb-round-robin" />`.

The exact scenario schema (node types, layout, step actions) will be finalized when the scenario engine is designed.

---

## 5. URLs

Module is **not** part of the URL, so reorganizing modules never breaks links.

| Content | URL |
|---|---|
| Category home | `/system-design` |
| Lesson | `/system-design/sharding` |
| Problem | `/system-design/problems/url-shortener` |
| Concept | `/concepts/consistent-hashing` |
| Path | `/paths/staff-loop-4-weeks` |

Renamed ids are handled in `content/redirects.yaml` (permanent redirects).

## 6. Repository layout

```
content/
  system-design/
    category.yaml                # category metadata + ordered module and problem ids
    modules/
      data-storage.yaml          # module metadata + ordered item ids
    lessons/
      sharding.mdx
    problems/
      url-shortener.mdx
  concepts/
    consistent-hashing.mdx
  paths/
    staff-loop-4-weeks.yaml
  redirects.yaml
diagrams/
  load-balancer-overview/
scenarios/
  lb-round-robin.yaml
```

Ordering is owned by the category and module files, so files are never renamed to reorder content. (The category file is not named `_category.yaml` because Velite ignores files starting with `_`.)

```yaml
# content/system-design/category.yaml
id: system-design
title: System Design
summary: Design scalable, reliable distributed systems.
modules: [foundations, data-storage]       # ordered
problems: [url-shortener, rate-limiter]    # ordered
```

```yaml
# content/system-design/modules/data-storage.yaml
id: data-storage
category: system-design
title: Data Storage
summary: How to store, index, replicate, and partition data.
items: [sql-vs-nosql, indexing, replication, sharding]   # ordered lesson ids
```

---

## 7. MVP curriculum

### Lessons (30)

| Module | Lessons |
|---|---|
| **Interview Framework** (2) | How to run a system design interview · Senior vs. staff expectations & estimation |
| **Foundations** (5) | Scaling fundamentals · Networking, DNS & CDNs · API design (REST / gRPC / GraphQL) · Load balancing · Proxies & API gateways |
| **Data Storage** (7) | SQL vs. NoSQL · Indexing · Replication · Sharding · Consistent hashing · Transactions & isolation · Choosing a database |
| **Caching** (3) | Caching strategies · Invalidation & stampedes · Distributed caches |
| **Messaging & Streaming** (4) | Queues vs. logs · Delivery semantics & idempotency · Stream processing · Event-driven architecture & sagas |
| **Distributed Systems** (6) | CAP & PACELC · Consistency models · Consensus & leader election · Time, clocks & ordering · Distributed transactions · Failure handling (retries, timeouts, circuit breakers) |
| **Reliability at Scale** (3) | Rate limiting · Observability · Multi-region & high availability |

### Problems (10)

URL shortener · Distributed rate limiter · News feed · Chat system · Notification system · Video streaming · Typeahead · Ride sharing · Distributed key-value store · Ticketing system

### MVP scope decisions

- Concept graph and hover cards: **included in MVP**.
- Paths: schema supported; at least one path ships with the MVP.
