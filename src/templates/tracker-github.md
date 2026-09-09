# Telos Tracker — GitHub Issues

Tasks sync into GitHub Issues through the `gh` CLI.

- Each task becomes an issue titled `telos: <feature> NN <slug>`, labelled
  `telos:<feature>`.
- Blocking edges use a body convention: a line reading `Blocked by: #12, #15`
  where the numbers are issue numbers of the blocking tasks.
- The tracker is authoritative for task status in this mode: issues close when a
  task is verified, and STATE.md mirrors their status.
- Cascade re-plan diffs the old vs new task set: unchanged tasks keep their issues,
  new tasks get issues, removed tasks are closed with a `superseded:` comment.
- Gate approvals (spec / contracts / design / tasks) stay local-only; they are
  never synced.

## Operations

The uniform tracker interface maps to these exact commands. `<feature>` is the
feature slug; `NN` the task number; `#K` refers to issue numbers of blocking
tasks (their `telos: <feature> NN <slug>` titles make the mapping findable).

**create_task** (Tasks approval; one per task, created in topological
dependency order so a blocking task's issue number exists before its
dependents reference it):

```sh
gh issue create \
  --title "telos: <feature> NN <slug>" \
  --label "telos:<feature>" \
  --body "$(cat <<'EOF'
<task title>

Blocked by: #3, #7

<implementation notes and verification plan from TASK.md>
EOF
)"
```

Record the returned issue number in the tasks table's `tracker` column and the
task's TASK.md `issue` frontmatter. If the label does not exist yet, create it
once: `gh label create "telos:<feature>"`.

**set_blocked_by** — GitHub has no native blocking; it is the `Blocked by:`
line in the issue body, set at creation from the task's `depends_on` (map task
NNs to issue numbers). Never edit blocking edges in place on a re-plan: close
superseded, create fresh.

**close_task** (on task verification):

```sh
gh issue close <issue-number>
```

**comment**:

```sh
gh issue comment <issue-number> --body "<text>"
```

**assign**:

```sh
gh issue edit <issue-number> --add-assignee "<user>"
```

**list_open(feature)**:

```sh
gh issue list --label "telos:<feature>" --state open \
  --json number,title,state
```

**fetch_status**:

```sh
gh issue view <issue-number> --json state,title,labels,body
```

STATE.md's mirrored task table is generated from `list_open(feature)` plus the
tasks table: an issue mirrors as done when closed; otherwise the task's status
from the tasks table (pending/in-progress).
