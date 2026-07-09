# RSpice Site

This repository contains the public, static marketing and documentation source
for [rspice.app](https://rspice.app). It is deliberately separate from the
proprietary RSpice simulator and cloud-service source.

## Repository boundary

This repository owns:

- the marketing and documentation HTML pages at the repository root;
- shared CSS, JavaScript, fonts, and images under `assets/`; and
- validation of local links, static assets, browser-safety invariants, and
  bounded product claims.

It does **not** own the browser simulator runtime. The `/ide/` and `/play/`
routes, including their WebAssembly bundles and workers, are built from the
private RSpice client repository. Its release workflow checks out an explicit
commit from this repository, overlays the verified browser runtime, records
both source revisions in `build.json`, runs browser smoke tests, and only then
publishes the assembled site.

Keeping that assembly in the client release pipeline ensures the website can
never publish a browser UI whose JavaScript worker and WebAssembly exports were
not built and tested from the same client revision.

## Making a change

1. Edit the static pages or assets.
2. Run `python tools/check_site.py` (Windows: `py tools\check_site.py`).
3. Commit the change and open a pull request.
4. After merge, dispatch the client repository's `Deploy site` workflow with
   the desired site commit or tag.
5. Verify `https://rspice.app/build.json` reports both the expected
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
`assets/fonts/`.
