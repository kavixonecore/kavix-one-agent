# Phase 1: Harness Research

Three articles were reviewed to establish foundational knowledge for building agent-one:

---

## Article 1 — Anthropic: Effective Harnesses for Long-Running Agents

**Source:** https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

**Key Takeaways:**

- **Two-agent architecture:** Initializer Agent (bootstraps project, creates init.sh, progress.txt, feature list) + Coding Agent (reads progress, works one feature at a time, commits, updates docs)
- **Session initialization protocol:** verify directory → read progress → review feature list → start dev server → test baseline → then start new work
- **Features tracked as structured JSON** with status flags (not markdown) — prevents agents from inappropriately modifying them
- **Incremental progress:** one feature per session prevents context exhaustion
- **End-to-end verification** via browser automation (Puppeteer), not just unit tests
- **Git as recovery mechanism:** commits at every feature boundary

---

## Article 2 — LangChain: The Anatomy of an Agent Harness

**Source:** https://blog.langchain.com/the-anatomy-of-an-agent-harness/

**Key Takeaways:**

- **Core equation:** Agent = Model + Harness
- **Five harness primitives:**
  1. Filesystem — durable storage, cross-session persistence, multi-agent coordination
  2. Bash/Code Execution — general-purpose tool > fixed tool set
  3. Sandboxes — isolated, safe execution with pre-configured runtimes
  4. Memory & Knowledge — persistent files (AGENTS.md) + real-time access (web search, MCP)
  5. Context Management — compaction, tool-call offloading, progressive skill disclosure
- **Behavior-driven design:** identify desired behaviors first, then engineer harness features
- **Ralph Loop pattern:** hooks intercept model exits and reinject original prompt in clean context
- **Model-harness co-evolution:** models post-trained with harnesses create tight coupling (benefit and risk)

---

## Article 3 — OpenAI: Harness Engineering (Codex)

**Source:** https://openai.com/index/harness-engineering/ (403 — content retrieved via InfoQ and Martin Fowler coverage)

**Additional Sources:**
- https://www.infoq.com/news/2026/02/openai-harness-engineering-codex/
- https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html

**Key Takeaways:**

- **Results:** 3 engineers, 5 months, ~1M lines of code, ~1,500 PRs (~3.5 PRs/engineer/day), zero manually written code
- **Three pillars:**
  1. Context Engineering — structured knowledge bases in repo, dynamic context (observability, browser)
  2. Architectural Constraints — custom linters, structural tests enforcing layer boundaries (Types → Config → Repo → Service → Runtime → UI)
  3. Entropy Management ("Garbage Collection") — periodic agent runs detecting doc inconsistencies, constraint violations
- **Key insight:** "Give the agent a map, not a 1,000-page manual." Context is scarce.
- **Philosophy shift:** Engineers move from writing code to designing environments, specifying intent, building feedback loops

---

## Unified Principles (All Three)

1. **State persistence across sessions** — filesystem + git as handoff mechanism
2. **Incremental, scoped work** — small units prevent context exhaustion
3. **Self-verification** — agents must test their own work
4. **Constraints > instructions** — linters, structural tests, and enforced boundaries beat lengthy prompts
5. **Context is scarce** — compact, offload, progressively disclose
6. **Treat agent struggles as system signals** — improve the harness, not just the prompt
7. **Documentation as machine-readable infrastructure**
