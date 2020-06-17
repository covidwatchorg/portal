# Code Style Guide

**Buttons:** Use the `PendingOperationButton` component whenever a button triggers an action that is 
asynchronous and may take some time, such as updating data in the store or on the server. 
`PendingOperationButton`'s `operation` property accepts a function that takes no arguments and 
returns a `Promise` (or is `async`; they're equivalent). For actions that complete immediately, such 
as opening or closing a modal, use a naked `<button>` element.
