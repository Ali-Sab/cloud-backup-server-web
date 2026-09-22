# Cloud Backup PWA backlog

## Completed in the browser-first MVP

- [x] Mobile-first Design A shell with Home, Files, Activity, and Settings navigation
- [x] Cookie-authenticated login and registration flows
- [x] Session restoration through `/api/session`
- [x] Folder dashboard with backup status, counts, sizes, and last-backup state
- [x] Cloud file list with folder selection and client-side search
- [x] Activity history with folder filtering
- [x] Theme preference with light and dark modes
- [x] Profile sheet with sign out
- [x] Installable PWA manifest and app icon

## Deferred but feasible in a browser

- [ ] Password reset and forgot-password screens
- [ ] Change email and password screens
- [ ] Account deletion confirmation flow
- [ ] Cloud file download action
- [ ] Cloud backup deletion action
- [ ] File version listing and version downloads
- [ ] Manual upload of selected files
- [ ] Upload progress, retry, and error details
- [ ] Browser notifications for foreground backup completion
- [ ] Production API URL configuration and deployment setup
- [ ] Service worker and offline shell

## Deferred because they require native or backend work

- [ ] Arbitrary local folder selection and recursive scanning on mobile
- [ ] Continuous folder watching and automatic backup on file changes
- [ ] Full client-side checksum scan for large local trees
- [ ] Restore a cloud version directly into a local folder
- [ ] Restore-and-reupload provenance flow
- [ ] Native file opening and save dialogs
- [ ] Background backup while the PWA is closed
- [ ] Mobile push notification infrastructure
- [ ] Native companion app, if browser limitations become a blocker

## Integration checks before production

- [ ] Confirm backend `ALLOWED_ORIGINS` includes the deployed PWA origin
- [ ] Serve the PWA and API over HTTPS
- [ ] Verify `credentials: include` behavior in the deployed domain setup
- [ ] Add API contract tests for current cookie-only authentication
- [ ] Add browser tests for login, session restoration, folder loading, and sign out
