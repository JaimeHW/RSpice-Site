# RSpice Site

This repository contains the public static website for
[rspice.app](https://rspice.app). It is deliberately separate from the
proprietary RSpice simulator and cloud-service source.

## Repository boundary

This repository owns:

- the deployable marketing and documentation tree under `public/`;
- shared CSS, JavaScript, fonts, images, crawler metadata, and deployment
  headers under `public/`; and
- deterministic validation and static assembly under `tools/`.

The `/workbench/` route under `public/` is a generated vendor snapshot of the
existing RSpice Workbench mockup from
`mockups/rspice-workbench-host/public/rspice`. The marketing page embeds that
real HTML surface in a non-interactive frame; it never substitutes a screenshot
or a hand-maintained imitation. The site-owned `workbench-frame.html` wrapper
auto-fits the fixed desktop GUI from `/workbench/index.html`; the standalone
`responsive-preview.html` lab and its viewport controls are not embedded in the
landing page. Refresh the snapshot with `python tools/sync_workbench.py`.

The current mockup directory is not tracked by the RSpice Git revision, so the
reviewed `public/workbench/` copy is the production build input. CI compares it
with the simulator source automatically whenever that directory is present in a
clean checkout; until then, CI validates and deploys the vendor snapshot instead
of depending on a local-only path.

It does **not** own the browser simulator runtime. The `/ide/` and `/play/`
routes, including their WebAssembly bundles and workers, are reserved for the
private RSpice client repository. Its release workflow overlays a verified
browser runtime on the website artifact, records both source revisions in
`build.json`, runs browser smoke tests, and only then publishes the assembled
site.

Keeping that assembly in the client release pipeline prevents the website from
publishing a browser UI whose JavaScript worker and WebAssembly exports were
built from a different client revision.

The `/reference` and `/validation` pages are generated from an exact RSpice Git
checkout. `tools/reference_catalog.py` reads the source README tables, CLI
reference, workspace metadata, ngspice and Xyce manifests, nightly gate, and
benchmark scoreboard; it writes the searchable page, a machine-readable catalog,
and copies the source-controlled raw inputs under `public/reference/`. Refresh
the checked-in snapshot and its CI pin together from a clean RSpice checkout:

```shell
python tools/sync_reference.py --rspice-source ../RSpice
```

The sync command writes `RSPICE_SOURCE_REVISION`, `public/reference.html`,
`public/validation.html`, and `public/reference/` from one inspected commit, so
the snapshot cannot accidentally be paired with a different manual SHA.

`RSPICE_SOURCE_REVISION` makes website CI reproducible instead of coupling an
unchanged site commit to the simulator repository's mutable `main`. CI checks
out that exact revision, repeats reference generation, and fails when the pin
and checked-in snapshot differ. Production assembly is separate: the release
controller checks out the explicitly requested site and simulator SHAs and
regenerates the deployable reference from that exact pair. A build may also
import a downloaded nightly artifact, but a CI conclusion is presented as a
result only when `validation-metadata.json` identifies the exact source commit.
Unpinned or mismatched files remain downloadable without being counted as a
result.

## Validate and build

The tooling uses only the Python standard library. Python 3.10 or newer is
recommended.

Validate the editable source tree:

```shell
python tools/check_site.py --root public
```

On Windows, `py` can be used in place of `python`. Validation covers every HTML
file recursively, local links and fragments, responsive/SEO metadata,
accessibility basics, URL safety, deployment metadata, and the `/ide/`,
`/play/`, and `/workbench/` overlay boundaries.

Build a clean deployable copy in `dist/`. The builder uses the sibling
`../RSpice` Workbench source when it is present and otherwise uses the reviewed
`public/workbench/` snapshot. Reference generation still requires the sibling
RSpice Git checkout by default:

```shell
python tools/build_site.py
```

When the RSpice checkout lives elsewhere, pass the existing mockup-host source:

```shell
python tools/build_site.py --rspice-source ../RSpice --workbench-source ../RSpice/mockups/rspice-workbench-host/public/rspice
```

To reproduce a validation page with CI data, pass an artifact directory that
contains `conformance.log` and revision metadata:

```shell
python tools/build_site.py --validation-artifacts build/nightly-artifact
```

Choose another repository-local output directory when needed:

```shell
python tools/build_site.py --out build/site
```

For local preview, use the preview tool to build the same artifact that
deployment consumes and disable browser caching:

```shell
python tools/serve_site.py
```

Then open `http://127.0.0.1:48917/`. Stop it with `Ctrl+C`.

The build validates `public/`, replaces the selected output with an exact copy,
overlays the selected Workbench UI and its bundled fonts at `/workbench/`,
regenerates reference and validation data from the selected RSpice revision,
rewrites only deployment-relative brand/font paths in that output copy, and
validates the resulting artifact again. It refuses destinations outside the
repository, inside `public/`, or overlapping repository metadata and tooling.

## Continuous integration and deployment

Every pull request and push to `main` uses a sparse RSpice checkout for the
revision pinned by `RSPICE_SOURCE_REVISION`, including the technical-catalog
inputs and optional tracked Workbench source. It validates the vendor snapshot,
verifies the generated reference snapshot, runs the tooling tests, attempts to
download an exact-revision nightly conformance log, validates the source, builds
`dist/`, validates the resulting tree, and uploads it as the
`rspice-static-site` workflow artifact.
The artifact includes dotfiles, the Workbench overlay, generated reference data,
and the deployment `_headers` file.

The `/early-access` form has no collection endpoint today. It prepares a
structured email to `sales@rspice.app` and stores nothing on the site. A future
same-origin endpoint can be set in `data-intake-endpoint` only after its data
handling, abuse protection, retention, privacy notice, and customer-record
ownership are ready.

When `JaimeHW/RSpice` is private, configure this repository's
`RSPICE_SOURCE_TOKEN` Actions secret with read-only access to that repository.
The workflow falls back to its normal token for a public source repository.

After a successful `main` run, this repository's release trigger mints a
short-lived, repository-scoped GitHub App token and dispatches the private
`JaimeHW/RSpice-Release` controller. The controller records full site and
simulator SHAs, requires successful CI for both exact revisions, assembles and
tests the static site plus `/ide/` and `/play/` WebAssembly runtimes, uploads an
inactive Cloudflare Worker version, verifies its preview URL, and only then
promotes that exact version to `rspice.app`. Re-dispatching the already-active
source pair exits as a verified no-op.

For normal static-site changes, commit and push `main`; no generated WebAssembly
or Cloudflare command is run from this repository. Site CI must pass, then the
release controller automatically combines that exact site commit with the
current RSpice `main`, verifies both source revisions, and promotes the result.
Generated-reference-only changes use the sync command above, then commit the
pin and all generated reference files together and push `main` in the same way.

The source repository stores no Cloudflare credential. Automatic dispatch uses
the `RSPICE_RELEASE_APP_ID` variable, `RSPICE_RELEASE_APP_PRIVATE_KEY` secret,
and `RSPICE_AUTO_RELEASE=true`; Cloudflare account ID and Worker token secrets
exist only in the private release controller.

The site repository never contains deployment credentials, generated
WebAssembly, customer data, or simulator source. Do not add generated `pkg/`
directories or secrets.

## History

The repository retains the 21 commits that changed the original `site/`
subtree. Its extraction was verified against RSpice client commit
`c4727960a1195c564fbb65b8d5839066f3d69d14`; the extracted tree was exactly
`229dc4d91c6ad9b745a34a545a37200391b17a34` before repository-boundary changes.

## License

The RSpice website source and content are proprietary and all rights are
reserved. Bundled fonts retain the license included beside them under
`public/assets/fonts/`.
