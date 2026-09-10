# Building the Hallyu APK (EAS Build)

APKs are built on Expo's servers via EAS Build, triggered from GitHub Actions.
One-time setup takes ~10 minutes; every build after that is one click.

## One-time setup

### 1. Get an Expo access token (`EXPO_TOKEN`)

1. Create an account (or log in) at [expo.dev](https://expo.dev).
2. Click your avatar → **Account Settings → Access Tokens**
   (or open `https://expo.dev/accounts/<your-username>/settings/access-tokens`).
3. **Create Token**, give it a name like `hallyu-github-actions`, and **copy it
   immediately** — it is shown only once.
4. In GitHub, open this repo → **Settings → Secrets and variables → Actions →
   New repository secret**:
   - Name: `EXPO_TOKEN`
   - Value: paste the token.
5. Never commit the token anywhere. It grants full access to your Expo
   account; if it leaks, revoke it on the same settings page and rotate.

### 2. Link the EAS project (from your own machine, once)

```sh
cd mobile
npm install -g eas-cli
eas login
eas build:configure
```

- Pick **Android** when asked. This registers the `com.hallyu.app` project on
  EAS and writes `extra.eas.projectId` into `mobile/app.json`.
- Commit that `app.json` change and push — the workflow needs it.
- Signing credentials are generated and hosted by EAS automatically; you do
  not need a keystore.

## Triggering a build

**Browser:** repo → **Actions** tab → **Build APK** → **Run workflow** →
pick the branch → pick a profile → **Run workflow**.

**CLI:**

```sh
gh workflow run build-apk.yml --ref arena/01a08a07-hallu -f profile=preview
```

| Profile | Output | Use for |
| ------- | ------ | ------- |
| `preview` (default) | `.apk` | Sideloading / sharing test builds |
| `production` | `.aab` | Google Play uploads |

## Where the file lands

- The run's **Summary** page links the EAS build page.
- The binary is attached under the run's **Artifacts**
  (`hallyu-android-preview`) — download `hallyu.apk`, send it to a phone,
  allow "install unknown apps", and install.
- Builds typically take 15–30 minutes (faster after the first one).

## Notes

- The free Expo plan includes a monthly build allowance; each manual run
  consumes one Android build.
- `preview` builds reuse the version in `app.json`. If Android refuses to
  install over an older copy, bump `version` / `android.versionCode` in
  `mobile/app.json` first.
- If a run fails with "projectId missing", step 2 above was not committed yet.
