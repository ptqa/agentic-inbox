---
name: birthpath-inbox
description: Operate the BirthPath support inbox through the configured Restish CLI. Use for listing, reading, searching, drafting, sending, replying to, forwarding, moving, or deleting email and downloading attachments from support@birthpath.app.
compatibility: Requires Restish API profile "inbox" and ~/.config/restish/birthpath-inbox.key.
---

# BirthPath inbox

Load the key without printing it, then use the local Restish profile:

```bash
export BIRTHPATH_INBOX_API_KEY="$(<"$HOME/.config/restish/birthpath-inbox.key")"
restish inbox <operation> --rsh-print b
```

Default mailbox: `support@birthpath.app`.

Run `restish inbox <operation> --help` before using unfamiliar arguments.

Operations include `list-emails`, `get-email`, `search-emails`, `create-draft`, `send-email`, `reply-to-email`, `forward-email`, `move-email`, `update-email`, `delete-email`, `list-folders`, `get-thread`, and `download-attachment`.

Read and search freely. Only mutate mail when explicitly requested. Confirm before deleting email or a mailbox. Never print the key. Omit message bodies unless requested.
