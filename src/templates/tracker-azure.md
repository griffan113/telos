# Telos Tracker — Azure DevOps

Tasks sync into Azure DevOps as Task work items through the `az boards` CLI.

- Each task becomes a Task work item titled `telos: <feature> NN <slug>`.
- Blocking edges use native dependency links (Predecessor/Successor).
- The tracker is authoritative for task status in this mode: work items close when
  a task is verified, and STATE.md mirrors their status.
- Cascade re-plan diffs the old vs new task set: unchanged tasks keep their work
  items, new tasks get work items, removed tasks are closed with a `superseded:`
  comment.
- Gate approvals (spec / contracts / design / tasks) stay local-only; they are
  never synced.

## Operations

One-time setup: `az extension add --name azure-devops`, then
`az devops configure -d organization=https://dev.azure.com/<org> --project <project>`
so the commands below can omit `--org` and `--project`. The title convention is
ASCII-fixed and machine-parsed; only descriptive prose localizes.

**create_task** (Tasks approval; one per task, created in topological
dependency order so the NN→ID mapping stays deterministic):

```sh
az boards work-item create \
  --title "telos: <feature> NN <slug>" \
  --type Task \
  --description "<task title, implementation notes, verification plan>"
```

Record the returned work item ID in the tasks table's `tracker` column and the
task's TASK.md `issue` frontmatter. Links are added afterwards in a
`set_blocked_by` pass, once every ID exists.

**set_blocked_by** — native dependency links. From the blocked task's work
item, link each blocking task as its Predecessor:

```sh
az boards work-item relation add \
  --id <blocked-item-id> \
  --relation-type "Predecessor" \
  --target-id <blocking-item-id>
```

(`System.LinkTypes.Dependency-Reverse`/`-Forward` under the hood; list the
exact names with `az boards work-item relation list-type`.) Never edit links
in place on a re-plan: close superseded, create fresh.

**close_task** (on task verification):

```sh
az boards work-item update --id <item-id> --state Done
```

`Done` is the Task state in the Scrum/Basic process templates; the Agile
template uses `Closed`. Use the state name your organization's process
defines.

**comment** — append to the Discussion field:

```sh
az boards work-item update --id <item-id> --discussion "superseded: <reason>"
```

**assign**:

```sh
az boards work-item update --id <item-id> --assigned-to "<user>"
```

**list_open(feature)** — the title convention makes features queryable:

```sh
az boards query --wiql "SELECT [System.Id], [System.Title], [System.State] \
  FROM workitems \
  WHERE [System.WorkItemType] = 'Task' \
    AND [System.Title] STARTS WITH 'telos: <feature> ' \
    AND [System.State] NOT IN ('Done', 'Closed') \
  ORDER BY [System.Id]"
```

**fetch_status**:

```sh
az boards work-item show --id <item-id> --output json
```

STATE.md's mirrored task table is generated from `list_open(feature)` plus the
tasks table: a work item in state Done mirrors as done; otherwise the task's
status from the tasks table (pending/in-progress).
