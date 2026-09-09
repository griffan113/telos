# Telos Tracker — Local Markdown

This repo uses the **local tracker**: the task files themselves are the issue store.

- Source of truth: `.telos/features/<feature>/tasks.md` (the task table) and each
  `.telos/features/<feature>/tasks/NN-slug/TASK.md`.
- There is no duplicate issue store anywhere; STATE.md's task mirror is a generated
  view of these files, always in sync.
- A task is open while its frontmatter status is `pending` or `in-progress`, and
  closed once it is `done`.
- Blocking edges come from each task's `depends_on` frontmatter field.
- Nothing in this mode contacts an external system; no credentials are required.
