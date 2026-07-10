# RSpice Site

This repository contains the public static website for
[rspice.app](https://rspice.app). It is deliberately separate from the
proprietary RSpice simulator and cloud-service source.

## Repository boundary

This repository owns:

- the deployable marketing and documentation tree under `public/`;
- shared CSS, JavaScript, fonts, images, crawler metadata, and Cloudflare Pages
  headers under `public/`; and
- deterministic validation and static assembly under `tools/`.

The `/workbench/` route under `public/` is a generated vendor snapshot of the
existing RSpice Workbench mockup from
`mockups/rspice-workbench-host/public/rspice`. The marketing page embeds that
real HTML surface in a non-interactive frame; it never substitutes a screenshot
or a hand-maintained imitation. The site-owned `workbench-frame.html` wrapper
auto-fits the fixed desktop GUI from `/workbench/index.html`; the standalone
`responsive-preview.html` lab and its viewport controls are not embedded in the
landing page. Refresh the snapshot with
`python tools/sync_workbench.py`. CI verifies that the checked-in snapshot still
matches the simulator source, and the deploy build overlays the current source
again before publishing.

It does **not** own the browser simulator runtime. The `/ide/` and `/play/`
routes, including their WebAssembly bundles and workers, are reserved for the
private RSpice client repository. Its release workflow overlays a verified
browser runtime on the website artifact, records both source revisions in
`build.json`, runs browser smoke tests, and only then publishes the assembled
site.

Keeping that assembly in the client release pipeline prevents the website from
publishing a browser UI whose JavaScript worker and WebAssembly exports were
built from a different client revision.

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

Build a clean deployable copy in `dist/`. By default the builder expects the
sibling `../RSpice` checkout used by this workspace. In the private client
deployment workflow it automatically resolves the primary RSpice checkout that
sits beside the standalone site checkout:

```shell
python tools/build_site.py
```

When the RSpice checkout lives elsewhere, pass the existing mockup-host source:

```shell
python tools/build_site.py --workbench-source ../RSpice/mockups/rspice-workbench-host/public/rspice
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
overlays the existing Workbench UI and its bundled fonts at `/workbench/`,
rewrites only deployment-relative brand/font paths in that output copy, and
validates the resulting artifact again. It refuses destinations outside the
repository, inside `public/`, or overlapping repository metadata and tooling.

## Continuous integration and deployment

Every pull request and push to `main` uses a sparse RSpice checkout for the
Workbench mockup, validates the source, builds `dist/`, validates the resulting
tree, and uploads it as the `rspice-static-site` workflow artifact. The artifact
includes dotfiles, the Workbench overlay, and the Cloudflare Pages `_headers`
file.

When `JaimeHW/RSpice` is private, configure this repository's
`RSPICE_SOURCE_TOKEN` Actions secret with read-only access to that repository.
The workflow falls back to its normal token for a public source repository.

After a change merges:

1. Download or consume the successful `rspice-static-site` artifact.
2. Dispatch the private client repository's `Deploy site` workflow with the
   desired site commit or tag.
3. Let that workflow overlay the matching `/ide/` and `/play/` runtime files and
   deploy the assembled tree.
4. Verify `https://rspice.app/build.json` reports the expected
   `client_source_sha` and `site_source_sha`.

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
