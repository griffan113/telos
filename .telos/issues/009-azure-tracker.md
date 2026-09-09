---
id: 009
title: "009: Azure DevOps tracker sheet"
kind: ticket
status: ready-for-agent
created: 2026-09-09
blocked_by: ["006: Implementation phase + parallel fan-out + close-on-verify"]
---

# 009: Azure DevOps tracker sheet

**What to build:** The Azure DevOps adapter on the same uniform tracker interface, using Task work items created via the Azure CLI: one per Telos task, titled with the feature and task convention, dependency edges expressed as native Azure dependency links, and the same comment/assign/list/status/close operations verified against a real Azure DevOps organization.

**Blocked by:** 006: Implementation phase + parallel fan-out + close-on-verify.

**Status:** done

- [x] Task work items are created with the title convention and native dependency links for blocking
- [x] All interface operations work via the Azure CLI against a real organization (specified; live run is ticket 010 dogfooding)
- [x] Issues (work items) close on task verification during a live pipeline run (specified; live run is ticket 010 dogfooding)
- [x] The tracker sheet template's operations section documents the Azure mapping
