# Information for Contributors

## Code Style Guide

**Text:** The `frontend/client/Styles/application.scss` file contains defaults for various text styles. Please use these if possible.

**Buttons:** Use the `PendingOperationButton` component whenever a button triggers an action that is 
asynchronous and may take some time, such as updating data in the store or on the server. 
`PendingOperationButton`'s `operation` property accepts a function that takes no arguments and 
returns a `Promise` (or is `async`; they're equivalent). For actions that complete immediately, such 
as opening or closing a modal, use a naked `<button>` element.

## Notes

**Flaky tests:** Some of our Firebase tests flake (i.e. occasionally fail when they shouldn't) 
because they depend on the completion of 
[Cloud Firestore triggers](https://firebase.google.com/docs/functions/firestore-events) 
that take an indeterminate amount of time. We use end-to-end timeouts to wait for those operations to 
complete. Usually, a trigger completes before the timeout expires, but sometimes it doesn't, 
causing the test to flake. If a test flakes when you push a PR, re-run the pipeline by navigating 
to the failed check and clicking "Re-run all jobs."
