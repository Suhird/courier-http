# Deployment & Release Guide — CourierHTTP

---

## What Version Number Should I Use?

**Recommendation: start at `v0.1.0`** (you are already there).

| Version | Meaning | Use when |
|---|---|---|
| `v0.1.0` | First public beta | App works but you expect bug reports / iterations |
| `v1.0.0` | Stable, production-ready | You're confident in quality and will support it long-term |

Since this is your first public release and you haven't had real user feedback yet, **stay at `v0.1.0`**. Bump to `v1.0.0` after a few patch releases once you're confident in stability.

Semantic versioning (`MAJOR.MINOR.PATCH`):
- `PATCH` bump (`v0.1.0 → v0.1.1`): bug fixes
- `MINOR` bump (`v0.1.0 → v0.2.0`): new features, backwards compatible
- `MAJOR` bump (`v0.1.0 → v1.0.0`): first stable release or breaking changes

---

## Is GitHub Releases Enough?

**Yes — GitHub Releases is the right place to start.** It gives you:
- Free hosting and CDN for your `.dmg` / `.exe` / `.msi` binaries
- A public download page users can link to
- Version history and release notes
- Foundation for Homebrew tap (macOS) and future auto-updates

You do NOT need the App Store, Electron's update server, or any paid hosting to ship a real v0.1.0.

**Future options as you grow:**
- Add a Homebrew tap (macOS `brew install`) — see Section 5
- Add `tauri-plugin-updater` for in-app auto-updates
- Submit to macOS App Store (requires Apple Developer account + sandbox compliance)
- Submit to Microsoft Store (requires Partner Center account)

---

## 1. Pre-Release Checklist

Before tagging a release, verify:

- [ ] `package.json` version matches the tag you're about to push
- [ ] `src-tauri/tauri.conf.json` version matches
- [ ] `npm test` passes (172 frontend tests)
- [ ] `cargo test` passes from `src-tauri/` (58 Rust tests)
- [ ] App builds locally: `npm run tauri build`
- [ ] App icon is set (`src-tauri/icons/` — all sizes present)
- [ ] `tauri.conf.json` has correct `identifier` (e.g. `dev.courierhttp.app`)
- [ ] No hardcoded localhost URLs or debug-only code in production paths
  - ✅ `open_devtools` is already gated by `#[cfg(debug_assertions)]` — safe

---

## 2. Bump the Version

Edit both files — they must stay in sync:

**`package.json`**
```json
"version": "0.1.0"
```

**`src-tauri/tauri.conf.json`**
```json
"version": "0.1.0"
```

Commit and tag:
```bash
git add package.json src-tauri/tauri.conf.json
git commit -m "chore: bump version to v0.1.0"
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

Pushing the tag triggers the GitHub Actions release workflow.

---

## 3. GitHub Actions Release Workflow

Create `.github/workflows/release.yml`. This builds four artifacts:
- macOS Apple Silicon (`.dmg`)
- macOS Intel (`.dmg`)
- Windows NSIS installer (`.exe`)
- Windows MSI installer (`.msi`)

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  publish-tauri:
    permissions:
      contents: write
    strategy:
      fail-fast: false
      matrix:
        include:
          # macOS Apple Silicon (M1/M2/M3)
          - platform: macos-latest
            args: --target aarch64-apple-darwin

          # macOS Intel
          - platform: macos-latest
            args: --target x86_64-apple-darwin

          # Windows (builds both NSIS .exe and MSI .msi)
          - platform: windows-latest
            args: ''

    runs-on: ${{ matrix.platform }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: aarch64-apple-darwin,x86_64-apple-darwin

      - name: Install frontend dependencies
        run: npm ci

      - name: Build and publish Tauri app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # macOS code signing (optional for v0.1.0 — see Section 4)
          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
          APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        with:
          tagName: v__VERSION__
          releaseName: CourierHTTP v__VERSION__
          releaseBody: |
            ## What's new
            See CHANGELOG.md for details.

            ## Downloads
            | Platform | File |
            |---|---|
            | macOS Apple Silicon | `CourierHTTP_*_aarch64.dmg` |
            | macOS Intel | `CourierHTTP_*_x64.dmg` |
            | Windows | `CourierHTTP_*_x64-setup.exe` (recommended) or `.msi` |
          releaseDraft: true
          prerelease: false
          args: ${{ matrix.args }}
```

**After the action completes:**
1. Go to your repo → **Releases** → find the draft
2. Review the attached assets (4 files expected)
3. Edit release notes if needed
4. Click **Publish release**

---

## 4. Code Signing (macOS)

Without code signing, macOS Gatekeeper shows an "unidentified developer" warning. Users can still open the app via right-click → Open, so **this is optional for v0.1.0** but required for a polished release.

You need an **Apple Developer account** ($99/year).

### Steps

1. In Xcode or Keychain Access, create/export a **Developer ID Application** certificate as a `.p12` file
2. Base64-encode it:
   ```bash
   base64 -i certificate.p12 | pbcopy
   ```
3. Add these secrets in GitHub → repo Settings → Secrets → Actions:

| Secret | Value |
|---|---|
| `APPLE_CERTIFICATE` | Base64-encoded `.p12` content |
| `APPLE_CERTIFICATE_PASSWORD` | Password set when exporting `.p12` |
| `APPLE_SIGNING_IDENTITY` | `Developer ID Application: Your Name (XXXXXXXXXX)` |
| `APPLE_ID` | Your Apple ID email |
| `APPLE_PASSWORD` | App-specific password from [appleid.apple.com](https://appleid.apple.com) |
| `APPLE_TEAM_ID` | 10-character team ID from [developer.apple.com](https://developer.apple.com) |

The `tauri-action` handles notarization automatically when these are set.

### Without code signing (v0.1.0 workaround)

Tell users to run this once after downloading:
```bash
xattr -cr /Applications/CourierHTTP.app
```

---

## 5. Windows Code Signing (Optional)

Without signing, Windows Defender SmartScreen shows a warning on first run. Users can click "More info → Run anyway." Acceptable for v0.1.0.

For production: purchase an EV code signing certificate from DigiCert or Sectigo (~$300–500/year) and add `WINDOWS_CERTIFICATE` / `WINDOWS_CERTIFICATE_PASSWORD` secrets. Tauri's action picks these up automatically.

---

## 6. Homebrew Tap (macOS)

Once your GitHub Release has a published `.dmg`, you can create a Homebrew tap so macOS users can install with:

```bash
brew tap YOUR_GITHUB_USERNAME/courier-http
brew install --cask courier-http
```

### Setup

1. Create a new GitHub repo named **`homebrew-courier-http`**
2. Inside it, create `Casks/courier-http.rb`:

```ruby
cask "courier-http" do
  version "0.1.0"

  on_arm do
    url "https://github.com/YOUR_USERNAME/courier-http/releases/download/v#{version}/CourierHTTP_#{version}_aarch64.dmg"
    sha256 "PASTE_SHA256_HERE"
  end

  on_intel do
    url "https://github.com/YOUR_USERNAME/courier-http/releases/download/v#{version}/CourierHTTP_#{version}_x64.dmg"
    sha256 "PASTE_SHA256_HERE"
  end

  name "CourierHTTP"
  desc "Local, offline-first HTTP client"
  homepage "https://github.com/YOUR_USERNAME/courier-http"

  app "CourierHTTP.app"

  zap trash: [
    "~/Library/Application Support/courier-http",
  ]
end
```

3. Get SHA256 for each DMG after publishing the release:
   ```bash
   shasum -a 256 CourierHTTP_0.1.0_aarch64.dmg
   shasum -a 256 CourierHTTP_0.1.0_x64.dmg
   ```
4. Paste the hashes and push

Update the cask file manually for each new release (or automate via GitHub Actions).

---

## 7. Manual Local Build

To test the production build on your local machine before releasing:

```bash
# macOS (must be on a Mac)
npm run tauri build
# Output: src-tauri/target/release/bundle/dmg/

# macOS Apple Silicon explicitly
npm run tauri build -- --target aarch64-apple-darwin

# macOS Intel explicitly
npm run tauri build -- --target x86_64-apple-darwin
```

> You cannot build macOS binaries on Windows or vice versa. Use GitHub Actions for cross-platform builds.

---

## 8. Release Cycle

Recommended cadence once you have users:

```
Bug fix:   patch every 1–2 weeks  (v0.1.0 → v0.1.1 → v0.1.2)
Feature:   minor every 4–8 weeks  (v0.1.x → v0.2.0)
Stable:    major when ready        (v0.x.x → v1.0.0)
```

**Workflow per release:**
```
1. Develop on feature branches
2. Merge to main
3. Update CHANGELOG.md
4. Bump version in package.json + tauri.conf.json
5. git tag vX.Y.Z && git push origin vX.Y.Z
6. GitHub Actions builds all 4 artifacts automatically
7. Review draft release → publish
8. Update Homebrew tap cask (if set up)
```
