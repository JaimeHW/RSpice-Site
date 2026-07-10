(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

  const icons = {
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.4 15.4 4.1 4.1"/>',
    cloud: '<path d="M7.5 18h9.8a4 4 0 0 0 .3-8 6 6 0 0 0-11.4-1.5A4.8 4.8 0 0 0 7.5 18Z"/>',
    sun: '<circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 15.2A8.4 8.4 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z"/>',
    home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
    schematic: '<path d="M3 7h5m8 0h5M8 4v6h8V4zM12 10v4m-6 0h12M6 14v5m12-5v5M3 19h6m6 0h6"/>',
    simulate: '<path d="M7 3 18 12 7 21Z"/><path d="M3 3v18"/>',
    waveform: '<path d="M2 12h4l2-7 4 14 3-10 2 3h5"/>',
    verify: '<path d="M12 3 4.5 6v5.2c0 4.7 3.2 8 7.5 9.8 4.3-1.8 7.5-5.1 7.5-9.8V6Z"/><path d="m8.2 12.1 2.4 2.4 5.1-5.1"/>',
    library: '<path d="M4 4h5v16H4zM10 4h4v16h-4zM15 5l4-1 2.8 15.4-4 .7z"/>',
    code: '<path d="m8 5-6 7 6 7M16 5l6 7-6 7M14 3l-4 18"/>',
    density: '<path d="M4 5h16M4 12h16M4 19h16"/><path d="M7 3v4M12 10v4M17 17v4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    "panel-left": '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M9 4v16"/>',
    "panel-right": '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M15 4v16"/>',
    sliders: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="11" cy="18" r="2"/>',
    play: '<path d="m7 4 12 8-12 8Z"/>',
    stop: '<rect x="5" y="5" width="14" height="14" rx="1"/>',
    pointer: '<path d="m5 3 13 9-6 1.3L9 20Z"/>',
    wire: '<path d="M3 18h5V6h8v12h5"/><circle cx="3" cy="18" r="1.5"/><circle cx="21" cy="18" r="1.5"/>',
    component: '<path d="M2 12h4m12 0h4M6 7v10l12-5Z"/>',
    label: '<path d="M4 5h10l6 7-6 7H4Z"/><circle cx="8" cy="12" r="1"/>',
    probe: '<path d="M5 20 16 9m0 0 3-3-1-2-2-1-3 3m3 3 2 2"/><path d="M4 20h5"/>',
    bus: '<path d="M3 17 17 3M7 21 21 7M3 9l12 12"/>',
    rotate: '<path d="M20 7v5h-5"/><path d="M18.5 16A8 8 0 1 1 20 12"/>',
    mirror: '<path d="M12 3v18M4 7l6 5-6 5zM20 7l-6 5 6 5z"/>',
    undo: '<path d="M9 7 4 12l5 5"/><path d="M5 12h8a6 6 0 0 1 6 6"/>',
    "arrow-left": '<path d="m15 5-7 7 7 7"/><path d="M8 12h13"/>',
    redo: '<path d="m15 7 5 5-5 5"/><path d="M19 12h-8a6 6 0 0 0-6 6"/>',
    zoomin: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M10.5 7v7M7 10.5h7m1.4 4.9 4.1 4.1"/>',
    zoomout: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M7 10.5h7m1.4 4.9 4.1 4.1"/>',
    fit: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
    grid: '<path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a8 8 0 0 1 13.4 2M4.5 15a8 8 0 0 0 13.4 2"/>',
    export: '<path d="M12 3v12m0 0 5-5m-5 5-5-5"/><path d="M4 18v3h16v-3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16M9 3h6l1 4H8zM6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
    "chevron-down": '<path d="m5 9 7 7 7-7"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3M9 9h6v6H9z"/>',
    folder: '<path d="M3 6h7l2 2h9v11H3Z"/>',
    file: '<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v5h5"/>',
    cells: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    warning: '<path d="M12 3 2.5 20h19Z"/><path d="M12 9v5M12 17h.01"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    history: '<path d="M4 5v6h6"/><path d="M5.5 16a8 8 0 1 0 .2-8.3L4 11"/><path d="M12 7v5l3 2"/>',
    tune: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    terminal: '<path d="m4 6 5 5-5 5M11 17h8"/>',
    copy: '<rect x="8" y="8" width="11" height="12" rx="1"/><path d="M5 16H4V4h11v1"/>',
    save: '<path d="M4 3h14l2 2v16H4Z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
    compare: '<path d="M8 4v16M16 4v16M4 8l4-4 4 4M12 16l4 4 4-4"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 3.8 2.1c-1 .6-1.5 1.2-1.5 2.4M12 17h.01"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>'
  };

  function iconSvg(name) {
    return `<span class="icon" data-icon="${name}"><svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.more}</svg></span>`;
  }

  function hydrateIcons(root = document) {
    $$('[data-icon]:not([data-hydrated="true"])', root).forEach((node) => {
      const name = node.dataset.icon;
      node.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.more}</svg>`;
      node.dataset.hydrated = "true";
    });
  }

  const params = new URLSearchParams(location.search);
  const initialView = ["project", "design", "simulate", "results", "verify", "models", "netlist"].includes(params.get("view"))
    ? params.get("view")
    : "design";

  function readPreference(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
  }

  function writePreference(key, value) {
    try { localStorage.setItem(key, value); } catch { /* Direct-file previews may disable storage. */ }
  }

  function readJsonPreference(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
  }

  const BASE_INPUT_REVISION = "7c49d2b";
  const RUN_SET_DIMENSIONS = Object.freeze([
    Object.freeze({ id: "process", label: "Process section", values: Object.freeze(["FF", "FS", "TT", "SF", "SS"]), combination: "Cartesian", reuse: "model cache" }),
    Object.freeze({ id: "temperature", label: "Temperature", values: Object.freeze(["−40 °C", "27 °C", "125 °C"]), combination: "Cartesian", reuse: "OP warm-start" })
  ]);
  const PVT_RUN_POINTS = Object.freeze(RUN_SET_DIMENSIONS[0].values.flatMap((process) => RUN_SET_DIMENSIONS[1].values.map((temperature) => `${process} · ${temperature}`)));
  const ENGINE_BUILD = "0.1.0+91e7c2a";
  const NUMERIC_CONTRACT = "f64 / complex128";
  const PDK_LOCK = "demo180@2.3.1";
  const MODEL_SET_DIGEST = "be17c41978a3107d5993f46180c1c02a3f18c59acfd41d27dc352e54481c0a7e";
  const REQUIREMENT_CONTRACT = Object.freeze({ id: "req-19", mapped: 14, total: 14, policy: "missing required measurements fail closed" });
  const REQUIRED_NOMINAL_ANALYSES = Object.freeze(["op", "tran", "ac", "noise", "stb", "dc", "sens", "fourier"]);
  const RELEASE_PROFILE = deepFreeze({
    id: "afe-release-1.0",
    requirementRevision: "req-19",
    monteCarlo: { required: true, minimumSamples: 1000, targetYieldPercent: 99 },
    modelQualification: { required: true, evidenceId: "demo180-models@qual-2026q2" },
    regression: { required: true, evidenceId: "reg-main@run-41-vs-38", requirementRevision: "req-19" },
    safeOperatingArea: { required: true, evidenceId: "soa-electrical@run-41", ruleDeck: "demo180_soa_2.1" }
  });

  function mockDigest(value) {
    const input = String(value);
    const words = [0x811c9dc5, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35, 0x27d4eb2f, 0x165667b1, 0xd3a2646c, 0xfd7046c5];
    return words.map((seed, wordIndex) => {
      let hash = seed >>> 0;
      for (let index = 0; index < input.length; index += 1) {
        hash ^= input.charCodeAt(index) + wordIndex * 17;
        hash = Math.imul(hash, 0x01000193) >>> 0;
      }
      return hash.toString(16).padStart(8, "0");
    }).join("");
  }

  function shortDigest(value) {
    return `${String(value).slice(0, 4)}…${String(value).slice(-4)}`;
  }

  function canonicalObject(value) {
    return Object.fromEntries(Object.entries(value || {}).sort(([left], [right]) => left.localeCompare(right)));
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  }

  function copyAnalysisValues(values) {
    return Object.fromEntries(Object.entries(values || {}).map(([analysis, fields]) => [analysis, { ...fields }]));
  }

  const ANALYSIS_DEFAULT_VALUES = deepFreeze({
    op: { 0: "PVT run set", 1: "Automatic", 2: "Use IC / nodeset", 3: "Adaptive", 4: "Voltages + currents", 5: "Selected + violations", 6: "Enabled", 7: "Balanced" },
    tran: { 0: "0", 1: "20m", 2: "10u", 3: "auto", 4: "Gear 2", 5: "Solve operating point", 6: "Balanced", 7: "Selected + probes" },
    ac: { 0: "Decade", 1: "50", 2: "1", 3: "10Meg", 4: "VIN_DIFF", 5: "V(afe_out)", 6: "Balanced", 7: "Enabled" },
    noise: { 0: "Decade", 1: "30", 2: "1", 3: "1Meg", 4: "afe_out", 5: "VIN_DIFF", 6: "Top 50", 7: "Enabled" },
    stb: { 0: "LP1 · afe_feedback", 1: "Decade", 2: "80", 3: "10", 4: "100Meg", 5: "Middlebrook", 6: "Gain + phase", 7: "Enabled" },
    dc: { 0: "VOS", 1: "Linear", 2: "-10m", 3: "10m", 4: "100u", 5: "None", 6: "Previous solution", 7: "Selected + probes" },
    sens: { 0: "gain_dc", 1: "AC at 10 Hz", 2: "12 selected", 3: "Direct + adjoint", 4: "Relative (%)", 5: "Absolute influence", 6: "Enabled", 7: "Disabled" },
    fourier: { 0: "V(afe_out)", 1: "1k", 2: "10", 3: "10m", 4: "20m", 5: "Blackman-Harris", 6: "THD + SINAD + ENOB", 7: "Enabled" },
    pz: { 0: "Poles + zeros", 1: "VIN_DIFF", 2: "V(afe_out)", 3: "rad/s", 4: "Enabled", 5: "1e-9", 6: "64", 7: "Enabled" },
    xf: { 0: "VIN_DIFF", 1: "V(afe_out)", 2: "DC operating point", 3: "Enabled", 4: "Enabled", 5: "Enabled", 6: "Disabled", 7: "Balanced" },
    mc: { 0: "1000", 1: "Latin hypercube", 2: "0x73A4", 3: "Process + mismatch", 4: "Foundry groups", 5: "Per selected corner", 6: "Complete all samples", 7: "Failures + extrema" },
    temp: { 0: "List", 1: "-40, 27, 125", 2: "27", 3: "Adjacent point", 4: "Every point", 5: "Per temperature", 6: "Automatic", 7: "Continue" },
    corner: { 0: "PDK sections", 1: "ff, fs, tt, sf, ss", 2: "-40, 27, 125", 3: "Nominal", 4: "Cartesian", 5: "tt / 27 °C", 6: "12 local slots", 7: "Continue matrix" },
    pss: { 0: "Driven shooting", 1: "1k", 2: "VIN_DIFF", 3: "20", 4: "512", 5: "1e-7", 6: "Disabled", 7: "20" },
    hb: { 0: "1 kHz", 1: "15", 2: "5", 3: "PSS / transient", 4: "Adaptive", 5: "1e-7", 6: "Source power", 7: "Enabled" },
    sp: { 0: "PORT1, PORT2", 1: "50", 2: "Logarithmic", 3: "1Meg", 4: "10Gig", 5: "101", 6: "Fixture A", 7: "RI · GHz" },
    pac: { 0: "pss_1", 1: "VIN_DIFF", 2: "V(afe_out)", 3: "−10…+10", 4: "1", 5: "1Meg", 6: "Decade", 7: "Preview kernel" },
    pnoise: { 0: "pss_1", 1: "V(afe_out)", 2: "VIN_DIFF", 3: "20", 4: "1", 5: "10Meg", 6: "Time average", 7: "Preview kernel" },
    pxf: { 0: "pss_1", 1: "VIN_DIFF", 2: "V(afe_out)", 3: "0", 4: "−10…+10", 5: "1…1Meg Hz", 6: "Conversion gain", 7: "Preview kernel" },
    pstb: { 0: "pss_1", 1: "LPROBE", 2: "Automatic", 3: "−8…+8", 4: "10…100Meg Hz", 5: "Enabled", 6: "Enabled", 7: "Preview" },
    envelope: { 0: "1 MHz", 1: "10m", 2: "1u", 3: "9", 4: "VIN_AM", 5: "HB", 6: "Enabled", 7: "Preview" },
    reliability: { 0: "Industrial 10 year", 1: "TRAN + OP", 2: "BTI + HCI", 3: "0, 1, 5, 10 years", 4: "IEC industrial", 5: "Foundry rules", 6: "Every age point", 7: "Fail closed" },
    opt: { 0: "Levenberg–Marquardt", 1: "4 selected", 2: "5 mapped", 3: "2 mapped", 4: "Nominal + worst 3", 5: "40", 6: "1e-4", 7: "Pareto + accepted" },
    soa: { 0: "PDK electrical limits", 1: "OP + TRAN", 2: "Enabled", 3: "Enabled", 4: "Enabled", 5: "Temperature aware", 6: "Enabled", 7: "Block sign-off" },
    disto: { 0: "AC + THD/IMD post-process", 1: "VIN_DIFF", 2: "1k", 3: "1.1k", 4: "10", 5: "HD2, HD3, IM2, IM3", 6: "No Volterra solve", 7: "Required" }
  });

  function effectiveAnalysisValues(analyses, overrides) {
    return Object.fromEntries([...analyses].map((analysis) => [analysis, {
      ...(ANALYSIS_DEFAULT_VALUES[analysis] || { configuration: "plan-defined defaults" }),
      ...(overrides?.[analysis] || {})
    }]));
  }

  const REQUIREMENT_CONTRACT_DIGEST = mockDigest(JSON.stringify(REQUIREMENT_CONTRACT));

  function generatedDesignNetlistDigest(inputRevision, sourceDigests = {}) {
    return mockDigest(JSON.stringify({
      inputRevision,
      sourceDigests: canonicalObject(sourceDigests),
      modelSetDigest: MODEL_SET_DIGEST
    }));
  }

  function evidenceRecord({ evidenceId, evaluated = true, passed, reviewStatus, binding }) {
    const record = { evidenceId, evaluated, passed, reviewStatus, binding: canonicalObject(binding) };
    return deepFreeze({ ...record, evidenceDigest: mockDigest(JSON.stringify(record)) });
  }

  const BASE_RELEASE_BINDING = deepFreeze({
    inputRevision: "7c49d2b",
    netlistDigest: "11c781a34ffc41b136ccd7a94c074a8910760575a6cd779178207f829c9f4719",
    modelSetDigest: "be17c41978a3107d5993f46180c1c02a3f18c59acfd41d27dc352e54481c0a7e",
    requirementDigest: "051a41fe018e4d8d25f9110e2acdcaaf56c594ec7be3d2f994c0d677cb218a3b",
    engineBuild: "0.1.0+91e7c2a",
    numericContract: "f64 / complex128"
  });

  const RELEASE_EVIDENCE = deepFreeze({
    modelQualification: evidenceRecord({
      evidenceId: "demo180-models@qual-2026q2",
      passed: false,
      reviewStatus: "technical suite passed; 9 review or waiver dispositions remain",
      binding: { modelSetDigest: "be17c41978a3107d5993f46180c1c02a3f18c59acfd41d27dc352e54481c0a7e", requirementDigest: "051a41fe018e4d8d25f9110e2acdcaaf56c594ec7be3d2f994c0d677cb218a3b", engineBuild: "0.1.0+91e7c2a", numericContract: "f64 / complex128" }
    }),
    regression: evidenceRecord({
      evidenceId: "reg-main@run-41-vs-38",
      passed: true,
      reviewStatus: "approved",
      binding: BASE_RELEASE_BINDING
    }),
    safeOperatingArea: evidenceRecord({
      evidenceId: "soa-electrical@run-41",
      passed: true,
      reviewStatus: "approved",
      binding: { ...BASE_RELEASE_BINDING, ruleDeck: "demo180_soa_2.1" }
    })
  });

  function evaluateBoundEvidence(profile, evidence, currentBinding, requiredFields) {
    const labels = { evidenceId: "evidence identity", inputRevision: "input revision", netlistDigest: "generated-netlist digest", modelSetDigest: "model-set digest", requirementDigest: "requirements digest", engineBuild: "engine build", numericContract: "numeric contract", ruleDeck: "SOA rule deck" };
    const mismatches = [
      ...(evidence?.evidenceId === profile.evidenceId ? [] : ["evidenceId"]),
      ...requiredFields.filter((field) => evidence?.binding?.[field] !== currentBinding[field])
    ];
    const evaluated = Boolean(evidence?.evaluated);
    const passed = evaluated && Boolean(evidence?.passed) && mismatches.length === 0;
    let detail;
    if (!evaluated) detail = `${profile.evidenceId} is required but no evaluated evidence is linked`;
    else if (!evidence.passed) detail = `${evidence.evidenceId} is not approved: ${evidence.reviewStatus}`;
    else if (mismatches.length) detail = `${evidence.evidenceId} is stale for ${mismatches.map((field) => labels[field]).join(", ")}`;
    else detail = `${evidence.evidenceId} is approved and applies to the frozen evidence binding`;
    return {
      required: true,
      evaluated,
      passed,
      evidenceId: evidence?.evidenceId || profile.evidenceId,
      evidenceDigest: evidence?.evidenceDigest || null,
      reviewStatus: evidence?.reviewStatus || "missing",
      applicability: {
        expected: canonicalObject({ evidenceId: profile.evidenceId, ...(evidence?.binding || {}) }),
        current: canonicalObject({ evidenceId: evidence?.evidenceId || null, ...Object.fromEntries(requiredFields.map((field) => [field, currentBinding[field]])) }),
        mismatches
      },
      detail
    };
  }

  function boundReleaseEvidenceGates(binding) {
    return {
      modelQualification: evaluateBoundEvidence(RELEASE_PROFILE.modelQualification, RELEASE_EVIDENCE.modelQualification, binding, ["modelSetDigest", "requirementDigest", "engineBuild", "numericContract"]),
      regression: evaluateBoundEvidence(RELEASE_PROFILE.regression, RELEASE_EVIDENCE.regression, binding, ["inputRevision", "netlistDigest", "modelSetDigest", "requirementDigest", "engineBuild", "numericContract"]),
      safeOperatingArea: {
        ...evaluateBoundEvidence(RELEASE_PROFILE.safeOperatingArea, RELEASE_EVIDENCE.safeOperatingArea, binding, ["inputRevision", "netlistDigest", "modelSetDigest", "requirementDigest", "engineBuild", "numericContract", "ruleDeck"]),
        ruleDeck: RELEASE_PROFILE.safeOperatingArea.ruleDeck
      }
    };
  }

  const ANALYSIS_CODE_MAP = Object.freeze({ op: "OP", tran: "TRAN", ac: "AC", dc: "DC", noise: "NOISE", pz: "PZ", sens: "SENS", stb: "STB", xf: "XF", mc: "MC", temp: "TEMP", corner: "CORNER", pss: "PSS", hb: "HB", sp: "SP", pac: "PAC", pnoise: "PNOISE", pxf: "PXF", pstb: "PSTB", envelope: "ENV", fourier: "FOUR", reliability: "REL", opt: "OPT", soa: "SOA", disto: "DISTO" });
  const NON_RELEASE_ANALYSES = new Set(["pac", "pnoise", "pxf", "pstb", "envelope", "reliability", "disto"]);

  function executionTaskGraph(analyses, analysisValues = {}) {
    const list = typeof analyses === "number" ? Array.from({ length: analyses }, (_, index) => `analysis_${index}`) : [...analyses];
    const entries = list.map((analysis) => {
      const values = analysisValues[analysis] || ANALYSIS_DEFAULT_VALUES[analysis] || {};
      let taskCount = PVT_RUN_POINTS.length;
      let expansion = `${PVT_RUN_POINTS.length} PVT points`;
      if (analysis === "mc") {
        const samples = Math.max(1, Math.floor(Number(String(values[0] || "1000").replace(/[,_\s]/g, ""))) || 1000);
        taskCount = samples * PVT_RUN_POINTS.length;
        expansion = `${samples.toLocaleString()} samples × ${PVT_RUN_POINTS.length} PVT points`;
      } else if (analysis === "opt") {
        const iterations = Math.max(1, Number.parseInt(String(values[5] || "40"), 10) || 40);
        taskCount = iterations * 4;
        expansion = `${iterations} iterations × 4 scoped points`;
      } else if (analysis === "reliability") {
        const agePoints = String(values[3] || "0, 1, 5, 10 years").split(",").length;
        taskCount = agePoints * PVT_RUN_POINTS.length;
        expansion = `${agePoints} age points × ${PVT_RUN_POINTS.length} PVT points`;
      }
      return { analysis, code: ANALYSIS_CODE_MAP[analysis] || analysis.toUpperCase(), taskCount, expansion };
    });
    return { entries, total: entries.reduce((sum, entry) => sum + entry.taskCount, 0) };
  }

  function estimatedRunDurationSeconds(analyses, analysisValues = {}) {
    const graph = executionTaskGraph(analyses, analysisValues);
    const seconds = graph.entries.reduce((sum, entry) => {
      const rate = entry.analysis === "mc" ? 0.058 : entry.analysis === "opt" ? 0.72 : entry.analysis === "reliability" ? 0.48 : 0.236833;
      return sum + entry.taskCount * rate;
    }, 0);
    return Math.max(4.8, Number(seconds.toFixed(2)));
  }

  function formatDuration(seconds) {
    if (!Number.isFinite(seconds)) return "in progress";
    if (seconds < 60) return `${seconds.toFixed(2)} s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min ${(seconds - minutes * 60).toFixed(1)} s`;
  }

  function createRunManifest({ id, status, analyses, analysisValues, referenceCorner, inputRevision, startedAt, completedAt = null, durationSeconds = null, estimatedDurationSeconds = null, targetPlatform = "desktop", sourceDrafts = {}, sourceDigests = null }) {
    const analysisList = [...analyses];
    const taskGraph = executionTaskGraph(analysisList, analysisValues);
    const estimate = estimatedDurationSeconds ?? estimatedRunDurationSeconds(analysisList, analysisValues);
    const frozenSourceDrafts = canonicalObject(Object.fromEntries(Object.entries(sourceDrafts).map(([name, text]) => [name, String(text)])));
    const resolvedSourceDigests = canonicalObject(sourceDigests || Object.fromEntries(Object.entries(frozenSourceDrafts).map(([name, text]) => [name, mockDigest(text)])));
    const designNetlistDigest = generatedDesignNetlistDigest(inputRevision, resolvedSourceDigests);
    const runConfigurationDigest = mockDigest(JSON.stringify({ analyses: analysisList, analysisValues, referenceCorner }));
    const netlistDigest = mockDigest(JSON.stringify({ designNetlistDigest, runConfigurationDigest }));
    const evidenceBinding = { inputRevision, netlistDigest: designNetlistDigest, modelSetDigest: MODEL_SET_DIGEST, requirementDigest: REQUIREMENT_CONTRACT_DIGEST, engineBuild: ENGINE_BUILD, numericContract: NUMERIC_CONTRACT, ruleDeck: RELEASE_PROFILE.safeOperatingArea.ruleDeck };
    const evidenceGates = boundReleaseEvidenceGates(evidenceBinding);
    const nonReleaseAnalyses = analysisList.filter((analysis) => NON_RELEASE_ANALYSES.has(analysis));
    const engineEligible = nonReleaseAnalyses.length === 0;
    const targetEligible = targetPlatform !== "mobile";
    const modelEligible = evidenceGates.modelQualification.passed;
    const missingNominalAnalyses = REQUIRED_NOMINAL_ANALYSES.filter((analysis) => !analysisList.includes(analysis));
    const monteCarloSamples = analysisList.includes("mc") ? Math.max(2, Math.floor(Number(String(analysisValues?.mc?.[0] || "1000").replace(/[,_\s]/g, ""))) || 1000) : 0;
    const illustrativeFailures = monteCarloSamples ? Math.floor(monteCarloSamples / 71) : 0;
    const illustrativeYieldPercent = monteCarloSamples ? Number(((monteCarloSamples - illustrativeFailures) / monteCarloSamples * 100).toFixed(3)) : null;
    const yieldGate = analysisList.includes("mc")
      ? {
          required: true,
          evaluated: true,
          samples: monteCarloSamples,
          minimumSamples: RELEASE_PROFILE.monteCarlo.minimumSamples,
          failures: illustrativeFailures,
          resultPercent: illustrativeYieldPercent,
          targetPercent: RELEASE_PROFILE.monteCarlo.targetYieldPercent,
          passed: monteCarloSamples >= RELEASE_PROFILE.monteCarlo.minimumSamples && illustrativeYieldPercent >= RELEASE_PROFILE.monteCarlo.targetYieldPercent,
          detail: monteCarloSamples < RELEASE_PROFILE.monteCarlo.minimumSamples
            ? `${monteCarloSamples.toLocaleString()} samples are below the ${RELEASE_PROFILE.monteCarlo.minimumSamples.toLocaleString()}-sample release minimum`
            : `${illustrativeYieldPercent.toFixed(3)}% yield from ${monteCarloSamples.toLocaleString()} samples; target ≥ ${RELEASE_PROFILE.monteCarlo.targetYieldPercent}%`,
          source: "deterministic reference dataset"
        }
      : {
          required: true,
          evaluated: false,
          samples: 0,
          minimumSamples: RELEASE_PROFILE.monteCarlo.minimumSamples,
          resultPercent: null,
          targetPercent: RELEASE_PROFILE.monteCarlo.targetYieldPercent,
          passed: false,
          detail: "required Monte Carlo yield evidence was not evaluated by this run",
          source: "missing release-profile evidence"
        };
    const gates = {
      engineReadiness: { passed: engineEligible, detail: engineEligible ? "all analyses use release engines" : `${nonReleaseAnalyses.map((analysis) => ANALYSIS_CODE_MAP[analysis]).join(", ")} excluded from release evidence` },
      targetRuntime: { passed: targetEligible, detail: targetEligible ? `${targetPlatform} runtime qualified` : "mobile runtime is preview-only" },
      modelQualification: evidenceGates.modelQualification,
      requirementCoverage: { required: true, evaluated: true, passed: REQUIREMENT_CONTRACT.mapped === REQUIREMENT_CONTRACT.total, mappingRevision: REQUIREMENT_CONTRACT.id, mapped: REQUIREMENT_CONTRACT.mapped, total: REQUIREMENT_CONTRACT.total, detail: `${REQUIREMENT_CONTRACT.mapped} / ${REQUIREMENT_CONTRACT.total} requirements mapped in ${REQUIREMENT_CONTRACT.id}` },
      nominalSpecifications: { required: true, evaluated: missingNominalAnalyses.length === 0, passed: missingNominalAnalyses.length === 0, requiredAnalyses: [...REQUIRED_NOMINAL_ANALYSES], missingAnalyses: missingNominalAnalyses, detail: missingNominalAnalyses.length ? `required executable checks are not evaluated because ${missingNominalAnalyses.map((analysis) => ANALYSIS_CODE_MAP[analysis]).join(", ")} are absent` : "all release-profile nominal analyses are present and configured checks pass in the reference dataset" },
      monteCarloYield: yieldGate,
      regression: { ...evidenceGates.regression, requirementRevision: RELEASE_PROFILE.regression.requirementRevision },
      safeOperatingArea: evidenceGates.safeOperatingArea
    };
    const technicalGatePassed = Object.values(gates).every((gate) => gate.passed);
    const releaseEligible = engineEligible && targetEligible;
    const signOffEligible = status === "complete" && releaseEligible && technicalGatePassed;
    return deepFreeze({
      id,
      status,
      dataOrigin: "embedded-reference-dataset",
      analyses: analysisList,
      analysisValues: copyAnalysisValues(analysisValues),
      referenceCorner,
      runSet: {
        id: `pvt-${RUN_SET_DIMENSIONS.map((dimension) => dimension.values.length).join("x")}`,
        name: "PVT characterization",
        dimensions: RUN_SET_DIMENSIONS.map((dimension) => ({ id: dimension.id, label: dimension.label, values: [...dimension.values], combination: dimension.combination })),
        points: [...PVT_RUN_POINTS],
        pointCount: PVT_RUN_POINTS.length,
        taskCount: taskGraph.total
      },
      releaseProfile: RELEASE_PROFILE,
      taskGraph,
      target: {
        platform: targetPlatform,
        runtime: targetPlatform === "desktop" ? "native + interpreted Verilog-A" : targetPlatform === "mobile" ? "WASM preview" : "WASM + interpreted Verilog-A",
        releaseEligible: targetEligible
      },
      provenance: {
        digestContract: "SHA-256 content-addressed provenance contract",
        netlistDigest,
        designNetlistDigest,
        runConfigurationDigest,
        requirementContractDigest: REQUIREMENT_CONTRACT_DIGEST,
        sourceDigests: resolvedSourceDigests,
        modelSetDigest: MODEL_SET_DIGEST,
        engineBuild: ENGINE_BUILD,
        pdkLock: PDK_LOCK,
        numericContract: NUMERIC_CONTRACT
      },
      qualification: {
        engineEligible,
        targetEligible,
        modelEligible,
        technicalGatePassed,
        releaseEligible,
        nonReleaseAnalyses,
        uxMaturity: "release interaction design",
        signOffEligible,
        approvalStatus: signOffEligible ? "pending engineering approval" : "not approvable",
        gates
      },
      inputRevision,
      startedAt,
      completedAt,
      durationSeconds,
      estimatedDurationSeconds: estimate
    });
  }

  const state = {
    view: initialView,
    platform: ["desktop", "web", "tablet", "mobile"].includes(params.get("platform")) ? params.get("platform") : "desktop",
    designLeft: "navigator",
    designInspector: "parameters",
    selectedComponent: "U1",
    projectSection: "dashboard",
    simulationSection: "analyses",
    modelSection: "models",
    codeSurface: "netlist",
    canvasTool: "select",
    canvasZoom: 1,
    canvasGrid: true,
    schematicMutations: [],
    schematicRedo: [],
    designClipboard: null,
    schematicSequence: 1,
    pendingWireStart: null,
    componentEdits: {},
    selectedAnalysis: "tran",
    analysisValues: {},
    configuredAnalyses: new Set(["op", "tran", "ac", "noise", "stb", "dc", "sens", "fourier"]),
    enabledAnalyses: new Set(["op", "tran", "ac", "noise", "stb", "dc", "sens", "fourier"]),
    planCorner: "TT · 27 °C",
    resultCorner: "TT · 27 °C",
    activeRunCorner: null,
    resultAnalysisCount: 8,
    activeRunAnalysisCount: null,
    resultAnalyses: new Set(["op", "tran", "ac", "noise", "stb", "dc", "sens", "fourier"]),
    activeRunAnalyses: null,
    resultSpecCount: 12,
    resultPassedSpecCount: 12,
    resultDuration: "28.42 s",
    resultMode: "waves",
    verifyMode: "yield",
    selectedDrcMarker: "DRC-0042",
    drcFilter: "open",
    selectedModel: "OPA189_A",
    tuningBaseline: { RGAIN: 499, CFILT: 22, VREF: 2.5 },
    tuningValues: { RGAIN: 499, CFILT: 22, VREF: 2.5 },
    tuningDirty: false,
    consoleTab: "console",
    consoleCollapsed: readPreference("rspice-console-default", "collapsed") !== "open",
    consoleHeight: 145,
    consoleMaximized: false,
    workspaceFocus: readPreference("rspice-workspace-preset", "engineering") === "canvas",
    workspacePreset: readPreference("rspice-workspace-preset", "engineering"),
    unitsSystem: readPreference("rspice-units-system", "mixed"),
    schematicGrid: readPreference("rspice-schematic-grid", "50mil"),
    consoleDefault: readPreference("rspice-console-default", "collapsed"),
    dockSizes: readJsonPreference("rspice-dock-sizes", {}),
    themeMode: readPreference("rspice-theme", readPreference("rspice-mockup-theme", "dark")),
    theme: readPreference("rspice-theme", readPreference("rspice-mockup-theme", "dark")) === "system"
      ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
      : readPreference("rspice-theme", readPreference("rspice-mockup-theme", "dark")),
    density: readPreference("rspice-density", readPreference("rspice-mockup-density", "compact")),
    running: false,
    runProgress: 0,
    runTimer: null,
    runId: 41,
    newResults: false,
    resultsStale: false,
    dirty: false,
    checksCurrent: true,
    planValidated: true,
    inputRevision: BASE_INPUT_REVISION,
    editSequence: 0,
    netlistDirty: false,
    netlistText: null,
    sourceDrafts: {},
    dirtySourceDocuments: new Set(),
    sourceValidationRequired: new Set(),
    closedDocs: new Set(),
    cursorEnabled: true,
    plotLog: false,
    plotTool: "cursor",
    plotZoom: 1,
    plotPan: 0,
    menuTrigger: null,
    drawerTrigger: null,
    activeCommandIndex: 0,
    commandScope: "All",
    activeDocuments: {},
    activeRunManifest: null,
    resultManifest: null,
    historicalResultManifests: null,
    cancelledRunManifest: null
  };

  state.resultManifest = createRunManifest({
    id: state.runId,
    status: "complete-review",
    analyses: state.resultAnalyses,
    analysisValues: effectiveAnalysisValues(state.resultAnalyses, {}),
    referenceCorner: state.resultCorner,
    inputRevision: BASE_INPUT_REVISION,
    startedAt: "2026-07-09T21:14:08.000Z",
    completedAt: "2026-07-09T21:14:36.420Z",
    durationSeconds: 28.42,
    estimatedDurationSeconds: 28.42
  });

  const run39BaseManifest = createRunManifest({
    id: 39,
    status: "complete-review",
    analyses: state.resultAnalyses,
    analysisValues: effectiveAnalysisValues(state.resultAnalyses, {}),
    referenceCorner: "SS · 125 °C",
    inputRevision: "6f19a83",
    startedAt: "2026-07-08T18:32:10.000Z",
    completedAt: "2026-07-08T18:32:12.140Z",
    durationSeconds: 2.14,
    estimatedDurationSeconds: 2.14
  });
  const run39TaskEntries = run39BaseManifest.taskGraph.entries.map((entry) => ({ ...entry, taskCount: 1, expansion: "SS · 125 °C diagnostic point" }));
  const run39Manifest = deepFreeze({
    ...run39BaseManifest,
    dataOrigin: "embedded-historical-reference-dataset",
    runSet: { ...run39BaseManifest.runSet, id: "diagnostic-ss-125", name: "SS / 125 °C diagnostic", dimensions: [{ id: "point", label: "Diagnostic point", values: ["SS · 125 °C"], combination: "single", reuse: "none" }], points: ["SS · 125 °C"], pointCount: 1, taskCount: run39TaskEntries.length },
    taskGraph: { entries: run39TaskEntries, total: run39TaskEntries.length }
  });
  const yieldAnalyses = new Set([...REQUIRED_NOMINAL_ANALYSES, "mc"]);
  const yieldBaseManifest = createRunManifest({
    id: "yield_1000",
    status: "complete-review",
    analyses: yieldAnalyses,
    analysisValues: effectiveAnalysisValues(yieldAnalyses, { mc: { 0: "1000", 2: "0x73A4" } }),
    referenceCorner: "5 process × 3 temperature",
    inputRevision: "fixture-mc-ref-17",
    startedAt: "2026-07-07T15:04:00.000Z",
    completedAt: "2026-07-07T15:18:28.000Z",
    durationSeconds: 868,
    estimatedDurationSeconds: 868,
    targetPlatform: "desktop"
  });
  const yieldRequirementGate = { required: true, evaluated: true, passed: false, mappingRevision: "req-17", mapped: 12, total: 14, detail: "12 / 14 historical requirements mapped in req-17; two mappings are absent" };
  const yieldGates = { ...yieldBaseManifest.qualification.gates, targetRuntime: { required: true, evaluated: true, passed: false, detail: "lab-hpc-west connector is a preview transport and cannot provide release evidence" }, requirementCoverage: yieldRequirementGate };
  const yieldManifest = deepFreeze({
    ...yieldBaseManifest,
    dataOrigin: "embedded-independent-verification-dataset",
    releaseProfile: { ...yieldBaseManifest.releaseProfile, id: "afe-release-0.9", requirementRevision: "req-17" },
    target: { platform: "remote-preview", runtime: "lab-hpc-west connector preview", releaseEligible: false },
    qualification: { ...yieldBaseManifest.qualification, targetEligible: false, technicalGatePassed: false, releaseEligible: false, signOffEligible: false, approvalStatus: "not approvable", gates: yieldGates }
  });
  state.historicalResultManifests = deepFreeze({ run39: run39Manifest, yield1000: yieldManifest });

  function currentPlanNetlistDigest() {
    const analyses = [...state.enabledAnalyses];
    const analysisValues = effectiveAnalysisValues(state.enabledAnalyses, state.analysisValues);
    const sourceDigests = canonicalObject(Object.fromEntries(Object.entries(state.sourceDrafts).map(([name, source]) => [name, mockDigest(String(source))])));
    const designNetlistDigest = generatedDesignNetlistDigest(state.inputRevision, sourceDigests);
    const runConfigurationDigest = mockDigest(JSON.stringify({ analyses, analysisValues, referenceCorner: state.planCorner }));
    return mockDigest(JSON.stringify({ designNetlistDigest, runConfigurationDigest }));
  }

  function specificationCount(analyses) {
    const weights = { op: 1, tran: 3, ac: 2, noise: 1, stb: 1, dc: 1, sens: 1, fourier: 2, pz: 1, xf: 1, mc: 3, temp: 2, corner: 4, pss: 2, hb: 2, sp: 2, pac: 1, pnoise: 1, pxf: 1, pstb: 1, envelope: 1, reliability: 2, opt: 2, soa: 2, disto: 2 };
    return [...analyses].reduce((total, analysis) => total + (weights[analysis] || 0), 0);
  }

  function firstResultMode(analyses) {
    if (analyses.has("tran")) return "waves";
    if (analyses.has("ac")) return "bode";
    if (analyses.has("noise")) return "noise";
    if (analyses.has("op")) return "op";
    if (analyses.has("stb")) return "nyquist";
    if (analyses.has("dc")) return "dc";
    if (analyses.has("sens")) return "sens";
    if (analyses.has("fourier")) return "fft";
    if (analyses.has("mc") || analyses.has("corner")) return "hist";
    if (analyses.has("sp")) return "smith";
    if (analyses.has("pz")) return "pz";
    if (analyses.has("hb")) return "hb";
    if (analyses.has("pnoise")) return "phase-noise";
    return "specs";
  }

  function manifestRevision(manifest = state.resultManifest) {
    return manifest?.inputRevision || state.inputRevision;
  }

  function failedQualificationGates(manifest = state.resultManifest) {
    const labels = { engineReadiness: "engine readiness", targetRuntime: "target runtime", modelQualification: "model qualification", requirementCoverage: "requirement mapping", nominalSpecifications: "nominal executable checks", monteCarloYield: "Monte Carlo yield evidence", regression: "regression evidence", safeOperatingArea: "safe-operating-area evidence" };
    return Object.entries(manifest?.qualification?.gates || {}).filter(([, gate]) => !gate.passed).map(([name]) => labels[name] || name);
  }

  function resultEligibilityCopy(manifest = state.resultManifest) {
    if (manifest?.qualification?.signOffEligible) return "sign-off eligible";
    if (!manifest?.qualification?.engineEligible || !manifest?.qualification?.targetEligible) return "preview / non-sign-off";
    const failed = failedQualificationGates(manifest);
    if (!manifest?.qualification?.modelEligible && failed.length === 1) return "review required · model qualification";
    return failed.length ? `review required · ${failed.length} gate${failed.length === 1 ? "" : "s"}` : "review required";
  }

  function manifestRunSetLabel(manifest = state.resultManifest) {
    if (!manifest) return `${PVT_RUN_POINTS.length} PVT points`;
    return `${manifest.runSet.pointCount} PVT points · ${manifest.runSet.taskCount} tasks`;
  }

  function syncWorkspaceStateChrome() {
    const projectState = $(".project-state");
    if (projectState) {
      projectState.classList.toggle("dirty", state.dirty);
      projectState.title = state.dirty ? `Unsaved changes · working revision ${state.inputRevision} · autosave protected` : "All changes saved";
      projectState.setAttribute("aria-label", state.dirty ? `Unsaved changes in working revision ${state.inputRevision}; autosave protected` : "All changes saved");
    }
    const checkStatus = $(".status-left .status-item:first-child");
    if (checkStatus) {
      const icon = $(".status-icon", checkStatus);
      const copy = $("span:last-child", checkStatus);
      if (icon) { icon.textContent = state.checksCurrent ? "✓" : "△"; icon.classList.toggle("ok", state.checksCurrent); icon.style.color = state.checksCurrent ? "" : "var(--warn)"; }
      if (copy) copy.textContent = state.checksCurrent ? "Schematic checks · 0 errors · 2 advisories" : "Schematic checks stale · 2 prior advisories";
      checkStatus.title = state.checksCurrent ? `Schematic checks are current for revision ${state.inputRevision}` : `Schematic checks must be rerun for working revision ${state.inputRevision}`;
    }
    const canvasCheck = $("#schematic-check-note");
    if (canvasCheck) canvasCheck.innerHTML = !state.checksCurrent ? "<span>△</span><span>Schematic checks stale · run preflight</span>" : state.resultsStale ? `<span>△</span><span>Checks current · Run ${state.runId} annotations historical</span>` : "<span>✓</span><span>Checks and annotations current</span>";
    const inspectorBadge = $("#inspector-check-badge");
    if (inspectorBadge) {
      inspectorBadge.className = `mini-badge ${state.checksCurrent ? "ok" : "warn"}`;
      inspectorBadge.textContent = state.checksCurrent ? "0 errors" : "stale";
    }
    const inspectorCheckState = $("#inspector-check-state");
    if (inspectorCheckState) {
      inspectorCheckState.className = `property-value ${state.checksCurrent ? "ok-text" : "warn-text"}`;
      inspectorCheckState.textContent = state.checksCurrent ? `✓ revision ${state.inputRevision}` : `△ rerun for ${state.inputRevision}`;
    }
    if (state.dirty && $("#title-cell") && !$("#title-cell").textContent.includes("modified")) $("#title-cell").textContent += " · modified";
  }

  function markWorkspaceChanged({ checksStale = true, planStale = true } = {}) {
    state.editSequence += 1;
    state.inputRevision = `${BASE_INPUT_REVISION}+w${state.editSequence.toString(16).padStart(3, "0")}`;
    state.dirty = true;
    state.resultsStale = true;
    state.newResults = false;
    if (checksStale) state.checksCurrent = false;
    if (planStale) state.planValidated = false;
    const generatedNetlistCommand = commandItems.find((item) => item.title === "Open generated netlist");
    if (generatedNetlistCommand) generatedNetlistCommand.detail = `top.sp · working revision ${state.inputRevision}`;
    syncWorkspaceStateChrome();
  }

  const viewMeta = {
    project: { title: "Project overview", icon: "home" },
    design: { title: "top · schematic", icon: "schematic" },
    simulate: { title: "Lab characterization · setup", icon: "simulate" },
    results: { title: "Results", icon: "waveform" },
    verify: { title: "Verification", icon: "verify" },
    models: { title: "Models & PDKs", icon: "library" },
    netlist: { title: "top.sp · generated", icon: "code" }
  };

  const docSets = {
    project: [
      { name: "Project overview", icon: "home", active: true }
    ],
    design: [
      { name: "top · schematic", icon: "schematic", active: true, dirty: true },
      { name: "afe_core · schematic", icon: "schematic" },
      { name: "OPA189 · symbol", icon: "component" }
    ],
    simulate: [
      { name: "Lab characterization", icon: "simulate", active: true },
      { name: "transient_setup", icon: "sliders" },
      { name: "ac_stability", icon: "sliders" }
    ],
    results: [
      { name: "Run 41 · nominal", icon: "waveform", active: true },
      { name: "Run 39 · SS/125 °C", icon: "waveform" },
      { name: "yield_1000", icon: "chart" }
    ],
    verify: [
      { name: "Verification", icon: "verify", active: true },
      { name: "Physical DRC · Run 42", icon: "layers" },
      { name: "Optimization · #18", icon: "target" },
      { name: "Regression · main", icon: "compare" }
    ],
    models: [
      { name: "Model & PDK Manager", icon: "library", active: true },
      { name: "OPA189.lib", icon: "file" },
      { name: "bsim4.va", icon: "code" }
    ],
    netlist: [
      { name: "top.sp", icon: "code", active: true },
      { name: "models.lib", icon: "file" },
      { name: "generated.diff", icon: "compare" }
    ]
  };

  const VERIFY_MODE_BY_DOCUMENT = Object.freeze({
    "Verification": "yield",
    "Physical DRC · Run 42": "drc",
    "Optimization · #18": "optimization",
    "Regression · main": "regression"
  });

  const MODEL_BY_DOCUMENT = Object.freeze({
    "OPA189.lib": "OPA189_A",
    "bsim4.va": "BSIM4_4.8.2"
  });

  const MODEL_ROWS = deepFreeze([
    ["OPA189_A", "Op-amp macro", "OPA189.lib", "vendor_analog", "typical / min / max", "32 / 32", "qualified"],
    ["BSIM4_4.8.2", "MOSFET · L14/54", "built-in", "RSpice", "canonical modes", "418 / 423", "review"],
    ["VBIC_1.3", "BJT · L4/9/11/12/13", "vbic_1p3.va", "CMC", "generated Rust", "88 / 88", "qualified"],
    ["HICUM_L2", "BJT compact", "hicumL2.va", "CMC", "generated Rust", "61 / 64", "review"],
    ["demo180_nch", "NMOS · BSIM4", "demo180_tt.lib", "demo180 PDK", "tt / ff / ss / fs / sf", "120 / 120", "review"],
    ["sensor_bridge", "Verilog-A", "sensor_bridge.va", "project", "interpreter release / JIT preview", "7 / 8", "review"],
    ["LTRA", "Lossy line", "built-in", "RSpice", "native", "24 / 24", "qualified"],
    ["GaN_HEMT", "Physics HEMT", "built-in", "RSpice", "native", "19 / 24", "experimental"]
  ]);

  const DRC_MARKERS = deepFreeze([
    { id: "DRC-0042", index: "042", rule: "M2.SP.3", title: "Minimum Metal2 spacing", severity: "error", status: "open", measured: "0.142 µm", required: "≥ 0.160 µm", delta: "−0.018 µm", layer: "M2", cell: "afe_core", path: "/top/XAFE/M14", bbox: "124.840, 88.120 · 125.420, 88.780 µm", x: 53, y: 39 },
    { id: "DRC-0038", index: "038", rule: "M2.SP.3", title: "Minimum Metal2 spacing", severity: "error", status: "open", measured: "0.148 µm", required: "≥ 0.160 µm", delta: "−0.012 µm", layer: "M2", cell: "afe_core", path: "/top/XAFE/M12", bbox: "118.210, 76.540 · 118.840, 77.130 µm", x: 42, y: 28 },
    { id: "DRC-0012", index: "012", rule: "VIA1.EN.2", title: "Metal1 enclosure of Via1", severity: "error", status: "open", measured: "0.031 µm", required: "≥ 0.040 µm", delta: "−0.009 µm", layer: "VIA1 / M1", cell: "afe_core", path: "/top/XAFE/XBIAS/M3", bbox: "141.020, 102.880 · 141.360, 103.220 µm", x: 68, y: 58 },
    { id: "DRC-0007", index: "007", rule: "NWELL.SP.1", title: "N-well spacing", severity: "warn", status: "review", measured: "1.76 µm", required: "≥ 1.80 µm", delta: "−0.04 µm", layer: "NWELL", cell: "top", path: "/top/XOUT", bbox: "92.400, 64.200 · 101.600, 72.800 µm", x: 29, y: 67 },
    { id: "DRC-0001", index: "001", rule: "DENS.M4.1", title: "Metal4 local density", severity: "warn", status: "waived", measured: "19.6 %", required: "≥ 20.0 %", delta: "−0.4 %", layer: "M4", cell: "top", path: "/top/keepout_analog", bbox: "40.000, 28.000 · 80.000, 68.000 µm", x: 18, y: 21 }
  ]);

  function activateDocument(view, name) {
    state.activeDocuments[view] = name;
    if (view === "verify" && VERIFY_MODE_BY_DOCUMENT[name]) state.verifyMode = VERIFY_MODE_BY_DOCUMENT[name];
    if (view === "models" && MODEL_BY_DOCUMENT[name]) state.selectedModel = MODEL_BY_DOCUMENT[name];
  }

  function modelBrowserGroup(modelId) {
    if (modelId === "OPA189_A") return "OPA189_A";
    if (modelId === "sensor_bridge") return "sensor_bridge";
    if (modelId === "VBIC_1.3" || modelId === "HICUM_L2") return "bjt";
    if (modelId === "LTRA") return "passives";
    if (modelId === "demo180_nch") return "demo180";
    return "mos";
  }

  function resolvedDocuments(view) {
    return (docSets[view] || []).map((doc, index) => view === "results" && index === 0 ? { ...doc, name: `Run ${state.runId} · PVT ${state.resultManifest?.runSet.pointCount || PVT_RUN_POINTS.length}` } : { ...doc });
  }

  const analysisCatalog = [
    { id: "op", code: "OP", title: "Operating point", kind: "solver", category: "Core analyses", availability: "production", detail: "Bias solution · annotations · device operating points" },
    { id: "tran", code: "TRAN", title: "Transient", kind: "solver", category: "Core analyses", availability: "production", detail: "Adaptive time-domain integration and checkpoints" },
    { id: "ac", code: "AC", title: "AC response", kind: "solver", category: "Core analyses", availability: "production", detail: "Linearized complex frequency sweep" },
    { id: "dc", code: "DC", title: "DC sweep", kind: "solver", category: "Core analyses", availability: "production", detail: "Single, nested and list parameter sweeps" },
    { id: "noise", code: "NOISE", title: "Noise", kind: "solver", category: "Core analyses", availability: "production", detail: "Output, input-referred and contributor noise" },
    { id: "pz", code: "PZ", title: "Pole-zero", kind: "solver", category: "Transfer & linearization", availability: "production", detail: "Poles, zeros or combined extraction" },
    { id: "sens", code: "SENS", title: "Sensitivity", kind: "solver", category: "Transfer & linearization", availability: "production", detail: "Direct and adjoint parameter sensitivity" },
    { id: "stb", code: "STB", title: "Loop stability", kind: "solver", category: "Transfer & linearization", availability: "production", detail: "Loop gain, gain margin and phase margin" },
    { id: "xf", code: "XF", title: "Transfer function", kind: "solver", category: "Transfer & linearization", availability: "production", detail: "DC transfer, input and output resistance" },
    { id: "pss", code: "PSS", title: "Periodic steady state", kind: "solver", category: "RF & periodic solvers", availability: "production", detail: "Shooting-method autonomous or driven periodic solve" },
    { id: "hb", code: "HB", title: "Harmonic balance", kind: "solver", category: "RF & periodic solvers", availability: "production", detail: "Multi-tone frequency-domain nonlinear solve" },
    { id: "sp", code: "SP", title: "S-parameters", kind: "solver", category: "RF & periodic solvers", availability: "production", detail: "Multiport network analysis, de-embedding and Touchstone export" },
    { id: "envelope", code: "ENV", title: "Envelope", kind: "solver", category: "RF & periodic solvers", availability: "preview", detail: "Slow-envelope kernel; circuit extraction in preview" },
    { id: "pac", code: "PAC", title: "Periodic AC", kind: "solver", category: "Periodic small-signal solvers", availability: "preview", detail: "Conversion-matrix kernel; extraction path in preview" },
    { id: "pnoise", code: "PNOISE", title: "Periodic noise", kind: "solver", category: "Periodic small-signal solvers", availability: "preview", detail: "Cyclostationary noise kernel; extraction path in preview" },
    { id: "pxf", code: "PXF", title: "Periodic transfer", kind: "solver", category: "Periodic small-signal solvers", availability: "preview", detail: "Periodic transfer kernel; extraction path in preview" },
    { id: "pstb", code: "PSTB", title: "Periodic stability", kind: "solver", category: "Periodic small-signal solvers", availability: "preview", detail: "Monodromy stability path with explicit prerequisites" },
    { id: "mc", code: "MC", title: "Monte Carlo", kind: "sweep", category: "Sweeps & variation", availability: "production", detail: "Process, mismatch, distributions and correlations" },
    { id: "temp", code: "TEMP", title: "Temperature sweep", kind: "sweep", category: "Sweeps & variation", availability: "production", detail: "Temperature dimension with warm-start policy" },
    { id: "corner", code: "CORNER", title: "Process corners", kind: "sweep", category: "Sweeps & variation", availability: "production", detail: "Model-section and environment combinations" },
    { id: "fourier", code: "FOUR", title: "Fourier measurements", kind: "measurement", category: "Measurements & post-processing", availability: "production", detail: "Harmonics, THD, SINAD, SFDR and ENOB from a compatible dataset" },
    { id: "disto", code: "DISTO", title: "Distortion compatibility", kind: "measurement", category: "Measurements & post-processing", availability: "compat", detail: "AC compatibility plus THD/IMD post-processing" },
    { id: "reliability", code: "REL", title: "Reliability & aging", kind: "verification", category: "Verification checks", availability: "preview", detail: "Mission profile and aging projection; electrical SOA remains the production sign-off path" },
    { id: "soa", code: "SOA", title: "Safe operating area", kind: "verification", category: "Verification checks", availability: "production", detail: "Device stress rules and cross-probed violations" },
    { id: "opt", code: "OPT", title: "Optimization", kind: "optimization", category: "Optimization workflows", availability: "production", detail: "Variables, goals, constraints and candidate history" }
  ];

  const analysisKindLabels = Object.freeze({
    solver: "Numerical solver",
    sweep: "Run-set controller",
    measurement: "Derived measurement",
    verification: "Verification workspace",
    optimization: "Optimization workspace"
  });

  function analysisDefinition(id) {
    return analysisCatalog.find((analysis) => analysis.id === id) || analysisCatalog[1];
  }

  function analysisAvailabilityLabel(availability) {
    return availability === "production" ? "engine · release" : availability === "preview" ? "engine · preview" : "engine · compatibility";
  }

  const RESULT_VIEWERS = [
    ["waves", "waveform", "Waves", ["tran"]], ["bode", "chart", "Bode", ["ac"]], ["dc", "chart", "DC Sweep", ["dc"]],
    ["sens", "chart", "Sensitivity", ["sens"]], ["fft", "chart", "FFT", ["fourier", "tran"]], ["eye", "target", "Eye", ["tran"]],
    ["hist", "chart", "Histogram", ["mc", "corner"]], ["op", "cells", "OP", ["op"]], ["noise", "waveform", "Noise", ["noise"]],
    ["specs", "verify", "Specs", null], ["nyquist", "target", "Nyquist", ["stb"]], ["smith", "target", "Smith", ["sp"]],
    ["pz", "target", "PZ", ["pz"]], ["hb", "chart", "HB Tones", ["hb"]], ["phase-noise", "waveform", "Phase Noise", ["pnoise"]]
  ];

  const commandItems = [
    { group: "Navigate", icon: "simulate", title: "Open Simulation Studio", detail: "Configure analyses, outputs, PVT and solver options", view: "simulate", keys: "Alt+3" },
    { group: "Navigate", icon: "waveform", title: "Open Waveform Results", detail: "Run 41 · nominal · 27 saved signals", view: "results", keys: "Alt+4" },
    { group: "Navigate", icon: "verify", title: "Open Yield Dashboard", detail: "reference fixture · 98.6% yield · below 99% gate", action: "open-yield", keys: "Alt+5" },
    { group: "Navigate", icon: "layers", title: "Open Physical DRC", detail: "Run 42 · 26 markers · 23 blocking · layout L42", action: "open-drc" },
    { group: "Commands", icon: "play", title: "Run Lab characterization", detail: "8 enabled analyses · nominal PVT set", action: "start-run", keys: "F5" },
    { group: "Commands", icon: "component", title: "Place resistor", detail: "primitives / analog / resistor", view: "design", action: "place-resistor", keys: "R" },
    { group: "Commands", icon: "check", title: "Run schematic checks", detail: "Connectivity, floating nodes, parameters and safe operating area", action: "check", keys: "Ctrl+E" },
    { group: "Commands", icon: "code", title: "Compile Verilog-A model", detail: "Semantic diagnostics, interpreted runtime and native JIT availability", action: "veriloga" },
    { group: "Commands", icon: "waveform", title: "Open PWL source editor", detail: "Point table, interpolation, file import and waveform preview", action: "pwl" },
    { group: "Commands", icon: "tune", title: "Open parameter tuner", detail: "Live nominal sandbox with explicit commit and revert", action: "tuning" },
    { group: "Commands", icon: "terminal", title: "Open automation console", detail: "Script run plans, batch exports and reproducible reports", action: "automation" },
    { group: "Commands", icon: "target", title: "Open waveform calculator", detail: "Expressions, functions, interpolation and unit validation", action: "calculator" },
    { group: "Commands", icon: "export", title: "Import Cadence PSF dataset", detail: "PSF, Nutmeg RAW, CSV/TSV and Touchstone readers", action: "import" },
    { group: "Design", icon: "schematic", title: "Go to /top/U1", detail: "OPA189 · precision operational amplifier", action: "select-u1" },
    { group: "Design", icon: "code", title: "Open generated netlist", detail: "top.sp · revision 7c49d2b", action: "generated-netlist", keys: "Ctrl+L" },
    { group: "Models", icon: "library", title: "Browse OPA189 model", detail: "vendor_analog / opamps / OPA189", view: "models" },
    { group: "Signals", icon: "waveform", title: "V(afe_out)", detail: "Run 41 / tran · plotted · latest 5.000 V", view: "results" },
    { group: "Signals", icon: "waveform", title: "I(VDD)", detail: "Run 41 / tran · plotted · latest 1.823 mA", view: "results" },
    { group: "Help", icon: "help", title: "Simulation convergence guide", detail: "Troubleshoot Newton, source stepping and transient LTE", action: "help" }
  ];

  const menuDefinitions = {
    file: [
      ["folder", "Open project…", "Ctrl+O", "open-project"], ["file", "New project…", "Ctrl+Shift+N", "new-project"], ["history", "Open recent", "›", "recent-projects"], "-",
      ["save", "Save", "Ctrl+S", "save-project"], ["save", "Save all", "Ctrl+Shift+S", "save-all"], ["refresh", "Recover autosave…", "", "recovery"], "-",
      ["export", "Import design or project…", "", "import-project"], ["export", "Export project archive…", "", "export-project"], ["more", "Project settings…", "", "project-settings"]
    ],
    edit: [["undo", "Undo last schematic change", "Ctrl+Z", "undo"], ["redo", "Redo", "Ctrl+Shift+Z", "redo"], "-", ["copy", "Copy selection", "Ctrl+C", "copy-selection"], ["copy", "Paste", "Ctrl+V", "paste-selection"], ["search", "Find in design…", "Ctrl+F", "find-design"], ["settings", "Preferences…", "Ctrl+,", "preferences"]],
    view: [["panel-left", "Toggle navigator", "Ctrl+B", "toggle-navigator"], ["panel-right", "Toggle inspector", "Ctrl+I", "toggle-inspector"], ["terminal", "Toggle console", "Ctrl+J", "console"], ["fit", "Focus workspace", "Ctrl+Shift+F", "toggle-focus-mode"], "-", ["fit", "Zoom to fit", "F", "fit-canvas"], ["grid", "Canvas grid", "G", "toggle-grid"]],
    place: [["component", "Instance…", "Shift+I", "place-instance"], ["wire", "Wire", "W", "place-wire"], ["bus", "Bus", "B", "place-bus"], ["label", "Net label", "N", "place-label"], ["probe", "Probe", "P", "place-probe"], "-", ["folder", "Create hierarchy", "H", "create-hierarchy"]],
    simulate: [["play", "Run active plan", "F5", "start-run"], ["stop", "Stop active run", "Shift+F5", "stop-run"], ["check", "Preflight checks", "Ctrl+E", "check"], "-", ["simulate", "Simulation Studio", "Alt+3", "simulate"], ["history", "All jobs & targets", "", "jobs"], ["sliders", "Global solver options…", "", "solver"]],
    analyze: [["waveform", "Waveforms", "Alt+4", "waveforms"], ["chart", "New visualization…", "Ctrl+P", "new-plot"], ["target", "Calculator…", "", "calculator"], "-", ["export", "Export dataset…", "", "export-results"], ["compare", "Compare runs…", "", "compare-datasets"], ["export", "Import result dataset…", "", "import-dataset"]],
    verify: [["verify", "PVT & yield", "Alt+5", "yield"], ["layers", "Physical DRC", "", "open-drc"], ["target", "Optimization", "", "optimization"], ["compare", "Regression plan", "", "regression"], ["check", "Specification matrix", "", "specifications"], "-", ["export", "Generate report…", "", "generate-report"]],
    tools: [["library", "Model & PDK Manager", "", "models"], ["code", "Verilog-A compiler", "", "veriloga"], ["terminal", "Automation console", "Ctrl+`", "automation"], ["waveform", "PWL source editor", "", "pwl"], ["tune", "Parameter tuner", "", "tuning"]],
    overflow: [["waveform", "Analyze results", "", "results"], ["verify", "Verification", "", "verify"], ["library", "Models & PDKs", "", "models"], ["terminal", "Automation", "", "automation"], ["history", "Jobs & targets", "", "jobs"], ["help", "RSpice Help", "F1", "help-center"]],
    help: [["help", "RSpice Help", "F1", "help-center"], ["search", "Command reference", "", "command-reference"], ["info", "Feature availability", "", "feature-availability"], ["terminal", "Create support bundle…", "", "support-bundle"], "-", ["info", "About RSpice", "", "about"]]
  };

  function toolButton(icon, label, active = false, text = false, action = "") {
    return `<button class="${text ? "tool-text-button" : "tool-button"}${active ? " active" : ""}" type="button" title="${label}" aria-label="${label}"${action ? ` data-toolbar-action="${action}"` : ""}>${iconSvg(icon)}${text ? `<span>${label}</span>` : ""}</button>`;
  }

  function workspaceToolbarTools() {
    return `<span class="tool-separator workspace-tool-separator"></span>${toolButton("fit", state.workspaceFocus ? "Restore workspace layout (Ctrl+Shift+F)" : "Focus workspace (Ctrl+Shift+F)", state.workspaceFocus, false, "toggle-focus-mode")}`;
  }

  function toolbarForView(view) {
    if (view === "design") {
      return [
        toolButton("pointer", "Select (Esc)", state.canvasTool === "select", false, "canvas-select"), toolButton("wire", "Draw wire (W)", state.canvasTool === "wire", false, "canvas-wire"), toolButton("bus", "Draw bus (B)", state.canvasTool === "bus", false, "canvas-bus"), toolButton("label", "Net label (N)", state.canvasTool === "label", false, "canvas-label"), toolButton("probe", "Probe signal (P)", state.canvasTool === "probe", false, "canvas-probe"),
        '<span class="tool-separator"></span>', toolButton("rotate", "Rotate clockwise (R)", false, false, "rotate-selection"), toolButton("mirror", "Mirror (M)", false, false, "mirror-selection"),
        '<span class="tool-separator"></span>', toolButton("undo", "Undo (Ctrl+Z)", false, false, "undo"), toolButton("redo", "Redo (Ctrl+Shift+Z)", false, false, "redo"),
        '<span class="tool-separator"></span>', toolButton("zoomout", "Zoom out (-)", false, false, "canvas-zoom-out"), toolButton("zoomin", "Zoom in (+)", false, false, "canvas-zoom-in"), toolButton("fit", "Zoom to fit (F)", false, false, "canvas-fit"), toolButton("grid", "Grid and snap", state.canvasGrid, false, "toggle-grid"), toolButton("check", "Run schematic checks (Ctrl+E)", false, true, "run-checks")
      ].join("");
    }
    if (view === "simulate") return [toolButton("plus", "Add analysis", false, true, "add-analysis"), toolButton("copy", "Duplicate analysis", false, false, "duplicate-analysis"), toolButton("sliders", "Global solver options", false, false, "open-solver"), '<span class="tool-separator"></span>', toolButton("check", "Run preflight", false, true, "run-preflight"), toolButton("history", "Jobs and run history", false, false, "open-jobs")].join("");
    if (view === "results") {
      const activeResultName = state.activeDocuments.results || resolvedDocuments("results")[0]?.name || "";
      const historicalDocument = resultDatasetForName(activeResultName).manifest !== state.resultManifest;
      if (historicalDocument) return [toolButton("plus", "Create plot from this dataset", false, true, "new-plot"), toolButton("compare", "Compare datasets", false, false, "compare-datasets"), '<span class="tool-separator"></span>', toolButton("export", "Export this dataset", false, true, "export-results")].join("");
      return [toolButton("plus", "New plot", false, true, "new-plot"), toolButton("waveform", "Add trace", false, false, "add-trace"), toolButton("target", "Calculator", false, false, "calculator"), toolButton("compare", "Compare datasets", false, false, "compare-datasets"), '<span class="tool-separator"></span>', toolButton("export", "Export visible data", false, true, "export-results")].join("");
    }
    if (view === "verify" && state.verifyMode === "drc") return [toolButton("play", "Run physical DRC", false, true, "run-drc"), toolButton("refresh", "Incremental rerun", false, false, "rerun-drc"), '<span class="tool-separator"></span>', toolButton("arrow-left", "Previous marker", false, false, "drc-previous"), toolButton("arrow-right", "Next marker", false, false, "drc-next"), toolButton("fit", "Fit selected marker", false, false, "drc-fit"), '<span class="tool-separator"></span>', toolButton("compare", "Compare DRC runs", false, false, "compare-drc"), toolButton("export", "Export DRC sign-off package", false, true, "export-drc")].join("");
    if (view === "verify") return [toolButton("play", "Run verification plan", false, true, "run-verification"), toolButton("refresh", "Refresh statistics", false, false, "refresh-verification"), toolButton("compare", "Compare baseline", false, false, "compare-baseline"), '<span class="tool-separator"></span>', toolButton("target", "Add specification", false, false, "add-specification"), toolButton("export", "Generate report", false, false, "generate-report")].join("");
    if (view === "models") return [toolButton("plus", "Add library", false, true, "add-library"), toolButton("refresh", "Rescan libraries", false, false, "rescan-libraries"), toolButton("check", "Validate models", false, false, "validate-models"), '<span class="tool-separator"></span>', toolButton("code", "Compile Verilog-A", false, false, "compile-veriloga"), toolButton("export", "Export manifest", false, false, "export-manifest")].join("");
    if (view === "netlist") return [toolButton("save", "Save source deck", false, true, "save-source"), toolButton("search", "Find / replace", false, false, "find-netlist"), toolButton("check", "Validate netlist", false, false, "validate-netlist"), '<span class="tool-separator"></span>', toolButton("compare", "Diff against generated", false, false, "diff-generated"), toolButton("play", "Run this source deck", false, false, "run-source")].join("");
    return [toolButton("folder", "Open project", false, true, "open-project"), toolButton("plus", "New cell", false, true, "new-cell"), toolButton("refresh", "Refresh project", false, false, "refresh-project")].join("");
  }

  function panelHeader(title, actions = false) {
    return `<div class="panel-head"><h2>${title}</h2>${actions ? `<div class="panel-actions"><button class="icon-button" type="button" title="Panel options" aria-label="Panel options">${iconSvg("more")}</button></div>` : ""}</div>`;
  }

  function searchBox(placeholder) {
    return `<label class="panel-search">${iconSvg("search")}<input type="search" placeholder="${placeholder}" aria-label="${placeholder}"></label>`;
  }

  function leftPanelForView(view) {
    if (view === "design") {
      const componentLabel = (id, fallbackRef, fallbackValue) => {
        const edits = state.componentEdits[id] || {};
        return { ref: escapeHtml(edits.instance || fallbackRef), value: escapeHtml(edits.value || fallbackValue) };
      };
      const u1 = componentLabel("U1", "U1", "OPA189");
      const u2 = componentLabel("U2", "U2", "OPA189");
      const u3 = componentLabel("U3", "U3", "OPA2189");
      const navigator = `
        ${searchBox("Find instance, net or port…")}
        <div class="hierarchy-path">/ Precision_Sensor_AFE / top</div>
        <div class="panel-section">
          <div class="section-head"><span class="tree-caret">⌄</span><span class="grow">Hierarchy</span><span class="mini-badge">3 sheets</span></div>
          <div class="tree">
            <button class="tree-row selected" type="button"><span class="tree-caret">⌄</span>${iconSvg("schematic")}<span class="label">top</span><span class="tree-meta">schematic</span></button>
            <button class="tree-row level-1" type="button"><span class="tree-caret">›</span>${iconSvg("cells")}<span class="label">XAFE · afe_core</span><span class="tree-meta">14</span></button>
            <button class="tree-row level-1" type="button" data-select-component="U1"><span class="tree-caret"></span>${iconSvg("component")}<span class="label">${u1.ref} · ${u1.value}</span></button>
            <button class="tree-row level-1" type="button" data-select-component="U2"><span class="tree-caret"></span>${iconSvg("component")}<span class="label">${u2.ref} · ${u2.value}</span></button>
            <button class="tree-row level-1" type="button" data-select-component="U3"><span class="tree-caret"></span>${iconSvg("component")}<span class="label">${u3.ref} · ${u3.value}</span></button>
          </div>
        </div>
        <div class="panel-section">
          <div class="section-head"><span class="tree-caret">⌄</span><span class="grow">Nets</span><span class="mini-badge">27</span></div>
          <div class="tree">
            <button class="tree-row level-1" type="button"><span class="tree-caret"></span><span class="tree-icon" style="color:var(--wire)">━</span><span class="label mono">sensor_p</span><span class="tree-meta">3</span></button>
            <button class="tree-row level-1" type="button"><span class="tree-caret"></span><span class="tree-icon" style="color:var(--wire)">━</span><span class="label mono">sensor_n</span><span class="tree-meta">3</span></button>
            <button class="tree-row level-1" type="button"><span class="tree-caret"></span><span class="tree-icon" style="color:var(--wire)">━</span><span class="label mono">afe_out</span><span class="tree-meta">4</span></button>
            <button class="tree-row level-1" type="button"><span class="tree-caret"></span><span class="tree-icon" style="color:var(--net-label)">◆</span><span class="label mono">vref_2v5</span><span class="tree-meta">6</span></button>
          </div>
        </div>
        <div class="panel-section">
          <div class="section-head"><span class="tree-caret">⌄</span><span class="grow">Ports</span><span class="mini-badge">6</span></div>
          <div class="tree">
            <button class="tree-row level-1" type="button"><span class="tree-caret"></span><span class="tree-icon">→</span><span class="label mono">SENSOR_P</span><span class="tree-meta">in</span></button>
            <button class="tree-row level-1" type="button"><span class="tree-caret"></span><span class="tree-icon">→</span><span class="label mono">SENSOR_N</span><span class="tree-meta">in</span></button>
            <button class="tree-row level-1" type="button"><span class="tree-caret"></span><span class="tree-icon">←</span><span class="label mono">AFE_OUT</span><span class="tree-meta">out</span></button>
          </div>
        </div>`;

      const shelf = `
        ${searchBox("Place component or cell…")}
        <div class="panel-section"><div class="section-head"><span class="grow">Pinned</span><span class="tree-meta">Shift+I</span></div>
          <div class="place-strip"><button class="place-chip"><span class="part-glyph">R</span>Resistor</button><button class="place-chip"><span class="part-glyph">C</span>Capacitor</button><button class="place-chip"><span class="part-glyph">⏚</span>Ground</button></div>
        </div>
        <div class="panel-section"><div class="section-head"><span class="tree-caret">⌄</span><span class="grow">Primitives</span><span class="mini-badge">70</span></div>
          <div class="tree"><button class="tree-row level-1"><span class="tree-caret">›</span><span class="part-glyph">—</span><span class="label">Passives</span><span class="tree-meta">8</span></button><button class="tree-row level-1"><span class="tree-caret">›</span><span class="part-glyph">◯</span><span class="label">Sources</span><span class="tree-meta">18</span></button><button class="tree-row level-1"><span class="tree-caret">›</span><span class="part-glyph">▷</span><span class="label">Analog</span><span class="tree-meta">21</span></button><button class="tree-row level-1"><span class="tree-caret">›</span><span class="part-glyph">⊞</span><span class="label">Mixed signal / XSPICE</span><span class="tree-meta">23</span></button></div>
        </div>
        <div class="panel-section"><div class="section-head"><span class="tree-caret">⌄</span><span class="grow">Project library</span></div>
          <div class="tree"><button class="tree-row level-1"><span class="tree-caret">›</span>${iconSvg("cells")}<span class="label">analog_blocks</span><span class="tree-meta">12</span></button><button class="tree-row level-1"><span class="tree-caret">›</span>${iconSvg("cells")}<span class="label">sensor_afe</span><span class="tree-meta">8</span></button></div>
        </div>`;

      return `${panelHeader("Design navigator")}<div class="panel-tabs" role="tablist" aria-label="Design navigator mode"><button type="button" role="tab" data-design-left="navigator" aria-selected="${state.designLeft === "navigator"}" aria-controls="design-left-panel" tabindex="${state.designLeft === "navigator" ? "0" : "-1"}" class="${state.designLeft === "navigator" ? "active" : ""}">Navigator</button><button type="button" role="tab" data-design-left="shelf" aria-selected="${state.designLeft === "shelf"}" aria-controls="design-left-panel" tabindex="${state.designLeft === "shelf" ? "0" : "-1"}" class="${state.designLeft === "shelf" ? "active" : ""}">Component shelf</button></div><div id="design-left-panel" role="tabpanel">${state.designLeft === "navigator" ? navigator : shelf}</div>`;
    }

    if (view === "project") return `${panelHeader("Project library")}${searchBox("Filter libraries, cells, views…")}
      <div class="panel-tabs" role="navigation" aria-label="Project browser pages"><button class="${(state.projectSection || "dashboard") === "dashboard" ? "active" : ""}" data-project-section="dashboard" aria-current="${(state.projectSection || "dashboard") === "dashboard" ? "page" : "false"}">Library</button><button class="${["config", "technology", "dependencies"].includes(state.projectSection) ? "active" : ""}" data-project-section="config" aria-current="${["config", "technology", "dependencies"].includes(state.projectSection) ? "page" : "false"}">Configuration</button><button class="${state.projectSection === "recovery" ? "active" : ""}" data-project-section="recovery" aria-current="${state.projectSection === "recovery" ? "page" : "false"}">Recovery</button></div>
      <div class="tree">
        <button class="tree-row selected"><span class="tree-caret">⌄</span>${iconSvg("folder")}<span class="label">Precision_Sensor_AFE</span><span class="mini-badge ok">writable</span></button>
        <button class="tree-row level-1"><span class="tree-caret">⌄</span>${iconSvg("cells")}<span class="label">sensor_afe</span><span class="tree-meta">8</span></button>
        <button class="tree-row level-2"><span class="tree-caret">⌄</span>${iconSvg("component")}<span class="label">top</span></button>
        <button class="tree-row level-3 selected"><span class="tree-caret"></span>${iconSvg("schematic")}<span class="label">schematic</span></button>
        <button class="tree-row level-3"><span class="tree-caret"></span>${iconSvg("component")}<span class="label">symbol</span></button>
        <button class="tree-row level-2"><span class="tree-caret">›</span>${iconSvg("component")}<span class="label">afe_core</span></button>
        <button class="tree-row level-1"><span class="tree-caret">›</span>${iconSvg("cells")}<span class="label">analog_blocks</span><span class="tree-meta">12</span></button>
        <button class="tree-row"><span class="tree-caret">›</span>${iconSvg("lock")}<span class="label">primitives</span><span class="mini-badge">read-only</span></button>
        <button class="tree-row"><span class="tree-caret">›</span>${iconSvg("lock")}<span class="label">vendor_analog</span><span class="mini-badge">read-only</span></button>
      </div>
      <div class="panel-section"><div class="section-head"><span class="grow">Project contracts</span></div><div class="tree"><button class="tree-row" data-project-section="config">${iconSvg("sliders")}<span class="label">Testbench configuration</span><span class="mini-badge ok">resolved</span></button><button class="tree-row" data-project-section="technology">${iconSvg("library")}<span class="label">Technology & PDK</span><span class="tree-meta">demo180</span></button><button class="tree-row" data-project-section="dependencies">${iconSvg("layers")}<span class="label">Dependency manifest</span><span class="tree-meta">7 files</span></button></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Recovery</span><span class="mini-badge ok">protected</span></div><div class="section-body"><p class="muted" style="font-size:10px">Autosave every 5 minutes · latest recovery checkpoint 34 seconds ago.</p><button class="button ghost" style="width:100%;margin-top:8px" data-project-section="recovery">Open recovery history</button></div></div>`;

    if (view === "simulate") {
      const section = state.simulationSection || "analyses";
      const row = (id, icon, label, meta = "") => `<button class="tree-row level-1 ${section === id ? "selected" : ""}" data-simulation-section="${id}"><span class="tree-caret"></span>${iconSvg(icon)}<span class="label">${label}</span>${meta ? `<span class="tree-meta">${meta}</span>` : ""}</button>`;
      return `${panelHeader("Simulation Studio")}${searchBox("Filter setup…")}
        <div class="tree"><button class="tree-row selected"><span class="tree-caret">⌄</span>${iconSvg("simulate")}<span class="label">Lab characterization</span><span class="mini-badge accent">${state.enabledAnalyses.size} on</span></button>
          ${row("analyses", "waveform", "Analyses", `${state.enabledAnalyses.size} / 25`)}${row("variables", "tune", "Design variables", "6")}${row("outputs", "probe", "Outputs & expressions", "27")}${row("specifications", "target", "Requirements & specs", "14 req")}${row("runset", "grid", "PVT, sweeps & variation", "15 pts")}${row("models", "library", "Models & sections", "7")}${row("solver", "sliders", "Solver & convergence")}${row("save", "save", "Save & streaming policy", "27")}
        </div>
        <div class="panel-section"><div class="section-head"><span class="grow">Run set</span><span class="mini-badge">15 points</span></div><div class="section-body form-grid"><label>Process</label><span class="property-value">TT FF SS FS SF</span><label>Temperature</label><span class="property-value">−40, 27, 125 °C</span><label>Variation</label><span class="property-value">disabled</span></div><button class="button primary" style="width:100%;margin-top:9px" data-toolbar-action="add-analysis">${iconSvg("plus")} Add analysis…</button></div>
        <div class="panel-section"><div class="section-head"><span class="grow">Capability policy</span></div><div class="concept-banner">${iconSvg("info")}Every analysis declares release-engine, preview, compatibility, platform and sign-off contracts before it can be added.</div></div>`;
    }

    if (view === "results") {
      const selectedResultName = state.activeDocuments.results || resolvedDocuments("results")[0]?.name || "";
      const selectedDataset = resultDatasetForName(selectedResultName);
      if (selectedDataset.manifest !== state.resultManifest) {
        const manifest = selectedDataset.manifest;
        const analysisRows = manifest.analyses.map((analysis) => `<button class="tree-row level-1"><span class="tree-caret">›</span><span class="tree-icon">${ANALYSIS_CODE_MAP[analysis]?.[0] || "A"}</span><span class="label">${ANALYSIS_CODE_MAP[analysis] || analysis.toUpperCase()}</span><span class="tree-meta">manifest</span></button>`).join("");
        return `${panelHeader(`Dataset ${manifest.id}`)}${searchBox("Find analysis or manifest field…")}<div class="concept-banner">${iconSvg("info")}The browser is scoped to immutable dataset ${manifest.id}; current Run ${state.resultManifest.id} signals are not mixed into this document.</div><div class="panel-section"><div class="section-head"><span class="tree-caret">⌄</span><span class="grow">${escapeHtml(selectedResultName)}</span><span class="mini-badge warn">${resultEligibilityCopy(manifest)}</span></div><div class="tree">${analysisRows}</div></div><div class="panel-section"><div class="section-head"><span class="grow">Manifest identity</span></div><div class="property-list"><div class="property-row"><span>Run / fixture</span><span class="property-value">${manifest.id}</span></div><div class="property-row"><span>Input revision</span><span class="property-value mono">${manifest.inputRevision}</span></div><div class="property-row"><span>Run set</span><span class="property-value">${manifest.runSet.id} · ${manifest.runSet.pointCount} points</span></div><div class="property-row"><span>Tasks</span><span class="property-value">${manifest.runSet.taskCount.toLocaleString()}</span></div><div class="property-row"><span>Netlist digest</span><span class="property-value mono">${shortDigest(manifest.provenance.netlistDigest)}</span></div></div></div>`;
      }
      return `${panelHeader("Data browser")}${searchBox("Find signal, expression or run…")}
      <div class="panel-section"><div class="section-head"><span class="tree-caret">⌄</span><span class="grow">Datasets</span><span class="mini-badge">3</span></div><div class="tree">
        <button class="tree-row selected" data-result-document="${escapeHtml(resolvedDocuments("results")[0].name)}"><span class="tree-caret">⌄</span>${iconSvg("waveform")}<span class="label">Run ${state.runId} · PVT ${state.resultManifest.runSet.pointCount}</span><span class="mini-badge ${state.resultsStale || !state.resultManifest.qualification.signOffEligible ? "warn" : "ok"}">${state.resultsStale ? "historical" : resultEligibilityCopy()}</span></button>
        ${state.resultAnalyses.has("tran") ? `<button class="tree-row level-1 selected"><span class="tree-caret">⌄</span><span class="tree-icon">T</span><span class="label">tran</span><span class="tree-meta">12</span></button><div class="signal-row selected"><span class="signal-color" style="--trace-color:var(--trace-1)"></span><span class="signal-name">V(afe_out)</span><span>5.00 V</span></div><div class="signal-row selected"><span class="signal-color" style="--trace-color:var(--trace-2)"></span><span class="signal-name">V(sensor_p)</span><span>12.4 mV</span></div><div class="signal-row"><span class="signal-color" style="--trace-color:var(--trace-3)"></span><span class="signal-name">V(sensor_n)</span><span>10.8 mV</span></div><div class="signal-row selected"><span class="signal-color" style="--trace-color:var(--trace-4)"></span><span class="signal-name">I(VDD)</span><span>1.82 mA</span></div>` : ""}
        ${state.resultAnalyses.has("ac") ? `<button class="tree-row level-1"><span class="tree-caret">›</span><span class="tree-icon">A</span><span class="label">ac</span><span class="tree-meta">8</span></button>` : ""}
        ${state.resultAnalyses.has("noise") ? `<button class="tree-row level-1"><span class="tree-caret">›</span><span class="tree-icon">N</span><span class="label">noise</span><span class="tree-meta">6</span></button>` : ""}
        ${state.resultAnalyses.has("op") ? `<button class="tree-row level-1"><span class="tree-caret">›</span><span class="tree-icon">O</span><span class="label">operating_point</span><span class="tree-meta">83</span></button>` : ""}
        <button class="tree-row" data-result-document="Run 39 · SS/125 °C"><span class="tree-caret">›</span>${iconSvg("history")}<span class="label">Run 39 · SS/125 °C</span></button>
        <button class="tree-row" data-result-document="yield_1000"><span class="tree-caret">›</span>${iconSvg("chart")}<span class="label">yield_1000</span></button>
      </div></div>
      ${state.resultAnalyses.has("ac") ? `<div class="panel-section"><div class="section-head"><span class="tree-caret">⌄</span><span class="grow">Expressions</span><button class="icon-button" title="Add expression">${iconSvg("plus")}</button></div><div class="signal-row"><span class="signal-color" style="--trace-color:var(--trace-5)"></span><span class="signal-name">db20(V(out)/V(in))</span><span>41.7 dB</span></div><div class="signal-row"><span class="signal-color" style="--trace-color:var(--trace-6)"></span><span class="signal-name">phase(V(out))</span><span>−89.4°</span></div></div>` : ""}`;
    }

    if (view === "verify") return `${panelHeader("Verification flows")}${searchBox("Filter flows, specs or samples…")}
      <div class="flow-list">
        <button class="flow-row ${state.verifyMode === "yield" ? "selected" : ""}" data-verify-mode="yield"><span class="flow-status warn">△</span><span><strong>PVT & Monte Carlo · MC-REF-17</strong><small>req-17 · 1,000 samples · seed 73a4</small></span><span class="mini-badge warn">98.6% &lt; 99% gate</span></button>
        <button class="flow-row ${state.verifyMode === "corners" ? "selected" : ""}" data-verify-mode="corners"><span class="flow-status ok">✓</span><span><strong>Process corners</strong><small>5 corners × 3 temperatures</small></span><span class="mini-badge ok">15 / 15</span></button>
        <button class="flow-row ${state.verifyMode === "tuning" ? "selected" : ""}" data-verify-mode="tuning"><span class="flow-status accent">T</span><span><strong>Parameter tuning sandbox</strong><small>Live nominal exploration · explicit commit / revert</small></span><span class="mini-badge ${state.tuningDirty ? "warn" : "accent"}">${state.tuningDirty ? "provisional changes" : "baseline"}</span></button>
        <button class="flow-row ${state.verifyMode === "optimization" ? "selected" : ""}" data-verify-mode="optimization"><span class="flow-status">18</span><span><strong>Optimization</strong><small>Levenberg–Marquardt · 4 vars</small></span><span class="mini-badge accent">candidate</span></button>
        <button class="flow-row ${state.verifyMode === "reliability" ? "selected" : ""}" data-verify-mode="reliability"><span class="flow-status warn">△</span><span><strong>Electrical reliability & SOA</strong><small>Operating stress · mission aging · no geometry checks</small></span><span class="mini-badge warn">SOA pass · aging preview</span></button>
        <button class="flow-row ${state.verifyMode === "regression" ? "selected" : ""}" data-verify-mode="regression"><span class="flow-status ok">✓</span><span><strong>Regression · main</strong><small>Measurements and waveforms vs baseline</small></span><span class="mini-badge ok">12 / 12</span></button>
        <button class="flow-row ${state.verifyMode === "drc" ? "selected" : ""}" data-verify-mode="drc"><span class="flow-status warn">23</span><span><strong>Physical DRC · layout L42</strong><small>Geometry rules · markers · waivers · sign-off</small></span><span class="drc-inline-status error">sign-off blocked</span></button>
        <button class="flow-row" type="button" data-surface-action="post-layout"><span class="flow-status warn">◇</span><span><strong>LVS, PEX & multiphysics</strong><small>Identity · parasitic ingest · EM / electrothermal</small></span><span class="mini-badge warn">engines roadmap</span></button>
      </div>
      <div class="panel-section flow-history"><div class="section-head"><span class="grow">Historical fixture coverage</span></div><div class="flow-history-summary mini-badge warn">2 gaps · release blocked</div><div class="section-body"><div class="property-row"><span>Mapped requirements</span><span class="property-value">12 / 14 · req-17</span></div><div class="property-row"><span>PVT points</span><span class="property-value">15 / 15 run</span></div><div class="property-row"><span>Executable checks</span><span class="property-value">12 executed · 9 passed</span></div></div></div>`;

    if (view === "models") return `${panelHeader("Library browser")}${searchBox("Search model, device or library…")}
      <div class="tree">
        <button class="tree-row"><span class="tree-caret">⌄</span>${iconSvg("folder")}<span class="label">Project models</span><span class="tree-meta">18</span></button>
        <button class="tree-row level-1 ${modelBrowserGroup(state.selectedModel) === "OPA189_A" ? "selected" : ""}" data-model-browser="OPA189_A"><span class="tree-caret"></span>${iconSvg("file")}<span class="label">OPA189.lib</span><span class="mini-badge warn">review pending</span></button>
        <button class="tree-row level-1 ${modelBrowserGroup(state.selectedModel) === "sensor_bridge" ? "selected" : ""}" data-model-browser="sensor_bridge"><span class="tree-caret"></span>${iconSvg("code")}<span class="label">sensor_bridge.va</span><span class="mini-badge warn">1 advisory</span></button>
        <button class="tree-row"><span class="tree-caret">⌄</span>${iconSvg("lock")}<span class="label">RSpice built-ins</span><span class="tree-meta">126</span></button>
        <button class="tree-row level-1 ${modelBrowserGroup(state.selectedModel) === "mos" ? "selected" : ""}" data-model-browser="mos"><span class="tree-caret">›</span>${iconSvg("cells")}<span class="label">MOSFET / BSIM</span><span class="tree-meta">34</span></button>
        <button class="tree-row level-1 ${modelBrowserGroup(state.selectedModel) === "bjt" ? "selected" : ""}" data-model-browser="bjt"><span class="tree-caret">›</span>${iconSvg("cells")}<span class="label">BJT / compact models</span><span class="tree-meta">22</span></button>
        <button class="tree-row level-1 ${modelBrowserGroup(state.selectedModel) === "passives" ? "selected" : ""}" data-model-browser="passives"><span class="tree-caret">›</span>${iconSvg("cells")}<span class="label">Passives & lines</span><span class="tree-meta">18</span></button>
        <button class="tree-row ${modelBrowserGroup(state.selectedModel) === "demo180" ? "selected" : ""}" data-model-browser="demo180"><span class="tree-caret">⌄</span>${iconSvg("library")}<span class="label">demo180 PDK</span><span class="mini-badge">linked</span></button>
        <button class="tree-row level-1"><span class="tree-caret">›</span>${iconSvg("folder")}<span class="label">models</span><span class="tree-meta">88</span></button>
        <button class="tree-row level-1"><span class="tree-caret">›</span>${iconSvg("folder")}<span class="label">symbols</span><span class="tree-meta">62</span></button>
        <button class="tree-row level-1"><span class="tree-caret">›</span>${iconSvg("grid")}<span class="label">corners</span><span class="tree-meta">5</span></button>
      </div>
      <div class="panel-section"><div class="section-head"><span class="grow">Include order</span></div><div class="section-body mono" style="font-size:10px;line-height:1.65;color:var(--text-dim)"><span class="faint">01</span> project/models.lib<br><span class="faint">02</span> demo180/corners/tt.lib<br><span class="faint">03</span> vendor/OPA189.lib</div></div>`;

    return `${panelHeader("Netlist outline")}${searchBox("Find symbol or line…")}
      <div class="panel-tabs" role="navigation" aria-label="Code workspace pages">${[["netlist", "Netlist"], ["veriloga", "Verilog-A"], ["automation", "Automation"], ["reports", "Reports"]].map(([id, label]) => `<button class="${(state.codeSurface || "netlist") === id ? "active" : ""}" data-code-surface="${id}" aria-current="${(state.codeSurface || "netlist") === id ? "page" : "false"}">${label}</button>`).join("")}</div>
      <div class="panel-section"><div class="section-head"><span class="grow">Structure</span><span class="mini-badge">142 lines</span></div>
        <button class="outline-row selected">${iconSvg("code")}<span class="grow">top.sp</span><span class="tree-meta">root</span></button>
        <button class="outline-row">${iconSvg("tune")}<span class="grow">Parameters</span><span class="tree-meta">6</span></button>
        <button class="outline-row">${iconSvg("cells")}<span class="grow">Subcircuits</span><span class="tree-meta">3</span></button>
        <button class="outline-row">${iconSvg("library")}<span class="grow">Models</span><span class="tree-meta">4</span></button>
        <button class="outline-row">${iconSvg("simulate")}<span class="grow">Analyses</span><span class="tree-meta">8</span></button>
        <button class="outline-row">${iconSvg("target")}<span class="grow">Measurements</span><span class="tree-meta">12</span></button>
      </div>
      <div class="panel-section"><div class="section-head"><span class="grow">Includes</span><span class="mini-badge ok">resolved</span></div>
        <button class="outline-row">${iconSvg("file")}<span class="grow">models.lib</span></button><button class="outline-row">${iconSvg("file")}<span class="grow">demo180_tt.lib</span></button><button class="outline-row">${iconSvg("file")}<span class="grow">OPA189.lib</span></button>
      </div>
      <div class="panel-section"><div class="section-head"><span class="grow">Source mapping</span></div><div class="section-body"><p class="muted" style="font-size:10px">Generated lines preserve cell/view and instance provenance. Select a line to cross-probe the schematic.</p></div></div>`;
  }

  function modelInspectorFor(modelId) {
    const row = MODEL_ROWS.find((candidate) => candidate[0] === modelId) || MODEL_ROWS[0];
    const [id, family, source, library, runtime, tests, status] = row;
    const [passed, total] = tests.split("/").map((value) => Number(value.trim()));
    const percent = total ? Math.round(passed / total * 1000) / 10 : 0;
    const isOpa = id === "OPA189_A";
    const isBsim = id === "BSIM4_4.8.2";
    const tone = status === "qualified" ? "ok" : "warn";
    const glyph = family.includes("MOSFET") || family.includes("NMOS") ? "M" : family.includes("BJT") ? "Q" : family.includes("Verilog") ? "VA" : family.includes("line") ? "TL" : "▷";
    const qualificationDetails = isOpa
      ? `<div class="validation-meter"><div class="meter-head"><span>DC operating point</span><span class="ok-text">12 / 12</span></div><div class="progress-bar" style="--progress:100%"><span style="background:var(--ok)"></span></div></div><div class="validation-meter"><div class="meter-head"><span>AC response</span><span class="ok-text">8 / 8</span></div><div class="progress-bar" style="--progress:100%"><span style="background:var(--ok)"></span></div></div><div class="validation-meter"><div class="meter-head"><span>Transient</span><span class="ok-text">12 / 12</span></div><div class="progress-bar" style="--progress:100%"><span style="background:var(--ok)"></span></div></div>`
      : isBsim
        ? `<div class="validation-meter"><div class="meter-head"><span>DC operating point</span><span class="ok-text">126 / 126</span></div><div class="progress-bar" style="--progress:100%"><span style="background:var(--ok)"></span></div></div><div class="validation-meter"><div class="meter-head"><span>AC / charge</span><span class="warn-text">118 / 123</span></div><div class="progress-bar" style="--progress:95.9%"><span style="background:var(--warn)"></span></div></div><div class="validation-meter"><div class="meter-head"><span>Transient</span><span class="ok-text">92 / 92</span></div><div class="progress-bar" style="--progress:100%"><span style="background:var(--ok)"></span></div></div>`
        : `<div class="validation-meter"><div class="meter-head"><span>Catalog qualification vectors</span><span class="${tone}-text">${escapeHtml(tests)}</span></div><div class="progress-bar" style="--progress:${percent}%"><span style="background:var(--${tone})"></span></div></div>`;
    const availability = status === "experimental" ? "△ engineering preview" : source === "built-in" ? "✓ native + WASM" : "✓ resolved";
    return `${panelHeader("Model details")}
      <div class="inspector-hero"><div class="symbol-preview">${glyph}</div><div><span class="eyebrow">${escapeHtml(library)} · QUALIFIED CATALOG</span><h3>${escapeHtml(id)}</h3><p>${escapeHtml(family)}</p><div class="hero-tags"><span class="mini-badge ${tone}">${escapeHtml(status)}</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Provenance</span><span class="mini-badge ${source === "built-in" ? "accent" : "ok"}">${source === "built-in" ? "engine bound" : "content addressed"}</span></div><div class="model-source-card"><div class="source-title"><strong>${escapeHtml(source)}</strong><span class="mini-badge">${escapeHtml(library)}</span></div><p>${source === "built-in" ? "RSpice canonical model registry" : `project/models/${escapeHtml(source)}`}<br>${escapeHtml(runtime)}<br>Selection and qualification context synchronized</p></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Availability</span></div><div class="property-list"><div class="property-row"><span>Desktop</span><span class="property-value ${status === "experimental" ? "warn-text" : "ok-text"}">${availability}</span></div><div class="property-row"><span>Browser</span><span class="property-value ${status === "experimental" ? "warn-text" : "ok-text"}">${status === "experimental" ? "△ preview only" : "✓ WASM"}</span></div><div class="property-row"><span>Runtime / sections</span><span class="property-value">${escapeHtml(runtime)}</span></div><div class="property-row"><span>Library</span><span class="property-value">${escapeHtml(library)}</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Qualification</span><span class="mini-badge ${tone}">${escapeHtml(tests)} · ${escapeHtml(status)}</span></div>${qualificationDetails}<div class="section-body"><p class="muted">${status === "qualified" ? "All listed technical vectors pass; release approval remains a separate governed action." : "Promotion remains blocked until failed vectors have reviewed dispositions or approved waivers."}</p></div></div>`;
  }

  function rightPanelForView(view) {
    if (view === "design") {
      const selected = {
        U1: { glyph: "▷", ref: "U1", name: "OPA189", subtitle: "Precision operational amplifier", model: "OPA189_A", path: "/top/U1", ibias: "−2.4 pA", vout: "+2.501 342 V" },
        U2: { glyph: "▷", ref: "U2", name: "OPA189", subtitle: "Precision operational amplifier", model: "OPA189_A", path: "/top/U2", ibias: "+2.1 pA", vout: "+2.498 811 V" },
        U3: { glyph: "▷", ref: "U3", name: "OPA2189", subtitle: "Dual precision amplifier · A", model: "OPA2189_A", path: "/top/U3:A", ibias: "−1.8 pA", vout: "+3.742 096 V" },
        RG: { glyph: "R", ref: "RG", name: "499 Ω", subtitle: "Gain-setting resistor", model: "r_poly", path: "/top/RG", ibias: "10.02 µA", vout: "5.001 mV" }
      }[state.selectedComponent] || null;
      const base = selected || { glyph: "◇", ref: "Selection", name: "4 objects", subtitle: "Mixed selection", model: "—", path: "/top", ibias: "—", vout: "—" };
      const edits = state.componentEdits[state.selectedComponent] || {};
      const c = { ...base, ref: Object.hasOwn(edits, "instance") ? edits.instance : base.ref, name: Object.hasOwn(edits, "value") ? edits.value : base.name };
      const safeRef = escapeHtml(c.ref), safeName = escapeHtml(c.name);
      return `${panelHeader("Inspector")}
        <div class="inspector-hero"><div class="symbol-preview">${c.glyph}</div><div><span class="eyebrow">${safeRef} · ${c.path}</span><h3>${safeName}</h3><p>${c.subtitle}</p><div class="hero-tags"><span class="mini-badge ok">model resolved</span><span class="mini-badge">TT</span></div></div></div>
        <div class="panel-section"><div class="section-head"><span class="grow">Identity</span><span class="mini-badge">editable</span></div><div class="property-list">
          <div class="property-row"><label for="instance-name">Instance</label><input id="instance-name" class="input mono" data-property-input data-property-field="instance" value="${safeRef}"></div>
          <div class="property-row"><label for="instance-value">Value</label><input id="instance-value" class="input mono" data-property-input data-property-field="value" value="${safeName}"></div>
          <div class="property-row"><span>Library cell</span><span class="property-value">vendor_analog/${c.model}</span></div>
          <div class="property-row"><span>View</span><span class="property-value">symbol · spice</span></div>
        </div></div>
        <div class="panel-section"><div class="section-head"><span class="grow">Simulation parameters</span></div><div class="property-list">
          <div class="property-row"><span>Model</span><span class="property-value">${c.model}</span></div><div class="property-row"><span>Section</span><span class="property-value">typical</span></div><div class="property-row"><span>Temperature</span><span class="property-value">inherit · 27 °C</span></div><div class="property-row"><span>Mismatch</span><span class="property-value">enabled</span></div>
        </div></div>
        <div class="panel-section"><div class="section-head"><span class="grow">Operating point · Run ${state.runId}</span><span class="mini-badge ${state.resultsStale ? "warn" : "ok"}">${state.resultsStale ? "stale" : "current"}</span></div><div class="annotation-summary">
          <div class="op-row"><span>Output voltage</span><strong>${c.vout}</strong></div><div class="op-row"><span>Input bias</span><strong>${c.ibias}</strong></div><div class="op-row"><span>Supply current</span><strong>872.438 µA</strong></div><div class="op-row"><span>Device power</span><strong>4.362 19 mW</strong></div>
        </div></div>
        <div class="panel-section"><div class="section-head"><span class="grow">Checks</span><span id="inspector-check-badge" class="mini-badge ${state.checksCurrent ? "ok" : "warn"}">${state.checksCurrent ? "0 errors" : "stale"}</span></div><div class="property-list"><div class="property-row"><span>Connectivity</span><span class="property-value ${state.checksCurrent ? "ok-text" : "warn-text"}">${state.checksCurrent ? "✓ connected" : "△ pending recheck"}</span></div><div class="property-row"><span>Safe operating area</span><span class="property-value ${state.checksCurrent ? "ok-text" : "warn-text"}">${state.checksCurrent ? "✓ 41% margin" : "△ pending recheck"}</span></div><div class="property-row"><span>Last checked</span><span id="inspector-check-state" class="property-value ${state.checksCurrent ? "ok-text" : "warn-text"}">${state.checksCurrent ? `✓ revision ${state.inputRevision}` : `△ rerun for ${state.inputRevision}`}</span></div></div></div>`;
    }

    if (view === "project") return `${panelHeader("Project details")}
      <div class="panel-section"><div class="section-head"><span class="grow">Identity</span></div><div class="property-list"><div class="property-row"><span>Name</span><span class="property-value">Precision Sensor AFE</span></div><div class="property-row"><span>Format</span><span class="property-value">.rspiceproj 1.0.0</span></div><div class="property-row"><span>Location</span><span class="property-value">~/RSpice/afe</span></div><div class="property-row"><span>Modified</span><span class="property-value">34 seconds ago</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Dependencies</span><span class="mini-badge ok">resolved</span></div><div class="property-list"><div class="property-row"><span>Libraries</span><span class="property-value">4</span></div><div class="property-row"><span>Model files</span><span class="property-value">7</span></div><div class="property-row"><span>Verilog-A</span><span class="property-value">2 modules</span></div><div class="property-row"><span>Missing</span><span class="property-value ok-text">0</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Version & recovery</span></div><div class="property-list"><div class="property-row"><span>Input revision</span><span class="property-value">${state.inputRevision}</span></div><div class="property-row"><span>Autosave</span><span class="property-value ${state.dirty ? "warn-text" : "ok-text"}">${state.dirty ? "working checkpoint" : "current"}</span></div><div class="property-row"><span>Recovery points</span><span class="property-value">8 retained</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Post-layout design</span><span class="mini-badge warn">engine roadmap</span></div><div class="concept-banner">${iconSvg("layers")}The complete extracted-view, parasitic, EM and electrothermal interaction contract is available for review without claiming current engine support.</div><div class="section-body"><button class="button" style="width:100%" data-surface-action="post-layout">Review post-layout workflow</button></div></div>`;

    if (view === "simulate") {
      const targetTitle = state.platform === "mobile" ? "Mobile browser worker" : state.platform === "tablet" || state.platform === "web" ? "Browser simulation worker" : "Local desktop engine";
      const targetDetail = state.platform === "mobile" ? "WASM preview worker · full setup and result review · optional qualified-target handoff" : state.platform === "tablet" || state.platform === "web" ? "Single worker · WebAssembly · release interpreted Verilog-A" : "12 threads · SIMD · interpreted Verilog-A · native JIT preview";
      const targetBadge = state.platform === "mobile" ? '<span class="mini-badge warn">runtime · preview / non-sign-off</span>' : '<span class="mini-badge ok">release runtime ready</span>';
      const activeManifest = state.activeRunManifest;
      const planNetlistDigest = activeManifest?.provenance?.netlistDigest || currentPlanNetlistDigest();
      const resultManifest = state.resultManifest;
      const workingAnalysisValues = effectiveAnalysisValues(state.enabledAnalyses, state.analysisValues);
      const workingTaskGraph = executionTaskGraph(state.enabledAnalyses, workingAnalysisValues);
      const releasePlan = planValidationReport();
      const evidenceState = (gate) => gate.passed ? "approved · binding current" : gate.applicability?.mismatches?.length ? "stale binding" : gate.reviewStatus?.includes("remain") ? "technical pass · review pending" : "blocked";
      const monteCarloPlanState = !state.enabledAnalyses.has("mc") ? "required · not evaluated" : releasePlan.monteCarloReady ? `${releasePlan.monteCarloSamples.toLocaleString()} configured · evaluated after run` : `${releasePlan.monteCarloSamples.toLocaleString()} configured · below release minimum`;
      const cancelledProgress = state.cancelledRunManifest ? Math.round(state.cancelledRunManifest.durationSeconds / state.cancelledRunManifest.estimatedDurationSeconds * 100) : 0;
      const completedRow = `<div class="job-row"><div class="job-row-head"><strong>Run ${resultManifest.id} · ${resultManifest.runSet.name}</strong><span class="mini-badge ${resultManifest.qualification.signOffEligible ? "ok" : "warn"}">${resultManifest.status}</span></div><div class="job-row-meta"><span>${resultManifest.runSet.pointCount} PVT points · ${resultManifest.analyses.length} analyses · ${resultManifest.runSet.taskCount.toLocaleString()} tasks</span><span>${formatDuration(resultManifest.durationSeconds)}</span></div><div class="progress-bar" style="--progress:100%"><span style="background:var(--ok)"></span></div></div>`;
      const activeRow = activeManifest ? `<div class="job-row"><div class="job-row-head"><strong>Run ${activeManifest.id} · ${activeManifest.runSet.name}</strong><span class="mini-badge accent">running</span></div><div class="job-row-meta"><span>${activeManifest.runSet.pointCount} PVT points · ${activeManifest.runSet.taskCount} tasks</span><span id="active-run-progress-label">${state.runProgress}% · ${formatDuration(activeManifest.estimatedDurationSeconds * state.runProgress / 100)} simulated</span></div><div class="progress-bar" id="active-run-progress" style="--progress:${state.runProgress}%"><span></span></div></div>` : "";
      const cancelledRow = !activeManifest && state.cancelledRunManifest ? `<div class="job-row"><div class="job-row-head"><strong>Run ${state.cancelledRunManifest.id} · ${state.cancelledRunManifest.runSet.name}</strong><span class="mini-badge warn">cancelled</span></div><div class="job-row-meta"><span>${cancelledProgress}% · checkpoints retained · ${state.cancelledRunManifest.runSet.pointCount} point plan</span><span>${formatDuration(state.cancelledRunManifest.durationSeconds)}</span></div><div class="progress-bar" style="--progress:${cancelledProgress}%"><span style="background:var(--warn)"></span></div></div>` : "";
      return `${panelHeader("Current run")}
      <div class="panel-section"><div class="section-head"><span class="grow">Execution target</span>${targetBadge}</div><div class="run-summary"><div class="run-target"><div class="target-icon">${iconSvg("cpu")}</div><div class="grow"><strong>${targetTitle}</strong><small>${targetDetail}</small></div><span class="chevron">›</span></div>
        <div class="property-list" style="padding:8px 0 0"><div class="property-row"><span>Run points</span><span class="property-value">${PVT_RUN_POINTS.length} PVT points</span></div><div class="property-row"><span>Analyses</span><span class="property-value">${activeManifest?.analyses.length ?? state.enabledAnalyses.size} enabled</span></div><div class="property-row"><span>Estimated work</span><span class="property-value">${(activeManifest?.runSet.taskCount ?? workingTaskGraph.total).toLocaleString()} tasks · ${formatDuration(activeManifest?.estimatedDurationSeconds ?? estimatedRunDurationSeconds(state.enabledAnalyses, workingAnalysisValues))}</span></div><div class="property-row"><span>Checkpoint</span><span class="property-value">transactional per PVT point</span></div></div>
      </div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Release profile · ${RELEASE_PROFILE.id}</span><span class="mini-badge ${releasePlan.releaseEligible ? "ok" : "warn"}">${releasePlan.releaseEligible ? "configured" : "evidence incomplete"}</span></div><div class="property-list"><div class="property-row"><span>Requirement mapping</span><span class="property-value">${REQUIREMENT_CONTRACT.mapped} / ${REQUIREMENT_CONTRACT.total} · ${REQUIREMENT_CONTRACT.id}</span></div><div class="property-row"><span>Nominal analyses</span><span class="property-value">${REQUIRED_NOMINAL_ANALYSES.filter((analysis) => state.enabledAnalyses.has(analysis)).length} / ${REQUIRED_NOMINAL_ANALYSES.length} configured</span></div><div class="property-row"><span>Monte Carlo yield</span><span class="property-value ${releasePlan.monteCarloReady ? "ok-text" : "warn-text"}">${monteCarloPlanState}</span></div><div class="property-row"><span>Model qualification</span><span class="property-value ${releasePlan.evidenceGates.modelQualification.passed ? "ok-text" : "warn-text"}">${evidenceState(releasePlan.evidenceGates.modelQualification)}</span></div><div class="property-row"><span>Regression evidence</span><span class="property-value ${releasePlan.evidenceGates.regression.passed ? "ok-text" : "warn-text"}">${evidenceState(releasePlan.evidenceGates.regression)}</span></div><div class="property-row"><span>Physical DRC</span><span class="property-value error-text">Run 42 · 23 blocking</span></div><div class="property-row"><span>SOA evidence</span><span class="property-value ${releasePlan.evidenceGates.safeOperatingArea.passed ? "ok-text" : "warn-text"}">${evidenceState(releasePlan.evidenceGates.safeOperatingArea)}</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Queue</span><span class="mini-badge">${activeManifest ? "1 active · 1 complete" : state.cancelledRunManifest ? "idle · 1 cancelled · 1 complete" : "idle · 1 complete"}</span></div>
        ${activeRow}${cancelledRow}${completedRow}
      </div>
      <div class="panel-section"><div class="section-head"><span class="grow">Reproducibility</span></div><div class="property-list"><div class="property-row"><span>Input revision</span><span class="property-value">${activeManifest?.inputRevision || state.inputRevision}</span></div><div class="property-row"><span>Manifest</span><span class="property-value">immutable · ${activeManifest?.status || "ready"}</span></div><div class="property-row"><span>Netlist digest · mock contract</span><span class="property-value">${shortDigest(planNetlistDigest)}</span></div><div class="property-row"><span>Model digest</span><span class="property-value">${shortDigest(MODEL_SET_DIGEST)}</span></div><div class="property-row"><span>Random seed</span><span class="property-value">0x73A4</span></div><div class="property-row"><span>Engine build</span><span class="property-value">${ENGINE_BUILD}</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Failure policy</span></div><div class="property-list"><div class="property-row"><span>On convergence failure</span><span class="property-value">retry robust</span></div><div class="property-row"><span>Timeout</span><span class="property-value">10 min / point</span></div><div class="property-row"><span>Stop on spec fail</span><span class="property-value">off</span></div></div></div>`;
    }

    if (view === "results") {
      const selectedResultName = state.activeDocuments.results || resolvedDocuments("results")[0]?.name || "";
      const selectedDataset = resultDatasetForName(selectedResultName);
      if (selectedDataset.manifest !== state.resultManifest) {
        const manifest = selectedDataset.manifest;
        const gates = Object.entries(manifest.qualification.gates);
        const gateRows = gates.map(([name, gate]) => `<div class="property-row"><span>${escapeHtml(name.replace(/([A-Z])/g, " $1").toLowerCase())}</span><span class="property-value ${gate.passed ? "ok-text" : "warn-text"}">${gate.passed ? "✓ pass" : gate.evaluated === false ? "△ not evaluated" : "△ blocked"}</span></div>`).join("");
        return `${panelHeader(`Manifest ${manifest.id}`)}<div class="panel-section"><div class="section-head"><span class="grow">Dataset identity</span><span class="mini-badge warn">${resultEligibilityCopy(manifest)}</span></div><div class="property-list"><div class="property-row"><span>Document</span><span class="property-value">${escapeHtml(selectedResultName)}</span></div><div class="property-row"><span>Run / fixture</span><span class="property-value">${manifest.id} · ${manifest.status}</span></div><div class="property-row"><span>Input revision</span><span class="property-value mono">${manifest.inputRevision}</span></div><div class="property-row"><span>Executable checks</span><span class="property-value">${selectedDataset.executableChecks.passed} / ${selectedDataset.executableChecks.total}</span></div><div class="property-row"><span>Requirement mapping</span><span class="property-value">${selectedDataset.requirementMapping.mapped} / ${selectedDataset.requirementMapping.total} · ${selectedDataset.requirementMapping.id}</span></div><div class="property-row"><span>Duration</span><span class="property-value">${formatDuration(manifest.durationSeconds)}</span></div></div></div><div class="panel-section"><div class="section-head"><span class="grow">Qualification gates</span></div><div class="property-list">${gateRows}</div></div><div class="panel-section"><div class="section-head"><span class="grow">Provenance</span><span class="mini-badge ok">immutable</span></div><div class="property-list"><div class="property-row"><span>Run set</span><span class="property-value">${manifest.runSet.id} · ${manifest.runSet.taskCount.toLocaleString()} tasks</span></div><div class="property-row"><span>Execution digest</span><span class="property-value mono">${shortDigest(manifest.provenance.netlistDigest)}</span></div><div class="property-row"><span>Design-netlist digest</span><span class="property-value mono">${shortDigest(manifest.provenance.designNetlistDigest)}</span></div><div class="property-row"><span>Run-config digest</span><span class="property-value mono">${shortDigest(manifest.provenance.runConfigurationDigest)}</span></div><div class="property-row"><span>Requirements digest</span><span class="property-value mono">${shortDigest(manifest.provenance.requirementContractDigest)}</span></div><div class="property-row"><span>Model digest</span><span class="property-value mono">${shortDigest(manifest.provenance.modelSetDigest)}</span></div><div class="property-row"><span>Engine</span><span class="property-value">${manifest.provenance.engineBuild}</span></div></div></div>`;
      }
      const labels = { op: "Operating point", tran: "Transient", ac: "AC", noise: "Noise", stb: "Stability", dc: "DC sweep", sens: "Sensitivity", fourier: "Fourier" };
      const analysisSummary = [...state.resultAnalyses].map((analysis) => labels[analysis] || analysis.toUpperCase()).join(" · ");
      const resultGates = Object.values(state.resultManifest.qualification.gates);
      const passedGateCount = resultGates.filter((gate) => gate.passed).length;
      const measurementRows = [];
      if (state.resultAnalyses.has("tran")) measurementRows.push(["rise_time_10_90", "V(afe_out)", "2.197 215 ms"], ["settling_0p1", "V(afe_out)", "4.812 06 ms"], ["overshoot", "V(afe_out)", "0.184 2 %"]);
      if (state.resultAnalyses.has("ac")) measurementRows.push(["gain_dc", "V(out)/V(diff)", "40.006 8 dB"]);
      if (state.resultAnalyses.has("stb")) measurementRows.push(["phase_margin", "loop gain", "67.412°"]);
      if (state.resultAnalyses.has("noise")) measurementRows.push(["inoise_1k", "input referred", "14.818 3 nV/√Hz"]);
      if (state.resultAnalyses.has("op")) measurementRows.push(["vout_op", "V(afe_out)", "2.501 342 V"]);
      if (state.resultAnalyses.has("dc")) measurementRows.push(["offset_span", "VOS sweep", "19.998 6 mV"]);
      if (state.resultAnalyses.has("sens")) measurementRows.push(["top_sensitivity", "RGAIN → gain_dc", "0.982 1 %/%"]);
      if (state.resultAnalyses.has("fourier")) measurementRows.push(["thd", "V(afe_out)", "0.003 81 %"]);
      const cursorSection = state.resultAnalyses.has("tran") ? `<div class="panel-section"><div class="section-head"><span class="grow">A / B cursors</span><span class="mini-badge accent">linked</span></div><div class="cursor-card"><div class="cursor-card-head"><span>Trace</span><span>A</span><span>B</span><span>Δ</span></div><div class="cursor-row"><span>time</span><span>1.000 ms</span><span>3.197 ms</span><span>2.197 ms</span></div><div class="cursor-row"><span>V(out)</span><span>0.500 V</span><span>4.500 V</span><span>4.000 V</span></div><div class="cursor-row"><span>I(VDD)</span><span>1.201 mA</span><span>1.823 mA</span><span>622.0 µA</span></div></div></div>` : "";
      return `${panelHeader("Result details")}
        ${state.resultsStale ? `<div class="concept-banner" style="border-color:var(--warn);color:var(--warn)">${iconSvg("warning")}Run ${state.runId} is immutable at ${manifestRevision()}; working inputs are ${state.inputRevision}.</div>` : ""}
        <div class="panel-section"><div class="section-head"><span class="grow">Dataset</span><span class="mini-badge ${state.resultsStale || !state.resultManifest.qualification.signOffEligible ? "warn" : "ok"}">${state.resultsStale ? "historical" : `current · ${resultEligibilityCopy()}`}</span></div><div class="property-list"><div class="property-row"><span>Run set</span><span class="property-value">${manifestRunSetLabel()}</span></div><div class="property-row"><span>Analyses</span><span class="property-value">${state.resultAnalysisCount}</span></div><div class="property-row"><span>Executable checks</span><span class="property-value">${state.resultPassedSpecCount} / ${state.resultSpecCount}</span></div><div class="property-row"><span>Requirement mapping</span><span class="property-value">${REQUIREMENT_CONTRACT.mapped} / ${REQUIREMENT_CONTRACT.total} · ${REQUIREMENT_CONTRACT.id}</span></div><div class="property-row"><span>Duration</span><span class="property-value">${state.resultDuration}</span></div></div><p class="muted" style="padding:8px 10px 0;font-size:10px">${escapeHtml(analysisSummary)}</p></div>
        ${cursorSection}
        <div class="panel-section"><div class="section-head"><span class="grow">Computed measurements</span><button class="icon-button" title="Add measurement">${iconSvg("plus")}</button></div><div class="measurement-list">${measurementRows.map(([name, expression, value]) => `<div class="measurement-row"><span class="measure-name"><strong>${name}</strong>${expression}</span><span class="measurement-value ok-text">${value}</span></div>`).join("")}</div></div>
        <div class="panel-section"><div class="section-head"><span class="grow">Run provenance</span><span class="mini-badge ok">immutable</span></div><div class="property-list"><div class="property-row"><span>Run ID / status</span><span class="property-value">${state.resultManifest.id} · ${state.resultManifest.status}</span></div><div class="property-row"><span>Input revision</span><span class="property-value">${manifestRevision()}</span></div><div class="property-row"><span>Run set</span><span class="property-value">${state.resultManifest.runSet.id} · ${state.resultManifest.runSet.pointCount} points</span></div><div class="property-row"><span>Reference PVT</span><span class="property-value">${state.resultManifest.referenceCorner}</span></div><div class="property-row"><span>Frozen settings</span><span class="property-value">${Object.keys(state.resultManifest.analysisValues).length} analysis records</span></div><div class="property-row"><span>Execution digest</span><span class="property-value">${shortDigest(state.resultManifest.provenance.netlistDigest)}</span></div><div class="property-row"><span>Design-netlist digest</span><span class="property-value">${shortDigest(state.resultManifest.provenance.designNetlistDigest)}</span></div><div class="property-row"><span>Run-config digest</span><span class="property-value">${shortDigest(state.resultManifest.provenance.runConfigurationDigest)}</span></div><div class="property-row"><span>Requirements digest</span><span class="property-value">${shortDigest(state.resultManifest.provenance.requirementContractDigest)}</span></div><div class="property-row"><span>Models digest</span><span class="property-value">${shortDigest(state.resultManifest.provenance.modelSetDigest)}</span></div><div class="property-row"><span>Engine</span><span class="property-value">${state.resultManifest.provenance.engineBuild}</span></div><div class="property-row"><span>Technical gates</span><span class="property-value ${passedGateCount === resultGates.length ? "ok-text" : "warn-text"}">${passedGateCount} / ${resultGates.length} pass</span></div><div class="property-row"><span>Approval</span><span class="property-value">${state.resultManifest.qualification.approvalStatus}</span></div></div></div>`;
    }

    if (view === "verify" && state.verifyMode === "drc") {
      const marker = DRC_MARKERS.find((candidate) => candidate.id === state.selectedDrcMarker) || DRC_MARKERS[0];
      return `${panelHeader("DRC marker")}
        <div class="inspector-hero drc-inspector-hero"><div class="symbol-preview">${marker.index}</div><div><span class="eyebrow">${marker.id} · ${marker.layer}</span><h3>${marker.rule}</h3><p>${marker.title}</p><div class="drc-status-pair"><span class="drc-inline-status ${marker.severity === "error" ? "error" : "warn"}">${marker.severity === "error" ? "blocking" : "advisory"}</span><span class="drc-inline-status ${marker.status === "waived" ? "ok" : marker.status === "review" ? "warn" : "error"}">${marker.status}</span></div></div></div>
        <div class="panel-section"><div class="section-head"><span class="grow">Measured geometry</span><span class="drc-inline-status error">${marker.delta}</span></div><div class="property-list"><div class="property-row"><span>Measured</span><span class="property-value mono error-text">${marker.measured}</span></div><div class="property-row"><span>Required</span><span class="property-value mono">${marker.required}</span></div><div class="property-row"><span>Layer pair</span><span class="property-value">${marker.layer}</span></div><div class="property-row"><span>Bounding box</span><span class="property-value mono">${marker.bbox}</span></div></div></div>
        <div class="panel-section"><div class="section-head"><span class="grow">Rule definition</span><span class="drc-inline-status ok">deck qualified</span></div><div class="section-body"><p class="muted">${marker.rule} is evaluated by demo180_drc_v12 with hierarchical cell transforms preserved. The marker stores the exact rule text, deck digest and source polygons.</p></div><div class="property-list"><div class="property-row"><span>Rule class</span><span class="property-value">${marker.title}</span></div><div class="property-row"><span>Deck revision</span><span class="property-value mono">v12 · 19f2…bc71</span></div><div class="property-row"><span>Result digest</span><span class="property-value mono">7d18…a021</span></div></div></div>
        <div class="panel-section"><div class="section-head"><span class="grow">Hierarchy & cross-probe</span></div><div class="property-list"><div class="property-row"><span>Cell</span><span class="property-value">${marker.cell}</span></div><div class="property-row"><span>Instance path</span><span class="property-value mono">${marker.path}</span></div><div class="property-row"><span>Schematic map</span><span class="property-value ok-text">stable device ID</span></div></div><div class="section-body drc-inspector-actions"><button class="button primary" type="button" data-surface-action="locate-drc">Locate & zoom</button><button class="button" type="button" data-surface-action="crossprobe-drc">Cross-probe schematic</button></div></div>
        <div class="panel-section"><div class="section-head"><span class="grow">Disposition & waiver</span><span class="drc-inline-status ${marker.status === "waived" ? "ok" : marker.status === "review" ? "warn" : "error"}">${marker.status}</span></div><div class="property-list"><div class="property-row"><span>Owner</span><span class="property-value">${marker.status === "waived" ? "J. Whitfield" : "unassigned"}</span></div><div class="property-row"><span>Reason code</span><span class="property-value">${marker.status === "waived" ? "analog density exception" : "required before waiver"}</span></div><div class="property-row"><span>Expiry</span><span class="property-value">${marker.status === "waived" ? "tapeout L42 only" : "—"}</span></div><div class="property-row"><span>Sign-off impact</span><span class="property-value ${marker.status === "waived" ? "ok-text" : "error-text"}">${marker.status === "waived" ? "approved exception" : "blocks package"}</span></div></div><div class="section-body drc-inspector-actions"><button class="button" type="button" data-surface-action="waive-drc">Request waiver…</button><button class="button ghost" type="button" data-surface-action="history-drc">Disposition history</button></div></div>
        <div class="drc-inspector-footer"><button class="button ghost" type="button" data-drc-cycle="previous">Previous</button><span class="mono faint">${DRC_MARKERS.findIndex((candidate) => candidate.id === marker.id) + 1} / ${DRC_MARKERS.length}</span><button class="button" type="button" data-drc-cycle="next">Next marker</button></div>`;
    }

    if (view === "verify" && state.verifyMode === "corners") return `${panelHeader("Corner details")}
      <div class="inspector-hero"><div class="symbol-preview">PVT</div><div><span class="eyebrow">WORST PASSING POINT</span><h3>SS · 125 °C</h3><p>All 12 specifications pass</p><div class="hero-tags"><span class="mini-badge ok">+2.10% margin</span><span class="mini-badge">complete</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Limiting specifications</span></div><div class="measurement-list"><div class="measurement-row"><span class="measure-name"><strong>bandwidth</strong>requirement ≥ 95 kHz</span><span class="measurement-value ok-text">97.0 kHz</span></div><div class="measurement-row"><span class="measure-name"><strong>gain_dc</strong>requirement ≥ 39.5 dB</span><span class="measurement-value ok-text">39.71 dB</span></div><div class="measurement-row"><span class="measure-name"><strong>offset</strong>requirement ≤ 50 µV</span><span class="measurement-value ok-text">29.0 µV</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Point definition</span></div><div class="property-list"><div class="property-row"><span>Model section</span><span class="property-value">ss</span></div><div class="property-row"><span>Temperature</span><span class="property-value">125 °C</span></div><div class="property-row"><span>Supply</span><span class="property-value">5.000 V</span></div><div class="property-row"><span>Analyses</span><span class="property-value">8 / 8 complete</span></div><div class="property-row"><span>Runtime</span><span class="property-value">2.14 s</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Provenance</span></div><div class="property-list"><div class="property-row"><span>Input revision</span><span class="property-value">7c49d2b</span></div><div class="property-row"><span>Model digest</span><span class="property-value">be17…481c</span></div><div class="property-row"><span>Engine</span><span class="property-value">0.1.0+91e7c2a</span></div></div></div>`;

    if (view === "verify" && state.verifyMode === "tuning") return `${panelHeader("Tuning session")}
      <div class="inspector-hero"><div class="symbol-preview">T</div><div><span class="eyebrow">NON-DESTRUCTIVE EXPLORATION</span><h3 id="tuning-inspector-title">${state.tuningDirty ? "Provisional values" : "Committed baseline"}</h3><p id="tuning-inspector-copy">${state.tuningDirty ? "Changes exist only in the tuning sandbox" : `Aligned to working revision ${state.inputRevision}`}</p><div class="hero-tags"><span id="tuning-inspector-status" class="mini-badge ${state.tuningDirty ? "warn" : "ok"}">${state.tuningDirty ? "not committed" : "clean"}</span><span class="mini-badge">TT · 27 °C</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Change set</span></div><div class="property-list"><div class="property-row"><span>RGAIN</span><span class="property-value" id="tuning-inspector-rgain">${state.tuningBaseline.RGAIN.toFixed(1)} → ${state.tuningValues.RGAIN.toFixed(1)} Ω</span></div><div class="property-row"><span>CFILT</span><span class="property-value" id="tuning-inspector-cfilt">${state.tuningBaseline.CFILT.toFixed(2)} → ${state.tuningValues.CFILT.toFixed(2)} nF</span></div><div class="property-row"><span>VREF</span><span class="property-value" id="tuning-inspector-vref">${state.tuningBaseline.VREF.toFixed(3)} → ${state.tuningValues.VREF.toFixed(3)} V</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Session contract</span></div><div class="property-list"><div class="property-row"><span>Baseline result</span><span class="property-value">Run ${state.resultManifest.id} · immutable</span></div><div class="property-row"><span>Evaluation scope</span><span class="property-value">nominal estimate</span></div><div class="property-row"><span>Release evidence</span><span class="property-value warn-text">excluded</span></div><div class="property-row"><span>Commit behavior</span><span class="property-value">review → working revision</span></div></div></div>
      <div class="concept-banner">${iconSvg("info")}Commit creates explicit working changes, invalidates affected checks and results, and requires a new simulation before any value can become evidence.</div>`;

    if (view === "verify" && state.verifyMode === "optimization") return `${panelHeader("Candidate 18")}
      <div class="inspector-hero"><div class="symbol-preview">◎</div><div><span class="eyebrow">OPTIMIZATION · CONVERGED</span><h3>Candidate 18</h3><p>Composite objective improved 34.2%</p><div class="hero-tags"><span class="mini-badge ok">5 / 5 goals</span><span class="mini-badge accent">not applied</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Solver</span></div><div class="property-list"><div class="property-row"><span>Algorithm</span><span class="property-value">Levenberg–Marquardt</span></div><div class="property-row"><span>Iterations</span><span class="property-value">18 / 40</span></div><div class="property-row"><span>Gradient norm</span><span class="property-value">8.7e−5</span></div><div class="property-row"><span>Termination</span><span class="property-value ok-text">converged</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Candidate changes</span></div><div class="property-list"><div class="property-row"><span>RGAIN</span><span class="property-value">499 → 512.4 Ω</span></div><div class="property-row"><span>CFILT</span><span class="property-value">22 → 19.62 nF</span></div><div class="property-row"><span>RFB</span><span class="property-value">10 → 10.31 kΩ</span></div><div class="property-row"><span>CCOMP</span><span class="property-value">3.3 → 3.74 pF</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Provenance</span></div><div class="property-list"><div class="property-row"><span>Seed revision</span><span class="property-value">7c49d2b</span></div><div class="property-row"><span>Run set</span><span class="property-value">TT · 27 °C</span></div><div class="property-row"><span>Objective digest</span><span class="property-value">19af…0c72</span></div></div></div>
      <div class="section-body" style="display:grid;gap:6px"><button class="button" data-surface-action="compare-candidate">Create comparison run</button><button class="button ghost" data-surface-action="discard-candidate">Discard candidate</button></div>`;

    if (view === "verify" && state.verifyMode === "reliability") return `${panelHeader("Reliability details")}
      <div class="inspector-hero"><div class="symbol-preview">10y</div><div><span class="eyebrow">AGING EVALUATION · PREVIEW</span><h3>U3 transconductance</h3><p>Projected drift −3.8% at 10 years</p><div class="hero-tags"><span class="mini-badge warn">not sign-off eligible</span><span class="mini-badge">BTI + HCI</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Mission exposure</span><span class="mini-badge warn">evaluation deck</span></div><div class="property-list"><div class="property-row"><span>Equivalent age</span><span class="property-value">10.0 years</span></div><div class="property-row"><span>Worst temperature</span><span class="property-value">125 °C</span></div><div class="property-row"><span>High-stress duty</span><span class="property-value">15%</span></div><div class="property-row"><span>Qualification</span><span class="property-value warn-text">foundry evaluation · preview</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Affected specifications</span></div><div class="measurement-list"><div class="measurement-row"><span class="measure-name"><strong>bandwidth</strong>aged 10 years</span><span class="measurement-value ok-text">−2.9%</span></div><div class="measurement-row"><span class="measure-name"><strong>phase margin</strong>aged 10 years</span><span class="measurement-value ok-text">−1.2°</span></div><div class="measurement-row"><span class="measure-name"><strong>input noise</strong>aged 10 years</span><span class="measurement-value ok-text">+2.1%</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Provenance</span></div><div class="property-list"><div class="property-row"><span>Rule deck</span><span class="property-value">demo180_rel_2.1</span></div><div class="property-row"><span>Model digest</span><span class="property-value mono">be17…481c</span></div><div class="property-row"><span>Mission digest</span><span class="property-value mono">7db2…0a11</span></div></div></div>`;

    if (view === "verify" && state.verifyMode === "regression") return `${panelHeader("Regression details")}
      <div class="inspector-hero"><div class="symbol-preview">Δ</div><div><span class="eyebrow">WORST NORMALIZED DELTA</span><h3>inoise_total</h3><p>Current result is +0.42 σ from baseline</p><div class="hero-tags"><span class="mini-badge ok">pass</span><span class="mini-badge">±3 σ tolerance</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Comparison policy</span></div><div class="property-list"><div class="property-row"><span>Alignment</span><span class="property-value">event + interpolation</span></div><div class="property-row"><span>Numeric precision</span><span class="property-value">full f64</span></div><div class="property-row"><span>NaN / missing</span><span class="property-value error-text">fail closed</span></div><div class="property-row"><span>Approval</span><span class="property-value">not required</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Baseline provenance</span><span class="mini-badge ok">approved</span></div><div class="property-list"><div class="property-row"><span>Run</span><span class="property-value">38</span></div><div class="property-row"><span>Revision</span><span class="property-value mono">6f19a83</span></div><div class="property-row"><span>Approved</span><span class="property-value">JM · 2026-06-25</span></div><div class="property-row"><span>Result digest</span><span class="property-value mono">611a…82cf</span></div></div></div>
      <div class="section-body" style="display:grid;gap:6px"><button class="button primary" data-surface-action="open-wave-diff">Open waveform difference</button><button class="button" data-surface-action="export-ci">Export CI artifacts</button><button class="button ghost" data-surface-action="replace-baseline">Propose new baseline…</button></div>`;

    if (view === "verify") return `${panelHeader("Yield details")}
      <div class="panel-section"><div class="section-head"><span class="grow">Run definition</span><span class="mini-badge ok">complete</span></div><div class="property-list"><div class="property-row"><span>Samples</span><span class="property-value">1,000 / 1,000</span></div><div class="property-row"><span>Seed</span><span class="property-value">0x73A4</span></div><div class="property-row"><span>Sampling</span><span class="property-value">Latin hypercube</span></div><div class="property-row"><span>Confidence</span><span class="property-value">95 %</span></div><div class="property-row"><span>Duration</span><span class="property-value">14 min 28 s</span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Worst samples</span><span class="mini-badge error">14 fail</span></div>
        <div class="failure-row"><strong><span>#0731 · bandwidth</span><span class="error-text">−8.4%</span></strong><p>SS · 125 °C · R3 +2.81σ · C1 +2.42σ</p></div>
        <div class="failure-row"><strong><span>#0184 · phase margin</span><span class="error-text">−3.7°</span></strong><p>FF · −40 °C · Ccomp −2.64σ · gm +2.19σ</p></div>
        <div class="failure-row"><strong><span>#0922 · offset</span><span class="error-text">+11.2 µV</span></strong><p>TT · 27 °C · Vos U1 +3.04σ</p></div>
      </div>
      <div class="panel-section"><div class="section-head"><span class="grow">Top contributors</span></div><div class="validation-meter"><div class="meter-head"><span>R3 mismatch</span><span class="mono">31.4%</span></div><div class="progress-bar" style="--progress:31.4%"><span></span></div></div><div class="validation-meter"><div class="meter-head"><span>C1 tolerance</span><span class="mono">24.8%</span></div><div class="progress-bar" style="--progress:24.8%"><span></span></div></div><div class="validation-meter"><div class="meter-head"><span>U1 input offset</span><span class="mono">18.7%</span></div><div class="progress-bar" style="--progress:18.7%"><span></span></div></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Actions</span></div><div class="section-body" style="display:grid;gap:6px"><button class="button primary" data-surface-action="open-worst-sample">Open worst sample</button><button class="button" data-surface-action="create-optimization-seed">Create optimization seed</button><button class="button" data-surface-action="export-verification-report">Export verification report</button></div></div>`;

    if (view === "models") return modelInspectorFor(state.selectedModel);

    return `${panelHeader("Diagnostics & tuner")}
      <div class="panel-section"><div class="section-head"><span class="grow">Advisories</span><span class="mini-badge warn">2</span></div>
        <div class="diagnostic-row"><span class="diag-icon">△</span><div><strong>Maximum transient step is implicit</strong><p>line 128 · consider MAXSTEP=10u for edge fidelity</p></div></div>
        <div class="diagnostic-row"><span class="diag-icon">i</span><div><strong>Model section inherited</strong><p>line 14 · demo180 defaults to section “tt”</p></div></div>
      </div>
      <div class="panel-section"><div class="section-head"><span class="grow">Parameter exploration</span><span class="mini-badge accent">dedicated workspace</span></div><p class="muted">Use the non-destructive tuning sandbox for live plots, measurement deltas, limit checks and explicit commit or revert.</p><div class="section-body"><button class="button" style="width:100%" data-surface-action="open-tuning">Open parameter tuner</button></div></div>
      <div class="panel-section"><div class="section-head"><span class="grow">Generated provenance</span></div><div class="property-list"><div class="property-row"><span>Source cell/view</span><span class="property-value">sensor_afe/top</span></div><div class="property-row"><span>Input revision</span><span class="property-value">${state.inputRevision}</span></div><div class="property-row"><span>Generator state</span><span class="property-value">${state.netlistDirty ? "edited · validation pending" : "generated · source mapped"}</span></div><div class="property-row"><span>Netlist digest</span><span class="property-value">${state.netlistDirty ? "pending validation" : "62f3…d09a"}</span></div></div></div>`;
  }

  function projectConfigurationStage(section) {
    if (section === "config") return `<div class="workspace-view project-view"><div class="project-header"><div class="project-title"><span class="eyebrow">TESTBENCH CONFIGURATION · AFE_LAB</span><h1>Hierarchy and view binding</h1><p>Define the exact design, view, model, environment and netlisting contracts used by every run.</p></div><div class="project-header-actions"><button class="button" data-project-section="dashboard">${iconSvg("arrow-left")} Project</button><button class="button primary" data-surface-action="validate-config">Validate configuration</button></div></div><div class="setup-workspace-grid"><section class="table-card span-2"><div class="card-head"><h3>Hierarchy binding table</h3><span class="mini-badge ok">126 instances resolved</span></div><table class="data-table"><thead><tr><th>Cell / pattern</th><th>Purpose</th><th>View search order</th><th>Stop view</th><th>Model section</th><th>Status</th></tr></thead><tbody><tr><td class="mono">sensor_afe/top</td><td>testbench root</td><td class="mono">schematic → spice</td><td>—</td><td>inherit PVT</td><td><span class="mini-badge ok">resolved</span></td></tr><tr><td class="mono">sensor_afe/afe_core</td><td>design under test</td><td class="mono">schematic → extracted → spice</td><td>spice</td><td>inherit PVT</td><td><span class="mini-badge ok">resolved</span></td></tr><tr><td class="mono">vendor_analog/OPA189</td><td>macro-model</td><td class="mono">spice</td><td>spice</td><td>typical / min / max</td><td><span class="mini-badge ok">resolved</span></td></tr><tr><td class="mono">demo180/*</td><td>foundry devices</td><td class="mono">spectre → spice</td><td>spice</td><td>ff/fs/tt/sf/ss</td><td><span class="mini-badge ok">resolved</span></td></tr></tbody></table></section><section class="table-card"><div class="card-head"><h3>Netlisting policy</h3></div><div class="section-body property-list"><div class="property-row"><span>Hierarchy</span><span class="property-value">preserve names</span></div><div class="property-row"><span>Parameter evaluation</span><span class="property-value">strict units</span></div><div class="property-row"><span>Unbound cell</span><span class="property-value error-text">block</span></div><div class="property-row"><span>Global nets</span><span class="property-value">explicit only</span></div></div></section><section class="table-card"><div class="card-head"><h3>Environment</h3></div><div class="section-body property-list"><div class="property-row"><span>Technology</span><span class="property-value">demo180 · 2.3.1</span></div><div class="property-row"><span>Supply profile</span><span class="property-value">AFE 5 V bipolar</span></div><div class="property-row"><span>Temperature source</span><span class="property-value">run set</span></div><div class="property-row"><span>Ground policy</span><span class="property-value">node 0 canonical</span></div></div></section></div></div>`;
    if (section === "technology") return `<div class="workspace-view project-view"><div class="project-header"><div class="project-title"><span class="eyebrow">TECHNOLOGY ATTACHMENT · DEMO180 2.3.1</span><h1>Technology and PDK contract</h1><p>Versioned attachment for symbols, models, rules, sections and qualification evidence.</p></div><div class="project-header-actions"><button class="button" data-project-section="dashboard">${iconSvg("arrow-left")} Project</button><button class="button primary" data-surface-action="attach-pdk">Attach technology…</button></div></div><div class="metric-grid"><div class="metric-card"><span class="metric-label">Attachment</span><div class="metric-value ok-text">resolved</div><div class="metric-foot">demo180 · exact version</div></div><div class="metric-card"><span class="metric-label">Model sections</span><div class="metric-value">5</div><div class="metric-foot">ff · fs · tt · sf · ss</div></div><div class="metric-card"><span class="metric-label">Rule decks</span><div class="metric-value">4</div><div class="metric-foot">DRC · ERC · SOA · reliability</div></div><div class="metric-card"><span class="metric-label">Qualification</span><div class="metric-value ok-text">99.3%</div><div class="metric-foot">technical checks · review tracked</div></div></div><section class="table-card"><div class="card-head"><h3>PDK resources</h3></div><table class="data-table"><thead><tr><th>Resource</th><th>Version / digest</th><th>Scope</th><th>Platform</th><th>Status</th></tr></thead><tbody><tr><td>Device symbols & CDF</td><td class="mono">2.3.1 · 1a22…f014</td><td>schematic</td><td>all</td><td><span class="mini-badge ok">loaded</span></td></tr><tr><td>SPICE model library</td><td class="mono">2.3.1 · 93d4…117c</td><td>simulation</td><td>all</td><td><span class="mini-badge ok">verified</span></td></tr><tr><td>Physical DRC deck</td><td class="mono">v12 · 19f2…bc71</td><td>physical verification</td><td>desktop · web handoff</td><td><span class="mini-badge ok">qualified</span></td></tr><tr><td>SOA / reliability rules</td><td class="mono">2.1.0 · c034…9c11</td><td>electrical verification</td><td>desktop · web</td><td><span class="mini-badge ok">verified</span></td></tr><tr><td>Extraction mapping</td><td class="mono">roadmap</td><td>post-layout</td><td>—</td><td><span class="mini-badge">not attached</span></td></tr></tbody></table></section></div>`;
    if (section === "dependencies") return `<div class="workspace-view project-view"><div class="project-header"><div class="project-title"><span class="eyebrow">DEPENDENCY MANIFEST · CONTENT ADDRESSED</span><h1>Project dependency graph</h1><p>Libraries, model files, behavioral sources and external contracts required to reproduce the project.</p></div><div class="project-header-actions"><button class="button" data-project-section="dashboard">${iconSvg("arrow-left")} Project</button><button class="button primary" data-surface-action="export-lockfile">Export lockfile</button></div></div><div class="include-graph-layout"><section class="table-card"><div class="card-head"><h3>Locked dependencies</h3><span class="mini-badge ok">all resolved</span></div><table class="data-table"><thead><tr><th>Dependency</th><th>Type</th><th>Version / digest</th><th>Source</th><th>License</th><th>Status</th></tr></thead><tbody><tr><td>demo180</td><td>PDK</td><td class="mono">2.3.1</td><td>workspace registry</td><td>project</td><td><span class="mini-badge ok">locked</span></td></tr><tr><td>OPA189.lib</td><td>vendor model</td><td class="mono">be17…481c</td><td>project/models</td><td>vendor supplied</td><td><span class="mini-badge ok">locked</span></td></tr><tr><td>sensor_bridge.va</td><td>Verilog-A</td><td class="mono">0b72…a84f</td><td>project/models</td><td>project</td><td><span class="mini-badge ok">compiled</span></td></tr><tr><td>afe_requirements.csv</td><td>requirements</td><td class="mono">req-19</td><td>project/specs</td><td>project</td><td><span class="mini-badge ok">mapped</span></td></tr></tbody></table></section><section class="table-card"><div class="card-head"><h3>Reproducibility contract</h3></div><div class="section-body property-list"><div class="property-row"><span>Manifest format</span><span class="property-value">rspice.lock 1.0</span></div><div class="property-row"><span>Missing dependency</span><span class="property-value error-text">fail closed</span></div><div class="property-row"><span>Mutable external path</span><span class="property-value">copy or pin digest</span></div><div class="property-row"><span>Manifest digest</span><span class="property-value mono">62f3…d09a</span></div></div></section></div></div>`;
    return `<div class="workspace-view project-view"><div class="project-header"><div class="project-title"><span class="eyebrow">RECOVERY · 8 CHECKPOINTS</span><h1>Autosave and recovery history</h1><p>Review, compare and restore interrupted work without overwriting the last explicit save.</p></div><div class="project-header-actions"><button class="button" data-project-section="dashboard">${iconSvg("arrow-left")} Project</button><button class="button primary" data-surface-action="create-checkpoint">Create checkpoint</button></div></div><section class="table-card"><div class="card-head"><h3>Recovery points</h3><span class="mini-badge ok">protected</span></div><table class="data-table"><thead><tr><th>Time</th><th>Document</th><th>Changes</th><th>Base revision</th><th>Integrity</th><th>Actions</th></tr></thead><tbody><tr><td>34 seconds ago</td><td>top · schematic</td><td>3 property edits</td><td class="mono">7c49d2b</td><td><span class="mini-badge ok">verified</span></td><td><button class="button ghost" data-surface-action="compare-checkpoint">Compare</button> <button class="button" data-surface-action="restore-checkpoint">Restore copy</button></td></tr><tr><td>5 minutes ago</td><td>Lab characterization</td><td>2 analysis settings</td><td class="mono">7c49d2b</td><td><span class="mini-badge ok">verified</span></td><td><button class="button ghost" data-surface-action="compare-checkpoint">Compare</button> <button class="button" data-surface-action="restore-checkpoint">Restore copy</button></td></tr><tr><td>18 minutes ago</td><td>models.lib</td><td>include ordering</td><td class="mono">62fe381</td><td><span class="mini-badge ok">verified</span></td><td><button class="button ghost" data-surface-action="compare-checkpoint">Compare</button> <button class="button" data-surface-action="restore-checkpoint">Restore copy</button></td></tr></tbody></table></section><div class="concept-banner">${iconSvg("info")}Restoring opens a recovered comparison document. The saved project is never overwritten until the user explicitly accepts the recovered changes.</div></div>`;
  }

  function projectStage() {
    const section = state.projectSection || "dashboard";
    if (section !== "dashboard") return projectConfigurationStage(section);
    const planCodes = [...state.enabledAnalyses].map((id) => analysisDefinition(id).code);
    const planSummary = `${planCodes.slice(0, 6).join(" · ")}${planCodes.length > 6 ? ` · +${planCodes.length - 6}` : ""}`;
    return `<div class="workspace-view project-view">
      <div class="project-header"><div class="project-title"><span class="eyebrow">PROJECT WORKSPACE · REVISION ${escapeHtml(state.inputRevision.toUpperCase())}</span><h1>Precision Sensor AFE</h1><p>Hierarchical analog front end · 3 sheets · 126 instances · ${state.dirty ? "working changes autosaved" : "autosave current"}</p></div><div class="project-header-actions"><button class="button" data-surface-action="open-project">${iconSvg("folder")} Open project</button><button class="button primary" data-view-target="design">${iconSvg("schematic")} Open top schematic</button></div></div>
      <div class="metric-grid">
        <div class="metric-card"><span class="metric-label">Schematic checks</span><div class="metric-value ${state.checksCurrent ? "ok-text" : "warn-text"}">${state.checksCurrent ? "0" : "—"} <small>${state.checksCurrent ? "errors" : "stale"}</small></div><div class="metric-foot">${state.checksCurrent ? `2 advisories · checked ${state.inputRevision}` : `rerun required for ${state.inputRevision}`}</div></div>
        <div class="metric-card"><span class="metric-label">Active simulation plan</span><div class="metric-value">${state.enabledAnalyses.size} <small>analyses enabled</small></div><div class="metric-foot">15 PVT points · 27 outputs · ${state.enabledAnalyses.has("mc") && REQUIRED_NOMINAL_ANALYSES.every((analysis) => state.enabledAnalyses.has(analysis)) ? "release profile configured" : "release evidence incomplete"}</div></div>
        <div class="metric-card"><span class="metric-label">Reference verification yield</span><div class="metric-value warn-text">98.6 <small>%</small></div><div class="metric-foot">MC-REF-17 · req-17 · below 99% gate</div></div>
        <div class="metric-card"><span class="metric-label">Model dependencies</span><div class="metric-value">7 <small>files</small></div><div class="metric-foot">All resolved · 1 Verilog-A advisory</div></div>
      </div>
      <div class="project-grid">
        <section class="subtle-card project-entry-pane"><div class="card-head"><h3>Design entry points</h3><button class="button ghost" data-surface-action="manage-library">Manage library</button></div>
          <button class="project-list-row" data-view-target="design"><span class="item-icon">${iconSvg("schematic")}</span><span><strong>top · schematic</strong><small>Primary testbench · ${state.dirty ? "working changes autosaved 34 seconds ago" : `saved revision ${state.inputRevision}`}</small></span><span class="mini-badge ${state.checksCurrent ? "ok" : "warn"}">${state.checksCurrent ? "checks current" : "checks stale"}</span><span class="mono faint">126 inst</span></button>
          <button class="project-list-row" data-view-target="design"><span class="item-icon">${iconSvg("schematic")}</span><span><strong>afe_core · schematic</strong><small>Instrumentation amplifier core</small></span><span class="mini-badge">saved</span><span class="mono faint">48 inst</span></button>
          <button class="project-list-row" data-view-target="simulate"><span class="item-icon">${iconSvg("simulate")}</span><span><strong>Lab characterization</strong><small>${planSummary}</small></span><span class="mini-badge accent">active</span><span class="mono faint">${state.enabledAnalyses.size} on</span></button>
          <button class="project-list-row" data-view-target="verify"><span class="item-icon">${iconSvg("verify")}</span><span><strong>Reference PVT & Monte Carlo</strong><small>MC-REF-17 · requirement mapping req-17</small></span><span class="mini-badge warn">review required</span><span class="mono faint">1000 pts</span></button>
          <button class="project-list-row" type="button" data-surface-action="open-drc"><span class="item-icon">${iconSvg("layers")}</span><span><strong>Physical DRC · Run 42</strong><small>Layout L42 · demo180_drc_v12 · governed markers</small></span><span class="mini-badge error">23 blocking</span><span class="mono faint">26 mk</span></button>
          <button class="project-list-row" type="button" data-surface-action="post-layout"><span class="item-icon">${iconSvg("layers")}</span><span><strong>LVS, PEX & multiphysics</strong><small>Identity mapping · parasitics · EM / electrothermal</small></span><span class="mini-badge warn">engines roadmap</span><span class="mono faint">review</span></button>
        </section>
        <section class="subtle-card project-history-pane"><div class="card-head"><h3>Recent runs & recovery</h3><button class="icon-button" aria-label="More recent run options">${iconSvg("more")}</button></div>
          <div class="recent-run"><div class="recent-run-head"><strong>Run ${state.runId} · ${state.resultManifest.runSet.name}</strong><span class="mini-badge ${state.resultsStale || !state.resultManifest.qualification.signOffEligible ? "warn" : "ok"}">${state.resultsStale ? "historical" : state.resultManifest.qualification.signOffEligible ? `${state.resultPassedSpecCount} / ${state.resultSpecCount} executable checks · eligible` : resultEligibilityCopy()}</span></div><p>${state.resultManifest.runSet.pointCount} PVT points · reference ${state.resultCorner} · requirements ${REQUIREMENT_CONTRACT.id}</p><div class="recent-run-foot"><span>${state.resultDuration}</span><span>revision ${state.resultManifest.inputRevision}</span></div></div>
          <div class="recent-run"><div class="recent-run-head"><strong>Yield 1000 · MC-REF-17</strong><span class="mini-badge warn">98.6% · below 99% gate</span></div><p>Monte Carlo · req-17 · Latin hypercube · seed 73a4</p><div class="recent-run-foot"><span>14 min 28 s</span><span>14 failures</span></div></div>
          <div class="recent-run"><div class="recent-run-head"><strong>Autosave checkpoint</strong><span class="mini-badge ok">current</span></div><p>top · schematic · 34 seconds ago</p><div class="recent-run-foot"><span>recoverable</span><span>8 retained</span></div></div>
        </section>
      </div>
    </div>`;
  }

  function designStage() {
    return `<div class="workspace-view schematic-view"><div class="canvas-wrap">
      <canvas id="schematic-canvas" role="img" tabindex="0" aria-describedby="schematic-help" aria-label="Precision sensor analog front-end schematic; U1, U2 and U3 form an instrumentation amplifier with gain resistor RG and filtered AFE output"></canvas><span class="sr-only" id="schematic-help">Use arrow keys to move selection among U1, U2, U3 and RG. The same instances are available in the Design navigator.</span>
      <div class="canvas-breadcrumb"><strong>sensor_afe</strong><span class="sep">/</span><strong>top</strong><span class="sep">/</span><span>schematic</span></div>
      <div class="canvas-note" id="schematic-check-note">${!state.checksCurrent ? "<span>△</span><span>Schematic checks stale · run preflight</span>" : state.resultsStale ? `<span>△</span><span>Checks current · Run ${state.runId} annotations historical</span>` : "<span>✓</span><span>Checks and annotations current</span>"}</div>
      <div class="minimap" aria-hidden="true"></div>
    </div></div>`;
  }

  function simulationSetupSectionStage(section) {
    const planGraph = executionTaskGraph(state.enabledAnalyses, effectiveAnalysisValues(state.enabledAnalyses, state.analysisValues));
    const runDimensionRows = RUN_SET_DIMENSIONS.map((dimension, index) => `<tr><td class="mono">${String(index + 1).padStart(2, "0")}</td><td>${dimension.label}</td><td class="mono">${dimension.values.join(", ")}</td><td>${dimension.combination}</td><td>${dimension.reuse}</td><td><span class="mini-badge ok">${dimension.values.length} values</span></td></tr>`).join("");
    const definitions = {
      variables: {
        eyebrow: "PARAMETERIZATION · 6 VARIABLES",
        title: "Design variables",
        copy: "Typed, unit-aware parameters shared by schematic, analyses, sweeps and optimization.",
        action: `${iconSvg("plus")} Add variable`,
        body: `<div class="setup-workspace-grid"><section class="table-card span-2"><div class="card-head"><h3>Variable registry</h3><span class="mini-badge ok">dimensionally valid</span></div><table class="data-table"><thead><tr><th>Name</th><th>Expression</th><th>Resolved value</th><th>Scope</th><th>Sweep use</th><th>Status</th></tr></thead><tbody><tr><td class="mono">RGAIN</td><td class="mono">499 ohm</td><td class="mono">499.000 Ω</td><td>project</td><td>Optimization</td><td><span class="mini-badge ok">valid</span></td></tr><tr><td class="mono">CFILT</td><td class="mono">22 nF</td><td class="mono">22.0000 nF</td><td>testbench</td><td>Monte Carlo</td><td><span class="mini-badge ok">valid</span></td></tr><tr><td class="mono">VREF</td><td class="mono">VDD / 2</td><td class="mono">2.50000 V</td><td>testbench</td><td>—</td><td><span class="mini-badge ok">valid</span></td></tr><tr><td class="mono">TEMP</td><td class="mono">temperature()</td><td class="mono">run-set</td><td>PVT</td><td>Temperature</td><td><span class="mini-badge accent">bound</span></td></tr><tr><td class="mono">CLOAD</td><td class="mono">10 pF</td><td class="mono">10.0000 pF</td><td>cell</td><td>Nested sweep</td><td><span class="mini-badge ok">valid</span></td></tr></tbody></table></section><section class="table-card"><div class="card-head"><h3>Selected variable</h3></div><div class="section-body property-list"><div class="field-block"><label>Name</label><input class="input mono" value="RGAIN"></div><div class="field-block"><label>Expression</label><input class="input mono" value="499 ohm"></div><div class="field-block"><label>Description</label><input class="input" value="Instrumentation gain resistor"></div><div class="property-row"><span>Dependencies</span><span class="property-value">4 expressions</span></div></div></section><section class="table-card"><div class="card-head"><h3>Dependency preview</h3></div><div class="section-body"><div class="dependency-chain"><span class="mini-badge accent">RGAIN</span><span>→</span><span class="mini-badge">gain_dc</span><span>→</span><span class="mini-badge">gain specification</span></div><p class="muted">Changing the variable invalidates OP, AC, STB and dependent measurements while preserving unrelated datasets.</p></div></section></div>`
      },
      outputs: {
        eyebrow: "OUTPUT POLICY · 27 SAVED SIGNALS",
        title: "Outputs, expressions & calculators",
        copy: "Select raw data deliberately, derive typed expressions and estimate storage before execution.",
        action: `${iconSvg("plus")} Add output`,
        body: `<div class="setup-workspace-grid"><section class="table-card span-2"><div class="card-head"><h3>Output registry</h3><span class="mini-badge">18 raw · 9 derived</span></div><table class="data-table"><thead><tr><th>Output / expression</th><th>Domain</th><th>Save policy</th><th>Precision</th><th>Consumers</th><th>Status</th></tr></thead><tbody><tr><td class="mono">V(afe_out)</td><td>all compatible</td><td>every accepted point</td><td class="mono">f64</td><td>4 plots · 3 specs</td><td><span class="mini-badge ok">resolved</span></td></tr><tr><td class="mono">I(VDD)</td><td>OP · TRAN</td><td>selected + final</td><td class="mono">f64</td><td>power()</td><td><span class="mini-badge ok">resolved</span></td></tr><tr><td class="mono">db20(V(afe_out)/V(diff))</td><td>AC</td><td>derived on demand</td><td class="mono">complex128</td><td>gain plot</td><td><span class="mini-badge ok">typed</span></td></tr><tr><td class="mono">integ(onoise, 10, 100k)</td><td>NOISE</td><td>measurement only</td><td class="mono">f64</td><td>noise spec</td><td><span class="mini-badge ok">typed</span></td></tr></tbody></table></section><section class="table-card"><div class="card-head"><h3>Expression editor</h3><span class="mini-badge ok">V/V</span></div><div class="section-body"><label class="field-block"><span>Expression</span><textarea class="input mono" rows="4">db20(V(afe_out) / V(sensor_p, sensor_n))</textarea></label><div class="property-list"><div class="property-row"><span>Inferred unit</span><span class="property-value">dB</span></div><div class="property-row"><span>Dependencies</span><span class="property-value">2 nodes</span></div><div class="property-row"><span>Evaluation</span><span class="property-value">lazy · cached</span></div></div></div></section><section class="table-card"><div class="card-head"><h3>Storage estimate</h3><span class="mini-badge ok">within budget</span></div><div class="section-body"><div class="metric-value">684 <small>MiB</small></div><p class="muted">15 PVT points · adaptive transient · full AC complex data.</p><div class="progress-bar" style="--progress:34%"><span></span></div><button class="button" data-surface-action="optimize-save">Optimize save policy</button></div></section></div>`
      },
      specifications: {
        eyebrow: "REQUIREMENTS · 14 MAPPED / 14 TOTAL",
        title: "Specifications & measurement contracts",
        copy: "Requirements bind expressions, analysis dependencies, limits, tolerances and regression behavior.",
        action: `${iconSvg("plus")} Add specification`,
        body: `<div class="setup-workspace-grid"><section class="table-card span-2"><div class="card-head"><h3>Specification registry</h3><span class="mini-badge">4 shown / 14 required</span><span class="mini-badge ok">all required measurements mapped</span></div><table class="data-table"><thead><tr><th>Requirement</th><th>Measurement</th><th>Analysis</th><th>Limit</th><th>Guard band</th><th>Last result</th><th>Coverage</th></tr></thead><tbody><tr><td>DC gain</td><td class="mono">gain_dc</td><td>AC</td><td class="mono">≥ 39.5 dB</td><td class="mono">0.2 dB</td><td class="ok-text">40.007 dB</td><td><span class="mini-badge ok">mapped</span></td></tr><tr><td>Settling</td><td class="mono">t_settle</td><td>TRAN</td><td class="mono">≤ 5 ms</td><td class="mono">0.25 ms</td><td class="ok-text">4.812 ms</td><td><span class="mini-badge ok">mapped</span></td></tr><tr><td>Input noise</td><td class="mono">inoise_total</td><td>NOISE</td><td class="mono">≤ 18 nV/√Hz</td><td class="mono">1 nV/√Hz</td><td class="ok-text">14.818</td><td><span class="mini-badge ok">mapped</span></td></tr><tr><td>Startup recovery</td><td class="mono">startup_recovery</td><td>TRAN</td><td class="mono">≤ 20 ms</td><td class="mono">1.0 ms</td><td class="ok-text">18.24 ms</td><td><span class="mini-badge ok">mapped</span></td></tr></tbody></table></section><section class="table-card"><div class="card-head"><h3>Evaluation policy</h3></div><div class="section-body property-list"><div class="property-row"><span>Nominal failures</span><span class="property-value">block release</span></div><div class="property-row"><span>Monte Carlo</span><span class="property-value">yield ≥ 99%</span></div><div class="property-row"><span>Regression tolerance</span><span class="property-value">limit + waveform</span></div><div class="property-row"><span>Missing measurement</span><span class="property-value error-text">fail closed</span></div></div></section><section class="table-card"><div class="card-head"><h3>Requirement sources</h3></div><div class="section-body"><div class="source-title"><strong>afe_requirements.csv</strong><span class="mini-badge ok">synchronized</span></div><p class="muted">14 requirements · revision req-19 · imported with stable IDs.</p><button class="button" data-surface-action="map-requirements">Review requirement mappings</button></div></section></div>`
      },
      runset: {
        eyebrow: `RUN SET &middot; ${PVT_RUN_POINTS.length} PVT POINTS &middot; ${planGraph.total.toLocaleString()} ANALYSIS TASKS`,
        title: "PVT, nested sweeps & statistical variation",
        copy: "Compose process, environment, parameter and statistical dimensions without losing provenance.",
        action: `${iconSvg("grid")} Preview task matrix`,
        body: `<div class="setup-workspace-grid"><section class="table-card span-2"><div class="card-head"><h3>Dimension stack</h3><span class="mini-badge accent">${planGraph.total.toLocaleString()} tasks</span></div><table class="data-table"><thead><tr><th>Order</th><th>Dimension</th><th>Values</th><th>Combination</th><th>Reuse</th><th>Status</th></tr></thead><tbody>${runDimensionRows}<tr><td class="mono">03</td><td>Nested parameter sweep</td><td class="mono">disabled in this run set</td><td>defined in Sweep Matrix</td><td>?</td><td><span class="mini-badge">off</span></td></tr><tr><td class="mono">04</td><td>Monte Carlo</td><td class="mono">disabled in this run set</td><td>separate variation run</td><td>seeded</td><td><span class="mini-badge">off</span></td></tr></tbody></table></section><section class="table-card"><div class="card-head"><h3>PVT selection</h3></div><div class="section-body"><div class="selection-chip-grid"><button class="mini-badge accent">FF</button><button class="mini-badge accent">FS</button><button class="mini-badge accent">TT</button><button class="mini-badge accent">SF</button><button class="mini-badge accent">SS</button></div><div class="selection-chip-grid"><button class="mini-badge accent">−40 °C</button><button class="mini-badge accent">27 °C</button><button class="mini-badge accent">125 °C</button></div><div class="property-list"><div class="property-row"><span>Nominal point</span><span class="property-value">TT · 27 °C</span></div><div class="property-row"><span>Failure policy</span><span class="property-value">continue point set</span></div></div></div></section><section class="table-card"><div class="card-head"><h3>Workload & memory</h3><span class="mini-badge ok">ready</span></div><div class="section-body"><div class="metric-value">${formatDuration(estimatedRunDurationSeconds(state.enabledAnalyses, effectiveAnalysisValues(state.enabledAnalyses, state.analysisValues)))} <small>estimated</small></div><div class="property-list"><div class="property-row"><span>Parallel slots</span><span class="property-value">12 local</span></div><div class="property-row"><span>Result estimate</span><span class="property-value">684 MiB</span></div><div class="property-row"><span>Checkpoint</span><span class="property-value">per point</span></div></div></div></section></div>`
      },
      models: {
        eyebrow: "MODEL BINDING · 7 FILES · DIGEST BE17…481C",
        title: "Models, PDK sections & include order",
        copy: "Resolve every instance through an explicit library, section and qualification record.",
        action: `${iconSvg("library")} Open Model Manager`,
        body: `<div class="setup-workspace-grid"><section class="table-card span-2"><div class="card-head"><h3>Ordered include graph</h3><span class="mini-badge ok">no shadowing</span></div><table class="data-table"><thead><tr><th>Order</th><th>Source</th><th>Section</th><th>Provides</th><th>Digest</th><th>Platform</th></tr></thead><tbody><tr><td class="mono">01</td><td class="mono">models/models.lib</td><td>project</td><td>aliases · parameters</td><td class="mono">2a91…18ef</td><td>all</td></tr><tr><td class="mono">02</td><td class="mono">demo180/corners.lib</td><td class="mono">${state.planCorner.split(" · ")[0].toLowerCase()}</td><td>BSIM4 · passives</td><td class="mono">93d4…117c</td><td>all</td></tr><tr><td class="mono">03</td><td class="mono">vendor/OPA189.lib</td><td>typical</td><td>OPA189_A</td><td class="mono">be17…481c</td><td>desktop · WASM</td></tr><tr><td class="mono">04</td><td class="mono">sensor_bridge.va</td><td>default</td><td>sensor_bridge</td><td class="mono">0b72…a84f</td><td>interpreted · JIT preview</td></tr></tbody></table></section><section class="table-card"><div class="card-head"><h3>Binding policy</h3></div><div class="section-body property-list"><div class="property-row"><span>Unresolved model</span><span class="property-value error-text">block preflight</span></div><div class="property-row"><span>Duplicate definition</span><span class="property-value">explicit override only</span></div><div class="property-row"><span>Section fallback</span><span class="property-value">disabled</span></div><div class="property-row"><span>Encrypted models</span><span class="property-value">license-gated</span></div></div></section><section class="table-card"><div class="card-head"><h3>Qualification gate</h3><span class="mini-badge warn">runnable · release review pending</span></div><div class="section-body"><div class="validation-meter"><div class="meter-head"><span>Required test vectors</span><span>1,397 / 1,406</span></div><div class="progress-bar" style="--progress:99.3%"><span></span></div></div><p class="muted">Nine review or waiver dispositions remain; release promotion fails closed until they are approved.</p></div></section></div>`
      },
      solver: {
        eyebrow: "NUMERICS · BALANCED PRESET · DETERMINISTIC",
        title: "Solver, convergence & per-analysis overrides",
        copy: "Expose robust defaults without hiding exact tolerances, continuation paths or fallback behavior.",
        action: `${iconSvg("check")} Validate options`,
        body: `<div class="setup-workspace-grid"><section class="table-card span-2"><div class="card-head"><h3>Solver preset</h3><span class="mini-badge ok">validated</span></div><div class="preset-grid"><button class="preset-card"><strong>Fast</strong><small>Looser tolerances · exploratory</small></button><button class="preset-card selected"><strong>Balanced</strong><small>Release default · current</small></button><button class="preset-card"><strong>Accurate</strong><small>Tighter LTE · verification</small></button><button class="preset-card"><strong>Robust</strong><small>Aggressive continuation</small></button></div></section><section class="table-card"><div class="card-head"><h3>Core tolerances</h3></div><div class="section-body property-list"><div class="property-row"><span>RELTOL</span><span class="property-value mono">1.000e−4</span></div><div class="property-row"><span>VABSTOL</span><span class="property-value mono">1.000e−9 V</span></div><div class="property-row"><span>IABSTOL</span><span class="property-value mono">1.000e−12 A</span></div><div class="property-row"><span>Charge tolerance</span><span class="property-value mono">1.000e−14 C</span></div></div></section><section class="table-card"><div class="card-head"><h3>Convergence sequence</h3></div><div class="section-body"><ol class="compact-steps"><li>Newton + merit line search</li><li>Adaptive gmin stepping</li><li>Source stepping</li><li>Pseudo-transient continuation</li><li>Typed failure with residual report</li></ol></div></section><section class="table-card span-2"><div class="card-head"><h3>Per-analysis overrides</h3></div><table class="data-table"><thead><tr><th>Analysis</th><th>Integrator / solver</th><th>Accuracy</th><th>Max iterations</th><th>Fallback</th></tr></thead><tbody><tr><td>TRAN</td><td>Gear2 · sparse KLU</td><td>balanced</td><td class="mono">50</td><td>trap retry disabled</td></tr><tr><td>AC / NOISE</td><td>complex sparse</td><td>accurate</td><td class="mono">—</td><td>fail closed</td></tr><tr><td>STB</td><td>Middlebrook extraction</td><td>accurate</td><td class="mono">80</td><td>diagnostic sweep</td></tr></tbody></table></section></div>`
      },
      save: {
        eyebrow: "RESULT STORAGE · STREAMING · RETENTION",
        title: "Save, streaming & retention policy",
        copy: "Control precision, decimation and retention explicitly for desktop, browser and remote targets.",
        action: `${iconSvg("save")} Save policy preset`,
        body: `<div class="setup-workspace-grid"><section class="table-card span-2"><div class="card-head"><h3>Signal groups</h3><span class="mini-badge ok">684 MiB estimated</span></div><table class="data-table"><thead><tr><th>Group</th><th>Signals</th><th>Accepted points</th><th>Live stream</th><th>Precision</th><th>Estimate</th></tr></thead><tbody><tr><td>Probes</td><td>12</td><td>all</td><td>full rate</td><td class="mono">f64</td><td>482 MiB</td></tr><tr><td>Supply currents</td><td>4</td><td>all</td><td>decimate 4×</td><td class="mono">f64</td><td>94 MiB</td></tr><tr><td>Device OP</td><td>83</td><td>final only</td><td>off</td><td class="mono">f64</td><td>12 MiB</td></tr><tr><td>Debug internals</td><td>0</td><td>on failure</td><td>off</td><td class="mono">f64</td><td>96 MiB reserve</td></tr></tbody></table></section><section class="table-card"><div class="card-head"><h3>Streaming</h3></div><div class="section-body property-list"><div class="property-row"><span>Live plot budget</span><span class="property-value">60 fps · 4 traces</span></div><div class="property-row"><span>Worker chunks</span><span class="property-value">4 MiB</span></div><div class="property-row"><span>Backpressure</span><span class="property-value">decimate display only</span></div><div class="property-row"><span>Disk commit</span><span class="property-value">transactional</span></div></div></section><section class="table-card"><div class="card-head"><h3>Retention</h3></div><div class="section-body property-list"><div class="property-row"><span>Successful runs</span><span class="property-value">keep 20</span></div><div class="property-row"><span>Failed partials</span><span class="property-value">7 days</span></div><div class="property-row"><span>Checkpoints</span><span class="property-value">until run accepted</span></div><div class="property-row"><span>Golden baselines</span><span class="property-value">immutable</span></div></div></section></div>`
      }
    };
    const page = definitions[section] || definitions.variables;
    return `<div class="workspace-view simulation-view"><div class="view-title-row"><div><span class="eyebrow">${page.eyebrow}</span><h1>${page.title}</h1><p>${page.copy}</p></div><div class="view-actions"><button class="button" data-simulation-section="analyses">${iconSvg("arrow-left")} Analyses</button><button class="button primary" data-surface-action="section-primary">${page.action}</button></div></div>${page.body}</div>`;
  }

  function analysisSelectOptions(label, current) {
    const key = label.toLowerCase();
    let candidates = [current];
    if (key.includes("sweep") || key.includes("combination")) candidates.push("Linear", "Decade", "Octave", "List", "Cartesian");
    else if (key.includes("accuracy") || key.includes("preset")) candidates.push("Fast", "Balanced", "Accurate", "Robust");
    else if (key.includes("policy") || key.includes("retain") || key.includes("save")) candidates.push("Automatic", "Complete all", "Failures only", "Disabled");
    else if (key.includes("method") || key.includes("integration") || key.includes("solver")) candidates.push("Automatic", "Trapezoidal", "Gear 2", "Direct", "Adjoint");
    else if (key.includes("mode") || key.includes("type") || key.includes("behavior")) candidates.push("Automatic", "Driven", "Autonomous", "Time average", "Compatibility");
    else if (key.includes("input") || key.includes("output") || key.includes("source") || key.includes("probe") || key.includes("prerequisite") || key.includes("profile") || key.includes("section")) candidates.push("Select…", "Automatic", "Project default");
    else candidates.push("Enabled", "Disabled", "Automatic");
    return [...new Set(candidates)].map((option) => `<option${option === current ? " selected" : ""}>${escapeHtml(option)}</option>`).join("");
  }

  function simulationStage() {
    if ((state.simulationSection || "analyses") !== "analyses") return simulationSetupSectionStage(state.simulationSection);
    const configured = state.configuredAnalyses || new Set(["op", "tran", "ac", "noise", "stb", "dc", "sens", "fourier"]);
    const analyses = [...configured].map((id) => analysisDefinition(id));
    const planGroups = [["solver", "Numerical analyses"], ["sweep", "Sweeps & variation"], ["measurement", "Derived measurements"]];
    let planIndex = 0;
    const cards = planGroups.map(([kind, label]) => {
      const members = analyses.filter((analysis) => analysis.kind === kind);
      if (!members.length) return "";
      const rows = members.map(({ id, code, title, detail, availability }) => {
        planIndex += 1;
        return `<div class="analysis-card ${state.selectedAnalysis === id ? "selected" : ""}"><button class="analysis-select" type="button" data-analysis="${id}"><span class="analysis-index">${String(planIndex).padStart(2, "0")}</span><span><strong>${code} · ${title}</strong><small>${detail}</small></span>${availability === "production" ? "" : `<span class="mini-badge warn">${analysisAvailabilityLabel(availability)}</span>`}</button><label class="switch" title="Enable ${title}"><input type="checkbox" data-analysis-toggle="${id}" ${state.enabledAnalyses.has(id) ? "checked" : ""} aria-label="Enable ${title}"><span></span></label></div>`;
      }).join("");
      return `<section class="analysis-stack-group" data-analysis-kind="${kind}"><h3>${label}<span>${members.length}</span></h3>${rows}</section>`;
    }).join("");
    const forms = {
      op: { title: "Operating-point analysis", icon: "target", fields: [["Temperature", "PVT run set", "select"], ["Initial guess", "Automatic", "select"], ["Node initialization", "Use IC / nodeset", "select"], ["Homotopy strategy", "Adaptive", "select"], ["Annotate schematic", "Voltages + currents", "select"], ["Device detail", "Selected + violations", "select"], ["Save device OP", "Enabled", "select"], ["Accuracy preset", "Balanced", "select"]] },
      tran: { title: "Transient analysis", icon: "waveform", fields: [["Start time", "0", "s"], ["Stop time", "20m", "s"], ["Maximum step", "10u", "s"], ["Initial step", "auto", ""], ["Integration", "Gear 2", "select"], ["Initial condition", "Solve operating point", "select"], ["Accuracy preset", "Balanced", "select"], ["Save mode", "Selected + probes", "select"]] },
      ac: { title: "AC response", icon: "chart", fields: [["Sweep", "Decade", "select"], ["Points / decade", "50", ""], ["Start frequency", "1", "Hz"], ["Stop frequency", "10Meg", "Hz"], ["Input source", "VIN_DIFF", "select"], ["Output", "V(afe_out)", "select"], ["Accuracy preset", "Balanced", "select"], ["Save complex data", "Enabled", "select"]] },
      noise: { title: "Noise analysis", icon: "waveform", fields: [["Sweep", "Decade", "select"], ["Points / decade", "30", ""], ["Start frequency", "1", "Hz"], ["Stop frequency", "1Meg", "Hz"], ["Output node", "afe_out", "select"], ["Input source", "VIN_DIFF", "select"], ["Contribution detail", "Top 50", "select"], ["Integrated noise", "Enabled", "select"]] },
      stb: { title: "Loop stability analysis", icon: "target", fields: [["Loop probe", "LP1 · afe_feedback", "select"], ["Sweep", "Decade", "select"], ["Points / decade", "80", ""], ["Start frequency", "10", "Hz"], ["Stop frequency", "100Meg", "Hz"], ["Loop break method", "Middlebrook", "select"], ["Report margins", "Gain + phase", "select"], ["Unstable detection", "Enabled", "select"]] },
      dc: { title: "DC sweep analysis", icon: "sliders", fields: [["Sweep variable", "VOS", "select"], ["Sweep type", "Linear", "select"], ["Start value", "-10m", "V"], ["Stop value", "10m", "V"], ["Step size", "100u", "V"], ["Nested sweep", "None", "select"], ["Continuation", "Previous solution", "select"], ["Save mode", "Selected + probes", "select"]] },
      sens: { title: "Sensitivity analysis", icon: "tune", fields: [["Output expression", "gain_dc", "select"], ["Analysis basis", "AC at 10 Hz", "select"], ["Parameters", "12 selected", "select"], ["Method", "Direct + adjoint", "select"], ["Normalize", "Relative (%)", "select"], ["Ranking", "Absolute influence", "select"], ["Correlation detail", "Enabled", "select"], ["Export Jacobian", "Disabled", "select"]] },
      fourier: { title: "Fourier / distortion analysis", icon: "chart", fields: [["Source waveform", "V(afe_out)", "select"], ["Fundamental", "1k", "Hz"], ["Harmonics", "10", ""], ["Window start", "10m", "s"], ["Window stop", "20m", "s"], ["Window", "Blackman-Harris", "select"], ["Metrics", "THD + SINAD + ENOB", "select"], ["Coherent resample", "Enabled", "select"]] },
      pz: { title: "Pole-zero analysis", icon: "target", fields: [["Extraction", "Poles + zeros", "select"], ["Input source", "VIN_DIFF", "select"], ["Output", "V(afe_out)", "select"], ["Frequency scaling", "rad/s", "select"], ["Matrix balancing", "Enabled", "select"], ["Residual tolerance", "1e-9", ""], ["Max roots", "64", ""], ["Report stability", "Enabled", "select"]] },
      xf: { title: "Transfer-function analysis", icon: "chart", fields: [["Input source", "VIN_DIFF", "select"], ["Output expression", "V(afe_out)", "select"], ["Solve point", "DC operating point", "select"], ["Transfer gain", "Enabled", "select"], ["Input resistance", "Enabled", "select"], ["Output resistance", "Enabled", "select"], ["Normalize", "Disabled", "select"], ["Accuracy", "Balanced", "select"]] },
      mc: { title: "Monte Carlo variation", icon: "grid", fields: [["Samples", "1000", ""], ["Sampling", "Latin hypercube", "select"], ["Base seed", "0x73A4", ""], ["Variation", "Process + mismatch", "select"], ["Correlation model", "Foundry groups", "select"], ["PVT nesting", "Per selected corner", "select"], ["Stop policy", "Complete all samples", "select"], ["Retain", "Failures + extrema", "select"]] },
      temp: { title: "Temperature sweep", icon: "sliders", fields: [["Sweep mode", "List", "select"], ["Temperatures", "-40, 27, 125", "°C"], ["Nominal", "27", "°C"], ["Warm start", "Adjacent point", "select"], ["Model reevaluation", "Every point", "select"], ["Initial conditions", "Per temperature", "select"], ["Parallelism", "Automatic", "select"], ["Failure policy", "Continue", "select"]] },
      corner: { title: "Process-corner analysis", icon: "grid", fields: [["Corner source", "PDK sections", "select"], ["Sections", "ff, fs, tt, sf, ss", ""], ["Temperatures", "-40, 27, 125", "°C"], ["Supplies", "Nominal", "select"], ["Combination", "Cartesian", "select"], ["Nominal point", "tt / 27 °C", "select"], ["Parallelism", "12 local slots", "select"], ["Failure policy", "Continue matrix", "select"]] },
      pss: { title: "Periodic steady-state", icon: "refresh", fields: [["Mode", "Driven shooting", "select"], ["Fundamental", "1k", "Hz"], ["Tones", "VIN_DIFF", "select"], ["Stabilization cycles", "20", ""], ["Shooting points", "512", ""], ["Period tolerance", "1e-7", ""], ["Autonomous oscillator", "Disabled", "select"], ["Save harmonics", "20", ""]] },
      hb: { title: "Harmonic-balance analysis", icon: "chart", fields: [["Fundamental tones", "1 kHz", ""], ["Harmonic order", "15", ""], ["Intermodulation order", "5", ""], ["Initial guess", "PSS / transient", "select"], ["Frequency pruning", "Adaptive", "select"], ["Newton tolerance", "1e-7", ""], ["Continuation", "Source power", "select"], ["Save spectral currents", "Enabled", "select"]] },
      sp: { title: "S-parameter analysis", icon: "target", fields: [["Ports", "PORT1, PORT2", "select"], ["Reference impedance", "50", "Ω"], ["Sweep", "Logarithmic", "select"], ["Start", "1Meg", "Hz"], ["Stop", "10Gig", "Hz"], ["Points / decade", "101", ""], ["De-embedding", "Fixture A", "select"], ["Touchstone export", "RI · GHz", "select"]] },
      pac: { title: "Periodic AC · preview", icon: "waveform", fields: [["PSS prerequisite", "pss_1", "select"], ["Small-signal input", "VIN_DIFF", "select"], ["Output", "V(afe_out)", "select"], ["Sidebands", "−10…+10", ""], ["Start offset", "1", "Hz"], ["Stop offset", "1Meg", "Hz"], ["Sweep", "Decade", "select"], ["Extraction path", "Preview kernel", "select"]] },
      pnoise: { title: "Periodic noise · preview", icon: "waveform", fields: [["PSS prerequisite", "pss_1", "select"], ["Output", "V(afe_out)", "select"], ["Input reference", "VIN_DIFF", "select"], ["Sidebands", "20", ""], ["Start offset", "1", "Hz"], ["Stop offset", "10Meg", "Hz"], ["Noise type", "Time average", "select"], ["Extraction path", "Preview kernel", "select"]] },
      pxf: { title: "Periodic transfer · preview", icon: "chart", fields: [["PSS prerequisite", "pss_1", "select"], ["Input", "VIN_DIFF", "select"], ["Output", "V(afe_out)", "select"], ["Output sideband", "0", ""], ["Input sidebands", "−10…+10", ""], ["Sweep range", "1…1Meg Hz", ""], ["Normalize", "Conversion gain", "select"], ["Extraction path", "Preview kernel", "select"]] },
      pstb: { title: "Periodic stability · preview", icon: "target", fields: [["PSS prerequisite", "pss_1", "select"], ["Probe", "LPROBE", "select"], ["Reactive state", "Automatic", "select"], ["Sidebands", "−8…+8", ""], ["Sweep range", "10…100Meg Hz", ""], ["Floquet report", "Enabled", "select"], ["Margin extraction", "Enabled", "select"], ["Extraction path", "Preview", "select"]] },
      envelope: { title: "Envelope analysis · preview", icon: "waveform", fields: [["Carrier tones", "1 MHz", ""], ["Envelope stop", "10m", "s"], ["Envelope step", "1u", "s"], ["Harmonic order", "9", ""], ["Modulation sources", "VIN_AM", "select"], ["Initial periodic solve", "HB", "select"], ["Adaptive envelope", "Enabled", "select"], ["Extraction path", "Preview", "select"]] },
      reliability: { title: "Reliability / aging", icon: "verify", fields: [["Mission profile", "Industrial 10 year", "select"], ["Stress analyses", "TRAN + OP", "select"], ["Mechanisms", "BTI + HCI", "select"], ["Time points", "0, 1, 5, 10 years", ""], ["Temperature profile", "IEC industrial", "select"], ["Derating", "Foundry rules", "select"], ["Re-simulation", "Every age point", "select"], ["Violation policy", "Fail closed", "select"]] },
      opt: { title: "Optimization", icon: "target", fields: [["Algorithm", "Levenberg–Marquardt", "select"], ["Variables", "4 selected", "select"], ["Goals", "5 mapped", "select"], ["Hard constraints", "2 mapped", "select"], ["PVT scope", "Nominal + worst 3", "select"], ["Max iterations", "40", ""], ["Termination norm", "1e-4", ""], ["Candidate retention", "Pareto + accepted", "select"]] },
      soa: { title: "Safe-operating-area checks", icon: "verify", fields: [["Rule deck", "PDK electrical limits", "select"], ["Analyses", "OP + TRAN", "select"], ["Voltage stress", "Enabled", "select"], ["Current density", "Enabled", "select"], ["Power dissipation", "Enabled", "select"], ["Thermal derating", "Temperature aware", "select"], ["Cross-probe markers", "Enabled", "select"], ["Violation policy", "Block sign-off", "select"]] },
      disto: { title: "DISTO compatibility", icon: "chart", fields: [["Compatibility behavior", "AC + THD/IMD post-process", "select"], ["Input source", "VIN_DIFF", "select"], ["Fundamental", "1k", "Hz"], ["Second tone", "1.1k", "Hz"], ["Harmonics", "10", ""], ["Metrics", "HD2, HD3, IM2, IM3", "select"], ["Engine", "No Volterra solve", "select"], ["Report disclaimer", "Required", "select"]] }
    };
    const config = forms[state.selectedAnalysis] || forms.tran;
    const selectedDefinition = analysisDefinition(state.selectedAnalysis);
    const workingAnalysisValues = effectiveAnalysisValues(state.enabledAnalyses, state.analysisValues);
    const plannedWork = executionTaskGraph(state.enabledAnalyses, workingAnalysisValues);
    const fieldHtml = config.fields.map(([label, value, unit], index) => { const fieldId = `analysis-field-${state.selectedAnalysis}-${index}`; const currentValue = state.analysisValues[state.selectedAnalysis]?.[index] ?? value; return `<div class="field-block"><label for="${fieldId}">${label}<span class="field-help">${unit === "select" ? "" : "engineering notation"}</span></label>${unit === "select" ? `<select id="${fieldId}" class="select mono" data-analysis-field="${index}">${analysisSelectOptions(label, currentValue)}</select>` : `<div class="field-with-unit"><input id="${fieldId}" class="input mono" data-analysis-field="${index}" value="${escapeHtml(currentValue)}">${unit ? `<span class="unit">${unit}</span>` : ""}</div>`}</div>`; }).join("");
    return `<div class="workspace-view simulation-view">
      <div class="view-title-row"><div><span class="eyebrow">SIMULATION PLAN · REVISION ${escapeHtml(state.inputRevision.toUpperCase())}</span><h1>Lab characterization</h1><p>${state.enabledAnalyses.size} enabled analyses · ${PVT_RUN_POINTS.length} PVT points · 27 outputs · ${specificationCount(state.enabledAnalyses)} executable checks · requirements ${REQUIREMENT_CONTRACT.id}</p></div><div class="view-actions"><button class="button" data-surface-action="clone-plan">${iconSvg("copy")} Clone plan</button><button class="button primary" data-toolbar-action="run-preflight">${iconSvg("check")} Validate plan</button></div></div>
      <div class="simulation-grid"><div class="analysis-stack">${cards}</div><div class="analysis-editor">
        <section class="analysis-form-card"><div class="analysis-form-head"><span class="analysis-type-icon">${iconSvg(config.icon)}</span><h2>${config.title}</h2><span class="mini-badge ${selectedDefinition.availability === "production" ? "ok" : "warn"}">${analysisAvailabilityLabel(selectedDefinition.availability)}</span><button class="icon-button" aria-label="Analysis options" data-surface-action="analysis-options">${iconSvg("more")}</button></div>${selectedDefinition.availability !== "production" ? `<div class="concept-banner">${iconSvg("warning")}${selectedDefinition.detail}. This configuration is retained for design review but cannot contribute to a release gate until its engine path and platform contract are qualified.</div>` : ""}<div class="analysis-form">${fieldHtml}</div></section>
        <div class="preflight-strip"><div class="preflight-item"><span class="check">${state.planValidated ? "✓" : "△"}</span><span><strong>Netlist</strong>${state.planValidated ? "validated" : "stale"} · revision ${escapeHtml(state.inputRevision)}</span></div><div class="preflight-item"><span class="check">${state.planValidated ? "✓" : "△"}</span><span><strong>Models</strong>${state.planValidated ? "7 files resolved" : "recheck required"}</span></div><div class="preflight-item"><span class="check">${state.planValidated ? "✓" : "△"}</span><span><strong>Outputs</strong>${state.planValidated ? "27 signals valid" : "validation pending"}</span></div><div class="preflight-item"><span class="check">✓</span><span><strong>Execution graph</strong>${plannedWork.total.toLocaleString()} tasks · ${formatDuration(estimatedRunDurationSeconds(state.enabledAnalyses, workingAnalysisValues))}</span></div></div>
        <div class="setup-tables">
          <section class="table-card"><div class="card-head"><h3>Design variables</h3><button class="icon-button" aria-label="Add design variable">${iconSvg("plus")}</button></div><table class="data-table"><thead><tr><th style="width:36%">Name</th><th>Value</th><th>Scope</th></tr></thead><tbody><tr><td class="mono">RGAIN</td><td class="mono">499 Ω</td><td>global</td></tr><tr><td class="mono">CFILT</td><td class="mono">22 nF</td><td>global</td></tr><tr><td class="mono">VREF</td><td class="mono">2.5 V</td><td>global</td></tr><tr><td class="mono">TEMP</td><td class="mono">27 °C</td><td>PVT</td></tr></tbody></table></section>
          <section class="table-card"><div class="card-head"><h3>Outputs & specifications</h3><button class="icon-button" aria-label="Add output">${iconSvg("plus")}</button></div><table class="data-table"><thead><tr><th style="width:42%">Expression</th><th>Spec</th><th>Status</th></tr></thead><tbody><tr><td class="mono">V(afe_out)</td><td>waveform</td><td><span class="mini-badge ok">valid</span></td></tr><tr><td class="mono">rise_time(V(out))</td><td>≤ 2.5 ms</td><td><span class="mini-badge ok">pass</span></td></tr><tr><td class="mono">phase_margin()</td><td>≥ 60°</td><td><span class="mini-badge ok">pass</span></td></tr><tr><td class="mono">inoise_total()</td><td>≤ 18 nV/√Hz</td><td><span class="mini-badge ok">pass</span></td></tr></tbody></table></section>
        </div>
      </div></div>
    </div>`;
  }

  function resultsStage() {
    const tabs = RESULT_VIEWERS;
    const availableTabs = tabs.filter(([, , , requirements]) => !requirements || requirements.some((analysis) => state.resultAnalyses.has(analysis)));
    return `<div class="workspace-view results-view">
      <div class="results-viewer-tabs"><div class="viewer-tab-list" role="tablist" aria-label="Compatible result viewers">${availableTabs.map(([id, icon, label]) => `<button class="viewer-tab ${state.resultMode === id ? "active" : ""}" type="button" role="tab" aria-selected="${state.resultMode === id}" aria-controls="results-plot-panel" tabindex="${state.resultMode === id ? "0" : "-1"}" data-result-mode="${id}">${iconSvg(icon)}${label}</button>`).join("")}</div><button class="viewer-tab viewer-picker" type="button" data-surface-action="all-viewers" aria-haspopup="dialog">${iconSvg("plus")} New visualization…</button><span class="results-toolbar-spacer"></span><span class="mini-badge ${state.resultsStale ? "warn" : state.resultManifest.qualification.signOffEligible ? "ok" : "warn"}">${state.resultsStale ? "stale" : `Run ${state.runId} · ${resultEligibilityCopy()}`}</span></div>
      <div class="results-canvas-wrap" id="results-plot-panel" role="tabpanel"><canvas id="plot-canvas" class="plot-canvas" aria-label="${state.resultMode} results plot" aria-describedby="plot-data-summary"></canvas><span class="sr-only" id="plot-data-summary">Run ${state.runId}, ${state.resultCorner}. The signal browser lists plotted traces; the Measurements inspector provides precision-formatted cursor values, deltas, and computed specifications for the selected immutable dataset.</span><div class="plot-legend" id="plot-legend"></div><div class="plot-toolbar"><button class="${state.cursorEnabled ? "active" : ""}" data-plot-action="cursor" title="A/B cursors">A│B</button><button class="${state.plotTool === "zoom" ? "active" : ""}" data-plot-action="zoom" title="Zoom in">▣</button><button class="${state.plotTool === "pan" ? "active" : ""}" data-plot-action="pan" title="Pan viewport">✥</button><button data-plot-action="fit" title="Fit all">⌗</button><button class="${state.plotLog ? "active" : ""}" data-plot-action="log" title="Logarithmic axis">LOG</button><button data-plot-action="export" title="Export plot data">${iconSvg("export")}</button></div></div>
      <div class="run-strip"><span class="eyebrow" style="margin:0 5px 0 2px">OVERLAYS</span><button class="run-chip active"><span class="signal-color" style="--trace-color:var(--trace-1)"></span>Run ${state.runId} · PVT ${state.resultManifest.runSet.pointCount} · ref ${state.resultCorner}</button><button class="run-chip"><span class="signal-color" style="--trace-color:var(--trace-2)"></span>Run 39 · SS/125 °C</button><button class="run-chip"><span class="signal-color" style="--trace-color:var(--trace-3)"></span>Run 38 · FF/−40 °C</button><button class="run-chip">+ Add dataset</button><span class="grow"></span><button class="run-chip">Sync X axes · on</button></div>
    </div>`;
  }

  function drcStage() {
    const selected = DRC_MARKERS.find((marker) => marker.id === state.selectedDrcMarker) || DRC_MARKERS[0];
    const visibleMarkers = state.drcFilter === "all" ? DRC_MARKERS : DRC_MARKERS.filter((marker) => marker.status === state.drcFilter);
    const markerRows = visibleMarkers.length
      ? visibleMarkers.map((marker) => `<button class="drc-marker-row ${marker.id === selected.id ? "selected" : ""}" type="button" data-drc-marker="${marker.id}" aria-pressed="${marker.id === selected.id}"><span class="drc-marker-index ${marker.severity}">${marker.index}</span><span><strong>${marker.rule} · ${marker.title}</strong><small>${marker.path} · ${marker.measured} / ${marker.required}</small></span><span class="drc-marker-state ${marker.status}">${marker.status}</span></button>`).join("")
      : '<div class="drc-empty-filter"><strong>No representative markers in this filter</strong><small>The complete immutable result database remains available in the table below.</small></div>';
    const canvasMarkers = DRC_MARKERS.map((marker) => `<button class="drc-canvas-marker ${marker.severity} ${marker.id === selected.id ? "selected" : ""}" type="button" data-drc-marker="${marker.id}" style="left:${marker.x}%;top:${marker.y}%" aria-label="${marker.id}, ${marker.rule}, ${marker.title}">${marker.index}</button>`).join("");
    const tableRows = DRC_MARKERS.map((marker) => `<tr class="${marker.id === selected.id ? "selected" : ""}" data-drc-table-row="${marker.id}"><td><button class="drc-table-link" type="button" data-drc-marker="${marker.id}">${marker.id}</button></td><td class="${marker.severity === "error" ? "error-text" : "warn-text"}">${marker.severity === "error" ? "blocking" : "advisory"}</td><td class="mono">${marker.rule}</td><td>${marker.cell}</td><td class="mono">${marker.measured}</td><td class="mono">${marker.required}</td><td class="mono ${marker.severity === "error" ? "error-text" : "warn-text"}">${marker.delta}</td><td>${marker.status}</td></tr>`).join("");
    return `<div class="workspace-view verify-view drc-view">
      <div class="view-title-row"><div><span class="eyebrow">PHYSICAL VERIFICATION · DRC RUN 42 · LAYOUT L42</span><h1>Design-rule checking</h1><p>Qualified deck demo180_drc_v12 · hierarchical geometry · immutable result database · marker, waiver and sign-off governance</p></div><div class="drc-title-status"><span class="drc-inline-status error">sign-off blocked</span><span class="mono faint">result 42 · 7d18…a021</span></div></div>
      <div class="drc-run-strip" aria-label="DRC run configuration"><label><span>Layout source</span><select class="select" aria-label="DRC layout source"><option>top · layout · L42</option></select></label><label><span>Rule deck</span><select class="select" aria-label="DRC rule deck"><option>demo180_drc_v12 · qualified</option></select></label><label><span>Scope</span><select class="select" aria-label="DRC scope"><option>Hierarchy · /top</option><option>Current cell · afe_core</option><option>Window / selection</option></select></label><label><span>Run mode</span><select class="select" aria-label="DRC run mode"><option>Incremental · changed geometry</option><option>Full hierarchical</option></select></label><div class="drc-run-provenance"><span class="drc-inline-status ok">inputs locked</span><small>layout L42 · deck 19f2…bc71</small></div></div>
      <div class="drc-status-strip" aria-label="DRC result summary"><div><span>Rules evaluated</span><strong>7,124 / 7,124</strong><small>deck coverage complete</small></div><div><span>Markers</span><strong>26</strong><small>4 rule classes</small></div><div><span>Blocking</span><strong class="error-text">23</strong><small>must fix or approve waiver</small></div><div><span>Disposition</span><strong>2 review · 1 waived</strong><small>waiver expires at tapeout</small></div><div><span>Runtime</span><strong>1 min 48 s</strong><small>external qualified runner</small></div></div>
      <div class="drc-workspace">
        <section class="drc-violations-pane" aria-label="DRC violation browser">
          <div class="drc-pane-head"><strong>Violation browser</strong><span class="mono faint">26 markers</span></div>
          <div class="drc-filter-bar"><label class="drc-search">${iconSvg("search")}<input type="search" placeholder="Rule, marker, cell or net…" aria-label="Filter DRC markers"></label><div class="drc-filter-buttons" role="group" aria-label="DRC marker status"><button class="${state.drcFilter === "open" ? "active" : ""}" type="button" data-drc-filter="open">Open 23</button><button class="${state.drcFilter === "review" ? "active" : ""}" type="button" data-drc-filter="review">Review 2</button><button class="${state.drcFilter === "waived" ? "active" : ""}" type="button" data-drc-filter="waived">Waived 1</button><button class="${state.drcFilter === "all" ? "active" : ""}" type="button" data-drc-filter="all">All</button></div></div>
          <div class="drc-browser-scroll">
            <div class="drc-rule-summary"><button class="drc-rule-row active" type="button"><span class="drc-rule-swatch m2"></span><span><strong>M2.SP.3</strong><small>Metal2 spacing</small></span><b>17</b></button><button class="drc-rule-row" type="button"><span class="drc-rule-swatch via1"></span><span><strong>VIA1.EN.2</strong><small>Via1 enclosure</small></span><b>6</b></button><button class="drc-rule-row" type="button"><span class="drc-rule-swatch nwell"></span><span><strong>NWELL.SP.1</strong><small>N-well spacing</small></span><b>2</b></button><button class="drc-rule-row" type="button"><span class="drc-rule-swatch m4"></span><span><strong>DENS.M4.1</strong><small>Metal4 density</small></span><b>1</b></button></div>
            <div class="drc-marker-list"><div class="drc-list-label">Representative markers · ${visibleMarkers.length} shown</div>${markerRows}</div>
          </div>
        </section>
        <section class="drc-layout-pane" aria-label="Layout marker viewer">
          <div class="drc-canvas-toolbar"><div class="segmented" role="group" aria-label="DRC viewer mode"><button class="active" type="button">Layout</button><button type="button">Rule context</button><button type="button">Compare run</button></div><span class="grow"></span><button class="icon-button" type="button" title="Pan">${iconSvg("pan")}</button><button class="icon-button" type="button" title="Zoom in">${iconSvg("zoomin")}</button><button class="icon-button" type="button" title="Fit marker">${iconSvg("fit")}</button><button class="button ghost" type="button" data-surface-action="configure-layers">Layers · 7 visible</button></div>
          <div class="drc-layout-canvas" aria-label="Layout context with DRC markers">
            <span class="drc-geometry nwell" style="left:7%;top:9%;width:38%;height:54%"></span><span class="drc-geometry active" style="left:13%;top:18%;width:24%;height:12%"></span><span class="drc-geometry active" style="left:13%;top:39%;width:24%;height:12%"></span><span class="drc-geometry poly vertical" style="left:20%;top:12%;width:3%;height:47%"></span><span class="drc-geometry poly vertical" style="left:29%;top:12%;width:3%;height:47%"></span><span class="drc-geometry m1" style="left:10%;top:31%;width:34%;height:5%"></span><span class="drc-geometry m1 vertical" style="left:35%;top:17%;width:5%;height:46%"></span>
            <span class="drc-geometry nwell" style="left:51%;top:16%;width:39%;height:66%"></span><span class="drc-geometry active" style="left:58%;top:25%;width:25%;height:13%"></span><span class="drc-geometry active" style="left:58%;top:55%;width:25%;height:13%"></span><span class="drc-geometry poly vertical" style="left:64%;top:20%;width:3%;height:54%"></span><span class="drc-geometry poly vertical" style="left:75%;top:20%;width:3%;height:54%"></span><span class="drc-geometry m2" style="left:45%;top:42%;width:43%;height:5%"></span><span class="drc-geometry m2 vertical" style="left:50%;top:24%;width:4%;height:53%"></span><span class="drc-geometry m4" style="left:8%;top:76%;width:80%;height:7%"></span>
            <span class="drc-via-array" style="left:37%;top:32%"></span><span class="drc-via-array" style="left:67%;top:43%"></span><span class="drc-via-array" style="left:78%;top:44%"></span>
            ${canvasMarkers}
            <div class="drc-selected-window" style="left:${Math.max(4, selected.x - 8)}%;top:${Math.max(4, selected.y - 9)}%"><span>${selected.rule}</span><i></i><em>${selected.measured} · limit ${selected.required}</em></div>
            <div class="drc-layer-legend"><span><i class="nwell"></i>NWELL</span><span><i class="active"></i>ACTIVE</span><span><i class="poly"></i>POLY</span><span><i class="m1"></i>M1</span><span><i class="m2"></i>M2</span><span><i class="m4"></i>M4</span></div>
            <div class="drc-minimap"><span></span><i style="left:34%;top:27%;width:42%;height:38%"></i></div>
          </div>
          <div class="drc-coordinate-bar"><span>/top/XAFE · ${selected.path}</span><span class="mono">x 124.840 µm · y 88.120 µm · 3200%</span></div>
        </section>
      </div>
      <section class="drc-results-table"><div class="card-head"><h3>Marker database · selected result 42</h3><span class="drc-inline-status error">23 blocking</span><span class="grow"></span><button class="button ghost" type="button" data-surface-action="compare-drc">Compare Run 41</button><button class="button" type="button" data-surface-action="export-drc">Export markers</button></div><table class="data-table"><thead><tr><th>Marker</th><th>Severity</th><th>Rule</th><th>Cell</th><th>Measured</th><th>Required</th><th>Delta</th><th>Disposition</th></tr></thead><tbody>${tableRows}</tbody></table></section>
    </div>`;
  }

  function optimizationStage() {
    const candidateHistorical = state.inputRevision !== BASE_INPUT_REVISION;
    return `<div class="workspace-view verify-view">
      <div class="view-title-row"><div><span class="eyebrow">OPTIMIZATION · CANDIDATE 18 · BASE ${BASE_INPUT_REVISION.toUpperCase()}</span><h1>Low-noise bandwidth optimization</h1><p>Levenberg–Marquardt · 4 design variables · 5 goals · 2 hard constraints${candidateHistorical ? ` · working revision ${escapeHtml(state.inputRevision)} requires rebase review` : ""}</p></div><div class="view-actions"><button class="button" data-surface-action="compare-candidate">${iconSvg("compare")} Compare nominal</button><button class="button primary" data-surface-action="apply-candidate">${iconSvg("check")} ${candidateHistorical ? "Review & rebase candidate" : "Apply candidate 18"}</button></div></div>
      <div class="verify-kpis"><div class="verify-kpi"><span class="kpi-label">Composite objective</span><div class="kpi-value ok-text">−34.2%</div><div class="kpi-foot">0.411 → 0.270 · lower is better</div></div><div class="verify-kpi"><span class="kpi-label">Iterations</span><div class="kpi-value">18 / 40</div><div class="kpi-foot">converged · gradient 8.7e−5</div></div><div class="verify-kpi"><span class="kpi-label">Goals passing</span><div class="kpi-value ok-text">5 / 5</div><div class="kpi-foot">all PVT nominal goals satisfied</div></div><div class="verify-kpi"><span class="kpi-label">Constraint margin</span><div class="kpi-value ok-text">+7.41°</div><div class="kpi-foot">phase margin is limiting</div></div></div>
      <div class="verify-content-grid">
        <section class="table-card"><div class="card-head"><h3>Design variables · bounds & candidate</h3><span class="mini-badge accent">candidate 18</span></div><table class="data-table"><thead><tr><th style="width:24%">Variable</th><th>Nominal</th><th>Candidate</th><th>Bounds</th><th>Δ</th></tr></thead><tbody><tr><td class="mono">RGAIN</td><td class="mono">499 Ω</td><td class="mono">512.4 Ω</td><td class="mono">450…560 Ω</td><td class="ok-text">+2.69%</td></tr><tr><td class="mono">CFILT</td><td class="mono">22 nF</td><td class="mono">19.62 nF</td><td class="mono">15…33 nF</td><td class="ok-text">−10.8%</td></tr><tr><td class="mono">RFB</td><td class="mono">10 kΩ</td><td class="mono">10.31 kΩ</td><td class="mono">9…12 kΩ</td><td class="ok-text">+3.10%</td></tr><tr><td class="mono">CCOMP</td><td class="mono">3.3 pF</td><td class="mono">3.74 pF</td><td class="mono">2…6 pF</td><td class="ok-text">+13.3%</td></tr></tbody></table></section>
        <section class="table-card"><div class="card-head"><h3>Goals & constraints</h3><span class="mini-badge ok">all satisfied</span></div><table class="data-table"><thead><tr><th style="width:30%">Metric</th><th>Target</th><th>Nominal</th><th>Candidate</th><th>Status</th></tr></thead><tbody><tr><td>Input noise</td><td class="mono">minimize</td><td class="mono">14.82 nV/√Hz</td><td class="mono">12.31 nV/√Hz</td><td><span class="mini-badge ok">−16.9%</span></td></tr><tr><td>Bandwidth</td><td class="mono">≥ 95 kHz</td><td class="mono">104.8 kHz</td><td class="mono">118.4 kHz</td><td><span class="mini-badge ok">pass</span></td></tr><tr><td>Phase margin</td><td class="mono">≥ 60°</td><td class="mono">67.41°</td><td class="mono">67.85°</td><td><span class="mini-badge ok">pass</span></td></tr><tr><td>Power</td><td class="mono">≤ 15 mW</td><td class="mono">7.18 mW</td><td class="mono">7.44 mW</td><td><span class="mini-badge ok">pass</span></td></tr></tbody></table></section>
        <section class="spec-matrix-card"><div class="card-head"><h3>Iteration history</h3><span class="mini-badge ok">converged</span><span class="grow"></span><button class="button ghost" data-surface-action="revert-candidate">Revert candidate</button></div><table class="data-table"><thead><tr><th style="width:12%">Iteration</th><th>Objective</th><th>Best goal</th><th>Limiting constraint</th><th>Step norm</th><th>Status</th></tr></thead><tbody><tr><td class="mono">18</td><td class="mono">0.270 184</td><td>noise −16.9%</td><td>PM +7.85°</td><td class="mono">8.7e−5</td><td><span class="mini-badge ok">converged</span></td></tr><tr><td class="mono">17</td><td class="mono">0.270 191</td><td>noise −16.8%</td><td>PM +7.82°</td><td class="mono">2.4e−4</td><td><span class="mini-badge">accepted</span></td></tr><tr><td class="mono">16</td><td class="mono">0.271 044</td><td>noise −16.1%</td><td>PM +7.63°</td><td class="mono">8.1e−4</td><td><span class="mini-badge">accepted</span></td></tr><tr><td class="mono">12</td><td class="mono">0.293 881</td><td>noise −12.2%</td><td>PM +6.74°</td><td class="mono">1.9e−2</td><td><span class="mini-badge">accepted</span></td></tr><tr><td class="mono">01</td><td class="mono">0.411 024</td><td>baseline</td><td>PM +7.41°</td><td class="mono">—</td><td><span class="mini-badge">seed</span></td></tr></tbody></table></section>
      </div>
    </div>`;
  }

  function cornerVerificationStage() {
    const columns = ["FF −40", "FF 27", "FF 125", "FS −40", "FS 27", "FS 125", "TT −40", "TT 27", "TT 125", "SF −40", "SF 27", "SF 125", "SS −40", "SS 27", "SS 125"];
    const rows = [
      ["gain_dc ≥ 39.5 dB", ["+0.84", "+0.77", "+0.63", "+0.71", "+0.65", "+0.54", "+0.62", "+0.51", "+0.43", "+0.49", "+0.41", "+0.34", "+0.31", "+0.26", "+0.21"]],
      ["bandwidth ≥ 95 kHz", ["+18.4", "+16.8", "+14.2", "+15.1", "+13.7", "+11.6", "+11.3", "+9.8", "+8.1", "+8.7", "+6.9", "+4.8", "+5.2", "+3.4", "+2.1"]],
      ["phase margin ≥ 60°", ["+4.1", "+4.8", "+5.7", "+5.0", "+5.8", "+6.7", "+6.2", "+7.4", "+8.2", "+7.9", "+8.8", "+9.7", "+9.1", "+10.2", "+11.1"]],
      ["offset ≤ 50 µV", ["+27", "+26", "+24", "+29", "+28", "+26", "+32", "+31", "+29", "+27", "+26", "+24", "+24", "+23", "+21"]],
      ["power ≤ 15 mW", ["+5.8", "+6.3", "+7.0", "+6.1", "+6.7", "+7.4", "+6.8", "+7.8", "+8.4", "+7.3", "+8.1", "+8.9", "+8.0", "+9.0", "+9.8"]]
    ];
    return `<div class="workspace-view verify-view">
      <div class="view-title-row"><div><span class="eyebrow">QUALIFICATION DATASET · PROCESS CORNERS · 5 × 3</span><h1>Process-corner verification</h1><p>Run 41 evidence · 15 / 15 PVT points complete · 12 specifications · deterministic model sections</p></div><div class="view-actions"><button class="button" data-surface-action="compare-nominal">${iconSvg("compare")} Compare nominal</button><button class="button primary" data-surface-action="export-corner-matrix">${iconSvg("export")} Export matrix</button></div></div>
      <div class="verify-kpis"><div class="verify-kpi"><span class="kpi-label">PVT points passing</span><div class="kpi-value ok-text">15 / 15</div><div class="kpi-foot">all required analyses complete</div></div><div class="verify-kpi"><span class="kpi-label">Specifications</span><div class="kpi-value ok-text">12 / 12</div><div class="kpi-foot">no corner violations</div></div><div class="verify-kpi"><span class="kpi-label">Worst margin</span><div class="kpi-value ok-text">+2.10%</div><div class="kpi-foot">bandwidth · SS / 125 °C</div></div><div class="verify-kpi"><span class="kpi-label">Runtime</span><div class="kpi-value">28.42 s</div><div class="kpi-foot">15 points · local parallel run</div></div></div>
      <div class="verify-content-grid">
        <section class="spec-matrix-card" style="grid-column:1/-1;overflow:auto"><div class="card-head" style="position:sticky;left:0"><h3>Full PVT specification-margin matrix</h3><span class="mini-badge ok">15 columns · all pass</span></div><table class="data-table" style="min-width:1450px"><thead><tr><th style="width:180px">Specification</th>${columns.map((column) => `<th>${column}</th>`).join("")}</tr></thead><tbody>${rows.map(([name, values]) => `<tr><td>${name}</td>${values.map((value) => `<td><span class="corner-cell pass">${value}</span></td>`).join("")}</tr>`).join("")}</tbody></table></section>
        <section class="table-card"><div class="card-head"><h3>Worst PVT points</h3></div><table class="data-table"><thead><tr><th>Rank</th><th>Point</th><th>Limiting spec</th><th>Margin</th></tr></thead><tbody><tr><td class="mono">01</td><td>SS · 125 °C</td><td>bandwidth</td><td class="ok-text">+2.10%</td></tr><tr><td class="mono">02</td><td>SS · 27 °C</td><td>gain_dc</td><td class="ok-text">+2.60%</td></tr><tr><td class="mono">03</td><td>SF · 125 °C</td><td>bandwidth</td><td class="ok-text">+4.80%</td></tr></tbody></table></section>
        <section class="table-card"><div class="card-head"><h3>Run reproducibility</h3><span class="mini-badge ok">locked</span></div><div class="property-list"><div class="property-row"><span>Input revision</span><span class="property-value">7c49d2b</span></div><div class="property-row"><span>Model digest</span><span class="property-value">be17…481c</span></div><div class="property-row"><span>Corner sections</span><span class="property-value">ff/fs/tt/sf/ss</span></div><div class="property-row"><span>Temperatures</span><span class="property-value">−40 / 27 / 125 °C</span></div></div></section>
      </div>
    </div>`;
  }

  function reliabilityStage() {
    return `<div class="workspace-view verify-view"><div class="view-title-row"><div><span class="eyebrow">QUALIFICATION DATASET &middot; RELIABILITY &middot; 10-YEAR MISSION PROFILE</span><h1>Reliability and safe-operating-area verification</h1><p>Production electrical SOA · BTI/HCI aging preview · temperature-aware derating · explicit qualification gates</p></div><div class="view-actions"><button class="button" data-surface-action="edit-mission">Edit mission profile</button><button class="button primary" data-surface-action="run-reliability">Run preview plan</button></div></div><div class="verify-kpis"><div class="verify-kpi"><span class="kpi-label">SOA rules passing</span><div class="kpi-value ok-text">128 / 128</div><div class="kpi-foot">production sign-off</div></div><div class="verify-kpi"><span class="kpi-label">Worst aging drift</span><div class="kpi-value warn-text">−3.8%</div><div class="kpi-foot">preview · U3 gm · 10 years</div></div><div class="verify-kpi"><span class="kpi-label">Power margin</span><div class="kpi-value ok-text">2.87×</div><div class="kpi-foot">U1 is limiting</div></div><div class="verify-kpi"><span class="kpi-label">Mission coverage</span><div class="kpi-value ok-text">100%</div><div class="kpi-foot">4 operating phases</div></div></div><div class="verify-content-grid reliability-grid"><section class="table-card"><div class="card-head"><h3>Mission profile</h3><span class="mini-badge warn">aging preview</span></div><table class="data-table"><thead><tr><th>Phase</th><th>Duty</th><th>Temperature</th><th>Supply</th><th>Activity</th></tr></thead><tbody><tr><td>Standby</td><td>54%</td><td>45 °C</td><td>5.0 V</td><td>low</td></tr><tr><td>Measure</td><td>31%</td><td>85 °C</td><td>5.0 V</td><td>nominal</td></tr><tr><td>Calibration</td><td>10%</td><td>105 °C</td><td>5.5 V</td><td>high</td></tr><tr><td>Fault recovery</td><td>5%</td><td>125 °C</td><td>5.5 V</td><td>maximum</td></tr></tbody></table></section><section class="table-card"><div class="card-head"><h3>Aging projection</h3><span class="mini-badge warn">not sign-off eligible</span></div><table class="data-table"><thead><tr><th>Device / metric</th><th>1 year</th><th>5 years</th><th>10 years</th><th>Limit</th></tr></thead><tbody><tr><td>U3 gm</td><td>−0.6%</td><td>−2.1%</td><td>−3.8%</td><td>−8%</td></tr><tr><td>U1 Vos</td><td>+0.8 µV</td><td>+2.6 µV</td><td>+4.7 µV</td><td>+15 µV</td></tr><tr><td>R3 resistance</td><td>+0.03%</td><td>+0.11%</td><td>+0.19%</td><td>+1%</td></tr></tbody></table></section><section class="spec-matrix-card"><div class="card-head"><h3>Electrical-stress rule results</h3><span class="mini-badge ok">production · all pass</span></div><table class="data-table"><thead><tr><th>Rule</th><th>Device / net</th><th>Observed</th><th>Derated limit</th><th>Margin</th><th>Cross-probe</th></tr></thead><tbody><tr><td>Terminal voltage</td><td>U3 VDD−VSS</td><td>10.00 V</td><td>13.20 V</td><td class="ok-text">+24.2%</td><td><button class="button ghost" data-surface-action="open-device-u3">Open U3</button></td></tr><tr><td>Branch current</td><td>VDD source</td><td>1.823 mA</td><td>4.00 mA</td><td class="ok-text">2.19×</td><td><button class="button ghost" data-surface-action="highlight-source">Highlight source</button></td></tr><tr><td>Device power</td><td>U1</td><td>4.36 mW</td><td>12.5 mW</td><td class="ok-text">2.87×</td><td><button class="button ghost" data-surface-action="open-operating-point">Open OP</button></td></tr></tbody></table></section></div></div>`;
  }

  function regressionStage() {
    return `<div class="workspace-view verify-view"><div class="view-title-row"><div><span class="eyebrow">QUALIFICATION DATASET &middot; REGRESSION &middot; BASELINE RUN 38</span><h1>Golden regression comparison</h1><p>Candidate revision ${state.resultManifest.inputRevision} against approved baseline 6f19a83 &middot; numeric and waveform tolerance contract</p></div><div class="view-actions"><button class="button" data-surface-action="select-baseline">Select baseline</button><button class="button primary" data-surface-action="run-regression">Run regression</button></div></div><div class="verify-kpis"><div class="verify-kpi"><span class="kpi-label">Checks passing</span><div class="kpi-value ok-text">12 / 12</div><div class="kpi-foot">no approval required</div></div><div class="verify-kpi"><span class="kpi-label">Waveform matches</span><div class="kpi-value ok-text">6 / 6</div><div class="kpi-foot">envelope + alignment</div></div><div class="verify-kpi"><span class="kpi-label">Worst normalized delta</span><div class="kpi-value">0.42 σ</div><div class="kpi-foot">inoise_total</div></div><div class="verify-kpi"><span class="kpi-label">Baseline age</span><div class="kpi-value">14 days</div><div class="kpi-foot">approved by JM</div></div></div><div class="verify-content-grid"><section class="verify-chart-card"><div class="chart-card-head"><h3>Waveform envelope comparison</h3><span>V(afe_out) · aligned at first crossing</span></div><div class="regression-wave-preview"><div class="wave-envelope"></div><div class="wave-current"></div><span class="envelope-label">approved tolerance envelope</span></div></section><section class="table-card"><div class="card-head"><h3>Baseline contract</h3><span class="mini-badge ok">immutable</span></div><div class="section-body property-list"><div class="property-row"><span>Baseline run</span><span class="property-value">Run 38</span></div><div class="property-row"><span>Revision</span><span class="property-value mono">6f19a83</span></div><div class="property-row"><span>Engine</span><span class="property-value">0.1.0+91e7c2a</span></div><div class="property-row"><span>Approval</span><span class="property-value">JM · 2026-06-25</span></div><div class="property-row"><span>Replacement policy</span><span class="property-value">review required</span></div></div></section><section class="spec-matrix-card"><div class="card-head"><h3>Regression checks</h3><span class="mini-badge ok">all within tolerance</span><span class="grow"></span><button class="button ghost" data-surface-action="export-ci">Export JUnit / TAP</button></div><table class="data-table"><thead><tr><th>Check</th><th>Comparison</th><th>Baseline</th><th>Current</th><th>Delta</th><th>Tolerance</th><th>Status</th></tr></thead><tbody><tr><td>gain_dc</td><td>absolute</td><td>40.001 dB</td><td>40.007 dB</td><td>+0.006 dB</td><td>±0.10 dB</td><td><span class="mini-badge ok">pass</span></td></tr><tr><td>t_settle</td><td>relative</td><td>4.801 ms</td><td>4.812 ms</td><td>+0.23%</td><td>±2%</td><td><span class="mini-badge ok">pass</span></td></tr><tr><td>inoise_total</td><td>statistical</td><td>14.76 nV/√Hz</td><td>14.82 nV/√Hz</td><td>+0.42 σ</td><td>±3 σ</td><td><span class="mini-badge ok">pass</span></td></tr><tr><td>V(afe_out)</td><td>waveform envelope</td><td>Run 38 / tran</td><td>Run ${state.runId} / tran</td><td>max 8.4 mV</td><td>±25 mV</td><td><span class="mini-badge ok">pass</span></td></tr></tbody></table></section></div></div>`;
  }

  function tuningMetrics(values = state.tuningValues) {
    const rgain = Number(values.RGAIN);
    const cfilter = Number(values.CFILT);
    const vref = Number(values.VREF);
    return {
      gainDb: 40.007 + 20 * Math.log10(rgain / 499),
      bandwidthKhz: 104.8 * (22 / cfilter) * Math.sqrt(499 / rgain),
      phaseMargin: 67.412 - (cfilter - 22) * 0.42 - (rgain - 499) * 0.006,
      noiseNv: 14.818 * (1 + (rgain - 499) / 499 * 0.12 + (22 - cfilter) / 22 * 0.04),
      settlingMs: 4.812 * (cfilter / 22) * Math.sqrt(rgain / 499),
      outputCommonMode: vref
    };
  }

  function tuningMetricRows(metrics, baseline = tuningMetrics(state.tuningBaseline)) {
    const row = (name, baselineValue, candidateValue, delta, limit, passed) => `<tr><td>${name}</td><td class="mono">${baselineValue}</td><td class="mono">${candidateValue}</td><td class="mono">${delta}</td><td class="mono">${limit}</td><td><span class="mini-badge ${passed ? "ok" : "error"}">${passed ? "pass" : "fail"}</span></td></tr>`;
    return `${row("DC gain", `${baseline.gainDb.toFixed(3)} dB`, `${metrics.gainDb.toFixed(3)} dB`, `${(metrics.gainDb - baseline.gainDb).toFixed(3)} dB`, "≥ 39.5 dB", metrics.gainDb >= 39.5)}${row("Bandwidth", `${baseline.bandwidthKhz.toFixed(2)} kHz`, `${metrics.bandwidthKhz.toFixed(2)} kHz`, `${(metrics.bandwidthKhz - baseline.bandwidthKhz).toFixed(2)} kHz`, "≥ 95 kHz", metrics.bandwidthKhz >= 95)}${row("Phase margin", `${baseline.phaseMargin.toFixed(2)}°`, `${metrics.phaseMargin.toFixed(2)}°`, `${(metrics.phaseMargin - baseline.phaseMargin).toFixed(2)}°`, "≥ 60°", metrics.phaseMargin >= 60)}${row("Input noise", `${baseline.noiseNv.toFixed(3)} nV/√Hz`, `${metrics.noiseNv.toFixed(3)} nV/√Hz`, `${(metrics.noiseNv - baseline.noiseNv).toFixed(3)} nV/√Hz`, "≤ 18 nV/√Hz", metrics.noiseNv <= 18)}${row("Settling", `${baseline.settlingMs.toFixed(3)} ms`, `${metrics.settlingMs.toFixed(3)} ms`, `${(metrics.settlingMs - baseline.settlingMs).toFixed(3)} ms`, "≤ 5 ms", metrics.settlingMs <= 5)}`;
  }

  function tuningValuesDiffer() {
    return Object.keys(state.tuningBaseline).some((key) => Math.abs(state.tuningValues[key] - state.tuningBaseline[key]) > 1e-9);
  }

  function updateTuningPreviewChrome() {
    const metrics = tuningMetrics();
    const updateKpi = (selector, value, passed) => {
      const node = $(selector);
      if (!node) return;
      node.textContent = value;
      node.classList.toggle("ok-text", passed);
      node.classList.toggle("error-text", !passed);
    };
    $("#tune-rgain-value")?.replaceChildren(`${state.tuningValues.RGAIN.toFixed(1)} Ω`);
    $("#tune-cfilt-value")?.replaceChildren(`${state.tuningValues.CFILT.toFixed(2)} nF`);
    $("#tune-vref-value")?.replaceChildren(`${state.tuningValues.VREF.toFixed(3)} V`);
    updateKpi("#tuning-gain-kpi", `${metrics.gainDb.toFixed(3)} dB`, metrics.gainDb >= 39.5);
    updateKpi("#tuning-bandwidth-kpi", `${metrics.bandwidthKhz.toFixed(2)} kHz`, metrics.bandwidthKhz >= 95);
    updateKpi("#tuning-noise-kpi", `${metrics.noiseNv.toFixed(3)} nV/√Hz`, metrics.noiseNv <= 18);
    updateKpi("#tuning-phase-kpi", `${metrics.phaseMargin.toFixed(2)}°`, metrics.phaseMargin >= 60);
    const rows = $("#tuning-metric-rows");
    if (rows) rows.innerHTML = tuningMetricRows(metrics);
    const sessionStatus = $("#tuning-session-status");
    if (sessionStatus) {
      sessionStatus.textContent = state.tuningDirty ? "provisional · not committed" : "committed baseline";
      sessionStatus.className = `mini-badge ${state.tuningDirty ? "warn" : "accent"}`;
    }
    $$('[data-surface-action="commit-tuning"], [data-surface-action="revert-tuning"]').forEach((button) => { button.disabled = !state.tuningDirty; });
    const flowBadge = $('[data-verify-mode="tuning"] .mini-badge');
    if (flowBadge) { flowBadge.textContent = state.tuningDirty ? "provisional changes" : "baseline"; flowBadge.className = `mini-badge ${state.tuningDirty ? "warn" : "accent"}`; }
    const inspectorTitle = $("#tuning-inspector-title");
    const inspectorCopy = $("#tuning-inspector-copy");
    const inspectorStatus = $("#tuning-inspector-status");
    if (inspectorTitle) inspectorTitle.textContent = state.tuningDirty ? "Provisional values" : "Committed baseline";
    if (inspectorCopy) inspectorCopy.textContent = state.tuningDirty ? "Changes exist only in the tuning sandbox" : `Aligned to working revision ${state.inputRevision}`;
    if (inspectorStatus) { inspectorStatus.textContent = state.tuningDirty ? "not committed" : "clean"; inspectorStatus.className = `mini-badge ${state.tuningDirty ? "warn" : "ok"}`; }
    if ($("#tuning-inspector-rgain")) $("#tuning-inspector-rgain").textContent = `${state.tuningBaseline.RGAIN.toFixed(1)} → ${state.tuningValues.RGAIN.toFixed(1)} Ω`;
    if ($("#tuning-inspector-cfilt")) $("#tuning-inspector-cfilt").textContent = `${state.tuningBaseline.CFILT.toFixed(2)} → ${state.tuningValues.CFILT.toFixed(2)} nF`;
    if ($("#tuning-inspector-vref")) $("#tuning-inspector-vref").textContent = `${state.tuningBaseline.VREF.toFixed(3)} → ${state.tuningValues.VREF.toFixed(3)} V`;
    drawTunerPlot();
  }

  function tuningStage() {
    const values = state.tuningValues;
    const metrics = tuningMetrics(values);
    const baseline = tuningMetrics(state.tuningBaseline);
    const gateClass = (passed) => passed ? "ok-text" : "error-text";
    return `<div class="workspace-view verify-view">
      <div class="view-title-row"><div><span class="eyebrow">PARAMETER TUNER · NOMINAL SANDBOX · NON-DESTRUCTIVE</span><h1>Live design-space exploration</h1><p>Explore RGAIN, CFILT and VREF against an immutable Run ${state.resultManifest.id} baseline. Provisional values never alter the schematic, netlist or release evidence until explicitly committed.</p></div><div class="view-actions"><button class="button" data-surface-action="revert-tuning" ${state.tuningDirty ? "" : "disabled"}>Revert to committed</button><button class="button primary" data-surface-action="commit-tuning" ${state.tuningDirty ? "" : "disabled"}>Review & commit changes</button></div></div>
      <div class="verify-kpis"><div class="verify-kpi"><span class="kpi-label">DC gain</span><div class="kpi-value ${gateClass(metrics.gainDb >= 39.5)}" id="tuning-gain-kpi">${metrics.gainDb.toFixed(3)} dB</div><div class="kpi-foot">limit ≥ 39.5 dB</div></div><div class="verify-kpi"><span class="kpi-label">Bandwidth</span><div class="kpi-value ${gateClass(metrics.bandwidthKhz >= 95)}" id="tuning-bandwidth-kpi">${metrics.bandwidthKhz.toFixed(2)} kHz</div><div class="kpi-foot">limit ≥ 95 kHz</div></div><div class="verify-kpi"><span class="kpi-label">Input noise</span><div class="kpi-value ${gateClass(metrics.noiseNv <= 18)}" id="tuning-noise-kpi">${metrics.noiseNv.toFixed(3)} nV/√Hz</div><div class="kpi-foot">limit ≤ 18 nV/√Hz</div></div><div class="verify-kpi"><span class="kpi-label">Phase margin</span><div class="kpi-value ${gateClass(metrics.phaseMargin >= 60)}" id="tuning-phase-kpi">${metrics.phaseMargin.toFixed(2)}°</div><div class="kpi-foot">limit ≥ 60°</div></div></div>
      <div class="verify-content-grid tuning-grid">
        <section class="table-card"><div class="card-head"><h3>Exploration variables</h3><span class="mini-badge ${state.tuningDirty ? "warn" : "accent"}" id="tuning-session-status">${state.tuningDirty ? "provisional · not committed" : "committed baseline"}</span></div><div class="section-body">
          <div class="tuner-row"><div class="tuner-head"><label for="tune-rgain">RGAIN</label><output class="tuner-value" id="tune-rgain-value">${values.RGAIN.toFixed(1)} Ω</output></div><input id="tune-rgain" data-tuning-param="RGAIN" type="range" min="350" max="750" step="0.5" value="${values.RGAIN}" aria-describedby="tune-rgain-help"><small class="muted" id="tune-rgain-help">Committed ${state.tuningBaseline.RGAIN.toFixed(1)} Ω · affects gain, bandwidth and noise.</small></div>
          <div class="tuner-row"><div class="tuner-head"><label for="tune-cfilt">CFILT</label><output class="tuner-value" id="tune-cfilt-value">${values.CFILT.toFixed(2)} nF</output></div><input id="tune-cfilt" data-tuning-param="CFILT" type="range" min="8" max="40" step="0.05" value="${values.CFILT}" aria-describedby="tune-cfilt-help"><small class="muted" id="tune-cfilt-help">Committed ${state.tuningBaseline.CFILT.toFixed(2)} nF · affects bandwidth, settling and phase margin.</small></div>
          <div class="tuner-row"><div class="tuner-head"><label for="tune-vref">VREF</label><output class="tuner-value" id="tune-vref-value">${values.VREF.toFixed(3)} V</output></div><input id="tune-vref" data-tuning-param="VREF" type="range" min="1.5" max="3.5" step="0.005" value="${values.VREF}" aria-describedby="tune-vref-help"><small class="muted" id="tune-vref-help">Committed ${state.tuningBaseline.VREF.toFixed(3)} V · shifts output common mode.</small></div>
        </div></section>
        <section class="verify-chart-card"><div class="chart-card-head"><h3>Live nominal step response</h3><span>solid · provisional &nbsp; dashed · Run ${state.resultManifest.id} baseline</span></div><canvas id="tuner-plot" class="verify-canvas" aria-label="Live provisional and baseline step-response comparison"></canvas></section>
        <section class="spec-matrix-card" style="grid-column:1/-1"><div class="card-head"><h3>Provisional measurement contract</h3><span class="mini-badge warn">sandbox estimates · excluded from release evidence</span></div><table class="data-table"><thead><tr><th>Executable check</th><th>Committed baseline</th><th>Provisional</th><th>Delta</th><th>Limit</th><th>Gate</th></tr></thead><tbody id="tuning-metric-rows">${tuningMetricRows(metrics, baseline)}</tbody></table></section>
      </div>
    </div>`;
  }

  function verifyStage() {
    if (state.verifyMode === "drc") return drcStage();
    if (state.verifyMode === "tuning") return tuningStage();
    if (state.verifyMode === "optimization") return optimizationStage();
    if (state.verifyMode === "corners") return cornerVerificationStage();
    if (state.verifyMode === "reliability") return reliabilityStage();
    if (state.verifyMode === "regression") return regressionStage();
    const runLabel = "QUALIFICATION DATASET MC-REF-17 · REQUIREMENTS REQ-17 · YIELD_1000 · SEED 0X73A4";
    const title = "PVT & Monte Carlo verification";
    return `<div class="workspace-view verify-view">
      <div class="view-title-row"><div><span class="eyebrow">${runLabel}</span><h1>${title}</h1><p>Independent verification dataset · 1,000 samples · 5 process corners · 3 temperatures · 12 / 14 requirements mapped in req-17</p></div><div class="view-actions"><button class="button" data-surface-action="compare-result">${iconSvg("compare")} Compare baseline</button><button class="button primary" data-surface-action="generate-report">${iconSvg("export")} Generate report</button></div></div>
      <div class="verify-kpis"><div class="verify-kpi"><span class="kpi-label">Estimated yield</span><div class="kpi-value warn-text">98.60%</div><div class="kpi-foot">95% CI · 97.7–99.2%</div></div><div class="verify-kpi"><span class="kpi-label">Passing samples</span><div class="kpi-value">986 / 1000</div><div class="kpi-foot">14 samples violate ≥1 executable check</div></div><div class="verify-kpi"><span class="kpi-label">Worst margin</span><div class="kpi-value error-text">−8.40%</div><div class="kpi-foot">bandwidth · sample #0731</div></div><div class="verify-kpi"><span class="kpi-label">Mapped requirements</span><div class="kpi-value warn-text">12 / 14</div><div class="kpi-foot">req-17 · 2 mappings absent</div></div></div>
      <div class="verify-content-grid">
        <section class="verify-chart-card"><div class="chart-card-head"><h3>Gain distribution · all samples</h3><span>mean 40.007 dB · σ 0.118 dB</span></div><canvas id="yield-histogram" class="verify-canvas" aria-label="Monte Carlo gain distribution histogram"></canvas></section>
        <section class="corner-matrix"><div class="card-head"><h3>Corner matrix · specification margin</h3><span class="mini-badge ok">15 / 15 pass</span></div><table class="data-table"><thead><tr><th style="width:27%">Specification</th><th>FF −40</th><th>FF 125</th><th>TT 27</th><th>SS −40</th><th>SS 125</th></tr></thead><tbody><tr><td>gain_dc ≥ 39.5 dB</td><td><span class="corner-cell pass">+0.8</span></td><td><span class="corner-cell pass">+0.6</span></td><td><span class="corner-cell pass">+0.5</span></td><td><span class="corner-cell pass">+0.3</span></td><td><span class="corner-cell pass">+0.2</span></td></tr><tr><td>bandwidth ≥ 95 kHz</td><td><span class="corner-cell pass">+18</span></td><td><span class="corner-cell pass">+12</span></td><td><span class="corner-cell pass">+9</span></td><td><span class="corner-cell pass">+5</span></td><td><span class="corner-cell pass">+2</span></td></tr><tr><td>phase_margin ≥ 60°</td><td><span class="corner-cell pass">+4</span></td><td><span class="corner-cell pass">+6</span></td><td><span class="corner-cell pass">+7</span></td><td><span class="corner-cell pass">+9</span></td><td><span class="corner-cell pass">+11</span></td></tr><tr><td>offset ≤ 50 µV</td><td><span class="corner-cell pass">+28</span></td><td><span class="corner-cell pass">+25</span></td><td><span class="corner-cell pass">+31</span></td><td><span class="corner-cell pass">+24</span></td><td><span class="corner-cell pass">+21</span></td></tr><tr><td>power ≤ 15 mW</td><td><span class="corner-cell pass">+6</span></td><td><span class="corner-cell pass">+7</span></td><td><span class="corner-cell pass">+8</span></td><td><span class="corner-cell pass">+9</span></td><td><span class="corner-cell pass">+10</span></td></tr></tbody></table></section>
        <section class="spec-matrix-card"><div class="card-head"><h3>Measurement & specification matrix</h3><span class="mini-badge warn">2 coverage gaps</span><button class="button ghost" style="margin-left:7px" data-surface-action="map-requirement">Map requirement</button></div><table class="data-table"><thead><tr><th style="width:22%">Requirement / measure</th><th>Limit</th><th>Nominal</th><th>Worst</th><th>Corner / sample</th><th>Status</th></tr></thead><tbody><tr><td>DC gain · gain_dc</td><td class="mono">≥ 39.5 dB</td><td class="mono">40.007 dB</td><td class="mono">39.711 dB</td><td>SS / 125 °C</td><td><span class="mini-badge ok">pass</span></td></tr><tr><td>Bandwidth · f_3db</td><td class="mono">≥ 95 kHz</td><td class="mono">104.8 kHz</td><td class="mono">87.02 kHz</td><td>#0731</td><td><span class="mini-badge error">14 fail</span></td></tr><tr><td>Phase margin · pm</td><td class="mono">≥ 60°</td><td class="mono">67.412°</td><td class="mono">56.31°</td><td>#0184</td><td><span class="mini-badge error">3 fail</span></td></tr><tr><td>Input offset · vos</td><td class="mono">≤ 50 µV</td><td class="mono">18.442 µV</td><td class="mono">61.2 µV</td><td>#0922</td><td><span class="mini-badge error">2 fail</span></td></tr><tr><td>Settling · t_settle</td><td class="mono">≤ 5 ms</td><td class="mono">4.812 ms</td><td class="mono">4.991 ms</td><td>SS / 125 °C</td><td><span class="mini-badge ok">pass</span></td></tr></tbody></table></section>
      </div>
    </div>`;
  }

  function modelManagerSectionStage(section) {
    const tabs = [["models", "Models"], ["symbols", "Symbols & CDF"], ["corners", "Corners & sections"], ["include", "Include graph"], ["validation", "Qualification"]];
    const tabBar = `<div class="model-tabs" role="navigation" aria-label="Model manager pages">${tabs.map(([id, label]) => `<button class="${section === id ? "active" : ""}" data-model-section="${id}" aria-current="${section === id ? "page" : "false"}">${label}</button>`).join("")}<span class="grow"></span></div>`;
    if (section === "symbols") return `<div class="workspace-view models-view">${tabBar}<div class="view-title-row"><div><span class="eyebrow">SYMBOLS, PINS & DEVICE FORMS</span><h1>Symbol and component-definition manager</h1><p>Bind graphical symbols, terminals, parameter forms and model families without hiding netlist semantics.</p></div><div class="view-actions"><button class="button" data-surface-action="import-symbol">Import symbol</button><button class="button primary" data-surface-action="create-symbol">Create symbol</button></div></div><div class="setup-workspace-grid"><section class="table-card span-2"><div class="card-head"><h3>Symbol registry</h3><span class="mini-badge ok">126 resolved</span></div><table class="data-table"><thead><tr><th>Symbol</th><th>Model family</th><th>Pins</th><th>Parameter form</th><th>Netlist template</th><th>Status</th></tr></thead><tbody><tr><td>opamp_5pin</td><td>OPA189_A</td><td class="mono">IN+ IN− V+ V− OUT</td><td>macro-model</td><td class="mono">X{name} … {model}</td><td><span class="mini-badge ok">bound</span></td></tr><tr><td>nmos_4pin</td><td>BSIM4</td><td class="mono">D G S B</td><td>MOS geometry</td><td class="mono">M{name} D G S B …</td><td><span class="mini-badge ok">bound</span></td></tr><tr><td>rf_port</td><td>PORT</td><td class="mono">P N</td><td>RF port</td><td class="mono">P{name} P N z0=…</td><td><span class="mini-badge ok">bound</span></td></tr></tbody></table></section><section class="table-card"><div class="card-head"><h3>Pin contract</h3></div><div class="section-body property-list"><div class="property-row"><span>Electrical types</span><span class="property-value">validated</span></div><div class="property-row"><span>Hidden power pins</span><span class="property-value">forbidden</span></div><div class="property-row"><span>Pin-order mismatch</span><span class="property-value error-text">block netlist</span></div></div></section><section class="table-card"><div class="card-head"><h3>Parameter form</h3></div><div class="section-body"><p class="muted">Typed engineering values, defaults, constraints, model inheritance and device-specific help are versioned with each symbol.</p><button class="button" data-surface-action="open-form-designer">Open form designer</button></div></section></div></div>`;
    if (section === "corners") return `<div class="workspace-view models-view">${tabBar}<div class="view-title-row"><div><span class="eyebrow">PDK SECTIONS · 5 PROCESS CORNERS</span><h1>Corner and section binding</h1><p>Map user-facing PVT names to exact library sections and verify availability before task expansion.</p></div><div class="view-actions"><button class="button" data-surface-action="import-section-map">Import section map</button><button class="button primary" data-surface-action="validate-bindings">Validate all bindings</button></div></div><div class="setup-workspace-grid"><section class="table-card span-2"><div class="card-head"><h3>Section matrix</h3><span class="mini-badge ok">complete</span></div><table class="data-table"><thead><tr><th>Corner</th><th>MOS section</th><th>BJT section</th><th>Passives</th><th>Macro-model</th><th>Temperature range</th><th>Status</th></tr></thead><tbody>${[["FF","ff","fast","rmin_cmax","maximum","−55…150"],["FS","fs","fast_n_slow_p","typical","typical","−55…150"],["TT","tt","typical","typical","typical","−55…150"],["SF","sf","slow_n_fast_p","typical","typical","−55…150"],["SS","ss","slow","rmax_cmin","minimum","−55…150"]].map((row) => `<tr>${row.map((value) => `<td class="mono">${value}</td>`).join("")}<td><span class="mini-badge ok">resolved</span></td></tr>`).join("")}</tbody></table></section><section class="table-card"><div class="card-head"><h3>Fallback policy</h3></div><div class="section-body property-list"><div class="property-row"><span>Missing section</span><span class="property-value error-text">fail closed</span></div><div class="property-row"><span>Implicit typical</span><span class="property-value">disabled</span></div><div class="property-row"><span>Alias resolution</span><span class="property-value">explicit map only</span></div></div></section><section class="table-card"><div class="card-head"><h3>Environment axes</h3></div><div class="section-body property-list"><div class="property-row"><span>Temperature</span><span class="property-value">−40 / 27 / 125 °C</span></div><div class="property-row"><span>Supply</span><span class="property-value">4.5 / 5.0 / 5.5 V</span></div><div class="property-row"><span>Package</span><span class="property-value">nominal</span></div></div></section></div></div>`;
    if (section === "include") return `<div class="workspace-view models-view">${tabBar}<div class="view-title-row"><div><span class="eyebrow">INCLUDE RESOLUTION · CONTENT ADDRESSED</span><h1>Model include graph</h1><p>Ordered, inspectable dependency resolution with shadowing and cycle detection.</p></div><div class="view-actions"><button class="button" data-surface-action="collapse-transitive">Collapse transitive</button><button class="button primary" data-surface-action="export-manifest">Export manifest</button></div></div><div class="include-graph-layout"><section class="include-graph-card"><div class="include-node root"><strong>models/models.lib</strong><small>project root · 2a91…18ef</small></div><div class="include-edge"></div><div class="include-level"><div class="include-node"><strong>demo180/corners.lib</strong><small>section ${state.planCorner.split(" · ")[0].toLowerCase()}</small></div><div class="include-node"><strong>vendor/OPA189.lib</strong><small>section typical</small></div><div class="include-node"><strong>sensor_bridge.va</strong><small>compiled module</small></div></div><div class="include-level"><div class="include-node"><strong>bsim4_4p8.va</strong><small>generated Rust builtin</small></div><div class="include-node"><strong>passives.lib</strong><small>temperature models</small></div></div></section><section class="table-card"><div class="card-head"><h3>Resolution diagnostics</h3><span class="mini-badge ok">clean</span></div><div class="section-body property-list"><div class="property-row"><span>Files</span><span class="property-value">7</span></div><div class="property-row"><span>Definitions</span><span class="property-value">142</span></div><div class="property-row"><span>Shadowed</span><span class="property-value ok-text">0</span></div><div class="property-row"><span>Cycles</span><span class="property-value ok-text">0</span></div><div class="property-row"><span>Total digest</span><span class="property-value mono">be17…481c</span></div></div></section></div></div>`;
    return `<div class="workspace-view models-view">${tabBar}<div class="view-title-row"><div><span class="eyebrow">MODEL QUALIFICATION · RELEASE GATE</span><h1>Qualification and correlation</h1><p>Every production model is backed by versioned test vectors, tolerances and traceable review dispositions.</p></div><div class="view-actions"><button class="button" data-surface-action="compare-release">Compare release</button><button class="button primary" data-surface-action="run-qualification">Run qualification suite</button></div></div><div class="verify-kpis"><div class="verify-kpi"><span class="kpi-label">Vectors passing</span><div class="kpi-value warn-text">1,397 / 1,406</div><div class="kpi-foot">9 review / waiver dispositions pending</div></div><div class="verify-kpi"><span class="kpi-label">Oracle coverage</span><div class="kpi-value ok-text">99.3%</div><div class="kpi-foot">ngspice · Xyce · vendor</div></div><div class="verify-kpi"><span class="kpi-label">Worst deviation</span><div class="kpi-value">0.74%</div><div class="kpi-foot">BSIM4 AC charge</div></div><div class="verify-kpi"><span class="kpi-label">Interpreter parity</span><div class="kpi-value ok-text">3 / 3</div><div class="kpi-foot">desktop · web · mobile</div></div></div><section class="table-card"><div class="card-head"><h3>Qualification suites</h3><span class="mini-badge warn">promotion blocked</span></div><table class="data-table"><thead><tr><th>Model family</th><th>DC</th><th>AC / charge</th><th>Transient</th><th>Noise</th><th>Temperature</th><th>Correlation</th><th>Gate</th></tr></thead><tbody><tr><td>OPA189_A</td><td>12 / 12</td><td>8 / 8</td><td>12 / 12</td><td>4 / 4</td><td>6 / 6</td><td>vendor</td><td><span class="mini-badge ok">pass</span></td></tr><tr><td>BSIM4_4.8.2</td><td>126 / 126</td><td>118 / 123</td><td>92 / 92</td><td>36 / 36</td><td>43 / 43</td><td>ngspice</td><td><span class="mini-badge warn">review pending</span></td></tr><tr><td>VBIC_1.3</td><td>30 / 30</td><td>18 / 18</td><td>22 / 22</td><td>8 / 8</td><td>10 / 10</td><td>Xyce</td><td><span class="mini-badge ok">pass</span></td></tr></tbody></table></section></div>`;
  }

  function modelsStage() {
    const section = state.modelSection || "models";
    if (section !== "models") return modelManagerSectionStage(section);
    return `<div class="workspace-view models-view"><div class="model-tabs" role="navigation" aria-label="Model manager pages"><button class="active" aria-current="page" data-model-section="models">Models</button><button aria-current="false" data-model-section="symbols">Symbols & CDF</button><button aria-current="false" data-model-section="corners">Corners & sections</button><button aria-current="false" data-model-section="include">Include graph</button><button aria-current="false" data-model-section="validation">Qualification</button><span class="grow"></span><label class="panel-search" style="width:220px;margin:5px 7px">${iconSvg("search")}<input aria-label="Filter model catalog" placeholder="Filter 142 models…"></label></div><div class="model-table-wrap"><table class="data-table"><thead><tr><th style="width:15%">Model</th><th style="width:17%">Family</th><th style="width:17%">Source</th><th style="width:14%">Library</th><th style="width:18%">Sections / runtime</th><th style="width:10%">Tests</th><th>Status</th></tr></thead><tbody>${MODEL_ROWS.map((r) => { const selected = r[0] === state.selectedModel; return `<tr class="${selected ? "selected" : ""}" data-model-row="${r[0]}" tabindex="${selected ? "0" : "-1"}" aria-selected="${selected}"><td class="mono">${r[0]}</td><td>${r[1]}</td><td class="mono">${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td class="mono">${r[5]}</td><td><span class="mini-badge ${r[6] === "qualified" ? "ok" : r[6] === "review" || r[6] === "compile" || r[6] === "experimental" ? "warn" : ""}">${r[6]}</span></td></tr>`; }).join("")}</tbody></table></div></div>`;
  }

  function codeWorkbenchStage(section) {
    const workflowGraph = executionTaskGraph(state.enabledAnalyses, effectiveAnalysisValues(state.enabledAnalyses, state.analysisValues));
    const workflowNonRelease = [...state.enabledAnalyses].filter((analysis) => NON_RELEASE_ANALYSES.has(analysis));
    const verilogDirty = state.sourceValidationRequired.has("sensor_bridge.va");
    const automationDirty = state.sourceValidationRequired.has("characterize.rspice");
    const physicalDrcEligible = DRC_MARKERS.every((marker) => marker.status === "waived");
    const releaseEligible = Boolean(state.resultManifest?.qualification?.signOffEligible && physicalDrcEligible);
    const failedReportGates = [...failedQualificationGates(state.resultManifest), ...(physicalDrcEligible ? [] : ["physical DRC"])];
    const reportStatus = releaseEligible ? "technically eligible · approval pending" : "draft · release blocked";
    const reportStatement = releaseEligible
      ? "All configured technical gates pass. The package remains pending explicit engineering approval and signature."
      : `This dataset is not sign-off eligible because ${failedReportGates.length ? failedReportGates.join(", ") : "one or more qualification gates"} remain blocked. The package is retained as a traceable engineering draft.`;
    if (section === "veriloga") return `<div class="workspace-view code-workbench-view"><div class="view-title-row"><div><span class="eyebrow">VERILOG-A · SEMANTIC COMPILE · MULTI-RUNTIME</span><h1>Behavioral-model compiler</h1><p>Canonical IR, interpreted WebAssembly, native-JIT preview and generated-Rust qualification paths.</p></div><div class="view-actions"><button class="button" data-code-surface="netlist">Generated netlist</button><button class="button primary" data-surface-action="compile-veriloga">Compile sensor_bridge.va</button></div></div><div class="code-workbench-grid"><section class="netlist-view code-pane"><div class="code-toolbar"><span class="code-language">sensor_bridge.va</span><span class="mini-badge ${verilogDirty ? "warn" : "ok"}">${verilogDirty ? "modified · compile required" : "semantic checks pass"}</span></div><div class="code-editor" role="textbox" aria-label="Editable code source" aria-multiline="true" data-editable-source="sensor_bridge.va" contenteditable="true" spellcheck="false"><div class="code-line" data-line="1"><code><span class="tok-control">&#96;include</span> <span class="tok-string">&quot;constants.vams&quot;</span></code></div><div class="code-line" data-line="2"><code><span class="tok-control">module</span> <span class="tok-device">sensor_bridge</span>(out, inp, inn);</code></div><div class="code-line" data-line="3"><code>  <span class="tok-param">parameter real gain</span> = <span class="tok-number">100.0</span> from (<span class="tok-number">0:inf</span>);</code></div><div class="code-line" data-line="4"><code>  analog V(out) &lt;+ gain * (V(inp)-V(inn));</code></div><div class="code-line" data-line="5"><code><span class="tok-control">endmodule</span></code></div></div></section><section class="compiler-inspector"><div class="panel-section"><div class="section-head"><span class="grow">Build targets</span></div><div class="property-list"><div class="property-row"><span>Semantic IR</span><span class="property-value ok-text">✓ canonical</span></div><div class="property-row"><span>Bytecode VM</span><span class="property-value ok-text">✓ available</span></div><div class="property-row"><span>Native x64 JIT</span><span class="property-value warn-text">△ preview</span></div><div class="property-row"><span>WASM interpreter</span><span class="property-value ok-text">✓ available</span></div><div class="property-row"><span>Generated Rust</span><span class="property-value">qualification only</span></div></div></div><div class="panel-section"><div class="section-head"><span class="grow">Diagnostics</span><span class="mini-badge warn">1 advisory</span></div><div class="diagnostic-row"><span class="diag-icon">△</span><div><strong>Transition time is implicit</strong><p>line 4 · consider transition() for discontinuous sources</p></div></div></div><div class="panel-section"><div class="section-head"><span class="grow">ABI contract</span></div><div class="property-list"><div class="property-row"><span>Analog ports</span><span class="property-value">3</span></div><div class="property-row"><span>Noise sources</span><span class="property-value">0</span></div><div class="property-row"><span>State variables</span><span class="property-value">0</span></div></div></div></section></div></div>`;
    if (section === "automation") return `<div class="workspace-view code-workbench-view"><div class="view-title-row"><div><span class="eyebrow">AUTOMATION · LOCAL SCRIPT · REPRODUCIBLE BATCH</span><h1>Automation and CI console</h1><p>Compose project-aware run plans, exports, comparisons and machine-readable release gates.</p></div><div class="view-actions"><button class="button" data-code-surface="netlist">Generated netlist</button><button class="button primary" data-surface-action="run-automation">Run workflow</button></div></div><div class="code-workbench-grid"><section class="netlist-view code-pane"><div class="code-toolbar"><span class="code-language">characterize.rspice</span><span class="mini-badge ${automationDirty ? "warn" : "ok"}">${automationDirty ? "modified · validation required" : "validated"}</span></div><div class="code-editor" role="textbox" aria-label="Editable code source" aria-multiline="true" data-editable-source="characterize.rspice" contenteditable="true" spellcheck="false"><div class="code-line" data-line="1"><code><span class="tok-control">plan</span> = project.plan(<span class="tok-string">&quot;Lab characterization&quot;</span>)</code></div><div class="code-line" data-line="2"><code>run = plan.with_corners(<span class="tok-string">&quot;all&quot;</span>).execute(target=<span class="tok-string">&quot;local&quot;</span>)</code></div><div class="code-line" data-line="3"><code>run.require(specs=<span class="tok-string">&quot;release&quot;</span>)</code></div><div class="code-line" data-line="4"><code>run.compare(baseline=<span class="tok-string">&quot;main&quot;</span>, waveforms=<span class="tok-param">True</span>)</code></div><div class="code-line" data-line="5"><code>run.export([<span class="tok-string">&quot;junit&quot;</span>, <span class="tok-string">&quot;summary.json&quot;</span>, <span class="tok-string">&quot;report.pdf&quot;</span>])</code></div></div></section><section class="compiler-inspector"><div class="panel-section"><div class="section-head"><span class="grow">Execution preview</span><span class="mini-badge ${workflowNonRelease.length ? "warn" : "accent"}">${workflowGraph.total.toLocaleString()} tasks &middot; ${workflowNonRelease.length ? "non-sign-off" : "release plan"}</span></div><div class="property-list"><div class="property-row"><span>Project revision</span><span class="property-value mono">${state.inputRevision}</span></div><div class="property-row"><span>Run target</span><span class="property-value">local · 12 slots</span></div><div class="property-row"><span>PVT points</span><span class="property-value">${PVT_RUN_POINTS.length}</span></div><div class="property-row"><span>Release checks</span><span class="property-value">${specificationCount(state.enabledAnalyses)} configured</span></div></div></div><div class="panel-section"><div class="section-head"><span class="grow">Artifacts</span></div><div class="tree"><button class="tree-row">${iconSvg("file")}<span class="label">junit.xml</span><span class="tree-meta">CI</span></button><button class="tree-row">${iconSvg("file")}<span class="label">summary.json</span><span class="tree-meta">machine</span></button><button class="tree-row">${iconSvg("file")}<span class="label">verification.pdf</span><span class="tree-meta">report</span></button></div></div><div class="panel-section"><div class="section-head"><span class="grow">Security</span></div><p class="muted">Scripts run with project-scoped file access. Remote targets require named authorization before any design data is transmitted.</p></div></section></div></div>`;
    return `<div class="workspace-view code-workbench-view"><div class="view-title-row"><div><span class="eyebrow">REPORT BUILDER · ${releaseEligible ? "RELEASE PACKAGE" : "ENGINEERING DRAFT"}</span><h1>Engineering report composer</h1><p>Traceable sections, locked run references, publication plots and machine-readable appendices.</p></div><div class="view-actions"><button class="button" data-code-surface="netlist">Generated netlist</button><button class="button primary" data-surface-action="generate-report">${releaseEligible ? "Generate release package" : "Generate draft package"}</button></div></div><div class="report-builder-grid"><section class="report-outline"><div class="panel-head"><h2>Report outline</h2></div><div class="tree"><button class="tree-row selected"><span class="tree-caret">1</span><span class="label">Executive summary</span></button><button class="tree-row"><span class="tree-caret">2</span><span class="label">Design and configuration</span></button><button class="tree-row"><span class="tree-caret">3</span><span class="label">Nominal results</span></button><button class="tree-row"><span class="tree-caret">4</span><span class="label">PVT and yield</span></button><button class="tree-row"><span class="tree-caret">5</span><span class="label">Reliability and regression</span></button><button class="tree-row"><span class="tree-caret">6</span><span class="label">Physical DRC and waivers</span></button><button class="tree-row"><span class="tree-caret">A</span><span class="label">Run manifests</span></button></div></section><section class="report-preview"><span class="eyebrow">PRECISION SENSOR AFE · VERIFICATION REPORT</span><h1>${releaseEligible ? "Release characterization" : "Engineering review draft"}</h1><p>Revision ${state.resultManifest.inputRevision} &middot; Run ${state.resultManifest.id} &middot; immutable manifest &middot; <strong>${reportStatus}</strong></p><div class="report-summary-grid"><div><strong>${state.resultPassedSpecCount} / ${state.resultSpecCount}</strong><small>configured checks passing</small></div><div><strong>${state.resultAnalyses.has("mc") ? `${state.resultManifest.qualification.gates.monteCarloYield.resultPercent.toFixed(2)}%` : "not run"}</strong><small>${state.resultAnalyses.has("mc") ? "Monte Carlo yield estimate" : "Monte Carlo not in dataset"}</small></div><div><strong>${state.resultManifest.runSet.pointCount} / ${state.resultManifest.runSet.pointCount}</strong><small>PVT points completed</small></div></div><h3>Sign-off statement</h3><p>${escapeHtml(reportStatement)}</p><div class="concept-banner">Every value and figure is bound to its exact run, model digest, input revision and calculation definition. Generated packages retain immutable provenance.</div></section><section class="compiler-inspector"><div class="panel-section"><div class="section-head"><span class="grow">Output formats</span></div><div class="property-list"><div class="property-row"><span>PDF/A</span><span class="property-value ok-text">enabled</span></div><div class="property-row"><span>HTML bundle</span><span class="property-value ok-text">enabled</span></div><div class="property-row"><span>JSON appendix</span><span class="property-value ok-text">enabled</span></div><div class="property-row"><span>CSV datasets</span><span class="property-value">selected only</span></div></div></div><div class="panel-section"><div class="section-head"><span class="grow">Review contract</span></div><div class="property-list"><div class="property-row"><span>Draft watermark</span><span class="property-value">on</span></div><div class="property-row"><span>Approval signature</span><span class="property-value">required</span></div><div class="property-row"><span>Baseline links</span><span class="property-value">immutable</span></div><div class="property-row"><span>Physical DRC</span><span class="property-value error-text">Run 42 · 23 blocking</span></div></div></div></section></div></div>`;
  }

  function netlistStage() {
    const section = state.codeSurface || "netlist";
    if (section !== "netlist") return codeWorkbenchStage(section);
    const spiceInstance = (id, fallback) => {
      const edited = state.componentEdits[id]?.instance;
      if (!edited) return fallback;
      return edited.startsWith("X") || id === "RG" ? edited : `X${edited}`;
    };
    const spiceModel = (id, fallback) => state.componentEdits[id]?.value || fallback;
    const rgValue = state.componentEdits.RG?.value ? String(state.componentEdits.RG.value).replace(/\s*Ω\s*$/, "") : "{<span class=\"tok-param\">RGAIN</span>}";
    const rgParameter = escapeHtml(String(state.componentEdits.RG?.value || state.tuningBaseline.RGAIN).replace(/\s*Ω\s*$/, ""));
    const cfiltParameter = escapeHtml(state.tuningBaseline.CFILT.toFixed(4));
    const vrefParameter = escapeHtml(state.tuningBaseline.VREF.toFixed(5));
    const planValues = effectiveAnalysisValues(state.enabledAnalyses, state.analysisValues);
    const directiveFor = (analysis) => {
      const values = planValues[analysis] || {};
      if (analysis === "op") return '<span class="tok-control">.op</span>';
      if (analysis === "tran") return `<span class="tok-control">.tran</span> <span class="tok-number">${escapeHtml(values[2] || "10u")} ${escapeHtml(values[1] || "20m")} ${escapeHtml(values[0] || "0")}</span>`;
      if (analysis === "ac") return `<span class="tok-control">.ac</span> dec <span class="tok-number">${escapeHtml(values[1] || "50")} ${escapeHtml(values[2] || "1")} ${escapeHtml(values[3] || "10Meg")}</span>`;
      if (analysis === "noise") {
        const source = String(values[5] || "VIN_DIFF") === "VIN_DIFF" ? "VINP" : String(values[5]);
        return `<span class="tok-control">.noise</span> V(<span class="tok-node">${escapeHtml(values[4] || "afe_out")}</span>) ${escapeHtml(source)} dec <span class="tok-number">${escapeHtml(values[1] || "30")} ${escapeHtml(values[2] || "1")} ${escapeHtml(values[3] || "1Meg")}</span> <span class="tok-comment">; VIN_DIFF maps to independent source VINP</span>`;
      }
      if (analysis === "dc") return `<span class="tok-control">.dc</span> ${escapeHtml(values[0] || "VOS")} <span class="tok-number">${escapeHtml(values[2] || "-10m")} ${escapeHtml(values[3] || "10m")} ${escapeHtml(values[4] || "100u")}</span>`;
      if (analysis === "sens") {
        const output = String(values[0] || "gain_dc") === "gain_dc" ? "V(afe_out)" : String(values[0]);
        return `<span class="tok-control">.sens</span> ${escapeHtml(output)} ac dec <span class="tok-number">1 10 10</span> <span class="tok-comment">; gain_dc resolves to the measured output</span>`;
      }
      if (analysis === "stb") return `<span class="tok-control">.stb</span> XLP1 dec <span class="tok-number">${escapeHtml(values[2] || "80")} ${escapeHtml(values[3] || "10")} ${escapeHtml(values[4] || "100Meg")}</span> method=middlebrook`;
      if (analysis === "fourier") return `<span class="tok-control">.four</span> <span class="tok-number">${escapeHtml(values[1] || "1k")}</span> ${escapeHtml(values[0] || "V(afe_out)")}`;
      return `<span class="tok-comment">* task analysis ${ANALYSIS_CODE_MAP[analysis] || analysis.toUpperCase()} · settings and prerequisites are frozen in the run manifest</span>`;
    };
    const analysisDirectiveLines = [...state.enabledAnalyses].map((analysis) => [directiveFor(analysis)]);
    const measurementLines = [];
    if (state.enabledAnalyses.has("tran")) measurementLines.push(['<span class="tok-control">.meas tran</span> rise_time TRIG V(<span class="tok-node">afe_out</span>) VAL=<span class="tok-number">0.5</span> RISE=1 TARG V(<span class="tok-node">afe_out</span>) VAL=<span class="tok-number">4.5</span> RISE=1']);
    if (state.enabledAnalyses.has("ac")) measurementLines.push(['<span class="tok-control">.meas ac</span> gain_dc FIND vdb(<span class="tok-node">afe_out</span>) AT=<span class="tok-number">10</span> GOAL=<span class="tok-number">40</span> TOL=<span class="tok-number">0.5</span>']);
    const lines = [
      ['<span class="tok-comment">* RSpice generated netlist · Precision Sensor AFE</span>'],
      [`<span class="tok-comment">* source revision: ${escapeHtml(state.inputRevision)} · live generated preview · immutable</span>`],
      [`<span class="tok-comment">* scheduler expands ${executionTaskGraph(state.enabledAnalyses, planValues).total.toLocaleString()} tasks across the frozen execution graph</span>`],
      [""],
      ['<span class="tok-control">.title</span> Precision Sensor AFE — Lab characterization'],
      ['<span class="tok-control">.include</span> <span class="tok-string">&quot;models/models.lib&quot;</span>'],
      [`<span class="tok-control">.lib</span> <span class="tok-string">&quot;demo180/corners.lib&quot;</span> <span class="tok-param">${escapeHtml(state.planCorner.split(" · ")[0].toLowerCase())}</span> <span class="tok-comment">; reference point, scheduler binds each PVT task explicitly</span>`],
      ['<span class="tok-control">.include</span> <span class="tok-string">&quot;vendor/OPA189.lib&quot;</span>'],
      [""],
      [`<span class="tok-control">.param</span> <span class="tok-param">RGAIN</span>=<span class="tok-number">${rgParameter}</span> <span class="tok-param">CFILT</span>=<span class="tok-number">${cfiltParameter}n</span> <span class="tok-param">VREF</span>=<span class="tok-number">${vrefParameter}</span>`],
      ['<span class="tok-control">.temp</span> <span class="tok-number">27</span>'],
      [""],
      ['<span class="tok-device">VINP</span> <span class="tok-node">sensor_p_drive</span> 0 SIN(<span class="tok-number">0 5m 1k</span>) AC <span class="tok-number">0.5</span>'],
      ['<span class="tok-device">VOS</span> <span class="tok-node">sensor_p sensor_p_drive</span> <span class="tok-number">0</span> <span class="tok-comment">; explicit DC-sweep offset source</span>'],
      ['<span class="tok-device">VINN</span> <span class="tok-node">sensor_n</span> 0 SIN(<span class="tok-number">0 -5m 1k</span>) AC <span class="tok-number">-0.5</span>'],
      ['<span class="tok-device">VDD</span>  <span class="tok-node">vdd</span> 0 <span class="tok-number">5</span>'],
      ['<span class="tok-device">VSS</span>  <span class="tok-node">vss</span> 0 <span class="tok-number">-5</span>'],
      ['<span class="tok-device">VREF_SRC</span> <span class="tok-node">vref_2v5</span> 0 {<span class="tok-param">VREF</span>}'],
      [""],
      [`<span class="tok-device">${escapeHtml(spiceInstance("U1", "XU1"))}</span> <span class="tok-node">sensor_p n1 vdd vss u1_out</span> ${escapeHtml(spiceModel("U1", "OPA189_A"))}`],
      [`<span class="tok-device">${escapeHtml(spiceInstance("U2", "XU2"))}</span> <span class="tok-node">sensor_n n2 vdd vss u2_out</span> ${escapeHtml(spiceModel("U2", "OPA189_A"))}`],
      [`<span class="tok-device">${escapeHtml(spiceInstance("RG", "RG"))}</span>  <span class="tok-node">n1 n2</span> ${state.componentEdits.RG?.value ? escapeHtml(rgValue) : rgValue} tc1=<span class="tok-number">15u</span>`],
      ['<span class="tok-device">R1</span>  <span class="tok-node">u1_out n1</span> <span class="tok-number">10k</span>'],
      ['<span class="tok-device">R2</span>  <span class="tok-node">u2_out n2</span> <span class="tok-number">10k</span>'],
      [`<span class="tok-device">${escapeHtml(spiceInstance("U3", "XU3"))}</span> <span class="tok-node">u1_out u2_out vref_2v5 afe_out_drive</span> ${escapeHtml(spiceModel("U3", "OPA2189_A"))}`],
      ['<span class="tok-device">XLP1</span> <span class="tok-node">afe_out_drive afe_out</span> RSPICE_IPROBE <span class="tok-comment">; loop-breaking probe for STB</span>'],
      ['<span class="tok-device">RLOAD</span> <span class="tok-node">afe_out 0</span> <span class="tok-number">10k</span>'],
      ['<span class="tok-device">CFILT</span> <span class="tok-node">afe_out 0</span> {<span class="tok-param">CFILT</span>}'],
      [""],
      ...analysisDirectiveLines,
      ...measurementLines,
      ['<span class="tok-control">.options</span> reltol=<span class="tok-number">1e-4</span> vabstol=<span class="tok-number">1e-9</span> iabstol=<span class="tok-number">1e-12</span> method=gear2'],
      ['<span class="tok-control">.end</span>']
    ];
    const selectedLine = { U1: 19, U2: 20, RG: 21, U3: 24 }[state.selectedComponent] ?? 19;
    const initialHtml = lines.map((line, i) => `<div class="code-line ${i === selectedLine ? "active" : ""}" data-line="${i + 1}"><code>${line[0] || " "}</code></div>`).join("");
    const editorHtml = initialHtml;
    return `<div class="workspace-view netlist-view"><div class="code-toolbar"><span class="code-language">SPICE · GENERATED · IMMUTABLE · SOURCE MAPPED</span><span class="mini-badge ok">syntax valid</span><span class="mini-badge warn">2 advisories</span><span class="grow"></span><button class="button" data-surface-action="open-source-deck">Open editable source deck</button><button class="button" data-surface-action="create-override">Create override patch</button><button class="icon-button" title="Find" data-toolbar-action="find-netlist">${iconSvg("search")}</button></div><div class="code-editor" id="netlist-editor" role="textbox" aria-readonly="true" aria-label="Read-only generated SPICE netlist" aria-multiline="true">${editorHtml}</div></div>`;
  }

  function resultDatasetForName(name) {
    if (name.includes("Run 39")) return { manifest: state.historicalResultManifests.run39, executableChecks: { passed: 8, total: 8 }, requirementMapping: { id: "req-19", mapped: 14, total: 14 } };
    if (name === "yield_1000") return { manifest: state.historicalResultManifests.yield1000, executableChecks: { passed: 9, total: 12 }, requirementMapping: { id: "req-17", mapped: 12, total: 14 } };
    return { manifest: state.resultManifest, executableChecks: { passed: state.resultPassedSpecCount, total: state.resultSpecCount }, requirementMapping: { id: REQUIREMENT_CONTRACT.id, mapped: REQUIREMENT_CONTRACT.mapped, total: REQUIREMENT_CONTRACT.total } };
  }

  function resultDatasetDocumentStage(name, back) {
    const dataset = resultDatasetForName(name);
    const { manifest, executableChecks, requirementMapping } = dataset;
    const domainMeta = {
      op: ["scalar operating point", "34 nodes / 22 branches", "f64"],
      tran: ["adaptive time", "12 waveforms / 3 measures", "f64"],
      ac: ["log frequency", "8 complex waveforms / 2 measures", "complex128"],
      dc: ["swept source or parameter", "6 waveforms / 1 measure", "f64"],
      noise: ["log frequency", "6 contributors / 1 integral", "f64"],
      pz: ["complex plane", "poles and zeros", "complex128"],
      sens: ["parameter vector", "12 sensitivities", "f64"],
      stb: ["log frequency", "loop gain / margins", "complex128"],
      xf: ["frequency or operating point", "transfer / impedance", "complex128"],
      mc: ["sample family", "statistics / retained samples", "f64"],
      temp: ["temperature family", "configured outputs", "f64"],
      corner: ["PVT family", "configured outputs", "f64 / complex128"],
      pss: ["periodic phase", "steady-state waveforms", "f64"],
      hb: ["tone family", "complex spectra", "complex128"],
      sp: ["frequency", "S-matrix", "complex128"],
      pac: ["translated frequency", "conversion waveforms", "complex128"],
      pnoise: ["offset frequency", "phase-noise contributors", "f64"],
      pxf: ["translated frequency", "conversion transfer", "complex128"],
      pstb: ["translated frequency", "periodic loop gain", "complex128"],
      envelope: ["slow time", "modulation envelopes", "complex128"],
      fourier: ["harmonic index", "spectrum / THD metrics", "complex128"],
      reliability: ["mission age", "stress / drift metrics", "f64"],
      opt: ["iteration / candidate", "objectives / constraints", "f64"],
      soa: ["device / rule", "stress maxima / margins", "f64"],
      disto: ["tone product", "HD / IM metrics", "complex128"]
    };
    const rows = manifest.analyses.map((analysis) => {
      const definition = analysisDefinition(analysis);
      const [axis, contents, precision] = domainMeta[analysis] || ["analysis-defined axis", "configured outputs", "f64"];
      const release = !NON_RELEASE_ANALYSES.has(analysis);
      return `<tr><td><strong>${definition.code}</strong><br><span class="faint">${escapeHtml(definition.title)}</span></td><td>${axis}</td><td>${contents}</td><td class="mono">${precision}</td><td><span class="mini-badge ${release ? "ok" : "warn"}">${release ? "release engine" : "preview / compatibility"}</span></td></tr>`;
    }).join("");
    const signOff = manifest.qualification.signOffEligible;
    const compareLabel = manifest === state.resultManifest ? "Compare another dataset" : `Compare with Run ${state.runId}`;
    return `<div class="workspace-view results-document-view"><div class="view-title-row"><div><span class="eyebrow">IMMUTABLE RESULT ${escapeHtml(String(manifest.id).toUpperCase())} · VERIFIED DATASET</span><h1>${escapeHtml(name)}</h1><p>Manifest ${escapeHtml(String(manifest.id))} · input ${escapeHtml(manifest.inputRevision)} · requirement mapping ${requirementMapping.id}. Locked inputs, declared numeric precision and reproducible configuration remain attached to this exact dataset.</p></div><div class="view-actions">${back}<button class="button primary" data-surface-action="compare-result">${compareLabel}</button></div></div><div class="verify-kpis"><div class="verify-kpi"><span class="kpi-label">Status</span><div class="kpi-value ${signOff ? "ok-text" : "warn-text"}">${manifest.status}</div><div class="kpi-foot">${signOff ? "sign-off eligible" : resultEligibilityCopy(manifest)}</div></div><div class="verify-kpi"><span class="kpi-label">Analyses</span><div class="kpi-value">${manifest.analyses.length}</div><div class="kpi-foot">${manifest.runSet.taskCount.toLocaleString()} frozen tasks</div></div><div class="verify-kpi"><span class="kpi-label">Executable checks</span><div class="kpi-value ${executableChecks.passed === executableChecks.total ? "ok-text" : "warn-text"}">${executableChecks.passed} / ${executableChecks.total}</div><div class="kpi-foot">${requirementMapping.mapped} / ${requirementMapping.total} requirements mapped · ${requirementMapping.id}</div></div><div class="verify-kpi"><span class="kpi-label">Input revision</span><div class="kpi-value mono">${manifest.inputRevision}</div><div class="kpi-foot">manifest locked</div></div></div><section class="table-card"><div class="card-head"><h3>Complete analysis inventory</h3><span class="mini-badge warn">locked manifest</span></div><table class="data-table"><thead><tr><th>Analysis</th><th>Domain / family axis</th><th>Stored values</th><th>Precision</th><th>Eligibility</th></tr></thead><tbody>${rows}</tbody></table></section></div>`;
  }

  function secondaryDocumentStage(view, name) {
    const back = `<button class="button" data-document-primary>${iconSvg("arrow-left")} Return to primary</button>`;
    const sourceDirty = state.sourceValidationRequired.has(name);
    if (view === "design" && name.includes("symbol")) return `<div class="workspace-view symbol-editor-view"><div class="view-title-row"><div><span class="eyebrow">SYMBOL EDITOR · MODEL-BOUND</span><h1>${escapeHtml(name)}</h1><p>Five-pin analog component with explicit electrical types and netlist order.</p></div><div class="view-actions">${back}<button class="button primary" data-surface-action="save-symbol">Save symbol</button></div></div><div class="symbol-editor-grid"><section class="symbol-canvas" aria-label="Editable OPA189 five-pin symbol"><div class="symbol-opamp"><span class="symbol-opamp-shape" aria-hidden="true"></span><span class="symbol-pin pin-in-plus"><b>1</b> IN+</span><span class="symbol-pin pin-in-minus"><b>2</b> IN−</span><span class="symbol-pin pin-vminus"><b>3</b> V−</span><span class="symbol-pin pin-out"><b>4</b> OUT</span><span class="symbol-pin pin-vplus"><b>5</b> V+</span><strong>OPA189</strong></div></section><section class="table-card"><div class="card-head"><h3>Pin contract</h3><span class="mini-badge ok">matches OPA189_A</span></div><table class="data-table"><thead><tr><th>Order</th><th>Name</th><th>Type</th><th>Orientation</th></tr></thead><tbody><tr><td>1</td><td>IN+</td><td>analog input</td><td>left</td></tr><tr><td>2</td><td>IN−</td><td>analog input</td><td>left</td></tr><tr><td>3</td><td>V−</td><td>power</td><td>bottom</td></tr><tr><td>4</td><td>OUT</td><td>analog output</td><td>right</td></tr><tr><td>5</td><td>V+</td><td>power</td><td>top</td></tr></tbody></table></section></div></div>`;
    if (view === "design") return `<div class="workspace-view project-view"><div class="project-header"><div class="project-title"><span class="eyebrow">HIERARCHICAL SCHEMATIC</span><h1>${escapeHtml(name)}</h1><p>48 instances · 19 nets · six explicit interface ports</p></div><div class="project-header-actions">${back}<button class="button primary" data-surface-action="descend-hierarchy">Open editor</button></div></div><div class="hierarchy-preview"><div class="hierarchy-block"><strong>Input stage</strong><small>U1 · U2 · RG</small></div><span>→</span><div class="hierarchy-block"><strong>Differential stage</strong><small>U3:A · matched network</small></div><span>→</span><div class="hierarchy-block"><strong>Output filter</strong><small>RLOAD · CFILT</small></div></div></div>`;
    if (view === "simulate") return `<div class="workspace-view simulation-view"><div class="view-title-row"><div><span class="eyebrow">REUSABLE ANALYSIS TEMPLATE</span><h1>${escapeHtml(name)}</h1><p>Versioned analysis settings, required outputs, solver policy and dependency contract.</p></div><div class="view-actions">${back}<button class="button primary" data-surface-action="apply-setup">Apply to plan</button></div></div><section class="table-card"><div class="card-head"><h3>Template contract</h3><span class="mini-badge ok">compatible</span></div><table class="data-table"><thead><tr><th>Analysis</th><th>Key settings</th><th>Required outputs</th><th>Solver</th><th>Version</th></tr></thead><tbody><tr><td>${name.includes("transient") ? "TRAN" : "AC + STB"}</td><td class="mono">${name.includes("transient") ? "20 ms · 10 µs max step" : "1 Hz…100 MHz · LP1"}</td><td class="mono">V(afe_out) · I(VDD)</td><td>balanced</td><td class="mono">setup-7</td></tr></tbody></table></section></div>`;
    if (view === "results") return resultDatasetDocumentStage(name, back);
    if (view === "verify") return name.includes("Physical DRC") ? drcStage() : name.includes("Optimization") ? optimizationStage() : regressionStage();
    if (view === "models") return `<div class="workspace-view netlist-view"><div class="code-toolbar"><span class="code-language">${name.endsWith(".va") ? "VERILOG-A · QUALIFIED SOURCE" : "SPICE MODEL LIBRARY · READ-ONLY"}</span><span class="mini-badge ok">digest verified</span><span class="grow"></span>${back}<button class="button primary" data-surface-action="compile-model">${name.endsWith(".va") ? "Compile" : "Run qualification"}</button></div><div class="code-editor model-source-preview" role="textbox" aria-readonly="true"><div class="code-line" data-line="1"><code><span class="tok-comment">// ${escapeHtml(name)} · read-only source view</span></code></div><div class="code-line" data-line="2"><code><span class="tok-control">${name.endsWith(".va") ? "module" : ".subckt"}</span> <span class="tok-device">${name.endsWith(".va") ? "bsim4" : "OPA189_A"}</span> …</code></div><div class="code-line" data-line="3"><code><span class="tok-param">parameter real gain</span> = <span class="tok-number">100e6</span>;</code></div></div></div>`;
    if (view === "netlist" && name.includes("diff")) return `<div class="workspace-view project-view"><div class="project-header"><div class="project-title"><span class="eyebrow">GENERATED NETLIST DIFFERENCE</span><h1>generated.diff</h1><p>Source-mapped comparison; generated output remains immutable.</p></div><div class="project-header-actions">${back}<button class="button primary" data-surface-action="create-override">Create override patch</button></div></div><section class="diff-view"><div class="diff-column"><h3>Revision 62fe381</h3><code>RG n1 n2 499</code><code>CFILT afe_out 0 22n</code></div><div class="diff-column"><h3>Revision 7c49d2b</h3><code class="diff-changed">RG n1 n2 510</code><code>CFILT afe_out 0 22n</code></div></section></div>`;
    if (view === "netlist") return `<div class="workspace-view netlist-view"><div class="code-toolbar"><span class="code-language">SPICE INCLUDE &middot; EDITABLE SOURCE</span><span class="mini-badge ${sourceDirty ? "warn" : "ok"}">${sourceDirty ? "modified &middot; validation required" : "syntax valid"}</span><span class="grow"></span>${back}<button class="button" data-surface-action="validate-source">Validate source</button><button class="button primary" data-surface-action="save-source">Save source deck</button></div><div class="code-editor" role="textbox" aria-label="Editable code source" aria-multiline="true" data-editable-source="${escapeHtml(name)}" contenteditable="true" spellcheck="false"><div class="code-line" data-line="1"><code><span class="tok-comment">* ${escapeHtml(name)} · project-owned source</span></code></div><div class="code-line" data-line="2"><code><span class="tok-control">.lib</span> <span class="tok-string">&quot;demo180/corners.lib&quot;</span> <span class="tok-param">tt</span></code></div><div class="code-line" data-line="3"><code><span class="tok-control">.include</span> <span class="tok-string">&quot;vendor/OPA189.lib&quot;</span></code></div></div></div>`;
    return projectConfigurationStage("dependencies");
  }

  function stageForView(view) {
    const docs = resolvedDocuments(view);
    const primaryName = docs.find((doc) => doc.active)?.name || docs[0]?.name;
    const selectedName = state.activeDocuments[view] || primaryName;
    if (selectedName && selectedName !== primaryName) return secondaryDocumentStage(view, selectedName);
    if (view === "project") return projectStage();
    if (view === "design") return designStage();
    if (view === "simulate") return simulationStage();
    if (view === "results") return resultsStage();
    if (view === "verify") return verifyStage();
    if (view === "models") return modelsStage();
    return netlistStage();
  }

  function consoleContent(tab) {
    if (tab === "problems") return `<div class="console-line warning"><span class="console-time">ADV-014</span><span class="console-source">top.sp:128</span><span class="console-message">Maximum transient step is implicit; 10 µs is recommended for the selected edge fidelity.</span></div><div class="console-line"><span class="console-time">INFO-031</span><span class="console-source">models.lib:4</span><span class="console-message">Model section inherited from active PVT set: demo180 / tt.</span></div>`;
    if (tab === "measurements") {
      const rows = [];
      if (state.resultAnalyses.has("ac")) rows.push(["gain_dc", "40.006 812 dB · requirement ≥ 39.500 000 dB · margin +0.506 812 dB"]);
      if (state.resultAnalyses.has("tran")) rows.push(["rise_time", "2.197 215 ms · requirement ≤ 2.500 000 ms · margin +302.785 µs"]);
      if (state.resultAnalyses.has("stb")) rows.push(["phase_margin", "67.412 0° · requirement ≥ 60.000 0° · margin +7.412 0°"]);
      if (state.resultAnalyses.has("noise")) rows.push(["inoise", "14.818 3 nV/√Hz · requirement ≤ 18.000 0 nV/√Hz"]);
      if (state.resultAnalyses.has("op")) rows.push(["vout_op", "2.501 342 V · operating-point output · converged"]);
      if (state.resultAnalyses.has("dc")) rows.push(["offset_span", "19.998 6 mV · full configured sweep completed"]);
      if (state.resultAnalyses.has("sens")) rows.push(["top_sensitivity", "RGAIN → gain_dc · 0.982 1 %/%"]);
      if (state.resultAnalyses.has("fourier")) rows.push(["thd", "0.003 81 % · requirement ≤ 0.010 00 %"]);
      return rows.map(([name, message]) => `<div class="console-line success"><span class="console-time">PASS</span><span class="console-source">${name}</span><span class="console-message">${message}</span></div>`).join("");
    }
    if (tab === "jobs") {
      const result = state.resultManifest;
      const completed = `<div class="console-line success"><span class="console-time">Run ${result.id}</span><span class="console-source">${result.status}</span><span class="console-message">${result.runSet.name} · ${result.runSet.pointCount} PVT points · ${result.analyses.length} analyses · ${formatDuration(result.durationSeconds)} · revision ${result.inputRevision}</span></div>`;
      if (state.activeRunManifest) {
        const active = state.activeRunManifest;
        return `<div class="console-line"><span class="console-time">Run ${active.id}</span><span class="console-source">running ${state.runProgress}%</span><span class="console-message">${active.runSet.name} · ${active.runSet.pointCount} PVT points · ${active.runSet.taskCount} tasks · ${formatDuration(active.estimatedDurationSeconds * state.runProgress / 100)} simulated</span></div>${completed}`;
      }
      const cancelled = state.cancelledRunManifest ? `<div class="console-line warning"><span class="console-time">Run ${state.cancelledRunManifest.id}</span><span class="console-source">cancelled</span><span class="console-message">Checkpoint retained after ${formatDuration(state.cancelledRunManifest.durationSeconds)} · revision ${state.cancelledRunManifest.inputRevision}</span></div>` : "";
      return `${cancelled}${completed}<div class="console-line"><span class="console-time">queue</span><span class="console-source">idle</span><span class="console-message">No queued jobs. The next run will snapshot ${state.inputRevision} across ${PVT_RUN_POINTS.length} PVT points.</span></div>`;
    }
    if (state.running) return `<div class="console-line"><span class="console-time">21:14:09</span><span class="console-source">run:${state.activeRunManifest.id}</span><span class="console-message">PVT characterization in progress · ${state.runProgress}% · ${state.activeRunManifest.analyses.length} analyses · ${state.activeRunManifest.runSet.pointCount} points · revision ${state.activeRunManifest.inputRevision}</span></div><div class="console-line"><span class="console-time">21:14:08</span><span class="console-source">scheduler</span><span class="console-message">${state.activeRunManifest.runSet.taskCount} analysis-point tasks validated · result commit remains transactional.</span></div><div class="console-line"><span class="console-time">21:14:08</span><span class="console-source">manifest</span><span class="console-message">Analysis settings, run set, reference corner and input revision are frozen for Run ${state.activeRunManifest.id}.</span></div>`;
    return `<div class="console-line ${state.resultManifest.qualification.signOffEligible ? "success" : "warning"}"><span class="console-time">21:12:46</span><span class="console-source">run:${state.resultManifest.id}</span><span class="console-message">Completed ${state.resultManifest.runSet.name} · ${state.resultManifest.runSet.pointCount} PVT points in ${state.resultDuration} · ${state.resultPassedSpecCount} / ${state.resultSpecCount} configured checks numerically passed; ${resultEligibilityCopy()}.</span></div><div class="console-line"><span class="console-time">21:12:46</span><span class="console-source">manifest</span><span class="console-message">${state.resultAnalysisCount} analyses · ${state.resultManifest.runSet.taskCount.toLocaleString()} tasks · immutable revision ${state.resultManifest.inputRevision} · ${resultEligibilityCopy()}.</span></div><div class="console-line"><span class="console-time">21:12:45</span><span class="console-source">solver</span><span class="console-message">All executed tasks reached their configured termination criteria; preview eligibility is tracked independently from numerical completion.</span></div><div class="console-line warning"><span class="console-time">21:12:45</span><span class="console-source">advisory</span><span class="console-message">${2 + state.resultManifest.qualification.nonReleaseAnalyses.length} non-blocking setup and qualification advisories retained with run provenance.</span></div>`;
  }

  function jobsManagerContent() {
    const manifest = state.activeRunManifest || state.cancelledRunManifest || state.resultManifest;
    const activeId = manifest?.id || state.runId;
    const activeStatus = state.running ? `running · ${state.runProgress}%` : manifest?.status || "complete";
    const activeTone = state.running ? "accent" : manifest?.qualification?.signOffEligible ? "ok" : "warn";
    const pointCount = manifest?.runSet?.pointCount || PVT_RUN_POINTS.length;
    const taskCount = manifest?.runSet?.taskCount || state.resultAnalysisCount * pointCount;
    const selectedProgress = state.running ? state.runProgress : manifest?.status === "cancelled" ? Math.min(99, Math.max(1, Math.round((manifest.durationSeconds || 0) / Math.max(1, manifest.estimatedDurationSeconds || 1) * 100))) : 100;
    const completedTasks = Math.floor(taskCount * selectedProgress / 100);
    let taskOffset = 0;
    const graphRows = (manifest?.taskGraph?.entries || []).map((entry) => {
      const completedInEntry = Math.max(0, Math.min(entry.taskCount, completedTasks - taskOffset));
      taskOffset += entry.taskCount;
      const progress = entry.taskCount ? Math.round(completedInEntry / entry.taskCount * 100) : 100;
      const status = progress >= 100 ? "complete" : progress > 0 ? manifest?.status === "cancelled" ? "checkpointed" : "running" : "queued";
      return `<tr><td><strong>${entry.code}</strong></td><td>${entry.expansion}</td><td class="mono">${entry.taskCount.toLocaleString()}</td><td><div class="progress-bar" style="--progress:${progress}%"><span></span></div></td><td><span class="mini-badge ${status === "complete" ? "ok" : status === "running" ? "accent" : status === "checkpointed" ? "warn" : ""}">${status}${["running", "checkpointed"].includes(status) ? ` · ${progress}%` : ""}</span></td></tr>`;
    }).join("");
    const resultTone = state.resultManifest.qualification.signOffEligible ? "ok" : "warn";
    const priorResultRow = manifest !== state.resultManifest ? `<tr><td class="mono">${state.resultManifest.id}</td><td>${state.resultManifest.runSet.name}<br><span class="faint">${state.resultManifest.runSet.pointCount} PVT points · ${state.resultManifest.runSet.taskCount.toLocaleString()} tasks</span></td><td>${state.resultManifest.target.platform} · retained result</td><td><div class="progress-bar" style="--progress:100%"><span></span></div></td><td>${formatDuration(state.resultManifest.durationSeconds)}</td><td><span class="mini-badge ${resultTone}">${state.resultManifest.status} · ${resultEligibilityCopy(state.resultManifest)}</span></td></tr>` : "";
    return `<div class="jobs-manager-grid"><section class="table-card"><div class="card-head"><h3>Execution queue</h3><span class="mini-badge ${activeTone}">${state.running ? "1 active" : state.cancelledRunManifest ? "idle · cancelled retained" : "idle"}</span></div><table class="data-table"><thead><tr><th>Run</th><th>Plan / scope</th><th>Target</th><th>Progress</th><th>Elapsed / duration</th><th>Status</th></tr></thead><tbody><tr class="selected"><td class="mono">${activeId}</td><td>Lab characterization<br><span class="faint">${pointCount} PVT points · ${taskCount} tasks</span></td><td>${platformCopy()}</td><td><div class="progress-bar" style="--progress:${selectedProgress}%"><span></span></div></td><td>${state.running ? "in progress" : formatDuration(manifest?.durationSeconds)}</td><td><span class="mini-badge ${activeTone}">${activeStatus}</span></td></tr>${priorResultRow}<tr><td class="mono">39</td><td>SS / 125 °C diagnostic<br><span class="faint">8 analyses · one point</span></td><td>Desktop · local</td><td><div class="progress-bar" style="--progress:100%"><span></span></div></td><td>2.14 s</td><td><span class="mini-badge">complete · diagnostic</span></td></tr><tr><td class="mono">yield_1000</td><td>Monte Carlo variation<br><span class="faint">1,000 samples · seed 73a4</span></td><td>lab-hpc-west · preview connector</td><td><div class="progress-bar" style="--progress:100%"><span></span></div></td><td>14 min 28 s</td><td><span class="mini-badge warn">complete · preview / review</span></td></tr></tbody></table><div class="card-head"><h3>Frozen execution graph</h3><span class="mini-badge">${manifest?.taskGraph?.entries.length || 0} analysis nodes</span></div><table class="data-table"><thead><tr><th>Analysis</th><th>Expansion</th><th>Tasks</th><th>Progress</th><th>Status</th></tr></thead><tbody>${graphRows}</tbody></table></section><aside class="compiler-inspector"><div class="panel-section"><div class="section-head"><span class="grow">Execution target</span><span class="mini-badge ok">ready</span></div><div class="run-target"><div class="target-icon">${iconSvg("cpu")}</div><div class="grow"><strong>${state.platform === "desktop" ? "Local desktop engine" : "Browser simulation worker"}</strong><small>${platformCopy()}</small></div></div><div class="property-list"><div class="property-row"><span>Parallel slots</span><span class="property-value">${state.platform === "desktop" ? "12" : "1 worker"}</span></div><div class="property-row"><span>Memory budget</span><span class="property-value">2.0 GiB</span></div><div class="property-row"><span>Checkpoint</span><span class="property-value">per PVT point</span></div><div class="property-row"><span>Failure policy</span><span class="property-value">retry robust</span></div></div></div><div class="panel-section"><div class="section-head"><span class="grow">Selected run manifest</span></div><div class="property-list"><div class="property-row"><span>Input revision</span><span class="property-value mono">${manifest?.inputRevision || state.inputRevision}</span></div><div class="property-row"><span>Analyses</span><span class="property-value">${manifest?.analyses?.length || state.resultAnalysisCount}</span></div><div class="property-row"><span>Run-set ID</span><span class="property-value mono">${manifest?.runSet?.id || "pvt-5x3"}</span></div><div class="property-row"><span>Tasks</span><span class="property-value">${taskCount}</span></div><div class="property-row"><span>Status</span><span class="property-value">${manifest?.status || activeStatus}</span></div></div></div><div class="panel-section"><div class="section-head"><span class="grow">Remote targets</span></div><div class="tree"><button class="tree-row selected" data-job-target="local"><span class="engine-dot"></span><span class="label">Local engine</span><span class="mini-badge ok">ready</span></button><button class="tree-row" data-job-target="lab-hpc-west"><span class="engine-dot"></span><span class="label">lab-hpc-west</span><span class="mini-badge warn">preview · 12 slots</span></button><button class="tree-row" data-job-target="browser-worker"><span class="engine-dot" style="background:var(--warn)"></span><span class="label">Browser worker</span><span class="mini-badge ok">release · interpreter</span></button></div></div></aside></div>`;
  }

  function renderDocuments() {
    const availableDocs = resolvedDocuments(state.view).filter((doc) => !state.closedDocs.has(`${state.view}:${doc.name}`));
    const fallbackName = availableDocs.find((doc) => doc.active)?.name || availableDocs[0]?.name;
    const selectedName = availableDocs.some((doc) => doc.name === state.activeDocuments[state.view]) ? state.activeDocuments[state.view] : fallbackName;
    state.activeDocuments[state.view] = selectedName;
    const docs = availableDocs.map((doc) => ({ ...doc, active: doc.name === selectedName }));
    const singleDocument = docs.length <= 1;
    $("#workspace-main").classList.toggle("single-document", singleDocument);
    $("#app-shell").classList.toggle("single-document", singleDocument);
    $("#document-tabs").innerHTML = docs.map((doc, index) => `<button id="document-tab-${index}" data-doc-name="${escapeHtml(doc.name)}" class="document-tab ${doc.active ? "active" : ""}" type="button" role="tab" aria-selected="${doc.active}" aria-controls="workspace-stage" aria-label="${escapeHtml(doc.name)}${index > 0 ? "; press Delete to close" : ""}" tabindex="${doc.active ? "0" : "-1"}" title="${escapeHtml(doc.name)}">${iconSvg(doc.icon)}<span class="tab-name">${escapeHtml(doc.name)}</span>${doc.dirty && state.dirty ? '<span class="dirty-dot" title="Unsaved changes"></span>' : ""}${index > 0 ? '<span class="tab-close" aria-hidden="true">×</span>' : ""}</button>`).join("");
    const activeIndex = docs.findIndex((doc) => doc.active);
    $("#workspace-stage").setAttribute("aria-labelledby", `document-tab-${Math.max(0, activeIndex)}`);
  }

  function platformCopy() {
    if (state.platform === "mobile") return "Mobile touch · WASM worker";
    if (state.platform === "tablet") return "Tablet browser · WASM worker";
    if (state.platform === "web") return "Browser · WASM worker";
    return "Desktop · local 12 threads";
  }

  function updateChrome() {
    document.documentElement.dataset.theme = state.theme;
    document.documentElement.dataset.density = state.density;
    document.documentElement.dataset.platform = state.platform;
    document.documentElement.dataset.view = state.view;
    document.querySelector('meta[name="theme-color"]').content = state.theme === "dark" ? "#11171b" : "#e8ecee";
    const activeResultName = state.view === "results" ? state.activeDocuments.results || resolvedDocuments("results")[0]?.name : null;
    const activeResultDataset = activeResultName ? resultDatasetForName(activeResultName) : null;
    $("#title-cell").textContent = state.view === "results" ? activeResultName || `Run ${state.runId} · results` : viewMeta[state.view].title;
    $("#context-toolbar").innerHTML = `${toolbarForView(state.view)}${workspaceToolbarTools()}`;
    hydrateIcons($("#context-toolbar"));
    $("#app-shell").classList.toggle("workspace-focus", state.workspaceFocus);
    const savedDock = state.dockSizes[state.view] || {};
    const workbench = $(".workbench");
    if (savedDock.left) workbench.style.setProperty("--left-dock-column", `${savedDock.left}px`);
    else workbench.style.removeProperty("--left-dock-column");
    if (savedDock.right) workbench.style.setProperty("--right-dock-column", `${savedDock.right}px`);
    else workbench.style.removeProperty("--right-dock-column");
    state.consoleHeight = savedDock.console || 145;
    $("#simulation-context").hidden = !["design", "simulate"].includes(state.view);
    if (!state.running) $("#run-label").textContent = "Run plan";
    $("#run-button").setAttribute("aria-label", state.running ? "Stop active simulation" : "Run active simulation plan");
    $("#run-config-detail").textContent = `${PVT_RUN_POINTS.length} PVT · ${state.enabledAnalyses.size} analyses`;
    $$(".activity-button[data-view]").forEach((button) => {
      const active = button.dataset.view === state.view;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    $("#results-badge").classList.toggle("hidden", !state.newResults || state.view === "results");
    $("#results-badge").textContent = "1";
    const resultsButton = $('.activity-button[data-view="results"]');
    resultsButton.setAttribute("aria-label", state.newResults && state.view !== "results" ? "Results, 1 new run" : "Results");
    $(".status-platform span:last-child").textContent = platformCopy();
    const selectedEdits = state.componentEdits[state.selectedComponent] || {};
    $("#selection-status").textContent = state.view === "design" ? `${selectedEdits.instance || state.selectedComponent} · ${selectedEdits.value || (state.selectedComponent === "RG" ? "499 Ω" : state.selectedComponent === "U3" ? "OPA2189" : "OPA189")}` : state.view === "results" ? `${activeResultDataset?.manifest.id || state.runId} · ${activeResultDataset?.manifest.runSet.pointCount || PVT_RUN_POINTS.length} result point${(activeResultDataset?.manifest.runSet.pointCount || PVT_RUN_POINTS.length) === 1 ? "" : "s"}` : viewMeta[state.view].title;
    $("#cursor-coordinates").textContent = state.view === "design" ? "x 24.00 · y 18.00 mm" : state.view === "results" ? activeResultDataset?.manifest === state.resultManifest ? "A 1.000 ms · B 3.197 ms · Δ 2.197 ms" : `${activeResultDataset?.manifest.id || "dataset"} · immutable` : `revision ${state.inputRevision}`;
    syncWorkspaceStateChrome();
  }

  const FOCUS_DATA_KEYS = Object.freeze([
    "docName", "view", "viewTarget", "projectSection", "simulationSection", "modelSection", "codeSurface",
    "designLeft", "analysis", "analysisToggle", "resultMode", "verifyMode", "tuningParam", "toolbarAction",
    "surfaceAction", "plotAction", "inspectorTab", "leftTab", "settingTheme", "settingDensity", "settingPreset", "settingConsole", "settingUnits", "settingGrid", "settingsPage",
    "menuName", "menu", "menuAction", "addAnalysis", "resultDocument", "canvasZoom", "jobTarget", "modelRow",
    "drcMarker", "drcFilter", "drcCycle"
  ]);

  function captureFocusAnchor(node = document.activeElement) {
    if (!node || node === document.body || node === document.documentElement) return null;
    const dataKey = FOCUS_DATA_KEYS.find((key) => node.dataset?.[key] !== undefined);
    return { node, id: node.id || null, dataKey: dataKey || null, value: dataKey ? node.dataset[dataKey] : null };
  }

  function isUsableFocusTarget(node) {
    return Boolean(node?.isConnected && node !== document.body && node !== document.documentElement && !node.disabled && node.getAttribute?.("aria-disabled") !== "true" && !node.inert && !node.closest?.('[hidden], [inert], [aria-hidden="true"], dialog:not([open])'));
  }

  function resolveFocusAnchor(anchor) {
    if (!anchor) return null;
    if (anchor.dataKey) {
      const attribute = `data-${anchor.dataKey.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
      const replacement = $$(`[${attribute}]`).find((candidate) => candidate.dataset[anchor.dataKey] === anchor.value);
      if (replacement) return replacement;
    }
    if (anchor.id) {
      const replacement = document.getElementById(anchor.id);
      if (replacement) return replacement;
    }
    return anchor.node || null;
  }

  function restoreFocusAnchor(anchor, fallback = "#workspace-main") {
    requestAnimationFrame(() => {
      if (isUsableFocusTarget(document.activeElement)) return;
      let target = resolveFocusAnchor(anchor);
      if (!isUsableFocusTarget(target)) target = $(fallback);
      if (!target) return;
      if (!target.matches("button, input, select, textarea, a[href], [tabindex]")) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    });
  }

  function mutatePreservingFocus(mutator, fallback = "#workspace-main") {
    const anchor = captureFocusAnchor();
    mutator();
    if (anchor) restoreFocusAnchor(anchor, fallback);
  }

  function renderView(options = {}) {
    const focusAnchor = Object.prototype.hasOwnProperty.call(options, "focusAnchor") ? options.focusAnchor : captureFocusAnchor();
    const focusFallback = options.focusFallback || "#workspace-main";
    updateChrome();
    renderDocuments();
    $("#left-panel-content").innerHTML = leftPanelForView(state.view);
    $("#workspace-stage").innerHTML = stageForView(state.view);
    $("#right-panel-content").innerHTML = rightPanelForView(state.view);
    $("#console-body").innerHTML = consoleContent(state.consoleTab);
    $("#console-context").textContent = state.running ? `Run ${state.activeRunManifest.id} · ${PVT_RUN_POINTS.length} PVT points · ${state.runProgress}%` : `Run ${state.resultManifest.id} · ${state.resultManifest.status} · revision ${state.resultManifest.inputRevision}`;
    hydrateIcons(document);
    bindDynamicEvents();
    syncWorkspaceStateChrome();
    syncPanelVisibility();
    updateConsoleLayout();
    requestAnimationFrame(drawActiveCanvas);
    if (focusAnchor) restoreFocusAnchor(focusAnchor, focusFallback);
  }

  function switchView(view, options = {}) {
    if (!viewMeta[view]) return;
    const focusAnchor = options.focusAnchor || captureFocusAnchor();
    state.view = view;
    if (view === "results") state.newResults = false;
    closeDrawers();
    closeMenu();
    renderView({ focusAnchor, focusFallback: options.focusFallback || (options.focusLanding ? "#workspace-stage h1" : "#workspace-main") });
    if (!options.silent) announce(`${view === "results" ? `Run ${state.runId} results` : viewMeta[view].title} opened`);
  }

  function openCodeSurface(section, options = {}) {
    state.codeSurface = section;
    state.activeDocuments.netlist = resolvedDocuments("netlist").find((document) => document.active)?.name || "top.sp";
    switchView("netlist", options);
  }

  function bindOnce(node, key, eventName, listener) {
    const marker = `bound${key}`;
    if (node.dataset[marker] === "true") return;
    node.dataset[marker] = "true";
    node.addEventListener(eventName, listener);
  }

  function renderViewAndRestoreFocus(dataKey, value, focusFallback = "#workspace-main") {
    renderView({ focusAnchor: { dataKey, value }, focusFallback });
  }

  function validateAnalysisConfiguration(analysis, values) {
    const issues = [];
    const code = ANALYSIS_CODE_MAP[analysis] || analysis.toUpperCase();
    const numberAt = (index) => parseEngineeringValue(values?.[index], Number.NaN);
    const integerAt = (index) => Number.parseInt(String(values?.[index] ?? "").replace(/[,_\s]/g, ""), 10);
    const positive = (index, label) => {
      const value = numberAt(index);
      if (!Number.isFinite(value) || value <= 0) issues.push(`${code} ${label} must be greater than zero.`);
      return value;
    };
    const orderedRange = (startIndex, stopIndex, label, allowZeroStart = false, allowNegativeStart = false) => {
      const start = numberAt(startIndex);
      const stop = numberAt(stopIndex);
      if (!Number.isFinite(start) || (!allowNegativeStart && ((!allowZeroStart && start <= 0) || (allowZeroStart && start < 0)))) issues.push(`${code} ${label} start is invalid.`);
      if (!Number.isFinite(stop) || stop <= start) issues.push(`${code} ${label} stop must be greater than start.`);
      return { start, stop };
    };
    const count = (index, label, minimum = 1) => {
      const value = integerAt(index);
      if (!Number.isInteger(value) || value < minimum) issues.push(`${code} ${label} must be an integer of at least ${minimum}.`);
      return value;
    };
    const knownIndependentSources = new Set(["VINP", "VINN", "VDD", "VSS", "VREF_SRC", "VOS"]);
    const knownNodes = new Set(["sensor_p", "sensor_p_drive", "sensor_n", "n1", "n2", "u1_out", "u2_out", "vref_2v5", "afe_out_drive", "afe_out", "vdd", "vss", "0"]);

    if (analysis === "tran") {
      const range = orderedRange(0, 1, "time", true);
      const step = positive(2, "maximum step");
      if (Number.isFinite(range.stop) && Number.isFinite(range.start) && Number.isFinite(step) && step > range.stop - range.start) issues.push("TRAN maximum step cannot exceed the simulated interval.");
    }
    if (analysis === "ac") { orderedRange(2, 3, "frequency"); count(1, "points per decade", 2); }
    if (analysis === "dc") {
      orderedRange(2, 3, "sweep", true, true);
      positive(4, "step");
      if (!knownIndependentSources.has(String(values?.[0] || ""))) issues.push(`DC sweep source ${values?.[0] || "(empty)"} is not defined in the generated deck.`);
    }
    if (analysis === "noise") {
      orderedRange(2, 3, "frequency");
      count(1, "points per decade", 2);
      const inputSource = String(values?.[5] || "");
      if (inputSource !== "VIN_DIFF" && !knownIndependentSources.has(inputSource)) issues.push(`NOISE input source ${inputSource || "(empty)"} cannot be resolved.`);
      if (!knownNodes.has(String(values?.[4] || ""))) issues.push(`NOISE output node ${values?.[4] || "(empty)"} cannot be resolved.`);
    }
    if (analysis === "fourier") { positive(1, "fundamental"); orderedRange(3, 4, "measurement window", true); count(2, "harmonics", 1); }
    if (analysis === "mc") count(0, "sample count", 2);
    if (analysis === "pss") { positive(1, "fundamental"); count(4, "timepoints", 16); }
    if (analysis === "hb") { positive(0, "fundamental"); count(1, "harmonic order", 1); }
    if (analysis === "sp") { orderedRange(3, 4, "frequency"); count(5, "point count", 2); }
    if (analysis === "opt") count(5, "maximum iterations", 1);
    if (analysis === "reliability") {
      const ages = String(values?.[3] ?? "").split(",").map((value) => Number.parseFloat(value)).filter(Number.isFinite);
      if (ages.length < 2 || ages.some((value) => value < 0) || ages.some((value, index) => index && value <= ages[index - 1])) issues.push("REL age points must contain at least two strictly increasing non-negative values.");
    }
    return issues;
  }

  function planValidationReport() {
    const blockers = [];
    const warnings = [];
    if (state.enabledAnalyses.size === 0) blockers.push("Enable at least one analysis.");
    state.sourceValidationRequired.forEach((source) => blockers.push(`${source} has changed and must pass syntax/semantic validation before execution.`));
    const prerequisiteMap = { pac: "pss", pnoise: "pss", pxf: "pss", pstb: "pss", envelope: "hb" };
    Object.entries(prerequisiteMap).forEach(([analysis, prerequisite]) => {
      if (state.enabledAnalyses.has(analysis) && !state.enabledAnalyses.has(prerequisite)) blockers.push(`${ANALYSIS_CODE_MAP[analysis]} requires enabled ${ANALYSIS_CODE_MAP[prerequisite]}.`);
    });
    const effectiveValues = effectiveAnalysisValues(state.enabledAnalyses, state.analysisValues);
    state.enabledAnalyses.forEach((analysis) => blockers.push(...validateAnalysisConfiguration(analysis, effectiveValues[analysis])));
    const nonRelease = [...state.enabledAnalyses].filter((analysis) => NON_RELEASE_ANALYSES.has(analysis));
    if (nonRelease.length) warnings.push(`${nonRelease.map((id) => ANALYSIS_CODE_MAP[id]).join(", ")} will produce non-sign-off datasets.`);
    const targetEligible = state.platform !== "mobile";
    if (!targetEligible) warnings.push("The mobile WASM runtime is preview-only; results cannot enter a release package.");
    const sourceDigests = canonicalObject(Object.fromEntries(Object.entries(state.sourceDrafts).map(([name, source]) => [name, mockDigest(String(source))])));
    const evidenceBinding = {
      inputRevision: state.inputRevision,
      netlistDigest: generatedDesignNetlistDigest(state.inputRevision, sourceDigests),
      modelSetDigest: MODEL_SET_DIGEST,
      requirementDigest: REQUIREMENT_CONTRACT_DIGEST,
      engineBuild: ENGINE_BUILD,
      numericContract: NUMERIC_CONTRACT,
      ruleDeck: RELEASE_PROFILE.safeOperatingArea.ruleDeck
    };
    const evidenceGates = boundReleaseEvidenceGates(evidenceBinding);
    if (!evidenceGates.modelQualification.passed) warnings.push(`Model qualification is not release-ready: ${evidenceGates.modelQualification.detail}.`);
    if (!evidenceGates.regression.passed) warnings.push(`Regression evidence is not applicable: ${evidenceGates.regression.detail}.`);
    if (!evidenceGates.safeOperatingArea.passed) warnings.push(`Safe-operating-area evidence is not applicable: ${evidenceGates.safeOperatingArea.detail}.`);
    const missingNominalAnalyses = REQUIRED_NOMINAL_ANALYSES.filter((analysis) => !state.enabledAnalyses.has(analysis));
    const monteCarloConfigured = state.enabledAnalyses.has("mc");
    const monteCarloSamples = monteCarloConfigured ? Math.max(0, Number.parseInt(String(effectiveValues.mc?.[0] || "0").replace(/[,_\s]/g, ""), 10) || 0) : 0;
    const monteCarloReady = monteCarloConfigured && monteCarloSamples >= RELEASE_PROFILE.monteCarlo.minimumSamples;
    if (missingNominalAnalyses.length) warnings.push(`Release profile ${RELEASE_PROFILE.id} still needs ${missingNominalAnalyses.map((analysis) => ANALYSIS_CODE_MAP[analysis]).join(", ")} evidence.`);
    if (!monteCarloConfigured) warnings.push(`Release profile ${RELEASE_PROFILE.id} requires Monte Carlo yield evidence; this plan does not evaluate it.`);
    else if (!monteCarloReady) warnings.push(`Release profile ${RELEASE_PROFILE.id} requires at least ${RELEASE_PROFILE.monteCarlo.minimumSamples.toLocaleString()} Monte Carlo samples; this plan configures ${monteCarloSamples.toLocaleString()}.`);
    const engineReleaseEligible = nonRelease.length === 0 && targetEligible;
    const releaseEvidenceReady = Object.values(evidenceGates).every((gate) => gate.passed);
    const releaseProfileReady = missingNominalAnalyses.length === 0 && monteCarloReady && releaseEvidenceReady;
    const releaseIssues = [
      ...(nonRelease.length ? ["analysis engine readiness"] : []),
      ...(!targetEligible ? ["target runtime qualification"] : []),
      ...(!evidenceGates.modelQualification.passed ? ["model qualification evidence"] : []),
      ...(!evidenceGates.regression.passed ? ["applicable regression evidence"] : []),
      ...(!evidenceGates.safeOperatingArea.passed ? ["applicable safe-operating-area evidence"] : []),
      ...(missingNominalAnalyses.length ? ["required nominal analysis evidence"] : []),
      ...(!monteCarloReady ? ["Monte Carlo yield evidence configuration"] : [])
    ];
    return { blockers, warnings, engineReleaseEligible, releaseEvidenceReady, releaseProfileReady, releaseEligible: engineReleaseEligible && releaseProfileReady, releaseIssues, evidenceGates, monteCarloSamples, monteCarloReady };
  }

  function runPreflightChecks() {
    const report = planValidationReport();
    state.checksCurrent = true;
    state.planValidated = report.blockers.length === 0;
    syncWorkspaceStateChrome();
    if (state.view === "simulate") renderView();
    else drawActiveCanvas();
    if (report.blockers.length) {
      showToast("Preflight blocked", `${report.blockers.join(" ")} Working revision ${state.inputRevision} was not queued.`, "warning");
      announce(`Preflight found ${report.blockers.length} blocking issue${report.blockers.length === 1 ? "" : "s"}.`);
    } else {
      const readiness = report.releaseEligible ? "release-profile complete" : report.engineReleaseEligible ? "runnable · release evidence incomplete" : "preview-only";
      showToast("Preflight complete", `0 blocking errors · ${2 + report.warnings.length} advisories · ${readiness} · revision ${state.inputRevision} · ${executionTaskGraph(state.enabledAnalyses, effectiveAnalysisValues(state.enabledAnalyses, state.analysisValues)).total.toLocaleString()} tasks`, report.releaseEligible ? "success" : "warning");
      announce(`Preflight checks are current for revision ${state.inputRevision}; plan is ${readiness}.`);
    }
    return report;
  }

  function renderAnalysisPicker(query = "") {
    const lower = query.trim().toLowerCase();
    const filtered = analysisCatalog.filter((analysis) => !lower || `${analysis.code} ${analysis.title} ${analysis.category} ${analysis.detail}`.toLowerCase().includes(lower));
    const categories = [...new Set(filtered.map((analysis) => analysis.category))];
    $("#analysis-picker-body").innerHTML = categories.map((category) => {
      const categoryItems = filtered.filter((analysis) => analysis.category === category);
      const rows = categoryItems.map((analysis) => {
        const routedWorkspace = analysis.kind === "verification" || analysis.kind === "optimization";
        const configured = !routedWorkspace && state.configuredAnalyses.has(analysis.id);
        const readiness = analysis.availability === "production" ? "Release engine" : analysis.availability === "preview" ? "Preview engine" : "Compatibility path";
        const actionLabel = routedWorkspace ? "Open workspace" : configured ? "In plan" : "Add to plan";
        return `<button class="analysis-picker-card" type="button" data-add-analysis="${analysis.id}" aria-pressed="${configured}"><span class="analysis-picker-code">${analysis.code}</span><span class="analysis-picker-copy"><strong>${analysis.title}</strong><small><span class="analysis-kind-copy">${analysisKindLabels[analysis.kind]}</span>${analysis.detail}</small></span><span class="analysis-picker-readiness ${analysis.availability} ${configured ? "configured" : ""}"><span>${actionLabel}</span><small>${readiness}</small></span></button>`;
      }).join("");
      return `<section class="analysis-category"><h3><span>${category}</span><span>${categoryItems.length}</span></h3><div class="analysis-picker-grid">${rows}</div></section>`;
    }).join("") || '<div class="empty-hint">No analysis matches this search.</div>';
    hydrateIcons($("#analysis-picker-body"));
    $$('[data-add-analysis]').forEach((button) => bindOnce(button, "AddAnalysis", "click", () => {
      const id = button.dataset.addAnalysis;
      const definition = analysisDefinition(id);
      if (definition.kind === "verification" || definition.kind === "optimization") {
        $("#analysis-dialog").close();
        state.verifyMode = definition.kind === "optimization" ? "optimization" : "reliability";
        activateDocument("verify", definition.kind === "optimization" ? "Optimization · #18" : "Verification");
        switchView("verify", { focusLanding: true });
        showToast("Workflow opened", `${definition.title} is governed in Verification rather than added as a numerical solver.`, "success");
        return;
      }
      const prerequisite = { pac: "pss", pnoise: "pss", pxf: "pss", pstb: "pss", envelope: "hb", fourier: "tran", disto: "ac" }[id];
      if (prerequisite) {
        state.configuredAnalyses.add(prerequisite);
        state.enabledAnalyses.add(prerequisite);
      }
      state.configuredAnalyses.add(id);
      state.enabledAnalyses.add(id);
      state.selectedAnalysis = id;
      state.simulationSection = "analyses";
      markWorkspaceChanged({ checksStale: false });
      $("#analysis-dialog").close();
      renderView();
      showToast("Analysis added", `${definition.code} · ${definition.title} is configured and enabled${prerequisite ? ` with required ${ANALYSIS_CODE_MAP[prerequisite]}` : ""}. ${analysisAvailabilityLabel(definition.availability)}.`, definition.availability === "production" ? "success" : "warning");
    }));
  }

  function openAnalysisPicker() {
    const dialog = $("#analysis-dialog");
    $("#analysis-search").value = "";
    renderAnalysisPicker();
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => $("#analysis-search").focus());
  }

  function openJobsManager() {
    $("#jobs-manager-body").innerHTML = jobsManagerContent();
    hydrateIcons($("#jobs-manager-body"));
    $("#jobs-run").textContent = state.running ? "Stop active run" : "Run active plan";
    const dialog = $("#jobs-dialog");
    if (!dialog.open) dialog.showModal();
  }

  function workflowMarkup(action) {
    if (action === "export-corner-matrix") return workflowMarkup("export-results");
    if (action === "create-symbol") return workflowMarkup("new-cell");
    if (action === "validate-bindings") return workflowMarkup("netlist-validation");
    if (action === "compare-nominal") return workflowMarkup("compare-result");
    if (action === "export-verification-report") return workflowMarkup("generate-report");
    if (action === "export-drc") return { title: "Export DRC marker database", eyebrow: "PHYSICAL VERIFICATION · TRACEABLE EXPORT", primary: "Export marker package", body: `<div class="setting-row"><div><strong>Format</strong><small>Every format includes a canonical manifest and stable marker identifiers.</small></div><select class="select"><option>RSpice DRC package · JSON + geometry</option><option>CSV marker summary</option><option>Review report · PDF/A</option><option>Foundry exchange archive</option></select></div><div class="setting-row"><div><strong>Marker scope</strong><small>Current filter is retained as export metadata.</small></div><select class="select"><option>All markers · 26</option><option>Blocking open markers · 23</option><option>Selected marker · ${state.selectedDrcMarker}</option></select></div><div class="setting-row"><div><strong>Geometry</strong><small>Layout snippets are clipped to the smallest reviewable context.</small></div><select class="select"><option>Measured polygons + context</option><option>Marker bounding boxes only</option><option>No geometry · summary only</option></select></div><table class="data-table"><thead><tr><th>Provenance</th><th>Value</th></tr></thead><tbody><tr><td>Layout revision</td><td class="mono">L42 · ${state.inputRevision}</td></tr><tr><td>Rule deck</td><td class="mono">demo180_drc_v12</td></tr><tr><td>Disposition history</td><td class="ok-text">included · immutable</td></tr><tr><td>Approved waivers</td><td class="ok-text">included with signatures</td></tr></tbody></table>` };
    if (action === "map-requirement") return { title: "Map executable requirement", eyebrow: "VERIFICATION · REQUIREMENT COVERAGE", primary: "Save requirement mapping", body: `<div class="concept-banner warning">${iconSvg("warning")}The selected measurement has no release requirement. Mapping changes coverage only after the expression, units, aggregation, and required run-set points are validated.</div><div class="setting-row"><div><strong>Measurement</strong><small>Stable result expression identifier.</small></div><select class="select"><option>settling_t_settle · 4.812 ms</option><option>bandwidth_f3db · 104.8 kHz</option></select></div><div class="setting-row"><div><strong>Requirement</strong><small>Imported contract with stable ID and revision.</small></div><select class="select"><option>req-19 · Settling accuracy</option><option>req-21 · Recovery time</option><option>Create engineering requirement…</option></select></div><div class="setting-row"><div><strong>Evaluation scope</strong><small>Release mapping must cover every declared required point.</small></div><select class="select"><option>All 15 required PVT points</option><option>Nominal only · engineering</option><option>Worst case aggregation</option></select></div><table class="data-table"><thead><tr><th>Contract check</th><th>Result</th></tr></thead><tbody><tr><td>Unit compatibility</td><td class="ok-text">time · valid</td></tr><tr><td>Dataset availability</td><td class="ok-text">TRAN · 15 / 15</td></tr><tr><td>Duplicate mapping</td><td class="ok-text">none</td></tr><tr><td>Coverage after save</td><td class="ok-text">13 / 14</td></tr></tbody></table>` };
    if (action === "configure-layers") return { title: "DRC layer display", eyebrow: "PHYSICAL VERIFICATION · VIEWER LAYERS", primary: "Apply layer visibility", body: `<div class="setting-row"><div><strong>Display preset</strong><small>Viewer-only; DRC evaluation and marker geometry are unchanged.</small></div><select class="select"><option>Marker context · 7 layers</option><option>Routing stack</option><option>Active rule layers</option><option>All layout layers</option></select></div><table class="data-table"><thead><tr><th>Visible</th><th>Layer</th><th>Purpose</th><th>Opacity</th><th>Color</th></tr></thead><tbody><tr><td><input type="checkbox" checked aria-label="Show metal 2 drawing"></td><td class="mono">M2</td><td>drawing</td><td>82%</td><td class="mono">#48a8d8</td></tr><tr><td><input type="checkbox" checked aria-label="Show via 1 drawing"></td><td class="mono">VIA1</td><td>drawing</td><td>90%</td><td class="mono">#d9c25f</td></tr><tr><td><input type="checkbox" checked aria-label="Show metal 1 drawing"></td><td class="mono">M1</td><td>drawing</td><td>42%</td><td class="mono">#58a878</td></tr><tr><td><input type="checkbox" checked aria-label="Show marker overlay"></td><td class="mono">DRC</td><td>marker</td><td>100%</td><td class="mono">severity</td></tr></tbody></table><div class="setting-row"><div><strong>Dim unrelated geometry</strong><small>Preserves hierarchy context without competing with selected markers.</small></div><label class="switch"><input type="checkbox" checked aria-label="Dim unrelated DRC geometry"><span></span></label></div>` };
    if (action === "compare-checkpoint") return { title: "Compare recovery checkpoint", eyebrow: "RECOVERY · NON-DESTRUCTIVE DIFFERENCE REVIEW", primary: "Open difference workspace", body: `<div class="setting-row"><div><strong>Recovery point</strong><small>Read-only autosave or protected checkpoint.</small></div><select class="select"><option>12:31:04 · autosave · 3 documents</option><option>12:24:19 · before model update</option><option>11:58:07 · protected checkpoint</option></select></div><div class="setting-row"><div><strong>Compare against</strong><small>Current working revision remains unchanged.</small></div><select class="select"><option>Current working revision ${state.inputRevision}</option><option>Saved project revision</option></select></div><table class="data-table"><thead><tr><th>Document</th><th>Recovery state</th><th>Current state</th><th>Difference</th></tr></thead><tbody><tr><td>top · schematic</td><td>126 instances</td><td>128 instances</td><td class="warn-text">2 modified</td></tr><tr><td>Lab characterization</td><td>7 analyses</td><td>8 analyses</td><td class="warn-text">1 added</td></tr><tr><td>afe_requirements.csv</td><td>req-18</td><td>req-19</td><td class="warn-text">1 revision</td></tr></tbody></table><div class="setting-row"><div><strong>Comparison mode</strong></div><select class="select"><option>Semantic schematic and configuration diff</option><option>Source text diff</option><option>Manifest summary</option></select></div>` };
    if (action === "restore-checkpoint") return { title: "Restore recovery copy", eyebrow: "RECOVERY · TRANSACTIONAL RESTORE", primary: "Create restore revision", body: `<div class="concept-banner warning">${iconSvg("warning")}Restore never rewrites project history. RSpice first protects the current working state, then creates a new revision from the selected recovery point.</div><div class="setting-row"><div><strong>Recovery point</strong><small>Selected immutable autosave.</small></div><span class="mono">12:31:04 · 3 documents · 7c49d2a</span></div><div class="setting-row"><div><strong>Restore scope</strong><small>Dependencies outside the selection remain at their current revision.</small></div><select class="select"><option>All 3 changed documents</option><option>top · schematic only</option><option>Simulation configuration only</option></select></div><div class="setting-row"><div><strong>Current work protection</strong><small>Checkpoint is created before restore begins.</small></div><span class="ok-text">automatic · protected</span></div><div class="setting-row"><div><strong>Result effect</strong><small>Immutable results remain available and retain original inputs.</small></div><span class="warn-text">restored design requires a new run</span></div>` };
    if (action === "run-qualification") return { title: "Run model qualification suite", eyebrow: "MODELS · QUALIFICATION EXECUTION", primary: "Queue qualification suite", body: `<div class="setting-row"><div><strong>Model scope</strong><small>Selected catalog family and exact content digest.</small></div><select class="select"><option>All changed and review models · 2</option><option>BSIM4_4.8.2 only</option><option>Complete release catalog · 126</option></select></div><div class="setting-row"><div><strong>Suite</strong><small>Validated vectors, references, tolerances, and platform parity.</small></div><select class="select"><option>Release qualification · DC, AC, transient, noise</option><option>Fast changed-vector suite</option><option>Desktop / WASM parity only</option></select></div><table class="data-table"><thead><tr><th>Expansion</th><th>Tasks</th><th>Target</th><th>Estimate</th></tr></thead><tbody><tr><td>2 models · 326 vectors</td><td>652</td><td>Local desktop · 12 threads</td><td>03:42</td></tr></tbody></table><div class="setting-row"><div><strong>Promotion policy</strong><small>Execution cannot approve failed vectors or promote a model automatically.</small></div><span>review required after completion</span></div>` };
    if (action === "import-pwl-csv") return { title: "Import PWL point table", eyebrow: "SOURCE · UNIT-SAFE TABULAR IMPORT", primary: "Validate and replace point table", body: `<div class="setting-row"><div><strong>File</strong><small>CSV or TSV with explicit time and value columns.</small></div><input class="input mono" value="~/Downloads/vin_cal.csv"></div><div class="setting-row"><div><strong>Column mapping</strong><small>Units may be declared in headers or assigned explicitly.</small></div><div class="settings-value-stack"><span>time_s → Time · s</span><span>voltage_v → Value · V</span></div></div><div class="setting-row"><div><strong>Duplicate time policy</strong><small>Discontinuities remain explicit solver breakpoints.</small></div><select class="select"><option>Preserve ordered duplicate times</option><option>Reject duplicates</option><option>Keep last value</option></select></div><table class="data-table"><thead><tr><th>Rows</th><th>Range</th><th>Monotonicity</th><th>Status</th></tr></thead><tbody><tr><td>4</td><td>0 s → 5 ms</td><td>non-decreasing</td><td class="ok-text">valid</td></tr></tbody></table>` };
    if (["attach-foundry-evidence", "attach-simulation-evidence", "link-change-request"].includes(action)) {
      const linked = action === "link-change-request";
      const simulation = action === "attach-simulation-evidence";
      return { title: linked ? "Link governed issue or change request" : simulation ? "Attach simulation evidence" : "Attach foundry disposition", eyebrow: "DRC WAIVER · AUDITABLE EVIDENCE", primary: linked ? "Link governed record" : "Attach verified evidence", body: `<div class="concept-banner">${iconSvg("info")}Evidence is copied or referenced by immutable digest and bound to ${state.selectedDrcMarker}, layout L42, rule deck demo180_drc_v12, and the waiver request revision.</div><div class="setting-row"><div><strong>${linked ? "Record URL or ID" : "Evidence file"}</strong><small>${linked ? "Supported issue, change-control, and approval systems." : "The source artifact remains available for independent review."}</small></div><input class="input mono" value="${linked ? "CHANGE-1842" : simulation ? "evidence/soa_margin_run41.pdf" : "evidence/foundry_disposition_FD-2291.pdf"}"></div><div class="setting-row"><div><strong>Evidence class</strong><small>Controls required metadata and independent approval routing.</small></div><select class="select"><option>${linked ? "Design change request" : simulation ? "Electrical stress simulation" : "Foundry disposition"}</option><option>Independent analysis</option><option>Review meeting record</option></select></div><div class="setting-row"><div><strong>Binding</strong><small>Mismatched geometry, rule, deck, or layout revision invalidates reuse.</small></div><span class="mono">${state.selectedDrcMarker} · M2.SP.3 · L42 · deck v12</span></div><div class="setting-row"><div><strong>Digest / trust</strong></div><span class="ok-text">source reachable · signature policy satisfied</span></div>` };
    }
    if (action === "compare-release") return { title: "Compare model qualification releases", eyebrow: "MODELS · VERSIONED QUALIFICATION DELTA", primary: "Open qualification comparison", body: `<div class="setting-row"><div><strong>Candidate catalog</strong><small>Current resolved model and test-vector revisions.</small></div><span class="mono">working · demo180 2.4.1 · 126 models</span></div><div class="setting-row"><div><strong>Reference release</strong><small>Approved immutable model qualification baseline.</small></div><select class="select"><option>release/2026.2 · approved</option><option>release/2026.1 · LTS</option></select></div><table class="data-table"><thead><tr><th>Delta</th><th>Count</th><th>Required disposition</th></tr></thead><tbody><tr><td>Model definitions changed</td><td>2</td><td class="warn-text">rerun affected vectors</td></tr><tr><td>Qualification vectors changed</td><td>9</td><td>review results</td></tr><tr><td>New failures</td><td>0</td><td class="ok-text">none</td></tr><tr><td>Waiver changes</td><td>1</td><td class="warn-text">independent approval</td></tr></tbody></table>` };
    if (action === "create-optimization-seed") return { title: "Create optimization seed from sample", eyebrow: "VARIATION · CONTROLLED OPTIMIZATION HANDOFF", primary: "Create seed revision", body: `<div class="concept-banner warning">${iconSvg("warning")}This copies selected sample parameters into a new optimization seed. It never mutates the Monte Carlo result or the current design revision.</div><div class="setting-row"><div><strong>Source sample</strong><small>Worst failing sample retained with complete variation provenance.</small></div><span class="mono">#0731 · SS / 125 °C · seed 0x73A4</span></div><div class="setting-row"><div><strong>Seed name</strong></div><input class="input" value="yield_failure_0731"></div><div class="setting-row"><div><strong>Parameter scope</strong><small>Only declared design variables become optimizer inputs.</small></div><select class="select"><option>RGAIN, CFILT, VREF · 3 variables</option><option>All tunable design variables · 4</option></select></div><div class="setting-row"><div><strong>Objective mapping</strong></div><select class="select"><option>Recover all failed mapped requirements</option><option>Bandwidth margin only</option></select></div>` };
    if (action === "import-section-map") return { title: "Import PDK section mapping", eyebrow: "MODELS · EXPLICIT CORNER BINDING", primary: "Validate and import mapping", body: `<div class="setting-row"><div><strong>Source</strong><small>Foundry manifest, Spectre section map, or RSpice mapping profile.</small></div><input class="input mono" value="demo180/section-map.yaml"></div><div class="setting-row"><div><strong>Merge policy</strong><small>Existing explicit bindings are never overwritten silently.</small></div><select class="select"><option>Merge and review conflicts</option><option>Replace unmodified mappings</option><option>Import as alternate profile</option></select></div><table class="data-table"><thead><tr><th>Logical corner</th><th>Model section</th><th>Passives</th><th>Status</th></tr></thead><tbody><tr><td>TT</td><td class="mono">tt</td><td class="mono">res_typ cap_typ</td><td class="ok-text">resolved</td></tr><tr><td>FF</td><td class="mono">ff</td><td class="mono">res_lo cap_lo</td><td class="ok-text">resolved</td></tr><tr><td>SS</td><td class="mono">ss</td><td class="mono">res_hi cap_hi</td><td class="ok-text">resolved</td></tr></tbody></table><div class="setting-row"><div><strong>Unmapped sections</strong></div><span class="ok-text">0 blocking · 2 unused</span></div>` };
    if (action === "import-symbol") return { title: "Import symbol definition", eyebrow: "SYMBOL LIBRARY · VALIDATED INTERCHANGE", primary: "Import into project library", body: `<div class="setting-row"><div><strong>Source</strong><small>RSpice, SVG, EDIF, or supported schematic-library symbol.</small></div><input class="input mono" value="~/Downloads/opamp_5pin.svg"></div><div class="setting-row"><div><strong>Target name</strong><small>Stable project-library identifier.</small></div><input class="input mono" value="opamp_5pin_variant"></div><div class="setting-row"><div><strong>Pin contract</strong><small>Geometry alone is never allowed to infer electrical semantics.</small></div><select class="select"><option>Bind to OPA189_A · 5 pins</option><option>Create unbound symbol for review</option></select></div><table class="data-table"><thead><tr><th>Check</th><th>Observed</th><th>Status</th></tr></thead><tbody><tr><td>Vector geometry</td><td>18 primitives</td><td class="ok-text">valid</td></tr><tr><td>Pin anchors</td><td>5 explicit</td><td class="ok-text">valid</td></tr><tr><td>Pin order</td><td>requires model binding</td><td class="warn-text">review</td></tr></tbody></table>` };
    if (action === "open-form-designer") return { title: "Open component form designer", eyebrow: "SYMBOL LIBRARY · TYPED PARAMETER FORM", primary: "Open form designer", body: `<div class="setting-row"><div><strong>Symbol family</strong><small>Selected model-bound component definition.</small></div><span class="mono">opamp_5pin · OPA189_A</span></div><div class="setting-row"><div><strong>Form revision</strong><small>Parameter schema, units, defaults, validation, visibility, and help.</small></div><select class="select"><option>macro-model · current</option><option>Create alternate form revision</option></select></div><table class="data-table"><thead><tr><th>Section</th><th>Fields</th><th>Validation</th></tr></thead><tbody><tr><td>Identity</td><td>3</td><td class="ok-text">complete</td></tr><tr><td>Electrical parameters</td><td>8</td><td class="ok-text">typed</td></tr><tr><td>Model overrides</td><td>4</td><td class="ok-text">constrained</td></tr><tr><td>Advanced</td><td>6</td><td class="warn-text">2 hidden by default</td></tr></tbody></table><div class="setting-row"><div><strong>Unsaved library changes</strong></div><span class="ok-text">none · safe to open</span></div>` };
    if (action === "select-result-store") return { title: "Choose project result store", eyebrow: "STORAGE · CONTENT-ADDRESSED RESULT DATABASE", primary: "Validate and use location", body: `<div class="concept-banner">${iconSvg("info")}Changing the store never rewrites immutable datasets in place. Existing data is copied transactionally, verified by digest, and kept at the original location until commit succeeds.</div><div class="setting-row"><div><strong>Location</strong><small>Local folder or organization-managed mounted storage.</small></div><input class="input mono" value="~/RSpice/afe/results"></div><div class="setting-row"><div><strong>Existing datasets</strong><small>Choose how the current 684 MiB store is handled.</small></div><select class="select"><option>Copy, verify, then switch</option><option>Use new location for future results only</option><option>Attach an existing compatible store</option></select></div><div class="setting-row"><div><strong>Filesystem contract</strong><small>Atomic rename, locking, case behavior and available capacity.</small></div><div class="settings-value-stack"><span class="ok-text">writable · locking verified</span><span>82.4 GiB available · schema 1.0 compatible</span></div></div><div class="setting-row"><div><strong>Recovery point</strong><small>Created before storage ownership changes.</small></div><label class="switch"><input type="checkbox" checked aria-label="Create checkpoint before changing result store"><span></span></label></div>` };
    if (action === "review-cache") return { title: "Review reconstructable caches", eyebrow: "STORAGE · SAFE CACHE MAINTENANCE", primary: "Clear selected caches", body: `<div class="concept-banner">${iconSvg("info")}Only reconstructable render, compile, index, and downloaded update caches are eligible. Project sources, model packages, recovery checkpoints, immutable results, credentials, and licenses are excluded.</div><table class="data-table"><thead><tr><th>Clear</th><th>Cache</th><th>Size</th><th>Rebuild cost</th><th>Last used</th></tr></thead><tbody><tr><td><input type="checkbox" checked aria-label="Clear waveform render cache"></td><td>Waveform render tiles</td><td>612 MiB</td><td>automatic</td><td>today</td></tr><tr><td><input type="checkbox" checked aria-label="Clear model compile cache"></td><td>Model compile artifacts</td><td>438 MiB</td><td>3–8 min</td><td>today</td></tr><tr><td><input type="checkbox" checked aria-label="Clear search index cache"></td><td>Search and cross-probe indexes</td><td>126 MiB</td><td>automatic</td><td>2 days</td></tr><tr><td><input type="checkbox" checked aria-label="Clear update cache"></td><td>Signed update packages</td><td>258 MiB</td><td>redownload</td><td>18 days</td></tr></tbody></table><div class="setting-row"><div><strong>Selected recovery</strong><small>Space available after successful deletion.</small></div><strong class="ok-text">1.40 GiB · no project data</strong></div>` };
    if (action === "import-shortcuts") return { title: "Import keyboard shortcut map", eyebrow: "PREFERENCES · VERSIONED COMMAND BINDINGS", primary: "Import compatible bindings", body: `<div class="setting-row"><div><strong>Source</strong><small>RSpice shortcut profile or supported editor preset.</small></div><input class="input mono" value="~/Downloads/rspice-shortcuts.json"></div><div class="setting-row"><div><strong>Merge policy</strong><small>Protected accessibility and operating-system bindings remain explicit.</small></div><select class="select"><option>Merge non-conflicting bindings</option><option>Replace current user bindings</option><option>Import into a named preset</option></select></div><table class="data-table"><thead><tr><th>Binding class</th><th>Imported</th><th>Conflicts</th><th>Policy</th></tr></thead><tbody><tr><td>Global</td><td>18</td><td>1</td><td class="warn-text">review Ctrl J</td></tr><tr><td>Schematic</td><td>31</td><td>0</td><td class="ok-text">ready</td></tr><tr><td>Results</td><td>22</td><td>0</td><td class="ok-text">ready</td></tr><tr><td>Simulation</td><td>14</td><td>0</td><td class="ok-text">ready</td></tr></tbody></table><div class="setting-row"><div><strong>Conflict handling</strong></div><select class="select"><option>Keep current and report</option><option>Use imported binding</option><option>Leave both unbound</option></select></div>` };
    if (action === "export-shortcuts") return { title: "Export keyboard shortcut map", eyebrow: "PREFERENCES · PORTABLE COMMAND BINDINGS", primary: "Export shortcut profile", body: `<div class="setting-row"><div><strong>Format</strong><small>Versioned schema with stable command identifiers.</small></div><select class="select"><option>RSpice shortcut profile · JSON</option><option>Human-readable reference · Markdown</option><option>Printable reference · PDF</option></select></div><div class="setting-row"><div><strong>Scope</strong><small>Defaults can be omitted for a smaller personal override.</small></div><select class="select"><option>User overrides + platform exceptions</option><option>Complete resolved shortcut map</option><option>Current workspace context only</option></select></div><div class="setting-row"><div><strong>Platform mappings</strong><small>Preserve explicit desktop and browser alternatives.</small></div><label class="switch"><input type="checkbox" checked aria-label="Include platform shortcut alternatives"><span></span></label></div><div class="setting-row"><div><strong>Privacy</strong><small>Projects, paths, recent commands, macros, credentials, and automation source are excluded.</small></div><span class="ok-text">portable profile only</span></div>` };
    if (action === "analysis-options") {
      const definition = analysisDefinition(state.selectedAnalysis);
      return { title: `${definition.code} advanced options`, eyebrow: `SIMULATION · ${analysisKindLabels[definition.kind].toUpperCase()} · NUMERICAL CONTRACT`, primary: "Apply advanced options", body: `<div class="concept-banner">${iconSvg("info")}Advanced values are frozen into the next run manifest. Presets never conceal an explicit override, and release evidence records the complete resolved option set.</div><div class="setup-workspace-grid" style="padding:0"><section class="table-card"><div class="card-head"><h3>Accuracy & tolerances</h3><span class="mini-badge ok">resolved</span></div><div class="section-body"><label class="field-block"><span>Relative tolerance</span><input class="input mono" value="1e-4"></label><label class="field-block"><span>Voltage absolute tolerance</span><input class="input mono" value="1 nV"></label><label class="field-block"><span>Current absolute tolerance</span><input class="input mono" value="1 pA"></label><label class="field-block"><span>Charge tolerance</span><input class="input mono" value="1e-18 C"></label></div></section><section class="table-card"><div class="card-head"><h3>Convergence</h3></div><div class="section-body"><label class="field-block"><span>Homotopy sequence</span><select class="select"><option>Adaptive · source then gmin</option><option>Source stepping</option><option>Gmin stepping</option><option>None</option></select></label><label class="field-block"><span>Newton iteration limit</span><input class="input mono" value="150"></label><label class="field-block"><span>Device limiting</span><select class="select"><option>Model-aware</option><option>Conservative</option><option>Disabled</option></select></label><label class="check-row"><input type="checkbox" checked> Capture residual history on failure</label></div></section><section class="table-card span-2"><div class="card-head"><h3>Execution & evidence</h3><span class="mini-badge">analysis-local override</span></div><div class="section-body form-grid"><label class="field-block"><span>Matrix solver</span><select class="select"><option>Automatic sparse direct</option><option>KLU</option><option>Iterative preconditioned</option></select></label><label class="field-block"><span>Precision</span><select class="select"><option>f64 / complex128</option><option>Extended residual accumulation</option></select></label><label class="field-block"><span>Checkpoint boundary</span><select class="select"><option>Completed run-set point</option><option>Every accepted operating state</option><option>Disabled</option></select></label><label class="field-block"><span>Failure artifact</span><select class="select"><option>Residuals + matrix diagnostics</option><option>Full restart state</option><option>Summary only</option></select></label></div></section></div>` };
    }
    if (action === "apply-setup" || action === "section-primary") {
      const sectionNames = { variables: "Design variables", outputs: "Outputs and expressions", specifications: "Requirements and specifications", runset: "PVT, sweeps and variation", models: "Models and sections", solver: "Solver and convergence", save: "Save, streaming and retention" };
      const section = state.simulationSection || "analyses";
      const title = sectionNames[section] || "Simulation setup";
      return { title: `Apply ${title.toLowerCase()}`, eyebrow: "SIMULATION PLAN · REVIEWED CHANGE SET", primary: "Apply to working plan", body: `<div class="concept-banner warning">${iconSvg("warning")}This updates the working simulation plan. Existing result datasets remain immutable and become stale only when their resolved inputs differ.</div><div class="setting-row"><div><strong>Destination</strong><small>Explicit plan and revision ownership.</small></div><div class="settings-value-stack"><span>Lab characterization</span><span>revision ${state.inputRevision}</span></div></div><div class="setting-row"><div><strong>Change scope</strong><small>Only the active setup domain is modified.</small></div><span class="mono">${title}</span></div><div class="setting-row"><div><strong>Validation</strong><small>References, units, model sections and platform eligibility.</small></div><div class="settings-value-stack"><span class="ok-text">syntax and references valid</span><span>${executionTaskGraph(state.enabledAnalyses, effectiveAnalysisValues(state.enabledAnalyses, state.analysisValues)).total} tasks after expansion</span></div></div><div class="setting-row"><div><strong>Result effect</strong><small>Prior results are preserved with their original manifests.</small></div><span class="warn-text">dependent results marked stale</span></div>` };
    }
    if (action === "descend-hierarchy") return { title: "Descend into hierarchy", eyebrow: "SCHEMATIC · EDIT CONTEXT", primary: "Open edit context", body: `<div class="setting-row"><div><strong>Target</strong><small>Selected hierarchical instance and bound view.</small></div><div class="settings-value-stack"><span>/top/XAFE</span><span>afe_core · schematic</span></div></div><div class="setting-row"><div><strong>Edit mode</strong><small>Controls ownership and parent-context visibility.</small></div><select class="select"><option>Edit in place</option><option>Open isolated cell view</option><option>Read-only reference</option></select></div><div class="setting-row"><div><strong>Parent context</strong><small>Dimmed connectivity remains available for cross-probing.</small></div><select class="select"><option>Show one level</option><option>Show full hierarchy</option><option>Hide parent context</option></select></div><div class="setting-row"><div><strong>Unsaved parent changes</strong><small>Preserved as a transactional working checkpoint.</small></div><span class="ok-text">safe to descend</span></div>` };
    if (action === "edit-mission") return { title: "Edit reliability mission profile", eyebrow: "RELIABILITY · VERSIONED OPERATING EXPOSURE", primary: "Save mission revision", body: `<div class="concept-banner">${iconSvg("info")}Mission phases are normalized to 100% duty and bound to model, temperature and supply assumptions. Changing the profile invalidates aging projections, never production SOA evidence.</div><table class="data-table"><thead><tr><th>Phase</th><th>Duty</th><th>Temperature</th><th>Supply</th><th>Activity</th></tr></thead><tbody><tr><td>Standby</td><td><input class="input mono" value="54%"></td><td><input class="input mono" value="45 °C"></td><td>5.0 V</td><td>low</td></tr><tr><td>Measure</td><td><input class="input mono" value="31%"></td><td><input class="input mono" value="85 °C"></td><td>5.0 V</td><td>nominal</td></tr><tr><td>Calibration</td><td><input class="input mono" value="10%"></td><td><input class="input mono" value="105 °C"></td><td>5.5 V</td><td>high</td></tr><tr><td>Fault recovery</td><td><input class="input mono" value="5%"></td><td><input class="input mono" value="125 °C"></td><td>5.5 V</td><td>maximum</td></tr></tbody></table><div class="setting-row"><div><strong>Aging mechanisms</strong><small>Foundry-qualified mechanisms available to this model set.</small></div><div class="selection-chip-grid"><button class="mini-badge accent">BTI</button><button class="mini-badge accent">HCI</button><button class="mini-badge">TDDB</button></div></div>` };
    if (action === "export-lockfile" || action === "export-manifest") return { title: "Export resolved dependency manifest", eyebrow: "PROJECT · CONTENT-ADDRESSED DEPENDENCIES", primary: "Export signed manifest", body: `<div class="setting-row"><div><strong>Format</strong><small>Portable for CI, review and long-term reconstruction.</small></div><select class="select"><option>RSpice lockfile · YAML</option><option>Canonical JSON</option><option>SPDX dependency inventory</option></select></div><div class="setting-row"><div><strong>Include</strong><small>Exact resolution state rather than mutable search paths.</small></div><div class="settings-value-stack"><span>7 files · 142 definitions</span><span>sections, digests, runtime and license class</span></div></div><div class="setting-row"><div><strong>Signature</strong><small>Optional organization signing identity.</small></div><select class="select"><option>J. Whitfield · Engineering signing key</option><option>Unsigned engineering export</option></select></div><table class="data-table"><thead><tr><th>Check</th><th>Status</th></tr></thead><tbody><tr><td>Missing definitions</td><td class="ok-text">0</td></tr><tr><td>Shadowed definitions</td><td class="ok-text">0</td></tr><tr><td>Unresolved license classes</td><td class="ok-text">0</td></tr><tr><td>Total digest</td><td class="mono">be17…481c</td></tr></tbody></table>` };
    if (action === "open-wave-diff") return { title: "Create waveform difference view", eyebrow: "REGRESSION · IMMUTABLE DATASET COMPARISON", primary: "Open difference workspace", body: `<div class="setting-row"><div><strong>Current dataset</strong><small>Candidate result and frozen input manifest.</small></div><span class="mono">Run ${state.resultManifest.id} · ${state.resultManifest.inputRevision}</span></div><div class="setting-row"><div><strong>Reference baseline</strong><small>Approved regression evidence.</small></div><select class="select"><option>main · Run 38 · approved</option><option>release/1.0 · Run 35</option></select></div><div class="setting-row"><div><strong>Alignment</strong><small>Recorded with each derived difference trace.</small></div><select class="select"><option>Event edges + monotone interpolation</option><option>Absolute X axis</option><option>Cross-correlation</option></select></div><div class="setting-row"><div><strong>Difference views</strong><small>All calculations retain full stored precision.</small></div><div class="selection-chip-grid"><button class="mini-badge accent">absolute</button><button class="mini-badge accent">relative</button><button class="mini-badge accent">normalized σ</button></div></div><table class="data-table"><thead><tr><th>Signal / measurement</th><th>Tolerance</th><th>Worst delta</th><th>Status</th></tr></thead><tbody><tr><td class="mono">V(afe_out)</td><td>±250 µV</td><td>+81 µV</td><td class="ok-text">pass</td></tr><tr><td class="mono">inoise_total</td><td>±3 σ</td><td>+0.42 σ</td><td class="ok-text">pass</td></tr><tr><td class="mono">settling_0p1</td><td>±0.5 ms</td><td>+0.11 ms</td><td class="ok-text">pass</td></tr></tbody></table>` };
    if (action === "optimize-save") return { title: "Save optimization policy", eyebrow: "OPTIMIZATION · REUSABLE GOVERNED TEMPLATE", primary: "Save policy", body: `<div class="setting-row"><div><strong>Name</strong><small>Project-local reusable optimizer definition.</small></div><input class="input" value="afe_nominal_centering"></div><div class="setting-row"><div><strong>Algorithm</strong><small>Resolved algorithm and termination behavior.</small></div><span class="mono">Levenberg–Marquardt · 40 iterations · 1e-4</span></div><div class="setting-row"><div><strong>Contents</strong><small>Variables, bounds, goals and constraints.</small></div><span class="mono">4 variables · 5 goals · 2 hard constraints</span></div><div class="setting-row"><div><strong>Sharing</strong><small>Controls use by automation and team members.</small></div><select class="select"><option>Project team · versioned</option><option>Personal workspace</option><option>Organization template library</option></select></div>` };
    if (action === "revert-candidate") return { title: "Revert applied optimization candidate", eyebrow: "OPTIMIZATION · CONTROLLED ROLLBACK", primary: "Create revert revision", body: `<div class="concept-banner warning">${iconSvg("warning")}The applied candidate is not deleted. A new working revision restores its parent values and records the rollback relationship.</div><table class="data-table"><thead><tr><th>Parameter</th><th>Current</th><th>Restore</th></tr></thead><tbody><tr><td>RGAIN</td><td class="mono">512.4 Ω</td><td class="mono">499 Ω</td></tr><tr><td>CFILT</td><td class="mono">19.62 nF</td><td class="mono">22 nF</td></tr><tr><td>VREF</td><td class="mono">2.503 V</td><td class="mono">2.500 V</td></tr></tbody></table><div class="setting-row"><div><strong>Result impact</strong><small>Existing datasets remain immutable.</small></div><span class="warn-text">checks and current results become stale</span></div>` };
    if (action === "save-source") return { title: "Save owned source revision", eyebrow: "SOURCE · VALIDATED TRANSACTION", primary: "Save source", body: `<div class="setting-row"><div><strong>Artifact</strong><small>Editable project-owned source.</small></div><span class="mono">${state.codeSurface === "automation" ? "characterize.rspice" : state.codeSurface === "veriloga" ? "sensor_bridge.va" : "top_override.sp"}</span></div><div class="setting-row"><div><strong>Validation</strong><small>Syntax, includes, model references and ownership.</small></div><div class="settings-value-stack"><span class="ok-text">0 blocking diagnostics</span><span>2 non-blocking advisories retained</span></div></div><div class="setting-row"><div><strong>Generated dependency</strong><small>Regeneration never overwrites owned source.</small></div><span>three-way comparison enabled</span></div><div class="setting-row"><div><strong>Commit message</strong><small>Recorded in local project history.</small></div><input class="input" value="Refine source configuration"></div>` };
    if (action === "save-symbol") return { title: "Validate and save symbol", eyebrow: "SYMBOL EDITOR · MODEL-BOUND CONTRACT", primary: "Save symbol revision", body: `<div class="concept-banner">${iconSvg("check")}Pin order, electrical types and model binding are validated before the symbol revision can replace the current project view.</div><table class="data-table"><thead><tr><th>Check</th><th>Expected</th><th>Observed</th><th>Status</th></tr></thead><tbody><tr><td>Pin count</td><td>5</td><td>5</td><td class="ok-text">pass</td></tr><tr><td>Netlist order</td><td>IN+ IN− V− OUT V+</td><td>matched</td><td class="ok-text">pass</td></tr><tr><td>Hidden power pins</td><td>forbidden</td><td>none</td><td class="ok-text">pass</td></tr><tr><td>Model family</td><td>OPA189_A</td><td>OPA189_A</td><td class="ok-text">pass</td></tr></tbody></table><div class="setting-row"><div><strong>Revision note</strong><small>Visible in library history and review.</small></div><input class="input" value="Align pin labels and model contract"></div>` };
    if (action === "add-library") return { title: "Attach model library", eyebrow: "MODELS · TRUSTED RESOLUTION SOURCE", primary: "Validate and attach", body: `<div class="setting-row"><div><strong>Scope</strong><small>Determines portability and ownership.</small></div><select class="select"><option>Project library · versioned</option><option>Workspace library</option><option>Organization managed library</option></select></div><div class="setting-row"><div><strong>Source</strong><small>Folder, manifest or signed package.</small></div><input class="input mono" value="~/RSpice/libraries/precision_analog"></div><div class="setting-row"><div><strong>Trust policy</strong><small>Executable callbacks and encrypted content require explicit trust.</small></div><select class="select"><option>Models only · no executable callbacks</option><option>Trusted signed package</option><option>Quarantine for inspection</option></select></div><table class="data-table"><thead><tr><th>Resolution preview</th><th>Count</th><th>Status</th></tr></thead><tbody><tr><td>SPICE / Spectre definitions</td><td>84</td><td class="ok-text">valid</td></tr><tr><td>Verilog-A modules</td><td>2</td><td class="ok-text">compilable</td></tr><tr><td>Symbol mappings</td><td>61</td><td class="ok-text">resolved</td></tr><tr><td>Name conflicts</td><td>1</td><td class="warn-text">explicit alias required</td></tr></tbody></table>` };
    if (action === "attach-pdk") return { title: "Attach process design kit", eyebrow: "PROJECT · TECHNOLOGY CONTRACT", primary: "Attach qualified PDK", body: `<div class="concept-banner warning">${iconSvg("warning")}A PDK attachment changes model, layer, unit and verification contracts. The operation creates a checkpoint and never migrates editable design data implicitly.</div><div class="setting-row"><div><strong>PDK package</strong><small>Signed local or organization-managed source.</small></div><select class="select"><option>demo180 · 2.4.1 · organization managed</option><option>Attach package…</option></select></div><div class="setting-row"><div><strong>Technology mapping</strong><small>Electrical, schematic and physical domains.</small></div><span class="mono">devices 126 · layers 42 · corners 5</span></div><div class="setting-row"><div><strong>Migration mode</strong><small>Existing views remain on their current technology until reviewed.</small></div><select class="select"><option>Attach only · no migration</option><option>Create migration branch</option></select></div><table class="data-table"><thead><tr><th>Gate</th><th>Result</th></tr></thead><tbody><tr><td>Package signature</td><td class="ok-text">verified</td></tr><tr><td>Model runtime compatibility</td><td class="ok-text">desktop + WASM</td></tr><tr><td>DRC deck qualification</td><td class="ok-text">foundry reference</td></tr><tr><td>License entitlement</td><td class="ok-text">available</td></tr></tbody></table>` };
    if (action === "clone-plan") return { title: "Clone simulation plan", eyebrow: "SIMULATION · EXPLICIT PLAN LINEAGE", primary: "Create cloned plan", body: `<div class="setting-row"><div><strong>New plan name</strong><small>Unique within this project.</small></div><input class="input" value="Lab characterization · variant"></div><div class="setting-row"><div><strong>Source</strong><small>Frozen source plan and working revision.</small></div><span class="mono">Lab characterization · ${state.inputRevision}</span></div><div class="setting-row"><div><strong>Copy contents</strong><small>Dependencies remain linked by stable identifiers.</small></div><div class="settings-value-stack"><label class="check-row"><input type="checkbox" checked> Analyses and advanced options</label><label class="check-row"><input type="checkbox" checked> Variables, outputs and specifications</label><label class="check-row"><input type="checkbox" checked> PVT and model bindings</label><label class="check-row"><input type="checkbox"> Regression baseline ownership</label></div></div><div class="setting-row"><div><strong>Results</strong><small>Result datasets are never duplicated with a plan.</small></div><span>none · manifests remain linked</span></div>` };
    if (action === "create-checkpoint") return { title: "Create project checkpoint", eyebrow: "RECOVERY · TRANSACTIONAL SNAPSHOT", primary: "Create checkpoint", body: `<div class="setting-row"><div><strong>Name</strong><small>Human-readable recovery marker.</small></div><input class="input" value="Before PDK and plan changes"></div><div class="setting-row"><div><strong>Scope</strong><small>Editable state only; immutable results are referenced.</small></div><select class="select"><option>All modified project documents</option><option>Active document</option><option>Simulation configuration only</option></select></div><div class="setting-row"><div><strong>Retention</strong><small>Protected checkpoints are never compacted automatically.</small></div><select class="select"><option>Protect until manually removed</option><option>Keep with next 8 autosaves</option><option>24 hours</option></select></div><div class="setting-row"><div><strong>Estimated snapshot</strong><small>Content-addressed data is reused.</small></div><span class="mono">2.8 MiB · 14 changed objects</span></div>` };
    if (action === "replace-baseline" || action === "select-baseline") {
      const replacing = action === "replace-baseline";
      return { title: replacing ? "Propose new regression baseline" : "Select regression baseline", eyebrow: "REGRESSION · GOVERNED REFERENCE", primary: replacing ? "Submit baseline proposal" : "Use selected baseline", body: `<div class="concept-banner ${replacing ? "warning" : ""}">${iconSvg(replacing ? "warning" : "info")}${replacing ? "Replacing an approved baseline requires independent review and never rewrites prior comparisons." : "The selected immutable dataset becomes the reference for this regression plan only."}</div><div class="setting-row"><div><strong>Candidate</strong><small>Frozen dataset and technical gate state.</small></div><select class="select"><option>Run ${state.resultManifest.id} · ${state.resultManifest.inputRevision} · review required</option><option>Run 39 · diagnostic only</option></select></div><div class="setting-row"><div><strong>Baseline channel</strong><small>Named reference used by interactive and CI runs.</small></div><select class="select"><option>main</option><option>release/1.0</option><option>qualification</option></select></div><div class="setting-row"><div><strong>Approval route</strong><small>Required for protected channels.</small></div><span>Design owner + verification owner</span></div><div class="setting-row"><div><strong>Comparison impact</strong><small>Existing reports keep their original baseline identity.</small></div><span class="mono">12 checks · 27 waveforms · future runs only</span></div>` };
    }
    if (action === "apply-candidate" || action === "discard-candidate") {
      const applying = action === "apply-candidate";
      return { title: applying ? "Apply optimization candidate" : "Discard optimization candidate", eyebrow: "OPTIMIZATION · REVIEWED CANDIDATE ACTION", primary: applying ? "Apply as working revision" : "Discard candidate", body: `<div class="concept-banner ${applying ? "warning" : ""}">${iconSvg(applying ? "warning" : "info")}${applying ? "Applying creates explicit working changes and marks dependent checks and results stale." : "Discarding removes the candidate from the active shortlist; its immutable optimization history remains available for audit."}</div><table class="data-table"><thead><tr><th>Parameter</th><th>Baseline</th><th>Candidate 18</th><th>Delta</th></tr></thead><tbody><tr><td>RGAIN</td><td class="mono">499 Ω</td><td class="mono">512.4 Ω</td><td>+2.69%</td></tr><tr><td>CFILT</td><td class="mono">22 nF</td><td class="mono">19.62 nF</td><td>−10.82%</td></tr><tr><td>VREF</td><td class="mono">2.500 V</td><td class="mono">2.503 V</td><td>+0.12%</td></tr></tbody></table><div class="setting-row"><div><strong>Candidate evidence</strong><small>Nominal optimization result is not release evidence.</small></div><span class="mono">5 / 5 goals · 2 / 2 constraints</span></div>` };
    }
    if (action === "add-specification") return { title: "Add executable specification", eyebrow: "REQUIREMENTS · TYPED PASS/FAIL CONTRACT", primary: "Add specification", body: `<div class="setup-workspace-grid" style="padding:0"><section class="table-card"><div class="card-head"><h3>Identity</h3></div><div class="section-body"><label class="field-block"><span>Name</span><input class="input mono" value="settling_0p1"></label><label class="field-block"><span>Requirement mapping</span><select class="select"><option>req-19 · Settling accuracy</option><option>Unmapped engineering check</option></select></label><label class="field-block"><span>Severity</span><select class="select"><option>Release blocking</option><option>Review required</option><option>Advisory</option></select></label></div></section><section class="table-card"><div class="card-head"><h3>Evaluation</h3><span class="mini-badge ok">unit valid</span></div><div class="section-body"><label class="field-block"><span>Expression</span><input class="input mono" value="settling_time(V(afe_out), 0.1%)"></label><label class="field-block"><span>Limit</span><div class="field-with-unit"><select class="select"><option>≤</option><option>≥</option><option>inside</option></select><input class="input mono" value="5"><span class="unit">ms</span></div></label><label class="field-block"><span>Aggregation</span><select class="select"><option>Every required PVT point</option><option>Worst case</option><option>Nominal only</option></select></label></div></section><section class="table-card span-2"><div class="card-head"><h3>Compatibility preview</h3></div><table class="data-table"><thead><tr><th>Required dataset</th><th>Mapped output</th><th>Coverage</th><th>Status</th></tr></thead><tbody><tr><td>TRAN</td><td class="mono">V(afe_out)</td><td>15 PVT points</td><td class="ok-text">executable</td></tr></tbody></table></section></div>` };
    if (action === "rescan-libraries") return { title: "Rescan model libraries", eyebrow: "MODELS · CONTROLLED DISCOVERY", primary: "Rescan and reconcile", body: `<div class="concept-banner">${iconSvg("refresh")}The resolver compares content digests before changing the project lock. New or changed definitions require explicit reconciliation.</div><table class="data-table"><thead><tr><th>Location</th><th>Scope</th><th>Last scan</th><th>Expected change</th></tr></thead><tbody><tr><td class="mono">project/models</td><td>project</td><td>34 s ago</td><td class="ok-text">none</td></tr><tr><td class="mono">~/RSpice/libraries</td><td>workspace</td><td>18 min ago</td><td>1 updated package</td></tr><tr><td class="mono">org://analog-qualified</td><td>managed</td><td>2 h ago</td><td class="ok-text">none</td></tr></tbody></table><div class="setting-row"><div><strong>Conflict policy</strong><small>Never changes resolution silently.</small></div><select class="select"><option>Review every changed digest</option><option>Accept signed patch updates</option></select></div>` };
    if (action === "find-netlist") return { title: "Find and replace in source", eyebrow: "SOURCE EDITOR · SCOPED SEARCH", primary: "Find next", body: `<div class="setting-row"><div><strong>Find</strong><small>Searches editable source and generated references.</small></div><input class="input mono" value="OPA189_A" autofocus></div><div class="setting-row"><div><strong>Replace</strong><small>Replacement is enabled only for owned source.</small></div><input class="input mono" value="OPA189_A"></div><div class="setting-row"><div><strong>Scope</strong><small>Generated netlists remain immutable.</small></div><select class="select"><option>Current editable source</option><option>All owned source files</option><option>Project references · find only</option></select></div><div class="setting-row"><div><strong>Options</strong></div><div class="settings-inline-actions"><label class="check-row"><input type="checkbox" checked> Match case</label><label class="check-row"><input type="checkbox"> Whole symbol</label><label class="check-row"><input type="checkbox"> Regular expression</label></div></div><div class="concept-banner">${iconSvg("search")}3 matches · lines 20, 21 and 87 · no generated artifact will be modified.</div>` };
    if (action === "netlist-validation") return { title: "Netlist validation report", eyebrow: "SOURCE · STRUCTURE AND SEMANTICS", primary: "Close", body: `<table class="data-table"><thead><tr><th>Validation stage</th><th>Findings</th><th>Status</th></tr></thead><tbody><tr><td>Parser and directives</td><td>142 lines · 0 unknown directives</td><td class="ok-text">pass</td></tr><tr><td>Hierarchy and pin order</td><td>3 subcircuits · 126 instances</td><td class="ok-text">pass</td></tr><tr><td>Models and sections</td><td>7 files · section tt</td><td class="ok-text">resolved</td></tr><tr><td>Units and expressions</td><td>6 parameters · 12 measurements</td><td class="ok-text">valid</td></tr><tr><td>Numerical advisories</td><td>MAXSTEP implicit · inherited section</td><td class="warn-text">2 advisory</td></tr></tbody></table><div class="setting-row"><div><strong>Validated identity</strong><small>Bound to the current generated source and dependency set.</small></div><span class="mono">62f3…d09a · be17…481c</span></div>` };
    if (action === "run-source") return { title: "Run source deck", eyebrow: "SOURCE EXECUTION · FROZEN INPUT", primary: "Queue source run", body: `<div class="concept-banner warning">${iconSvg("warning")}This queues the owned source deck as an independent run. It does not replace the schematic-generated Lab characterization plan.</div><div class="setting-row"><div><strong>Source</strong><small>Saved, validated artifact.</small></div><span class="mono">top_override.sp · revision ${state.inputRevision}</span></div><div class="setting-row"><div><strong>Execution target</strong><small>Qualified runtime and resource policy.</small></div><select class="select"><option>Local desktop engine · 12 threads</option><option>Browser worker · preview</option><option>lab-hpc-west · 12 slots</option></select></div><div class="setting-row"><div><strong>Reference environment</strong><small>Explicit model section and temperature.</small></div><select class="select"><option>${state.planCorner}</option><option>Use deck directives only</option></select></div><div class="setting-row"><div><strong>Result ownership</strong><small>Stored separately from plan-based results.</small></div><input class="input" value="Source deck · top_override"></div>` };
    if (action === "new-cell") return { title: "Create library cell", eyebrow: "PROJECT LIBRARY · CELL AND VIEW CONTRACT", primary: "Create cell", body: `<div class="setting-row"><div><strong>Library</strong><small>Writable destination library.</small></div><select class="select"><option>Precision_Sensor_AFE</option><option>analog_blocks</option></select></div><div class="setting-row"><div><strong>Cell name</strong><small>Stable identifier used by hierarchy and source mapping.</small></div><input class="input mono" value="filter_stage"></div><div class="setting-row"><div><strong>Initial views</strong><small>Additional views can be created without changing cell identity.</small></div><div class="settings-inline-actions"><label class="check-row"><input type="checkbox" checked> schematic</label><label class="check-row"><input type="checkbox" checked> symbol</label><label class="check-row"><input type="checkbox"> behavioral</label></div></div><div class="setting-row"><div><strong>Template</strong><small>Applies grid, units and review policy.</small></div><select class="select"><option>Analog schematic · project default</option><option>Blank electrical cell</option><option>RF two-port</option></select></div>` };
    if (action === "export-results") return { title: "Export result dataset", eyebrow: "RESULTS · PRECISION-PRESERVING EXPORT", primary: "Export dataset", body: `<div class="setting-row"><div><strong>Dataset</strong><small>Immutable source manifest.</small></div><span class="mono">Run ${state.resultManifest.id} · ${state.resultManifest.runSet.pointCount} points</span></div><div class="setting-row"><div><strong>Scope</strong><small>Choose visible traces or the complete compatible dataset.</small></div><select class="select"><option>Visible plot and measurements</option><option>All saved signals</option><option>Selected PVT families</option></select></div><div class="setting-row"><div><strong>Format</strong><small>Engineering metadata is embedded where supported.</small></div><select class="select"><option>CSV bundle + manifest JSON</option><option>Touchstone</option><option>Parquet</option><option>Nutmeg RAW</option></select></div><div class="setting-row"><div><strong>Precision and sampling</strong><small>Stored samples are never silently rounded or interpolated.</small></div><select class="select"><option>Full stored f64 · accepted samples</option><option>Display precision · visible range</option><option>Resample with recorded interpolation…</option></select></div><div class="setting-row"><div><strong>Provenance</strong><small>Input, model, engine and expression digests.</small></div><label class="switch"><input type="checkbox" checked aria-label="Include complete provenance"><span></span></label></div>` };
    if (action === "configure-targets") return { title: "Configure execution targets", eyebrow: "REMOTE COMPUTE · QUALIFIED RUNTIMES", primary: "Save target configuration", body: `<table class="data-table"><thead><tr><th>Target</th><th>Transport</th><th>Capacity</th><th>Qualification</th></tr></thead><tbody><tr><td>Local desktop engine</td><td>native</td><td>12 threads · 2 GiB</td><td class="ok-text">release</td></tr><tr><td>lab-hpc-west</td><td>TLS scheduler</td><td>12 / 64 slots</td><td class="warn-text">preview</td></tr><tr><td>Browser worker</td><td>WASM</td><td>1 worker · 2 GiB</td><td class="ok-text">release interpreter</td></tr></tbody></table><div class="setting-row"><div><strong>Endpoint</strong><small>Certificate-validated scheduler address.</small></div><input class="input mono" value="https://hpc-west.example.net/rspice"></div><div class="setting-row"><div><strong>Default queue</strong><small>Plan-specific routing may override this value.</small></div><select class="select"><option>analog-interactive</option><option>batch-standard</option><option>signoff-reserved</option></select></div><div class="setting-row"><div><strong>Health check</strong><small>Runtime, engine and license compatibility.</small></div><span class="ok-text">reachable · engine compatible</span></div>` };
    if (action === "manage-credentials") return { title: "Credential and certificate manager", eyebrow: "SECURITY · DEVICE-LOCAL SECRETS", primary: "Save security policy", body: `<div class="concept-banner">${iconSvg("info")}Credentials are stored in the operating-system credential vault. Project archives, diagnostics and browser storage never contain secrets.</div><table class="data-table"><thead><tr><th>Credential</th><th>Purpose</th><th>Storage</th><th>Status</th></tr></thead><tbody><tr><td>hpc-west</td><td>Remote scheduler</td><td>Windows Credential Manager</td><td class="ok-text">valid · 43 days</td></tr><tr><td>org-signing</td><td>Manifest signatures</td><td>Hardware-backed key</td><td class="ok-text">available</td></tr><tr><td>model-vault</td><td>Encrypted PDK access</td><td>Session token</td><td class="warn-text">expires in 2 h</td></tr></tbody></table><div class="setting-row"><div><strong>Certificate policy</strong><small>Remote targets must chain to an approved trust root.</small></div><select class="select"><option>System trust + organization roots</option><option>Organization roots only</option></select></div>` };
    if (action === "export-preferences") return { title: "Export preferences", eyebrow: "WORKSPACE · PORTABLE USER PROFILE", primary: "Export profile", body: `<div class="setting-row"><div><strong>Profile scope</strong><small>Secrets and project-specific paths are never included.</small></div><select class="select"><option>Appearance, workspace and editor behavior</option><option>All portable preferences</option><option>Keyboard shortcuts only</option></select></div><div class="setting-row"><div><strong>Format</strong></div><select class="select"><option>RSpice preferences · JSON</option><option>Organization policy overlay · YAML</option></select></div><div class="setting-row"><div><strong>Excluded</strong><small>Protected device-local state.</small></div><span class="mono">credentials · license tokens · recent paths</span></div>` };
    if (action === "reset-preferences") return { title: "Reset workspace preferences", eyebrow: "WORKSPACE · REVERSIBLE RESET", primary: "Reset selected preferences", body: `<div class="concept-banner warning">${iconSvg("warning")}A recovery copy of the current preferences is retained for 24 hours. Project data, results, credentials and licensing are not changed.</div><div class="setting-row"><div><strong>Reset scope</strong></div><select class="select"><option>Workspace layout only</option><option>Appearance and accessibility</option><option>All user preferences</option></select></div><div class="setting-row"><div><strong>Restore defaults for</strong></div><div class="settings-value-stack"><span>dock geometry · console behavior</span><span>toolbars · document restoration</span></div></div>` };
    if (action === "manage-integrations") return { title: "Integration manager", eyebrow: "AUTOMATION · CONTROLLED EXTERNAL ACCESS", primary: "Apply integration policy", body: `<table class="data-table"><thead><tr><th>Integration</th><th>Scope</th><th>Authentication</th><th>Status</th></tr></thead><tbody><tr><td>Git</td><td>Project source and reports</td><td>OS credential vault</td><td class="ok-text">connected</td></tr><tr><td>CI webhook</td><td>Immutable run manifests</td><td>Signed requests</td><td class="ok-text">enabled</td></tr><tr><td>Python automation</td><td>Local API</td><td>Process sandbox</td><td class="ok-text">enabled</td></tr><tr><td>Issue tracker</td><td>Waivers and failures</td><td>not configured</td><td>disabled</td></tr></tbody></table><div class="setting-row"><div><strong>New integration policy</strong><small>External writes require an explicit scope and review.</small></div><select class="select"><option>Deny until approved</option><option>Allow organization-signed integrations</option></select></div>` };
    if (action === "manage-roles") return { title: "Roles, approvals and design locks", eyebrow: "GOVERNANCE · PROJECT AUTHORITY", primary: "Save governance policy", body: `<table class="data-table"><thead><tr><th>Role</th><th>Members</th><th>Authority</th><th>Required approval</th></tr></thead><tbody><tr><td>Design owner</td><td>J. Whitfield</td><td>Schematic, plans, baselines</td><td>Baseline promotion</td></tr><tr><td>Verification owner</td><td>M. Chen</td><td>DRC, waivers, release gates</td><td>Sign-off package</td></tr><tr><td>Model librarian</td><td>A. Singh</td><td>PDKs and qualified models</td><td>Model promotion</td></tr><tr><td>Reviewer</td><td>4 members</td><td>Read and comment</td><td>none</td></tr></tbody></table><div class="setting-row"><div><strong>Concurrent editing</strong><small>Locks are scoped to a cell/view, not the whole project.</small></div><select class="select"><option>Optimistic editing + merge review</option><option>Exclusive cell/view locks</option></select></div><div class="setting-row"><div><strong>Protected actions</strong><small>Always require independent approval.</small></div><span>baseline · waiver · PDK · release package</span></div>` };
    if (action === "support-bundle") return { title: "Create support bundle", eyebrow: "SUPPORT · PRIVACY-SAFE DIAGNOSTICS", primary: "Create encrypted bundle", body: `<div class="concept-banner">${iconSvg("info")}Project schematics, model contents, source decks and waveform samples are excluded unless explicitly added on the next review step.</div><table class="data-table"><thead><tr><th>Content</th><th>Included</th><th>Privacy</th></tr></thead><tbody><tr><td>Application build and platform</td><td class="ok-text">yes</td><td>non-sensitive</td></tr><tr><td>Crash and performance traces</td><td class="ok-text">yes</td><td>paths redacted</td></tr><tr><td>Solver diagnostic summary</td><td class="ok-text">yes</td><td>values quantized</td></tr><tr><td>Project and model contents</td><td>no</td><td>excluded</td></tr><tr><td>Waveform samples</td><td>no</td><td>excluded</td></tr></tbody></table><div class="setting-row"><div><strong>Encryption</strong><small>Bundle can be opened only by RSpice Support.</small></div><span class="mono">support-public-key · 2026.2</span></div>` };
    if (action === "borrow-license") return { title: "Borrow simulation entitlement", eyebrow: "LICENSING · OFFLINE CHECKOUT", primary: "Borrow entitlement", body: `<div class="setting-row"><div><strong>Feature set</strong><small>Available from the organization pool.</small></div><select class="select"><option>RSpice Professional + RF</option><option>RSpice Professional</option></select></div><div class="setting-row"><div><strong>Offline duration</strong><small>Returns automatically at expiration.</small></div><select class="select"><option>7 days</option><option>24 hours</option><option>14 days</option></select></div><div class="setting-row"><div><strong>Pool availability</strong><small>Checked immediately before checkout.</small></div><span class="ok-text">8 of 24 seats available</span></div><div class="setting-row"><div><strong>Device</strong><small>Hardware-bound encrypted lease.</small></div><span class="mono">JMW-04 · Windows 11</span></div>` };
    if (action === "check-updates") return { title: "RSpice update channel", eyebrow: "PRODUCT · SIGNED RELEASES", primary: "Check for updates", body: `<div class="setting-row"><div><strong>Installed</strong><small>Current application and engine bundle.</small></div><span class="mono">RSpice 1.0.0 · engine ${ENGINE_BUILD}</span></div><div class="setting-row"><div><strong>Channel</strong><small>Only cryptographically signed builds are accepted.</small></div><select class="select"><option>Stable</option><option>Long-term support</option><option>Preview · non-production</option></select></div><div class="setting-row"><div><strong>Rollback</strong><small>Previous compatible build is retained after update.</small></div><label class="switch"><input type="checkbox" checked aria-label="Retain rollback build"><span></span></label></div><div class="setting-row"><div><strong>Update eligibility</strong></div><span class="ok-text">active through 2027-07-01</span></div>` };
    if (action === "calculator") return { title: "Waveform calculator", eyebrow: "RESULTS · TYPED EXPRESSION", primary: "Add expression", body: `<div class="setup-workspace-grid" style="padding:0"><section class="table-card span-2"><div class="card-head"><h3>Expression</h3><span class="mini-badge ok">unit: dB</span></div><div class="section-body"><label class="field-block"><span>Formula</span><textarea class="input mono" rows="4">db20(V(afe_out) / V(sensor_p, sensor_n))</textarea></label><div class="property-list"><div class="property-row"><span>Domain</span><span class="property-value">AC frequency</span></div><div class="property-row"><span>Dependencies</span><span class="property-value">2 complex waveforms</span></div><div class="property-row"><span>Evaluation</span><span class="property-value">full f64 / complex128</span></div></div></div></section><section class="table-card"><div class="card-head"><h3>Functions</h3></div><div class="section-body"><div class="selection-chip-grid"><button class="mini-badge">db20()</button><button class="mini-badge">phase()</button><button class="mini-badge">deriv()</button><button class="mini-badge">integ()</button><button class="mini-badge">cross()</button><button class="mini-badge">clip()</button></div></div></section><section class="table-card"><div class="card-head"><h3>Preview</h3></div><div class="section-body"><div class="metric-value">40.0068 <small>dB @ 10 Hz</small></div><p class="muted">Expression is dimensionally valid over the selected AC dataset.</p></div></section></div>` };
    if (action === "add-trace") return { title: "Add traces", eyebrow: "RESULTS · SIGNAL BROWSER", primary: "Add 4 traces", body: `<label class="panel-search" style="margin:0 0 10px">${iconSvg("search")}<input aria-label="Search available traces" placeholder="Search 83 nodes, currents and expressions…"></label><table class="data-table"><thead><tr><th></th><th>Signal</th><th>Domain</th><th>Unit</th><th>Latest / range</th></tr></thead><tbody><tr><td><input type="checkbox" checked aria-label="Add V(afe_out)"></td><td class="mono">V(afe_out)</td><td>TRAN · AC · NOISE</td><td>V</td><td>5.000 V</td></tr><tr><td><input type="checkbox" checked aria-label="Add V(sensor_p)"></td><td class="mono">V(sensor_p)</td><td>TRAN · AC</td><td>V</td><td>12.4 mV</td></tr><tr><td><input type="checkbox" checked aria-label="Add V(sensor_n)"></td><td class="mono">V(sensor_n)</td><td>TRAN · AC</td><td>V</td><td>10.8 mV</td></tr><tr><td><input type="checkbox" checked aria-label="Add I(VDD)"></td><td class="mono">I(VDD)</td><td>OP · TRAN</td><td>A</td><td>1.823 mA</td></tr></tbody></table>` };
    if (action === "new-plot" || action === "all-viewers") {
      const activeResultName = state.activeDocuments.results || resolvedDocuments("results")[0]?.name || "";
      const activeResultManifest = resultDatasetForName(activeResultName).manifest;
      const viewerRows = RESULT_VIEWERS.map(([, , label, requirements]) => {
        const available = !requirements || requirements.some((analysis) => activeResultManifest.analyses.includes(analysis));
        const requirement = requirements ? requirements.map((id) => analysisDefinition(id).code).join(" or ") : "any completed dataset";
        return `<tr><td>${label}</td><td>${requirement}</td><td><span class="mini-badge ${available ? "ok" : ""}">${available ? "available" : "requires analysis"}</span></td></tr>`;
      }).join("");
      return { title: "New visualization", eyebrow: "RESULTS · VIEWER COMPATIBILITY", primary: "Create visualization", body: `<div class="preset-grid"><button class="preset-card selected"><strong>Waveform panes</strong><small>Time, DC or parametric axes</small></button><button class="preset-card"><strong>Frequency response</strong><small>Bode, noise and transfer functions</small></button><button class="preset-card"><strong>RF network</strong><small>Smith, polar and mixed-mode S-parameters</small></button><button class="preset-card"><strong>Statistical</strong><small>Histogram, CDF, scatter and yield</small></button></div><div class="setting-row"><div><strong>Dataset</strong><small>Compatible viewers update with the selected immutable result.</small></div><select class="select"><option>${activeResultManifest.id} · ${activeResultManifest.runSet.name}</option><option>${state.resultManifest.id} · current PVT result</option><option>39 · SS / 125 °C diagnostic</option><option>yield_1000 · variation fixture</option></select></div><div class="setting-row"><div><strong>Layout</strong><small>Visualizations remain editable after creation.</small></div><select class="select"><option>Two linked panes</option><option>Single pane</option><option>2 × 2 engineering sheet</option></select></div><section class="table-card"><div class="card-head"><h3>Compatible viewers for dataset ${activeResultManifest.id}</h3><span class="mini-badge ok">availability gated</span></div><table class="data-table"><thead><tr><th>Viewer</th><th>Required result</th><th>Status</th></tr></thead><tbody>${viewerRows}</tbody></table></section>` };
    }
    if (action === "compare-datasets" || action === "compare-result") return { title: "Compare result datasets", eyebrow: "RESULTS · IMMUTABLE OVERLAY", primary: "Create comparison", body: `<div class="setting-row"><div><strong>Reference</strong><small>Selected immutable dataset.</small></div><select class="select"><option>${resultDatasetForName(state.activeDocuments.results || "").manifest.id} · selected dataset</option></select></div><div class="setting-row"><div><strong>Comparison</strong><small>Previous or golden result.</small></div><select class="select"><option>Run 39 · SS / 125 °C</option><option>Run 38 · approved baseline</option><option>yield_1000 · extrema</option></select></div><div class="setting-row"><div><strong>Alignment</strong><small>Preserves accepted samples and records interpolation.</small></div><select class="select"><option>First threshold crossing</option><option>Absolute X axis</option><option>Cross-correlation</option></select></div><div class="setting-row"><div><strong>Difference trace</strong><small>Generate absolute, relative and normalized differences.</small></div><label class="switch"><input type="checkbox" checked aria-label="Generate difference traces"><span></span></label></div>` };
    if (action === "compare-drc") return { title: "Compare DRC runs", eyebrow: "PHYSICAL VERIFICATION · RESULT DELTA", primary: "Create marker comparison", body: `<div class="setting-row"><div><strong>Reference result</strong><small>Current immutable result database.</small></div><select class="select"><option>Run 42 · layout L42 · deck v12</option></select></div><div class="setting-row"><div><strong>Comparison result</strong><small>Markers are matched by rule, hierarchy and geometry overlap.</small></div><select class="select"><option>Run 41 · layout L41 · deck v12</option><option>Golden sign-off · layout L39</option></select></div><div class="setting-row"><div><strong>Geometry tolerance</strong><small>Used only to correlate moved markers; rule evaluation is unchanged.</small></div><input class="input mono" value="0.020 µm" aria-label="DRC marker correlation tolerance"></div><table class="data-table"><thead><tr><th>Delta class</th><th>Count</th><th>Meaning</th></tr></thead><tbody><tr><td class="error-text">New</td><td>4</td><td>present only in Run 42</td></tr><tr><td class="ok-text">Resolved</td><td>11</td><td>present only in Run 41</td></tr><tr><td>Persistent</td><td>22</td><td>same rule and overlapping geometry</td></tr><tr><td>Disposition changed</td><td>1</td><td>waiver or review state changed</td></tr></tbody></table>` };
    if (action === "waive-drc") { const marker = DRC_MARKERS.find((candidate) => candidate.id === state.selectedDrcMarker) || DRC_MARKERS[0]; return { title: `Request waiver · ${marker.id}`, eyebrow: "DRC · GOVERNED EXCEPTION", primary: "Submit for approval", body: `<div class="drc-waiver-notice"><span aria-hidden="true">△</span><div><strong>Governed exception, not rule suppression</strong><p>The marker remains in the immutable result database. Any approval is bound to this rule, geometry, layout revision and deck revision; a mismatch or expiry blocks sign-off.</p></div></div><div class="drc-waiver-grid"><section class="drc-waiver-section"><div class="drc-waiver-section-head"><strong>Marker contract</strong><span class="drc-inline-status error">${marker.id} · blocking</span></div><dl class="drc-waiver-facts"><div><dt>Rule</dt><dd>${marker.rule}</dd></div><div><dt>Measured / required</dt><dd class="error-text">${marker.measured} / ${marker.required}</dd></div><div><dt>Hierarchy</dt><dd>${marker.path}</dd></div><div><dt>Layout / deck</dt><dd>L42 / demo180_drc_v12</dd></div></dl></section><section class="drc-waiver-section"><div class="drc-waiver-section-head"><strong>Approval route</strong><span class="drc-inline-status warn">two approvals</span></div><div class="drc-waiver-form"><label class="field-block"><span>Reason code</span><select class="select"><option>Foundry-approved analog exception</option><option>False positive · deck issue</option><option>Intentional density exception</option><option>Temporary review waiver</option></select></label><label class="field-block"><span>Owner</span><input class="input" value="J. Whitfield · Physical Design"></label><label class="field-block"><span>Expiry</span><select class="select"><option>This tapeout revision only</option><option>Until deck revision changes</option><option>Explicit date…</option></select></label></div></section><section class="drc-waiver-section drc-waiver-evidence"><div class="drc-waiver-section-head"><strong>Justification & evidence</strong><span class="drc-inline-status warn">required before submission</span></div><div class="drc-waiver-evidence-body"><label class="field-block"><span>Technical justification</span><textarea class="input" rows="3" placeholder="Explain why the geometry is safe, why a compliant change is not appropriate, and what evidence supports the exception."></textarea></label><div class="drc-waiver-attachments"><button class="button" type="button" data-surface-action="attach-foundry-evidence">Attach foundry disposition…</button><button class="button" type="button" data-surface-action="attach-simulation-evidence">Attach simulation evidence…</button><button class="button" type="button" data-surface-action="link-change-request">Link issue / change request…</button></div><p>Submission records the requester and timestamp. Approval must come from both physical-verification and design authorities.</p></div></section></div>` }; }
    if (action === "history-drc") return { title: "DRC disposition history", eyebrow: "PHYSICAL VERIFICATION · AUDIT TRAIL", primary: "Close", body: `<table class="data-table"><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Scope</th><th>Result</th></tr></thead><tbody><tr><td class="mono">2026-07-10 14:22Z</td><td>J. Whitfield</td><td>assigned review</td><td>${state.selectedDrcMarker}</td><td>owner recorded</td></tr><tr><td class="mono">2026-07-10 14:18Z</td><td>DRC importer</td><td>created marker</td><td>Run 42 / L42</td><td>open · blocking</td></tr><tr><td class="mono">2026-07-09 19:31Z</td><td>Run 41</td><td>correlation</td><td>overlapping geometry</td><td>persistent marker</td></tr></tbody></table>` };
    if (action === "open-source-deck" || action === "create-override") return { title: action === "open-source-deck" ? "Create editable source deck" : "Create generated-netlist override", eyebrow: "NETLIST OWNERSHIP", primary: action === "open-source-deck" ? "Create source deck" : "Create override patch", body: `<div class="concept-banner">${iconSvg("info")}The generated schematic netlist remains immutable. Your editable artifact records its base revision, ownership and regeneration behavior.</div><div class="setting-row"><div><strong>Artifact name</strong><small>Project-owned source file.</small></div><input class="input mono" value="top_override.sp"></div><div class="setting-row"><div><strong>Base revision</strong><small>Used for three-way regeneration comparisons.</small></div><span class="mono">${state.inputRevision}</span></div><div class="setting-row"><div><strong>Scope</strong><small>Prefer narrow, reviewable changes.</small></div><select class="select"><option>${action === "open-source-deck" ? "Standalone source deck" : "Parameter and option override"}</option><option>Include-order override</option><option>Analysis-only deck</option></select></div>` };
    if (action === "pwl") return { title: "Piecewise-linear source editor", eyebrow: "SOURCE · PWL · UNIT SAFE", primary: "Create PWL source", body: `<div class="setup-workspace-grid" style="padding:0"><section class="table-card span-2"><div class="card-head"><h3>VIN_CAL waveform points</h3><span class="mini-badge ok">strictly increasing time</span></div><table class="data-table"><thead><tr><th>Point</th><th>Time</th><th>Value</th><th>Interpolation</th><th>Derivative</th><th></th></tr></thead><tbody><tr><td>1</td><td><input class="input mono" value="0 s" aria-label="Point 1 time"></td><td><input class="input mono" value="0 V" aria-label="Point 1 value"></td><td>hold</td><td>—</td><td><button class="icon-button" aria-label="Delete point 1">×</button></td></tr><tr><td>2</td><td><input class="input mono" value="1 ms" aria-label="Point 2 time"></td><td><input class="input mono" value="5 V" aria-label="Point 2 value"></td><td>linear</td><td class="mono">5.000 kV/s</td><td><button class="icon-button" aria-label="Delete point 2">×</button></td></tr><tr><td>3</td><td><input class="input mono" value="4 ms" aria-label="Point 3 time"></td><td><input class="input mono" value="5 V" aria-label="Point 3 value"></td><td>hold</td><td class="mono">0 V/s</td><td><button class="icon-button" aria-label="Delete point 3">×</button></td></tr><tr><td>4</td><td><input class="input mono" value="5 ms" aria-label="Point 4 time"></td><td><input class="input mono" value="0 V" aria-label="Point 4 value"></td><td>linear</td><td class="mono">−5.000 kV/s</td><td><button class="icon-button" aria-label="Delete point 4">×</button></td></tr></tbody></table></section><section class="table-card"><div class="card-head"><h3>Source policy</h3></div><div class="section-body"><label class="field-block"><span>Repeat</span><select class="select"><option>No repeat</option><option>Repeat after 5 ms</option></select></label><label class="field-block"><span>Discontinuities</span><select class="select"><option>Insert solver breakpoints</option><option>Smooth with transition</option></select></label><button class="button" style="margin-top:8px" data-surface-action="import-pwl-csv">Import CSV points…</button></div></section><section class="table-card"><div class="card-head"><h3>Validated preview</h3><span class="mini-badge ok">4 points</span></div><div class="regression-wave-preview" aria-label="PWL source preview"><div class="wave-current"></div><span class="envelope-label">0 V → 5 V → 0 V · 5 ms</span></div></section></div>` };
    if (action === "import-dataset") return { title: "Import result dataset", eyebrow: "RESULTS · VALIDATED INGEST", primary: "Import as immutable dataset", body: `<div class="concept-banner">${iconSvg("info")}Imported samples are never presented as native solver output. The source format, file digest, units, mapping, interpolation and conversion warnings remain attached to the dataset.</div><div class="setup-workspace-grid" style="padding:0"><section class="table-card"><div class="card-head"><h3>1 · Source</h3><span class="mini-badge ok">recognized</span></div><div class="section-body"><label class="field-block"><span>Format</span><select class="select"><option>Cadence PSF / PSF-Lite</option><option>Nutmeg RAW</option><option>Touchstone</option><option>CSV / TSV</option></select></label><label class="field-block"><span>File</span><input class="input mono" value="reference/afe_nominal.psf"></label><div class="property-list"><div class="property-row"><span>Digest</span><span class="property-value mono">9f2a…e811</span></div><div class="property-row"><span>Size</span><span class="property-value">18.4 MiB</span></div></div></div></section><section class="table-card"><div class="card-head"><h3>2 · Dataset contract</h3></div><div class="section-body"><label class="field-block"><span>Analysis domain</span><select class="select"><option>Transient · time</option><option>AC · complex frequency</option><option>DC sweep</option></select></label><label class="field-block"><span>Duplicate samples</span><select class="select"><option>Preserve with event ordering</option><option>Reject import</option></select></label><label class="field-block"><span>Precision</span><select class="select"><option>Preserve source f64</option><option>Promote f32 to f64</option></select></label></div></section><section class="table-card span-2"><div class="card-head"><h3>3 · Signal and unit mapping</h3><span class="mini-badge warn">1 review</span></div><table class="data-table"><thead><tr><th>Source signal</th><th>RSpice expression</th><th>Source unit</th><th>Resolved unit</th><th>Samples</th><th>Status</th></tr></thead><tbody><tr><td class="mono">/afe_out</td><td class="mono">V(afe_out)</td><td>V</td><td>V</td><td>20,001</td><td><span class="mini-badge ok">mapped</span></td></tr><tr><td class="mono">/VDD:p</td><td class="mono">I(VDD)</td><td>A</td><td>A</td><td>20,001</td><td><span class="mini-badge ok">mapped</span></td></tr><tr><td class="mono">/gain_expr</td><td class="mono">imported::gain_expr</td><td>—</td><td>dimensionless</td><td>20,001</td><td><span class="mini-badge warn">review unit</span></td></tr></tbody></table></section></div>` };
    if (["open-project", "recent-projects", "new-project", "import-project", "export-project"].includes(action)) {
      const creating = action === "new-project";
      const importing = action === "import-project";
      const exporting = action === "export-project";
      const title = creating ? "Create RSpice project" : importing ? "Import design or project" : exporting ? "Export portable project archive" : "Open RSpice project";
      const primary = creating ? "Create project" : importing ? "Validate import" : exporting ? "Create archive" : "Open selected project";
      return { title, eyebrow: "PROJECT LIFECYCLE · TRANSACTIONAL · PORTABLE", primary, body: `<div class="setup-workspace-grid" style="padding:0"><section class="table-card span-2"><div class="card-head"><h3>${exporting ? "Archive composition" : creating ? "Project identity" : "Source and format"}</h3><span class="mini-badge ok">non-destructive</span></div><div class="section-body form-grid">${exporting ? '<label class="check-row"><input type="checkbox" checked> Schematics, symbols, plans and specifications</label><label class="check-row"><input type="checkbox" checked> Locked model/dependency manifest</label><label class="check-row"><input type="checkbox"> Result datasets (684 MiB)</label><label class="check-row"><input type="checkbox" checked> Recovery history summary</label>' : `<label class="field-block"><span>${creating ? "Project name" : "Path or archive"}</span><input class="input mono" value="${creating ? "precision_sensor_afe" : "~/RSpice/afe/precision_sensor_afe.rspiceproj"}"></label><label class="field-block"><span>Format</span><select class="select"><option>${importing ? "SPICE / Spectre source deck" : "RSpice project 1.0"}</option><option>${importing ? "EDIF schematic" : "Portable .rspicepkg archive"}</option><option>${importing ? "KiCad netlist" : "Read-only recovery copy"}</option></select></label>`}</div></section><section class="table-card"><div class="card-head"><h3>Safety contract</h3></div><div class="section-body property-list"><div class="property-row"><span>Existing files</span><span class="property-value">never overwritten implicitly</span></div><div class="property-row"><span>Migration</span><span class="property-value">transactional copy</span></div><div class="property-row"><span>External references</span><span class="property-value">review before attach</span></div><div class="property-row"><span>Secrets</span><span class="property-value">excluded by default</span></div></div></section><section class="table-card"><div class="card-head"><h3>Validation preview</h3><span class="mini-badge ok">ready</span></div><div class="section-body property-list"><div class="property-row"><span>Writable location</span><span class="property-value ok-text">verified</span></div><div class="property-row"><span>Schema</span><span class="property-value ok-text">compatible</span></div><div class="property-row"><span>Libraries</span><span class="property-value">4 resolvable</span></div><div class="property-row"><span>Estimated size</span><span class="property-value">${exporting ? "18.7 MiB" : "6.4 MiB"}</span></div></div></section></div>` };
    }
    if (action === "create-hierarchy") return { title: "Create hierarchical cell", eyebrow: "SCHEMATIC · CELL / VIEW CONTRACT", primary: "Create and descend", body: `<div class="setting-row"><div><strong>Cell and view</strong><small>Stable library identity used by hierarchy and netlisting.</small></div><div><input class="input mono" value="sensor_frontend" aria-label="New cell name"> <select class="select" aria-label="New cell view"><option>schematic</option><option>symbol</option></select></div></div><div class="setting-row"><div><strong>Source selection</strong><small>Selected instances move transactionally; nets become explicit ports.</small></div><span class="mini-badge ok">U1 · U2 · RG · 6 nets</span></div><table class="data-table"><thead><tr><th>Port</th><th>Direction</th><th>Discipline</th><th>Net</th></tr></thead><tbody><tr><td>INP</td><td>input</td><td>electrical</td><td>sensor_p</td></tr><tr><td>INN</td><td>input</td><td>electrical</td><td>sensor_n</td></tr><tr><td>OUT</td><td>output</td><td>electrical</td><td>afe_out</td></tr><tr><td>VDD / VSS</td><td>inout</td><td>electrical</td><td>vdd / vss</td></tr></tbody></table>` };
    if (["help-center", "feature-availability", "about"].includes(action)) {
      const availabilityRows = analysisCatalog.map((analysis) => `<tr><td>${analysis.code}</td><td>${analysis.title}</td><td>${analysisAvailabilityLabel(analysis.availability)}</td><td>${analysis.availability === "production" ? "desktop · web · tablet" : "review contract"}</td></tr>`).join("");
      return { title: action === "about" ? "About RSpice" : action === "feature-availability" ? "Feature availability and qualification" : "RSpice Help Center", eyebrow: "HELP · VERSIONED PRODUCT CONTRACT", primary: "Close", body: action === "about" ? `<div class="project-hero"><div class="project-mark">R</div><div><h2>RSpice Workbench</h2><p>Version 1.0.0 · engine ${ENGINE_BUILD} · project schema 1.0.</p></div></div><div class="property-list"><div class="property-row"><span>Edition</span><span class="property-value">Professional</span></div><div class="property-row"><span>Update channel</span><span class="property-value">Stable · signed releases</span></div><div class="property-row"><span>License</span><span class="property-value ok-text">activated · offline verified</span></div><div class="property-row"><span>Support entitlement</span><span class="property-value">active through 2027-07-01</span></div></div><div class="section-body" style="display:flex;gap:6px"><button class="button" data-surface-action="check-updates">Check for updates…</button><button class="button" data-surface-action="support-bundle">Create support bundle…</button></div>` : action === "feature-availability" ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Code</th><th>Analysis</th><th>Engine readiness</th><th>Platform / evidence</th></tr></thead><tbody>${availabilityRows}</tbody></table></div>` : `<label class="panel-search" style="margin-bottom:10px">${iconSvg("search")}<input aria-label="Search help topics" placeholder="Search analyses, convergence, models, plots…"></label><div class="preset-grid"><button class="preset-card"><strong>Design entry</strong><small>Hierarchy, wiring, parameters and checks</small></button><button class="preset-card"><strong>Simulation</strong><small>Analyses, solver policy and diagnostics</small></button><button class="preset-card"><strong>Results</strong><small>Plots, expressions, cursors and exports</small></button><button class="preset-card"><strong>Verification</strong><small>Gates, provenance and review workflows</small></button></div>` };
    }
    if (action === "commit-tuning") return { title: "Commit tuned parameters", eyebrow: "TUNING · REVIEWABLE WORKING CHANGE", primary: "Commit to working revision", body: `<div class="concept-banner warning">${iconSvg("warning")}This commit changes design inputs. Existing checks and results remain preserved but become stale until the revised design is validated and simulated.</div><table class="data-table"><thead><tr><th>Parameter</th><th>Committed</th><th>Proposed</th><th>Delta</th><th>Destination</th></tr></thead><tbody><tr><td>RGAIN</td><td class="mono">${state.tuningBaseline.RGAIN.toFixed(1)} Ω</td><td class="mono">${state.tuningValues.RGAIN.toFixed(1)} Ω</td><td class="mono">${(state.tuningValues.RGAIN - state.tuningBaseline.RGAIN).toFixed(1)} Ω</td><td>schematic parameter</td></tr><tr><td>CFILT</td><td class="mono">${state.tuningBaseline.CFILT.toFixed(2)} nF</td><td class="mono">${state.tuningValues.CFILT.toFixed(2)} nF</td><td class="mono">${(state.tuningValues.CFILT - state.tuningBaseline.CFILT).toFixed(2)} nF</td><td>project parameter</td></tr><tr><td>VREF</td><td class="mono">${state.tuningBaseline.VREF.toFixed(3)} V</td><td class="mono">${state.tuningValues.VREF.toFixed(3)} V</td><td class="mono">${(state.tuningValues.VREF - state.tuningBaseline.VREF).toFixed(3)} V</td><td>project parameter</td></tr></tbody></table><div class="property-list" style="margin-top:10px"><div class="property-row"><span>New simulation</span><span class="property-value">required</span></div><div class="property-row"><span>Release evidence</span><span class="property-value">never copied from sandbox</span></div><div class="property-row"><span>Change set</span><span class="property-value">one transactional working revision</span></div></div>` };
    if (action === "generate-report") {
      const eligible = state.resultManifest.qualification.signOffEligible && state.resultPassedSpecCount === state.resultSpecCount && DRC_MARKERS.every((marker) => marker.status === "waived");
      const gateCopy = eligible
        ? `Run ${state.resultManifest.id} is eligible for a release package; approval signatures remain required.`
        : `Run ${state.resultManifest.id} is not sign-off eligible. Release verification is disabled; the generated package is watermarked as a review draft.`;
      return { title: eligible ? "Generate release verification package" : "Generate traceable review draft", eyebrow: "REPORT · TRACEABLE OUTPUT", primary: eligible ? "Generate release package" : "Generate draft package", body: `<div class="concept-banner ${eligible ? "" : "warning"}">${iconSvg(eligible ? "check" : "warning")}${gateCopy}</div><div class="setting-row"><div><strong>Template</strong><small>Versioned report structure with an enforced eligibility gate.</small></div><select class="select"><option ${eligible ? "selected" : "disabled"}>Release verification${eligible ? "" : " · unavailable"}</option><option ${eligible ? "" : "selected"}>Design review</option><option>Model qualification</option></select></div><div class="setting-row"><div><strong>Sections</strong><small>All figures link to immutable results and their calculation definitions.</small></div><div class="selection-chip-grid"><button class="mini-badge accent">Nominal</button><button class="mini-badge accent">PVT</button><button class="mini-badge accent">Yield</button><button class="mini-badge accent">Reliability</button><button class="mini-badge accent">Regression</button><button class="mini-badge error">Physical DRC · blocked</button></div></div><div class="setting-row"><div><strong>Formats</strong><small>Machine- and human-readable deliverables.</small></div><div class="selection-chip-grid"><button class="mini-badge accent">PDF/A</button><button class="mini-badge accent">HTML</button><button class="mini-badge accent">JSON</button><button class="mini-badge">CSV bundle</button></div></div>` };
    }
    return { title: "Command unavailable", eyebrow: "RSPICE · DEFENSIVE COMMAND ROUTING", primary: "Close", body: `<div class="concept-banner warning">${iconSvg("warning")}The command <span class="mono">${escapeHtml(action)}</span> is not available in this workspace state. No project or result data was changed.</div>` };
  }

  function openWorkflow(action, onApply = null) {
    const config = workflowMarkup(action);
    const dialog = $("#workflow-dialog");
    dialog.dataset.workflow = action;
    dialog.classList.toggle("drc-workflow", ["compare-drc", "waive-drc", "history-drc"].includes(action));
    $("#workflow-dialog-title").textContent = config.title;
    $("#workflow-dialog-eyebrow").textContent = config.eyebrow;
    $("#workflow-dialog-body").innerHTML = config.body;
    $("#workflow-dialog-primary").textContent = config.primary;
    hydrateIcons(dialog);
    bindDynamicEvents();
    $("#workflow-dialog-primary").onclick = () => {
      $("#workflow-dialog").close();
      if (onApply) onApply();
      else if (action === "export-results") {
        const exported = exportPlotCsv();
        showToast("Dataset exported", `${exported.rows.toLocaleString()} ${exported.mode} rows from result ${exported.manifestId} were exported with manifest metadata.`, "success");
      }
      else if (config.primary !== "Close") showToast("Configuration applied", `${config.title} is recorded against working revision ${state.inputRevision}. Dependent results retain their immutable manifests.`, "success");
    };
    if (!dialog.open) dialog.showModal();
  }

  function selectDrcMarker(markerId) {
    if (!DRC_MARKERS.some((marker) => marker.id === markerId)) return;
    state.selectedDrcMarker = markerId;
    renderView({ focusAnchor: { dataKey: "drcMarker", value: markerId }, focusFallback: `[data-drc-marker="${markerId}"]` });
    announce(`${markerId} selected in the DRC marker database.`);
  }

  function cycleDrcMarker(direction) {
    const current = Math.max(0, DRC_MARKERS.findIndex((marker) => marker.id === state.selectedDrcMarker));
    const next = DRC_MARKERS[(current + direction + DRC_MARKERS.length) % DRC_MARKERS.length];
    selectDrcMarker(next.id);
  }

  function handleToolbarAction(action) {
    if (action === "toggle-focus-mode") { toggleWorkspaceFocus(); return; }
    if (action === "rotate-selection" || action === "mirror-selection") {
      state.componentEdits[state.selectedComponent] ||= {};
      state.componentEdits[state.selectedComponent].orientation = action === "rotate-selection" ? "rotated 90° clockwise" : "mirrored horizontally";
      markWorkspaceChanged({ checksStale: true, planStale: true });
      drawSchematic();
      showToast(action === "rotate-selection" ? "Selection rotated" : "Selection mirrored", `${state.selectedComponent} was ${state.componentEdits[state.selectedComponent].orientation}; connectivity checks are stale until refreshed.`, "success");
      return;
    }
    if (action === "drc-previous" || action === "drc-next") { cycleDrcMarker(action === "drc-next" ? 1 : -1); return; }
    if (action === "run-drc" || action === "rerun-drc") { showToast("DRC run prepared", `${action === "rerun-drc" ? "Incremental changed-geometry" : "Full hierarchical"} DRC is frozen and ready in the execution queue.`, "success"); openJobsManager(); return; }
    if (action === "drc-fit") { showToast("Marker fitted", `${state.selectedDrcMarker} is centered with its source polygons and measurement context.`, "success"); return; }
    if (action === "compare-drc") { openWorkflow("compare-drc"); return; }
    if (action === "export-drc") { openWorkflow("export-drc"); return; }
    if (action.startsWith("canvas-")) {
      const tool = action.replace("canvas-", "");
      if (tool === "fit") {
        state.canvasZoom = 1;
        $("#zoom-value").textContent = "100%";
        $("#zoom-control").setAttribute("aria-label", "Canvas zoom 100 percent");
        drawSchematic();
      }
      else if (tool === "zoom-in" || tool === "zoom-out") {
        state.canvasZoom = Math.max(0.6, Math.min(1.8, state.canvasZoom * (tool === "zoom-in" ? 1.2 : 1 / 1.2)));
        $("#zoom-value").textContent = `${Math.round(state.canvasZoom * 100)}%`;
        $("#zoom-control").setAttribute("aria-label", `Canvas zoom ${Math.round(state.canvasZoom * 100)} percent`);
        drawSchematic();
      }
      else armCanvasTool(tool);
      return;
    }
    if (action === "add-analysis") { openAnalysisPicker(); return; }
    if (action === "toggle-grid") {
      state.canvasGrid = !state.canvasGrid;
      mutatePreservingFocus(() => {
        $("#context-toolbar").innerHTML = toolbarForView(state.view);
        hydrateIcons($("#context-toolbar"));
        bindDynamicEvents();
      }, "#context-toolbar");
      drawSchematic();
      showToast("Schematic grid", `Grid and snap are ${state.canvasGrid ? "enabled" : "disabled"}.`, "success");
      return;
    }
    if (action === "open-solver") { state.simulationSection = "solver"; renderView(); return; }
    if (action === "open-jobs") { openJobsManager(); return; }
    if (action === "run-preflight" || action === "run-checks") { runPreflightChecks(); return; }
    if (action === "export-results") { openWorkflow("export-results"); return; }
    if (["new-plot", "add-trace", "calculator", "compare-datasets", "generate-report", "open-source-deck", "create-override"].includes(action)) { openWorkflow(action); return; }
    if (action === "compile-veriloga") { openCodeSurface("veriloga"); return; }
    if (action === "diff-generated") { state.activeDocuments.netlist = "generated.diff"; switchView("netlist"); return; }
    if (action === "save-source") { openWorkflow("save-source", () => { state.netlistDirty = false; state.dirtySourceDocuments.clear(); renderView(); showToast("Source saved", `Owned source was validated and saved in working revision ${state.inputRevision}.`, "success"); }); return; }
    if (action === "validate-models") { state.modelSection = "validation"; renderView(); return; }
    if (action === "add-library") { openWorkflow("add-library"); return; }
    if (action === "rescan-libraries") { openWorkflow("rescan-libraries"); return; }
    if (action === "export-manifest") { openWorkflow("export-manifest"); return; }
    if (action === "run-verification") { showToast("Verification plan prepared", "Immutable inputs, evidence requirements and execution targets are ready in the job manager.", "success"); openJobsManager(); return; }
    if (action === "refresh-verification") { renderView(); showToast("Verification refreshed", "Statistics, evidence bindings and stale-state checks were recalculated from immutable manifests.", "success"); return; }
    if (action === "compare-baseline") { openWorkflow("compare-datasets"); return; }
    if (action === "add-specification") { openWorkflow("add-specification"); return; }
    if (action === "find-netlist") { openWorkflow("find-netlist"); return; }
    if (action === "validate-netlist") { openWorkflow("netlist-validation"); return; }
    if (action === "run-source") { openWorkflow("run-source", openJobsManager); return; }
    if (action === "open-project") { openWorkflow("open-project"); return; }
    if (action === "new-cell") { openWorkflow("new-cell"); return; }
    if (action === "refresh-project") { renderView(); showToast("Project refreshed", "Libraries, dependencies, recovery state and external file digests are current.", "success"); return; }
    if (action === "duplicate-analysis") { state.activeDocuments.simulate = state.selectedAnalysis === "tran" ? "transient_setup" : "ac_stability"; renderView(); return; }
    if (action === "undo" || action === "redo") { handleExtendedMenuAction(action); return; }
    showToast("Command unavailable", `${action.replaceAll("-", " ")} is not available in the current workspace state.`, "warning");
  }

  function validateEditableSource(sourceKey) {
    if (!state.sourceValidationRequired.has(sourceKey)) return true;
    const text = state.sourceDrafts[sourceKey] || "";
    const issues = [];
    if (!text.trim()) issues.push("source is empty");
    if (sourceKey.endsWith(".va") && (!/\bmodule\b/.test(text) || !/\bendmodule\b/.test(text))) issues.push("module / endmodule pair is incomplete");
    if (sourceKey.endsWith(".rspice") && (!/\bplan\b/.test(text) || !/\bexecute\b/.test(text))) issues.push("plan and execute stages are required");
    if (sourceKey.endsWith(".sp") || sourceKey.endsWith(".lib")) {
      if (!/^\s*\.(?:include|lib|subckt|param|title)/im.test(text)) issues.push("no recognized SPICE source directive was found");
    }
    if (issues.length) {
      showToast("Source validation blocked", `${sourceKey}: ${issues.join("; ")}. No compiled artifact or run was created.`, "warning");
      return false;
    }
    state.sourceValidationRequired.delete(sourceKey);
    state.planValidated = false;
    showToast("Source validation passed", `${sourceKey} passed syntax, structure, ownership and dependency validation.`, "success");
    renderView();
    return true;
  }

  function handleSurfaceAction(action) {
    if (action === "save-source") { openWorkflow("save-source", () => { state.netlistDirty = false; state.dirtySourceDocuments.clear(); renderView(); showToast("Source saved", `Owned source was validated and saved in working revision ${state.inputRevision}.`, "success"); }); return; }
    const dialogWorkflows = [
      "analysis-options", "apply-setup", "section-primary", "descend-hierarchy", "edit-mission", "export-lockfile",
      "open-wave-diff", "optimize-save", "revert-candidate", "save-symbol", "add-specification",
      "configure-targets", "manage-credentials", "export-preferences", "reset-preferences", "manage-integrations",
      "manage-roles", "support-bundle", "borrow-license", "check-updates", "export-results", "new-cell",
      "select-result-store", "review-cache", "import-shortcuts", "export-shortcuts", "map-requirement",
      "configure-layers", "export-corner-matrix", "create-symbol", "run-qualification", "validate-bindings",
      "import-pwl-csv", "attach-foundry-evidence", "attach-simulation-evidence", "link-change-request",
      "compare-nominal", "compare-checkpoint", "restore-checkpoint", "compare-release", "create-optimization-seed",
      "export-verification-report", "import-section-map", "import-symbol", "open-form-designer", "export-manifest",
      "open-project", "export-drc"
    ];
    if (dialogWorkflows.includes(action)) { openWorkflow(action); return; }
    if (action === "post-layout") { location.href = "surface-gallery.html#post-layout"; return; }
    if (action === "open-drc") { state.verifyMode = "drc"; state.activeDocuments.verify = "Physical DRC · Run 42"; switchView("verify"); return; }
    if (action === "open-tuning") { state.verifyMode = "tuning"; state.activeDocuments.verify = resolvedDocuments("verify").find((document) => document.active)?.name; switchView("verify"); return; }
    if (["all-viewers", "compare-result", "create-override", "open-source-deck", "generate-report"].includes(action)) { openWorkflow(action); return; }
    if (action === "compare-candidate") { openWorkflow("compare-datasets"); return; }
    if (action === "compare-drc") { openWorkflow("compare-drc"); return; }
    if (["waive-drc", "history-drc"].includes(action)) { openWorkflow(action); return; }
    if (action === "locate-drc" || action === "crossprobe-drc") { showToast("DRC cross-probe", `${state.selectedDrcMarker} is linked to its layout polygons${action === "crossprobe-drc" ? " and stable schematic device identity" : ""}.`, "success"); return; }
    if (action === "revert-tuning") {
      state.tuningValues = { ...state.tuningBaseline };
      state.tuningDirty = false;
      renderView({ focusAnchor: captureFocusAnchor(), focusFallback: "#tune-rgain" });
      showToast("Tuning changes reverted", "The committed working values are restored. No schematic, netlist or result data changed.", "success");
      return;
    }
    if (action === "commit-tuning") {
      if (!state.tuningDirty) return;
      openWorkflow("commit-tuning", () => {
        state.tuningBaseline = { ...state.tuningValues };
        state.tuningDirty = false;
        state.componentEdits.RG = { ...(state.componentEdits.RG || {}), value: `${state.tuningBaseline.RGAIN.toFixed(1)} Ω` };
        markWorkspaceChanged({ checksStale: true, planStale: true });
        renderView({ focusAnchor: captureFocusAnchor(), focusFallback: "#tune-rgain" });
        showToast("Tuning values committed", `RGAIN, CFILT and VREF were applied to working revision ${state.inputRevision}; prior results remain immutable and stale.`, "warning");
      });
      return;
    }
    if (action === "apply-candidate") {
      openWorkflow("apply-candidate", () => {
        state.componentEdits.RG = { ...(state.componentEdits.RG || {}), value: "512.4 Ω" };
        markWorkspaceChanged({ checksStale: true, planStale: true });
        renderView({ focusAnchor: captureFocusAnchor(), focusFallback: "#workspace-stage h1" });
        showToast("Candidate applied as working changes", `Candidate 18 was rebased into ${state.inputRevision}; checks and prior results are retained but stale.`, "warning");
      });
      return;
    }
    if (action === "compile-veriloga") {
      if (state.codeSurface === "veriloga" && state.sourceValidationRequired.has("sensor_bridge.va")) validateEditableSource("sensor_bridge.va");
      else openCodeSurface("veriloga");
      return;
    }
    if (action === "compile-model") { openCodeSurface("veriloga"); return; }
    if (action === "manage-library") { state.modelSection = "models"; switchView("models"); return; }
    if (action === "open-worst-sample") { state.activeDocuments.results = "yield_1000"; switchView("results"); showToast("Worst sample opened", "Sample #0731 is selected with its retained parameters, corner, measurements, and failure evidence.", "success"); return; }
    if (["highlight-source", "open-device-u3"].includes(action)) { state.selectedComponent = "U3"; switchView("design"); showToast("Device cross-probed", "U3 is selected in the schematic and linked to the originating reliability rule.", "success"); return; }
    if (action === "open-operating-point") { state.activeDocuments.results = resolvedDocuments("results")[0]?.name; state.resultMode = "waves"; switchView("results"); showToast("Operating-point result opened", "The immutable OP dataset is active with device annotation links.", "success"); return; }
    if (action === "collapse-transitive") {
      const button = $('[data-surface-action="collapse-transitive"]');
      const rows = $$("#workspace-stage .models-view table.data-table tbody tr");
      const collapsed = button?.getAttribute("aria-pressed") !== "true";
      rows.forEach((row, index) => { if (index > 1) row.hidden = collapsed; });
      if (button) { button.setAttribute("aria-pressed", String(collapsed)); button.textContent = collapsed ? "Expand transitive" : "Collapse transitive"; }
      announce(collapsed ? "Transitive includes collapsed" : "Transitive includes expanded");
      return;
    }
    if (action === "validate-source") { const source = $("[data-editable-source]")?.dataset.editableSource; if (source) validateEditableSource(source); return; }
    if (action === "export-ci") { openCodeSurface("automation"); return; }
    if (action === "map-requirements") { state.simulationSection = "specifications"; switchView("simulate"); return; }
    if (action === "validate-config") { runPreflightChecks(); return; }
    if (["run-regression", "run-reliability", "run-automation"].includes(action)) {
      if (action === "run-automation" && state.sourceValidationRequired.has("characterize.rspice") && !validateEditableSource("characterize.rspice")) return;
      showToast("Job workflow prepared", `${action.replaceAll("-", " ")} is ready in the all-jobs manager with immutable inputs.`, "success");
      openJobsManager();
      return;
    }
    if (["replace-baseline", "select-baseline", "discard-candidate", "clone-plan", "attach-pdk", "create-checkpoint"].includes(action)) { openWorkflow(action); return; }
    showToast("Action unavailable", `${action.replaceAll("-", " ")} is not available in the current workspace state.`, "warning");
  }

  function bindDynamicEvents() {
    $$('[data-drc-marker]').forEach((button) => bindOnce(button, "DrcMarker", "click", () => selectDrcMarker(button.dataset.drcMarker)));
    $$('[data-drc-filter]').forEach((button) => bindOnce(button, "DrcFilter", "click", () => { state.drcFilter = button.dataset.drcFilter; renderViewAndRestoreFocus("drcFilter", state.drcFilter); }));
    $$('[data-drc-cycle]').forEach((button) => bindOnce(button, "DrcCycle", "click", () => cycleDrcMarker(button.dataset.drcCycle === "next" ? 1 : -1)));
    $$('[data-view-target]').forEach((button) => bindOnce(button, "ViewTarget", "click", () => {
      const dialog = button.closest("dialog");
      if (dialog?.open) dialog.close();
      switchView(button.dataset.viewTarget);
    }));
    $$('[data-result-document]').forEach((button) => bindOnce(button, "ResultDocument", "click", () => {
      const documentName = button.dataset.resultDocument;
      state.activeDocuments.results = documentName;
      renderView();
      requestAnimationFrame(() => $$(".document-tab").find((candidate) => candidate.dataset.docName === documentName)?.focus({ preventScroll: true }));
      announce(`${documentName} opened with its immutable manifest.`);
    }));
    $$('[data-project-section]').forEach((button) => bindOnce(button, "ProjectSection", "click", () => {
      const section = button.dataset.projectSection;
      state.projectSection = section;
      state.activeDocuments.project = resolvedDocuments("project").find((doc) => doc.active)?.name;
      renderViewAndRestoreFocus("projectSection", section);
    }));
    $$('[data-simulation-section]').forEach((button) => bindOnce(button, "SimulationSection", "click", () => {
      const section = button.dataset.simulationSection;
      state.simulationSection = section;
      state.activeDocuments.simulate = resolvedDocuments("simulate").find((doc) => doc.active)?.name;
      renderViewAndRestoreFocus("simulationSection", section);
    }));
    $$('[data-model-section]').forEach((button) => bindOnce(button, "ModelSection", "click", () => {
      const section = button.dataset.modelSection;
      state.modelSection = section;
      renderViewAndRestoreFocus("modelSection", section);
    }));
    $$('[data-code-surface]').forEach((button) => bindOnce(button, "CodeSurface", "click", () => {
      const section = button.dataset.codeSurface;
      state.codeSurface = section;
      state.activeDocuments.netlist = resolvedDocuments("netlist").find((doc) => doc.active)?.name;
      renderViewAndRestoreFocus("codeSurface", section);
    }));
    $$('[role="tab"][data-design-left]').forEach((tab) => bindOnce(tab, "TabKeys", "keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
      const list = tab.closest('[role="tablist"]');
      const tabs = $$(':scope > [role="tab"]:not([disabled])', list);
      if (!tabs.length) return;
      event.preventDefault();
      let index = tabs.indexOf(tab);
      if (event.key === "Home") index = 0;
      else if (event.key === "End") index = tabs.length - 1;
      else index = (index + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
      tabs[index].click();
    }));
    $$('[data-design-left]').forEach((button) => bindOnce(button, "DesignLeft", "click", () => {
      const designLeft = button.dataset.designLeft;
      state.designLeft = designLeft;
      renderView({ focusAnchor: { dataKey: "designLeft", value: designLeft } });
    }));
    $$('[data-analysis]').forEach((button) => bindOnce(button, "Analysis", "click", (event) => {
      if (event.target.closest(".switch")) return;
      state.selectedAnalysis = button.dataset.analysis;
      renderView();
      requestAnimationFrame(() => { const active = $(`[data-analysis="${state.selectedAnalysis}"]`); active?.focus(); active?.scrollIntoView({ block: "nearest", inline: "center" }); });
    }));
    $$('[data-analysis-toggle]').forEach((toggle) => bindOnce(toggle, "AnalysisToggle", "change", () => {
      if (toggle.checked) state.enabledAnalyses.add(toggle.dataset.analysisToggle);
      else state.enabledAnalyses.delete(toggle.dataset.analysisToggle);
      const count = state.enabledAnalyses.size;
      const toggleId = toggle.dataset.analysisToggle;
      markWorkspaceChanged({ checksStale: false });
      renderView();
      requestAnimationFrame(() => { const active = $(`[data-analysis-toggle="${toggleId}"]`); active?.focus(); active?.closest(".analysis-card")?.scrollIntoView({ block: "nearest", inline: "center" }); });
      showToast("Analysis plan updated", `${count} analyses enabled in Lab characterization. Existing results are retained and marked stale against the revised plan.`, "success");
    }));
    $$('[data-analysis-catalog]').forEach((button) => bindOnce(button, "AnalysisCatalog", "click", () => {
      const analysis = button.dataset.analysisCatalog;
      const existing = { OP: "op", TRAN: "tran", AC: "ac", DC: "dc", NOISE: "noise", SENS: "sens", STB: "stb", FOUR: "fourier" }[analysis];
      if (existing) { state.selectedAnalysis = existing; renderView(); requestAnimationFrame(() => $(`[data-analysis="${existing}"]`)?.scrollIntoView({ block: "nearest", inline: "center" })); }
      else showToast(button.classList.contains("preview") ? "Availability detail" : "Analysis catalog", `${analysis} has a dedicated setup surface in the product architecture; this focused plan keeps eight analyses active.`, button.classList.contains("preview") ? "warning" : "success");
    }));
    $$('[data-analysis-field]').forEach((field) => bindOnce(field, "AnalysisField", "change", () => {
      const fieldIndex = Number(field.dataset.analysisField);
      state.analysisValues[state.selectedAnalysis] ||= {};
      state.analysisValues[state.selectedAnalysis][fieldIndex] = field.value;
      markWorkspaceChanged({ checksStale: false });
      const analysis = state.selectedAnalysis;
      renderView();
      requestAnimationFrame(() => $(`#analysis-field-${analysis}-${fieldIndex}`)?.focus());
      showToast("Analysis setting updated", `The value is retained in working revision ${state.inputRevision} and will be frozen into the next run manifest.`, "success");
    }));
    $$('[data-result-mode]').forEach((button) => {
      bindOnce(button, "ResultMode", "click", () => {
        state.resultMode = button.dataset.resultMode;
        state.plotZoom = 1; state.plotPan = 0; state.plotTool = "cursor";
        renderView();
        requestAnimationFrame(() => { const active = $(`[data-result-mode="${state.resultMode}"]`); active?.focus(); active?.scrollIntoView({ block: "nearest", inline: "center" }); });
      });
      bindOnce(button, "ResultKeys", "keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const tabs = $$('[data-result-mode]:not(:disabled)');
        const next = tabs[(tabs.indexOf(button) + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
        state.resultMode = next.dataset.resultMode; state.plotZoom = 1; state.plotPan = 0; state.plotTool = "cursor"; renderView(); requestAnimationFrame(() => $(`[data-result-mode="${state.resultMode}"]`)?.focus());
      });
    });
    $$('[data-verify-mode]').forEach((button) => bindOnce(button, "VerifyMode", "click", () => {
      const mode = button.dataset.verifyMode;
      const label = button.querySelector("strong").textContent;
      activateDocument("verify", mode === "drc" ? "Physical DRC · Run 42" : mode === "optimization" ? "Optimization · #18" : mode === "regression" ? "Regression · main" : "Verification");
      state.verifyMode = mode;
      renderViewAndRestoreFocus("verifyMode", mode);
      showToast("Verification surface", `${label} selected.`, "success");
    }));
    $$('[data-tuning-param]').forEach((input) => bindOnce(input, "TuningParam", "input", () => {
      state.tuningValues[input.dataset.tuningParam] = Number(input.value);
      state.tuningDirty = tuningValuesDiffer();
      updateTuningPreviewChrome();
    }));
    $$('[data-property-input]').forEach((input) => bindOnce(input, "PropertyInput", "change", () => {
      state.componentEdits[state.selectedComponent] ||= {};
      state.componentEdits[state.selectedComponent][input.dataset.propertyField] = input.value;
      markWorkspaceChanged({ checksStale: true });
      renderDocuments();
      if (state.view === "design") {
        $("#left-panel-content").innerHTML = leftPanelForView("design");
        hydrateIcons($("#left-panel-content"));
        bindDynamicEvents();
      }
      const edited = state.componentEdits[state.selectedComponent];
      $("#selection-status").textContent = `${edited.instance || state.selectedComponent} · ${edited.value || (state.selectedComponent === "RG" ? "499 Ω" : state.selectedComponent === "U3" ? "OPA2189" : "OPA189")}`;
      drawSchematic();
      showToast("Design changed", `Run ${state.runId} is stale against ${state.inputRevision}. Re-run preflight and simulation to refresh checks and measurements.`, "warning");
      announce("Design changed. Checks and results are stale.");
    }));
    $$('[data-select-component]').forEach((button) => bindOnce(button, "SelectComponent", "click", () => selectComponent(button.dataset.selectComponent)));
    $$('[data-canvas-tool]').forEach((button) => bindOnce(button, "CanvasTool", "click", () => armCanvasTool(button.dataset.canvasTool)));
    const plotActionLabels = {
      cursor: "Toggle linked A and B cursors",
      zoom: "Zoom plot in",
      pan: "Pan the plot viewport",
      log: "Toggle logarithmic axis",
      zoomin: "Zoom plot in",
      zoomout: "Zoom plot out",
      fit: "Fit all result data",
      grid: "Toggle logarithmic axis",
      refresh: "Reset plot view",
      export: "Export visible result data"
    };
    $$('[data-plot-action]').forEach((button) => {
      button.setAttribute("aria-label", plotActionLabels[button.dataset.plotAction] || button.dataset.plotAction.replaceAll("-", " "));
      if (button.dataset.plotAction === "cursor") button.setAttribute("aria-pressed", String(state.cursorEnabled));
      if (button.dataset.plotAction === "log") button.setAttribute("aria-pressed", String(state.plotLog));
      if (button.dataset.plotAction === "zoom") button.setAttribute("aria-pressed", String(state.plotTool === "zoom"));
      if (button.dataset.plotAction === "pan") button.setAttribute("aria-pressed", String(state.plotTool === "pan"));
      bindOnce(button, "PlotAction", "click", () => handlePlotAction(button.dataset.plotAction));
    });
    $$('[data-toolbar-action]').forEach((button) => bindOnce(button, "ToolbarAction", "click", () => handleToolbarAction(button.dataset.toolbarAction)));
    $$('[data-surface-action]').forEach((button) => bindOnce(button, "SurfaceAction", "click", () => handleSurfaceAction(button.dataset.surfaceAction)));
    $$('[data-model-row]').forEach((row) => {
      const selectModelRow = () => {
        state.selectedModel = row.dataset.modelRow;
        $$('[data-model-row]').forEach((item) => {
          const selected = item === row;
          item.classList.toggle("selected", selected);
          item.setAttribute("aria-selected", String(selected));
          item.tabIndex = selected ? 0 : -1;
        });
        const inspector = $("#right-panel-content");
        inspector.innerHTML = rightPanelForView("models");
        hydrateIcons(inspector);
        $$('[data-model-browser]').forEach((item) => item.classList.toggle("selected", item.dataset.modelBrowser === modelBrowserGroup(state.selectedModel)));
        showToast("Model selected", `${row.dataset.modelRow} is ready for source, corner and qualification inspection.`, "success");
      };
      bindOnce(row, "ModelRow", "click", selectModelRow);
      bindOnce(row, "ModelRowKeys", "keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectModelRow(); }
        if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          const rows = $$('[data-model-row]').filter((candidate) => !candidate.hidden);
          let index = rows.indexOf(row);
          if (event.key === "Home") index = 0;
          else if (event.key === "End") index = rows.length - 1;
          else index = Math.max(0, Math.min(rows.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)));
          rows[index]?.focus();
          rows[index]?.click();
        }
      });
    });
    $$('[data-setting-theme]').forEach((button) => bindOnce(button, "SettingTheme", "click", () => {
      state.themeMode = button.dataset.settingTheme;
      state.theme = state.themeMode === "system" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : state.themeMode;
      writePreference("rspice-theme", state.themeMode);
      mutatePreservingFocus(() => {
        $("#settings-content").innerHTML = settingsPageContent("appearance");
        updateChrome();
        bindDynamicEvents();
      }, "#settings-content");
      drawActiveCanvas();
    }));
    $$('[data-setting-density]').forEach((button) => bindOnce(button, "SettingDensity", "click", () => {
      state.density = button.dataset.settingDensity;
      writePreference("rspice-density", state.density);
      mutatePreservingFocus(() => {
        $("#settings-content").innerHTML = settingsPageContent("appearance");
        updateChrome();
        bindDynamicEvents();
      }, "#settings-content");
      drawActiveCanvas();
    }));
    $$('[data-setting-preset]').forEach((button) => bindOnce(button, "SettingPreset", "click", () => {
      applyWorkspacePreset(button.dataset.settingPreset);
      $("#settings-content").innerHTML = settingsPageContent("workspace");
      bindDynamicEvents();
      showToast("Workspace preset applied", `${button.textContent.trim()} is now the saved layout preset for this device.`, "success");
    }));
    $$('[data-setting-console]').forEach((button) => bindOnce(button, "SettingConsole", "click", () => {
      state.consoleDefault = button.dataset.settingConsole;
      state.consoleCollapsed = state.consoleDefault === "collapsed";
      writePreference("rspice-console-default", state.consoleDefault);
      updateConsoleLayout();
      $("#settings-content").innerHTML = settingsPageContent("workspace");
      bindDynamicEvents();
      showToast("Console launch behavior updated", `The console will start ${state.consoleDefault}.`, "success");
    }));
    $$('[data-setting-units]').forEach((button) => bindOnce(button, "SettingUnits", "click", () => {
      state.unitsSystem = button.dataset.settingUnits;
      writePreference("rspice-units-system", state.unitsSystem);
      $("#settings-content").innerHTML = settingsPageContent("units");
      bindDynamicEvents();
      showToast("Unit display updated", `${button.textContent.trim()} notation is active; stored engineering values are unchanged.`, "success");
    }));
    $$('[data-setting-grid]').forEach((button) => bindOnce(button, "SettingGrid", "click", () => {
      state.schematicGrid = button.dataset.settingGrid;
      writePreference("rspice-schematic-grid", state.schematicGrid);
      $("#settings-content").innerHTML = settingsPageContent("schematic");
      bindDynamicEvents();
      showToast("Schematic grid updated", `${button.textContent.trim()} placement and snap increments are active.`, "success");
    }));
    $$('#settings-content input, #settings-content select').forEach((control) => bindOnce(control, "SettingControl", "change", () => {
      showToast("Preference updated", "The preference is applied immediately on this device.", "success");
    }));
    $$('#settings-content button:not([data-setting-theme]):not([data-setting-density]):not([data-setting-preset]):not([data-setting-console]):not([data-setting-units]):not([data-setting-grid]):not([data-surface-action])').forEach((button) => bindOnce(button, "SettingButton", "click", () => {
      const segmented = button.closest(".segmented");
      if (segmented) $$('button', segmented).forEach((item) => item.classList.toggle("active", item === button));
      showToast("Preference updated", `${button.textContent.trim()} is now selected on this device.`, "success");
    }));
    $$('.panel-search input').forEach((input) => bindOnce(input, "PanelFilter", "input", () => {
      const scope = input.closest(".panel-content, .workflow-dialog-body, .model-manager-view, .settings-dialog") || document;
      const query = input.value.trim().toLowerCase();
      $$('.tree-row, .project-list-row, .library-card, .analysis-card, .flow-row, .signal-row, .outline-row, tr[data-model-row]', scope).forEach((row) => {
        row.hidden = Boolean(query) && !row.textContent.toLowerCase().includes(query);
      });
    }));
    $$('[data-document-primary]').forEach((button) => bindOnce(button, "DocumentPrimary", "click", () => {
      const primary = resolvedDocuments(state.view).find((doc) => doc.active)?.name;
      activateDocument(state.view, primary);
      renderView();
    }));
    const schematic = $("#schematic-canvas");
    if (schematic) bindSchematicCanvas(schematic);
    $$('[data-editable-source]').forEach((editor) => {
      const sourceKey = editor.dataset.editableSource;
      if (state.sourceDrafts[sourceKey] != null && editor.innerText !== state.sourceDrafts[sourceKey]) editor.innerText = state.sourceDrafts[sourceKey];
      bindOnce(editor, "EditableSource", "input", () => {
        const firstEdit = !state.dirtySourceDocuments.has(sourceKey);
        const newValidationCycle = !state.sourceValidationRequired.has(sourceKey);
        state.sourceDrafts[sourceKey] = editor.innerText;
        state.dirtySourceDocuments.add(sourceKey);
        state.sourceValidationRequired.add(sourceKey);
        state.netlistDirty = true;
        if (firstEdit || newValidationCycle) {
          markWorkspaceChanged({ checksStale: true, planStale: true });
          renderDocuments();
          showToast("Source revision modified", `${sourceKey} is tracked in working revision ${state.inputRevision}; checks, compiled artifacts and existing results are stale.`, "warning");
        } else {
          state.resultsStale = true;
          state.newResults = false;
          state.checksCurrent = false;
          state.planValidated = false;
          syncWorkspaceStateChrome();
        }
      });
    });
    $$('#workspace-stage button, #left-panel-content button, #right-panel-content button').forEach((button) => {
      const alreadyBound = Object.keys(button.dataset).some((key) => key.startsWith("bound"));
      if (alreadyBound || button.disabled || button.getAttribute("aria-disabled") === "true") return;
      bindOnce(button, "MockControl", "click", () => {
        const exclusiveGroup = button.closest(".segmented, .preset-grid, .run-strip, .tree, .compact-list");
        if (exclusiveGroup && !button.classList.contains("icon-button")) {
          $$(':scope > button, :scope > .tree-row, :scope > .list-row', exclusiveGroup).forEach((item) => {
            const selected = item === button;
            item.classList.toggle("active", selected);
            item.classList.toggle("selected", selected);
            if (item.hasAttribute("aria-pressed")) item.setAttribute("aria-pressed", String(selected));
          });
        }
        const label = button.getAttribute("aria-label") || button.title || button.textContent.trim().replace(/\s+/g, " ") || "Control";
        showToast("Read-only interaction", `${label} does not modify project data in this workspace state.`, "warning");
      });
    });
  }

  function parseEngineeringValue(value, fallback) {
    const match = String(value ?? "").trim().match(/^([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)\s*(gig|meg|[kmunpf]?)/i);
    if (!match) return fallback;
    const scale = { gig: 1e9, meg: 1e6, k: 1e3, m: 1e-3, u: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15, "": 1 }[match[2].toLowerCase()] ?? 1;
    return Number(match[1]) * scale;
  }

  function exportPlotCsv() {
    const activeResultName = state.activeDocuments.results || resolvedDocuments("results")[0]?.name || "";
    const manifest = resultDatasetForName(activeResultName).manifest;
    const mode = manifest.id === "yield_1000" ? "hist" : state.resultMode;
    const lines = [
      `# RSpice result export · Run ${manifest.id} · mode=${mode}`,
      `# status=${manifest.status} · revision=${manifest.inputRevision} · reference_corner=${manifest.referenceCorner}`,
      `# run_set=${manifest.runSet.id} · pvt_points=${manifest.runSet.pointCount} · tasks=${manifest.runSet.taskCount}`,
      `# analyses=${manifest.analyses.join(",")}`,
      `# data_origin=${manifest.dataOrigin}; manifest metadata and configured axes are exact`
    ];
    const csv = (value) => typeof value === "string" && /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : String(value);
    if (mode === "waves" || mode === "eye") {
      const startTime = parseEngineeringValue(manifest.analysisValues.tran?.[0], 0);
      const stopTime = parseEngineeringValue(manifest.analysisValues.tran?.[1], 0.02);
      lines.push("time_s,V(afe_out)_V,V(sensor_p)_V,I(VDD)_A");
      for (let index = 0; index <= 80; index += 1) {
        const t = index / 80, time = startTime + t * Math.max(Number.EPSILON, stopTime - startTime);
        const out = 0.25 + 4.5 * (1 - Math.exp(-Math.max(0, t - 0.08) * 13));
        const sensor = 0.0108 + 0.0016 * t;
        const current = 0.0012 + 0.00062 * (1 - Math.exp(-t * 8));
        lines.push(`${time.toPrecision(12)},${out.toPrecision(12)},${sensor.toPrecision(12)},${current.toPrecision(12)}`);
      }
    } else if (mode === "bode") {
      const startFrequency = parseEngineeringValue(manifest.analysisValues.ac?.[2], 1);
      const stopFrequency = parseEngineeringValue(manifest.analysisValues.ac?.[3], 1e7);
      lines.push("frequency_hz,gain_db,phase_deg");
      for (let index = 0; index <= 80; index += 1) {
        const frequency = startFrequency * (stopFrequency / startFrequency) ** (index / 80);
        const gain = 40.0068 - 10 * Math.log10(1 + (frequency / 104800) ** 2);
        const phase = -Math.atan(frequency / 104800) * 180 / Math.PI;
        lines.push(`${frequency.toPrecision(12)},${gain.toPrecision(12)},${phase.toPrecision(12)}`);
      }
    } else if (mode === "fft" || mode === "hb") {
      lines.push("harmonic,frequency_hz,magnitude_dbc,phase_deg");
      for (let harmonic = 1; harmonic <= 10; harmonic += 1) {
        const magnitude = harmonic === 1 ? 0 : -46 - 12 * Math.log2(harmonic);
        lines.push(`${harmonic},${harmonic * 1000},${magnitude.toPrecision(12)},${((harmonic * 37) % 360 - 180).toPrecision(12)}`);
      }
    } else if (mode === "noise" || mode === "phase-noise") {
      lines.push(mode === "noise" ? "frequency_hz,input_referred_noise_V_rtHz,output_noise_V_rtHz" : "offset_frequency_hz,phase_noise_dbc_per_hz");
      const points = mode === "noise" ? 60 : 70;
      const startFrequency = mode === "noise" ? parseEngineeringValue(manifest.analysisValues.noise?.[2], 1) : parseEngineeringValue(manifest.analysisValues.pnoise?.[4], 1);
      const stopFrequency = mode === "noise" ? parseEngineeringValue(manifest.analysisValues.noise?.[3], 1e6) : parseEngineeringValue(manifest.analysisValues.pnoise?.[5], 1e7);
      for (let index = 0; index <= points; index += 1) {
        const frequency = startFrequency * (stopFrequency / startFrequency) ** (index / points);
        const inputNoise = 14.8e-9 * Math.sqrt(1 + 38 / Math.max(1, frequency));
        if (mode === "noise") lines.push(`${frequency.toPrecision(12)},${inputNoise.toPrecision(12)},${(inputNoise * 100).toPrecision(12)}`);
        else lines.push(`${frequency.toPrecision(12)},${(-92 - 10 * Math.log10(frequency)).toPrecision(12)}`);
      }
    } else if (mode === "dc") {
      const startValue = parseEngineeringValue(manifest.analysisValues.dc?.[2], -0.01);
      const stopValue = parseEngineeringValue(manifest.analysisValues.dc?.[3], 0.01);
      lines.push("VOS_V,V(afe_out)_V,input_offset_V");
      for (let index = 0; index <= 80; index += 1) {
        const vos = startValue + index / 80 * (stopValue - startValue);
        const output = 2.5 + vos * 41.08;
        lines.push(`${vos.toPrecision(12)},${output.toPrecision(12)},${(vos - 0.4e-6).toPrecision(12)}`);
      }
    } else if (mode === "sens") {
      lines.push("rank,parameter,normalized_sensitivity_percent_per_percent,absolute_influence");
      [[1, "RGAIN", 0.9821, 0.9821], [2, "RFB", 0.7412, 0.7412], [3, "CFILT", -0.3184, 0.3184], [4, "U1.GBW", 0.2077, 0.2077], [5, "U2.VOS", -0.1192, 0.1192], [6, "VREF", 0.0411, 0.0411]].forEach((row) => lines.push(row.map(csv).join(",")));
    } else if (mode === "op") {
      lines.push("quantity,expression,value,unit");
      [["node_voltage", "V(afe_out)", 2.501342, "V"], ["node_voltage", "V(vref_2v5)", 2.5, "V"], ["branch_current", "I(VDD)", 0.001823, "A"], ["device_power", "P(U1)", 0.00436219, "W"]].forEach((row) => lines.push(row.map(csv).join(",")));
    } else if (mode === "nyquist" || mode === "smith") {
      lines.push(mode === "nyquist" ? "frequency_hz,loop_gain_real,loop_gain_imag" : "frequency_hz,S11_real,S11_imag");
      for (let index = 0; index <= 80; index += 1) {
        const frequency = 10 ** (index / 10), phase = index / 80 * Math.PI * 2;
        const radius = mode === "nyquist" ? 1.6 - index / 80 : 0.18 + 0.62 * index / 80;
        lines.push(`${frequency.toPrecision(12)},${(Math.cos(phase) * radius).toPrecision(12)},${(Math.sin(phase) * radius).toPrecision(12)}`);
      }
    } else if (mode === "pz") {
      lines.push("kind,real_hz,imaginary_hz,Q");
      [["pole", -28000, 12000, 1.27], ["pole", -28000, -12000, 1.27], ["pole", -13000, 31000, 1.29], ["pole", -13000, -31000, 1.29], ["zero", -6000, 20000, 1.74], ["zero", -6000, -20000, 1.74]].forEach((row) => lines.push(row.map(csv).join(",")));
    } else if (mode === "hist") {
      const sampleCount = manifest.analyses.includes("mc")
        ? Math.max(2, Number.parseInt(String(manifest.analysisValues.mc?.[0] || "1000").replace(/[,_\s]/g, ""), 10) || 1000)
        : manifest.runSet.pointCount;
      lines.push("sample,gain_db,status");
      for (let sample = 1; sample <= sampleCount; sample += 1) {
        const failed = sample % 71 === 0;
        const gain = failed ? 39.42 + Math.sin(sample) * 0.04 : 40.007 + Math.sin(sample * 2.731) * 0.118;
        lines.push(`${sample},${gain.toPrecision(12)},${gain >= 39.5 ? "pass" : "fail"}`);
      }
    } else {
      lines.push("specification,measured_value,limit,margin,status");
      [["gain_dc", "40.0068 dB", ">= 39.5 dB", "+0.5068 dB", "pass"], ["rise_time", "2.1972 ms", "<= 2.5 ms", "+0.3028 ms", "pass"], ["phase_margin", "67.412 deg", ">= 60 deg", "+7.412 deg", "pass"], ["inoise_1k", "14.818 nV/rtHz", "<= 18 nV/rtHz", "+3.182 nV/rtHz", "pass"]].forEach((row) => lines.push(row.map(csv).join(",")));
    }
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rspice-run-${manifest.id}-${mode}.csv`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return { manifestId: manifest.id, mode, rows: Math.max(0, lines.filter((line) => !line.startsWith("#")).length - 1) };
  }

  function handlePlotAction(action) {
    if (action === "cursor") { state.cursorEnabled = !state.cursorEnabled; state.plotTool = "cursor"; }
    if (action === "log") state.plotLog = !state.plotLog;
    if (action === "zoom") { state.plotZoom = Math.min(4, state.plotZoom * 2); state.plotPan = Math.min(state.plotPan, 1 - 1 / state.plotZoom); state.plotTool = "zoom"; }
    if (action === "pan") { if (state.plotZoom === 1) state.plotZoom = 2; state.plotPan = (state.plotPan + 0.12) % (1 - 1 / state.plotZoom + 0.001); state.plotTool = "pan"; }
    if (action === "fit") { state.plotZoom = 1; state.plotPan = 0; state.plotTool = "cursor"; }
    if (action === "export") { openWorkflow("export-results"); }
    if (["zoom", "pan", "fit"].includes(action)) showToast("Plot navigation", `${action === "fit" ? "Full dataset fitted" : `${action[0].toUpperCase() + action.slice(1)} viewport ${state.plotZoom.toFixed(0)}×`}. Axes remain synchronized across strips.`, "success");
    if (state.view === "results") renderView();
  }

  function openDrawer(panelId, trigger) {
    closeDrawers();
    const panel = $(panelId);
    panel.classList.add("drawer-open");
    panel.inert = false;
    panel.setAttribute("aria-hidden", "false");
    trigger.setAttribute("aria-expanded", "true");
    state.drawerTrigger = trigger;
    $("#drawer-scrim").classList.add("visible");
    $$(".workbench > .activity-rail, .workbench > .center-stack, .workbench > .side-panel").forEach((region) => {
      if (region === panel) return;
      region.dataset.drawerInert = String(region.inert);
      region.inert = true;
      region.setAttribute("aria-hidden", "true");
    });
    requestAnimationFrame(() => panel.querySelector("button, input, select")?.focus());
  }

  function closeDrawers() {
    $$(".side-panel.drawer-open").forEach((panel) => panel.classList.remove("drawer-open"));
    $("#drawer-scrim")?.classList.remove("visible");
    $$(".mobile-panel-toggle").forEach((button) => button.setAttribute("aria-expanded", "false"));
    $$('[data-drawer-inert]').forEach((region) => {
      region.inert = region.dataset.drawerInert === "true";
      region.removeAttribute("data-drawer-inert");
      if (!region.inert) region.removeAttribute("aria-hidden");
    });
    if (state.drawerTrigger && document.contains(state.drawerTrigger)) state.drawerTrigger.focus({ preventScroll: true });
    state.drawerTrigger = null;
    syncPanelVisibility();
  }

  function syncPanelVisibility() {
    const left = $("#left-panel"), right = $("#right-panel");
    const phoneComposition = state.platform === "mobile" || innerWidth <= 820 || (innerWidth <= 900 && innerHeight <= 500);
    const leftHidden = state.workspaceFocus || (phoneComposition && !left.classList.contains("drawer-open"));
    const rightHidden = state.workspaceFocus || (innerWidth <= 1260 && !right.classList.contains("drawer-open"));
    [[left, leftHidden], [right, rightHidden]].forEach(([panel, hidden]) => {
      panel.inert = hidden;
      panel.setAttribute("aria-hidden", String(hidden));
    });
  }

  function handleExtendedMenuAction(action) {
    if (action === "toggle-focus-mode") { toggleWorkspaceFocus(); return true; }
    if (["open-project", "recent-projects", "new-project", "import-project", "export-project", "create-hierarchy", "help-center", "feature-availability", "about"].includes(action)) { openWorkflow(action); return true; }
    if (action === "save-project" || action === "save-all") {
      state.dirty = false;
      state.netlistDirty = false;
      state.dirtySourceDocuments.clear();
      renderDocuments();
      updateChrome();
      showToast(action === "save-all" ? "All working documents saved" : "Project saved", `Working revision ${state.inputRevision} is now the explicit saved checkpoint; immutable results remain unchanged.`, "success");
      return true;
    }
    if (action === "recovery") { state.projectSection = "recovery"; switchView("project"); return true; }
    if (action === "project-settings") { state.projectSection = "config"; switchView("project"); return true; }
    if (action === "undo" || action === "redo") {
      const source = action === "undo" ? state.schematicMutations : state.schematicRedo;
      const destination = action === "undo" ? state.schematicRedo : state.schematicMutations;
      const mutation = source.pop();
      if (!mutation) showToast(`${action === "undo" ? "Undo" : "Redo"} unavailable`, "There is no schematic mutation in that history direction.", "warning");
      else {
        destination.push(mutation);
        markWorkspaceChanged({ checksStale: true, planStale: true });
        switchView("design", { silent: true });
        showToast(action === "undo" ? "Schematic change undone" : "Schematic change restored", `${mutation.id} updated in working revision ${state.inputRevision}.`, "success");
      }
      return true;
    }
    if (action === "copy-selection") {
      const defaults = { U1: "OPA189", U2: "OPA189", U3: "OPA2189", RG: "499 Ω" };
      state.designClipboard = { source: state.selectedComponent, model: state.componentEdits[state.selectedComponent]?.value || defaults[state.selectedComponent] || "project component" };
      showToast("Selection copied", `${state.selectedComponent} and its model/parameter contract are available for a project-local paste.`, "success");
      return true;
    }
    if (action === "paste-selection") {
      if (!state.designClipboard) { showToast("Clipboard empty", "Copy a schematic selection before pasting.", "warning"); return true; }
      const sequence = state.schematicSequence++;
      const resistor = state.designClipboard.source === "RG";
      state.schematicMutations.push(resistor
        ? { type: "resistor", id: `RG_COPY${sequence}`, ref: `RG_COPY${sequence}`, value: state.designClipboard.model, x: 510, y: 470 }
        : { type: "instance", id: `U_COPY${sequence}`, ref: `U_COPY${sequence}`, model: state.designClipboard.model, x: 720, y: 420 });
      state.schematicRedo.length = 0;
      markWorkspaceChanged({ checksStale: true, planStale: true });
      switchView("design", { silent: true });
      showToast("Selection pasted", `A copied ${resistor ? "resistor" : "instance"} was placed on grid in ${state.inputRevision}.`, "success");
      return true;
    }
    if (action === "find-design") {
      switchView("design", { silent: true });
      requestAnimationFrame(() => { const input = $("#left-panel-content .panel-search input"); input?.focus(); input?.select(); });
      return true;
    }
    if (action === "toggle-navigator" || action === "toggle-inspector") {
      const side = action === "toggle-navigator" ? "left" : "right";
      if (innerWidth <= 1260) openDrawer(`#${side}-panel`, $(`#open-${side}-panel`));
      else {
        const className = `${side}-dock-hidden`;
        $("#app-shell").classList.toggle(className);
        requestAnimationFrame(drawActiveCanvas);
      }
      return true;
    }
    if (action === "fit-canvas") { state.canvasZoom = 1; switchView("design", { silent: true }); drawSchematic(); return true; }
    if (action === "toggle-grid") { if (state.view !== "design") switchView("design", { silent: true }); handleToolbarAction("toggle-grid"); return true; }
    const placementTools = { "place-instance": "place", "place-wire": "wire", "place-bus": "bus", "place-label": "label", "place-probe": "probe" };
    if (placementTools[action]) { switchView("design", { silent: true }); armCanvasTool(placementTools[action]); return true; }
    if (action === "command-reference") { openSettings("shortcuts"); return true; }
    if (action === "copy-diagnostics") {
      const diagnostic = JSON.stringify({ engine: ENGINE_BUILD, platform: state.platform, revision: state.inputRevision, run: state.resultManifest.id, status: state.resultManifest.status, gates: state.resultManifest.qualification.gates }, null, 2);
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(diagnostic).then(() => showToast("Diagnostics copied", "Project contents, models and waveform samples were excluded.", "success")).catch(() => showToast("Clipboard unavailable", "The browser blocked clipboard access; no data was copied.", "warning"));
      else showToast("Clipboard unavailable", "This environment does not expose a clipboard API; no data was copied.", "warning");
      return true;
    }
    return false;
  }

  function renderMenu(name, trigger) {
    const popover = $("#menu-popover");
    const items = menuDefinitions[name] || [];
    popover.innerHTML = items.map((item) => item === "-" ? '<div class="menu-separator" role="separator"></div>' : `<button class="menu-item" type="button" role="menuitem" data-menu-action="${item[3] || ""}">${iconSvg(item[0])}<span>${item[1]}</span><span class="menu-shortcut">${item[2] || ""}</span></button>`).join("");
    hydrateIcons(popover);
    const rect = trigger.getBoundingClientRect();
    popover.style.left = `${Math.min(rect.left, innerWidth - 252)}px`;
    popover.style.top = `${rect.bottom + 2}px`;
    popover.hidden = false;
    trigger.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-haspopup", "menu");
    state.menuTrigger = trigger;
    $$('[data-menu-action]', popover).forEach((button) => button.addEventListener("click", () => {
      const visibleMenuTrigger = state.menuTrigger;
      const action = button.dataset.menuAction;
      const actionLabel = button.children[1]?.textContent || action;
      closeMenu();
      if (isUsableFocusTarget(visibleMenuTrigger)) visibleMenuTrigger.focus({ preventScroll: true });
      if (viewMeta[action]) { state.activeDocuments[action] = resolvedDocuments(action).find((document) => document.active)?.name; switchView(action); }
      else if (action === "waveforms") { state.resultMode = "waves"; state.activeDocuments.results = resolvedDocuments("results").find((document) => document.active)?.name; switchView("results"); }
      else if (action === "yield") { state.verifyMode = "yield"; state.activeDocuments.verify = resolvedDocuments("verify").find((document) => document.active)?.name; switchView("verify"); }
      else if (action === "open-drc") { state.verifyMode = "drc"; state.activeDocuments.verify = "Physical DRC · Run 42"; switchView("verify", { focusLanding: true }); }
      else if (action === "start-run") startRun();
      else if (action === "stop-run") stopRun();
      else if (action === "preferences") openSettings();
      else if (action === "console") toggleConsole();
      else if (action === "check") runPreflightChecks();
      else if (action === "jobs") openJobsManager();
      else if (action === "solver") { state.simulationSection = "solver"; state.activeDocuments.simulate = resolvedDocuments("simulate").find((document) => document.active)?.name; switchView("simulate"); }
      else if (action === "tuning") { state.verifyMode = "tuning"; state.activeDocuments.verify = resolvedDocuments("verify").find((document) => document.active)?.name; switchView("verify"); }
      else if (action === "optimization") { state.verifyMode = "optimization"; state.activeDocuments.verify = resolvedDocuments("verify").find((document) => document.active)?.name; switchView("verify"); }
      else if (action === "regression") { state.verifyMode = "regression"; state.activeDocuments.verify = resolvedDocuments("verify").find((document) => document.active)?.name; switchView("verify"); }
      else if (action === "specifications") { state.simulationSection = "specifications"; state.activeDocuments.simulate = resolvedDocuments("simulate").find((document) => document.active)?.name; switchView("simulate"); }
      else if (action === "veriloga") openCodeSurface("veriloga");
      else if (action === "automation") openCodeSurface("automation");
      else if (["new-plot", "calculator", "compare-datasets", "export-results", "generate-report"].includes(action)) handleToolbarAction(action);
      else if (["pwl", "import-dataset"].includes(action)) openWorkflow(action);
      else if (action === "support-bundle") openWorkflow("support-bundle");
      else if (action === "surface-gallery") location.href = "surface-gallery.html";
      else if (handleExtendedMenuAction(action)) { /* Routed by the extended command contract. */ }
      else showToast("Command unavailable", `${actionLabel} is not available in the current workspace state.`, "warning");
    }));
    popover.querySelector("button")?.focus();
  }

  function closeMenu() {
    const popover = $("#menu-popover");
    if (popover) popover.hidden = true;
    if (state.menuTrigger) {
      state.menuTrigger.classList.remove("open");
      state.menuTrigger.setAttribute("aria-expanded", "false");
    }
    state.menuTrigger = null;
  }

  function openCommandPalette() {
    const dialog = $("#command-dialog");
    if (!dialog.open) dialog.showModal();
    state.activeCommandIndex = 0;
    state.commandScope = "All";
    $$(".scope-chip").forEach((chip) => { const active = chip.textContent.trim() === "All"; chip.classList.toggle("active", active); chip.setAttribute("aria-pressed", String(active)); });
    $("#command-input").value = "";
    renderCommandResults("");
    requestAnimationFrame(() => $("#command-input").focus());
  }

  function renderCommandResults(query) {
    const lower = query.trim().toLowerCase();
    const filtered = commandItems.filter((item) => (state.commandScope === "All" || item.group === state.commandScope) && (!lower || `${item.title} ${item.detail} ${item.group}`.toLowerCase().includes(lower)));
    state.activeCommandIndex = Math.min(state.activeCommandIndex, Math.max(0, filtered.length - 1));
    let group = "";
    $("#command-results").innerHTML = filtered.map((item, index) => {
      const groupLabel = item.group !== group ? `<div class="command-group-label">${item.group}</div>` : "";
      group = item.group;
      const detail = item.action === "run" ? `${state.enabledAnalyses.size} enabled analyses · ${PVT_RUN_POINTS.length} PVT points · reference ${state.planCorner}` : item.title === "Open Waveform Results" ? `Run ${state.runId} · ${state.resultManifest.runSet.pointCount} PVT points · ${state.resultAnalysisCount} analyses` : item.title === "Open generated netlist" ? `top.sp · revision ${state.inputRevision}${state.netlistDirty ? " · modified" : ""}` : item.detail;
      return `${groupLabel}<button id="command-option-${index}" class="command-result ${index === state.activeCommandIndex ? "active" : ""}" role="option" aria-selected="${index === state.activeCommandIndex}" type="button" data-command-index="${commandItems.indexOf(item)}"><span class="result-icon">${iconSvg(item.icon)}</span><span><strong>${item.title}</strong><small>${detail}</small></span>${item.keys ? `<kbd>${item.keys}</kbd>` : ""}</button>`;
    }).join("") || '<div class="empty-hint">No matching command, cell, signal or help topic.</div>';
    $("#command-results").setAttribute("role", "listbox");
    $("#command-input").setAttribute("role", "combobox");
    $("#command-input").setAttribute("aria-controls", "command-results");
    $("#command-input").setAttribute("aria-expanded", "true");
    $("#command-input").setAttribute("aria-activedescendant", filtered.length ? `command-option-${state.activeCommandIndex}` : "");
    hydrateIcons($("#command-results"));
    $$('[data-command-index]').forEach((button) => button.addEventListener("click", () => executeCommand(commandItems[Number(button.dataset.commandIndex)])));
  }

  function executeCommand(item) {
    $("#command-dialog").close();
    if (item.view) {
      state.activeDocuments[item.view] = resolvedDocuments(item.view).find((document) => document.active)?.name;
      if (item.group === "Signals" && item.view === "results") state.resultMode = "waves";
      switchView(item.view, { focusLanding: true });
    }
    if (item.action === "start-run") startRun();
    if (item.action === "place-resistor") {
      armCanvasTool("place");
      showToast("Resistor placement armed", "Tap the schematic to place a 1 kΩ resistor. Each committed instance is retained in the working revision.", "success");
    }
    if (item.action === "check") runPreflightChecks();
    if (item.action === "help") showToast("Context help", "Convergence guidance is available beside the active run diagnostics and residual report.", "success");
    if (item.action === "veriloga") openCodeSurface("veriloga", { focusLanding: true });
    if (item.action === "automation") openCodeSurface("automation", { focusLanding: true });
    if (item.action === "generated-netlist") openCodeSurface("netlist", { focusLanding: true });
    if (item.action === "calculator") { state.activeDocuments.results = resolvedDocuments("results").find((document) => document.active)?.name; switchView("results"); openWorkflow("calculator"); }
    if (item.action === "open-yield") { state.verifyMode = "yield"; state.activeDocuments.verify = resolvedDocuments("verify").find((document) => document.active)?.name; switchView("verify", { focusLanding: true }); }
    if (item.action === "open-drc") { state.verifyMode = "drc"; state.activeDocuments.verify = "Physical DRC · Run 42"; switchView("verify", { focusLanding: true }); }
    if (item.action === "tuning") { state.verifyMode = "tuning"; state.activeDocuments.verify = resolvedDocuments("verify").find((document) => document.active)?.name; switchView("verify", { focusLanding: true }); }
    if (item.action === "select-u1") { state.selectedComponent = "U1"; state.designInspector = "parameters"; state.activeDocuments.design = resolvedDocuments("design").find((document) => document.active)?.name; switchView("design", { focusLanding: true }); }
    if (item.action === "pwl") openWorkflow("pwl");
    if (item.action === "import") openWorkflow("import-dataset");
  }

  function settingsPageContent(page) {
    if (page === "workspace") return `<h3>Workspace layout</h3><p class="muted">Saved per device while project documents remain portable.</p><div class="settings-section-label">Dock composition</div><div class="setting-row"><div><strong>Workspace preset</strong><small>Engineering keeps contextual panes; Canvas focuses the active editor; Diagnostics opens the console.</small></div><div class="segmented"><button class="${state.workspacePreset === "engineering" ? "active" : ""}" data-setting-preset="engineering">Engineering</button><button class="${state.workspacePreset === "canvas" ? "active" : ""}" data-setting-preset="canvas">Canvas</button><button class="${state.workspacePreset === "diagnostics" ? "active" : ""}" data-setting-preset="diagnostics">Diagnostics</button></div></div><div class="setting-row"><div><strong>Console on launch</strong><small>Errors and explicit Problem navigation always open it.</small></div><div class="segmented"><button class="${state.consoleDefault === "collapsed" ? "active" : ""}" data-setting-console="collapsed">Collapsed</button><button class="${state.consoleDefault === "open" ? "active" : ""}" data-setting-console="open">Open</button></div></div><div class="setting-row"><div><strong>Restore workspace documents</strong><small>Reopen tabs, plot panes, inspector mode and cursor groups.</small></div><label class="switch"><input type="checkbox" checked aria-label="Restore workspace documents"><span></span></label></div><div class="setting-row"><div><strong>Dock sizes</strong><small>Independent navigator, inspector and console sizes per workspace.</small></div><div class="settings-value-stack"><span>navigator 256 px · inspector 312 px</span><span>console 145 px · saved</span></div></div><div class="settings-section-label">Profile management</div><div class="setting-row"><div><strong>Portable preferences</strong><small>Secrets, license leases and recent paths are excluded.</small></div><div class="settings-inline-actions"><button class="button" data-surface-action="export-preferences">Export…</button><button class="button" data-surface-action="reset-preferences">Reset…</button></div></div>`;
    if (page === "units") return `<h3>Units and engineering notation</h3><p class="muted">Parsing is strict and unit-safe; display choices never change stored values.</p><div class="setting-row"><div><strong>Unit system</strong><small>Mixed engineering is recommended for circuit design.</small></div><div class="segmented"><button class="${state.unitsSystem === "mixed" ? "active" : ""}" data-setting-units="mixed">Mixed</button><button class="${state.unitsSystem === "si" ? "active" : ""}" data-setting-units="si">SI</button><button class="${state.unitsSystem === "imperial" ? "active" : ""}" data-setting-units="imperial">Imperial layout</button></div></div><div class="setting-row"><div><strong>Engineering suffixes</strong><small>Case-sensitive SPICE parsing with unambiguous meg and mil handling.</small></div><select class="select"><option>Strict RSpice · 10Meg, 10m</option><option>Classic SPICE compatibility</option></select></div><div class="setting-row"><div><strong>Frequency display</strong><small>Stored internally as hertz.</small></div><select class="select"><option>Hz · engineering prefixes</option><option>rad/s</option></select></div><div class="setting-row"><div><strong>Temperature display</strong></div><select class="select"><option>°C</option><option>K</option><option>°F</option></select></div><div class="setting-row"><div><strong>Copied values</strong><small>Copy retains full precision plus an explicit unit.</small></div><select class="select"><option>Engineering notation + unit</option><option>Scientific notation + SI unit</option></select></div>`;
    if (page === "compute") return `<h3>Remote compute</h3><p class="muted">Qualified execution targets, queue defaults, resource limits and credentials.</p><div class="settings-section-label">Targets</div><div class="setting-row"><div><strong>Default target</strong><small>Plans may override this after compatibility validation.</small></div><select class="select"><option>Local desktop engine · release</option><option>Browser worker · release interpreter</option><option>lab-hpc-west · preview</option></select></div><div class="setting-row"><div><strong>Target configuration</strong><small>Endpoints, queues, health checks and runtime qualification.</small></div><button class="button" data-surface-action="configure-targets">Manage targets…</button></div><div class="setting-row"><div><strong>Credentials and certificates</strong><small>Stored only in the operating-system credential vault.</small></div><button class="button" data-surface-action="manage-credentials">Manage security…</button></div><div class="settings-section-label">Scheduling</div><div class="setting-row"><div><strong>Parallel task ceiling</strong><small>Across local and remote targets for one interactive user.</small></div><input class="input mono" value="64" aria-label="Parallel task ceiling"></div><div class="setting-row"><div><strong>Monthly remote quota</strong><small>Warn before dispatch; never terminate an active run automatically.</small></div><div class="settings-value-stack"><span>182 / 500 core-hours</span><span class="ok-text">within budget</span></div></div>`;
    if (page === "security") return `<h3>Security and privacy</h3><p class="muted">Fail-closed network trust, device-local secrets and explicit diagnostic consent.</p><div class="setting-row"><div><strong>Credential storage</strong><small>Secrets never enter projects, exports or browser storage.</small></div><span class="mono">Operating-system protected vault</span></div><div class="setting-row"><div><strong>Certificate trust</strong><small>Remote engines and organization services.</small></div><select class="select"><option>System trust + organization roots</option><option>Organization roots only</option></select></div><div class="setting-row"><div><strong>Network and proxy</strong><small>Uses the system proxy unless explicitly overridden.</small></div><button class="button" data-surface-action="manage-credentials">Configure…</button></div><div class="setting-row"><div><strong>Diagnostics sharing</strong><small>Crash reports exclude project, model, source and waveform contents.</small></div><label class="switch"><input aria-label="Share privacy-safe diagnostics" type="checkbox"><span></span></label></div><div class="setting-row"><div><strong>Support bundle</strong><small>Preview exact contents before encrypted export.</small></div><button class="button" data-surface-action="support-bundle">Create bundle…</button></div>`;
    if (page === "accessibility") return `<h3>Accessibility</h3><p class="muted">Keyboard, screen-reader, vision and motor-access settings apply across every workspace.</p><div class="setting-row"><div><strong>Interface scale</strong><small>Independent of plot and schematic zoom.</small></div><select class="select"><option>100% · system default</option><option>110%</option><option>125%</option><option>150%</option></select></div><div class="setting-row"><div><strong>Contrast mode</strong><small>Preserves semantic warning and pass/fail redundancy.</small></div><select class="select"><option>Automatic</option><option>High contrast dark</option><option>High contrast light</option><option>System forced colors</option></select></div><div class="setting-row"><div><strong>Reduced motion</strong><small>Disables non-essential transitions and animated progress.</small></div><label class="switch"><input aria-label="Reduce interface motion" type="checkbox"><span></span></label></div><div class="setting-row"><div><strong>Screen-reader plot summaries</strong><small>Expose axes, traces, cursor values and computed measurements as structured text.</small></div><label class="switch"><input aria-label="Enable structured plot summaries" type="checkbox" checked><span></span></label></div><div class="setting-row"><div><strong>Minimum touch target</strong><small>Applied automatically on coarse pointers.</small></div><select class="select"><option>44 px · WCAG recommended</option><option>48 px</option></select></div>`;
    if (page === "integrations") return `<h3>Plug-ins and integrations</h3><p class="muted">External access is scoped, versioned and reviewable.</p><div class="setting-row"><div><strong>Integration manager</strong><small>Git, CI, issue tracking, Python and organization services.</small></div><button class="button" data-surface-action="manage-integrations">Manage integrations…</button></div><div class="setting-row"><div><strong>Extension policy</strong><small>Native plug-ins must be signed and declare permissions.</small></div><select class="select"><option>Organization-approved only</option><option>Signed extensions</option><option>Disable all extensions</option></select></div><div class="setting-row"><div><strong>Python automation API</strong><small>Local process sandbox; no network access unless granted.</small></div><label class="switch"><input aria-label="Enable Python automation API" type="checkbox" checked><span></span></label></div><div class="setting-row"><div><strong>Webhook delivery</strong><small>Signed immutable manifest and release-gate events.</small></div><span class="mono ok-text">CI endpoint · healthy</span></div>`;
    if (page === "governance") return `<h3>Collaboration and governance</h3><p class="muted">Roles, cell/view ownership, protected actions, audit history and source-control policy.</p><div class="setting-row"><div><strong>Roles and approvals</strong><small>Design, verification, model and reviewer authority.</small></div><button class="button" data-surface-action="manage-roles">Manage policy…</button></div><div class="setting-row"><div><strong>Concurrent editing</strong><small>Cell/view-scoped collaboration with explicit merge review.</small></div><select class="select"><option>Optimistic editing + merge review</option><option>Exclusive cell/view locks</option></select></div><div class="setting-row"><div><strong>Source-control integration</strong><small>Working revisions link to external commits without rewriting project history.</small></div><div class="settings-value-stack"><span class="ok-text">Git · connected</span><span>branch main · clean</span></div></div><div class="setting-row"><div><strong>Protected actions</strong><small>Baseline, waiver, PDK and release promotion.</small></div><span>independent approval required</span></div><div class="setting-row"><div><strong>Audit retention</strong><small>Signed dispositions and release records.</small></div><select class="select"><option>7 years · organization policy</option><option>Project lifetime</option></select></div>`;
    if (page === "schematic") return `<h3>Schematic editor</h3><p class="muted">Interaction, units, hierarchy and connectivity behavior.</p><div class="setting-row"><div><strong>Grid and snap</strong><small>Visible grid and placement increments.</small></div><div class="segmented"><button class="${state.schematicGrid === "50mil" ? "active" : ""}" data-setting-grid="50mil">50 mil</button><button class="${state.schematicGrid === "25mil" ? "active" : ""}" data-setting-grid="25mil">25 mil</button><button class="${state.schematicGrid === "metric" ? "active" : ""}" data-setting-grid="metric">Metric</button></div></div><div class="setting-row"><div><strong>Operating-point annotation</strong><small>Default detail after a completed compatible run.</small></div><select class="select"><option>Voltages + selected currents</option><option>Voltages only</option><option>Hidden</option></select></div><div class="setting-row"><div><strong>Cross-probe behavior</strong><small>Highlight the matching net, device, netlist line and trace.</small></div><label class="switch"><input aria-label="Enable cross-probe behavior" type="checkbox" checked><span></span></label></div><div class="setting-row"><div><strong>Connectivity checks</strong><small>Refresh incrementally while editing.</small></div><label class="switch"><input aria-label="Enable incremental connectivity checks" type="checkbox" checked><span></span></label></div>`;
    if (page === "simulation") return `<h3>Simulation defaults</h3><p class="muted">Execution targets, numerical policy and failure handling.</p><div class="setting-row"><div><strong>Default solver preset</strong><small>Individual plans may override this value.</small></div><select class="select"><option>Balanced</option><option>Fast</option><option>Accurate</option><option>Robust</option></select></div><div class="setting-row"><div><strong>Local parallel slots</strong><small>Leaves one logical core for the interface.</small></div><input class="input mono" value="12" aria-label="Local parallel slots"></div><div class="setting-row"><div><strong>Convergence failure</strong><small>Default point-level behavior.</small></div><select class="select"><option>Retry robust, then continue</option><option>Stop run set</option><option>Continue without retry</option></select></div><div class="setting-row"><div><strong>Checkpoint policy</strong><small>Transactional resume boundary.</small></div><select class="select"><option>Every completed PVT point</option><option>Every 5 minutes</option><option>Disabled</option></select></div>`;
    if (page === "results") return `<h3>Results and precision</h3><p class="muted">Plot behavior never changes stored engineering precision.</p><div class="setting-row"><div><strong>Displayed significant digits</strong><small>Copy retains full stored precision.</small></div><input class="input mono" value="7" aria-label="Displayed significant digits"></div><div class="setting-row"><div><strong>Cursor interpolation</strong><small>Method used between accepted solver points.</small></div><select class="select"><option>Monotone cubic where valid</option><option>Linear</option><option>Nearest accepted point</option></select></div><div class="setting-row"><div><strong>Color-safe traces</strong><small>Okabe–Ito palette with dash and marker redundancy.</small></div><label class="switch"><input aria-label="Enable color-safe traces" type="checkbox" checked><span></span></label></div><div class="setting-row"><div><strong>Plot documents</strong><small>Restore panes, axes and linked cursor groups per project.</small></div><label class="switch"><input aria-label="Restore plot documents" type="checkbox" checked><span></span></label></div>`;
    if (page === "files") return `<h3>Files, storage and recovery</h3><p class="muted">Transactional writes, content-addressed results and explicit retention.</p><div class="settings-section-label">Recovery</div><div class="setting-row"><div><strong>Autosave interval</strong><small>Checkpoint active editable documents.</small></div><select class="select"><option>5 minutes</option><option>2 minutes</option><option>10 minutes</option></select></div><div class="setting-row"><div><strong>Recovery retention</strong><small>Protected points are never compacted automatically.</small></div><select class="select"><option>8 checkpoints per document</option><option>16 checkpoints</option><option>24 hours</option></select></div><div class="setting-row"><div><strong>Checkpoint before governed changes</strong><small>PDK, baseline, migration and bulk parameter operations.</small></div><label class="switch"><input type="checkbox" checked aria-label="Checkpoint before governed changes"><span></span></label></div><div class="settings-section-label">Result storage</div><div class="setting-row"><div><strong>Project result store</strong><small>Current content-addressed result database.</small></div><button class="button" data-surface-action="select-result-store">~/RSpice/afe/results…</button></div><div class="setting-row"><div><strong>Browser storage budget</strong><small>Warn before a run exceeds the safe estimate.</small></div><div class="settings-value-stack"><span>2.00 GiB · 34% used</span><span class="ok-text">1.32 GiB available</span></div></div><div class="setting-row"><div><strong>Automatic result retention</strong><small>Golden baselines and release evidence are always protected.</small></div><select class="select"><option>20 successful runs · failed partials 7 days</option><option>Storage-budget managed</option><option>Manual only</option></select></div><div class="setting-row"><div><strong>Cache maintenance</strong><small>Removes reconstructable render and compile caches only.</small></div><button class="button" data-surface-action="review-cache">Review 1.4 GiB cache…</button></div>`;
    if (page === "shortcuts") return `<h3>Keyboard and command shortcuts</h3><p class="muted">Conflicts are detected per desktop and browser platform.</p><table class="data-table"><thead><tr><th>Command</th><th>Shortcut</th><th>Context</th><th>Status</th></tr></thead><tbody><tr><td>Command palette</td><td><kbd>Ctrl K</kbd></td><td>global</td><td><span class="mini-badge ok">available</span></td></tr><tr><td>Run active plan</td><td><kbd>F5</kbd></td><td>runnable project</td><td><span class="mini-badge ok">available</span></td></tr><tr><td>Draw wire</td><td><kbd>W</kbd></td><td>schematic</td><td><span class="mini-badge ok">available</span></td></tr><tr><td>Toggle jobs dock</td><td><kbd>Ctrl J</kbd></td><td>global</td><td><span class="mini-badge warn">browser conflict</span></td></tr></tbody></table><div class="setting-row"><div><strong>Preset</strong><small>Import or export a versioned shortcut map.</small></div><div><button class="button" data-surface-action="import-shortcuts">Import…</button> <button class="button" data-surface-action="export-shortcuts">Export…</button></div></div>`;
    if (page === "licensing") return `<h3>Licensing, entitlements and updates</h3><p class="muted">Saved work remains accessible when a simulation seat or update entitlement is unavailable.</p><div class="setting-row"><div><strong>Edition</strong><small>Perpetual professional license with organization-managed features.</small></div><div class="settings-value-stack"><strong>RSpice Professional</strong><span class="ok-text">activated · JMW-04</span></div></div><div class="entitlement-grid"><div><strong>Circuit simulation</strong><small class="ok-text">named seat · available</small></div><div><strong>RF & periodic</strong><small class="ok-text">included</small></div><div><strong>Remote execution</strong><small>24-seat pool</small></div></div><div class="setting-row"><div><strong>Offline entitlement</strong><small>Hardware-bound encrypted lease with automatic return.</small></div><button class="button" data-surface-action="borrow-license">Borrow…</button></div><div class="setting-row"><div><strong>Update channel</strong><small>Signed stable releases with rollback support.</small></div><button class="button" data-surface-action="check-updates">Stable · check for updates…</button></div><div class="setting-row"><div><strong>Update eligibility</strong><small>Feature and maintenance builds.</small></div><span class="mono ok-text">active through 2027-07-01</span></div><div class="setting-row"><div><strong>Support</strong><small>Create a privacy-safe encrypted diagnostic package.</small></div><button class="button" data-surface-action="support-bundle">Create support bundle…</button></div>`;
    return `<h3>Appearance</h3><p class="muted">Shared across desktop and web. Touch target sizing follows the active platform.</p><div class="setting-row"><div><strong>Color mode</strong><small>Choose the workspace surface mode.</small></div><div class="segmented"><button class="${state.themeMode === "dark" ? "active" : ""}" data-setting-theme="dark">Dark</button><button class="${state.themeMode === "light" ? "active" : ""}" data-setting-theme="light">Light</button><button class="${state.themeMode === "system" ? "active" : ""}" data-setting-theme="system">System</button></div></div><div class="setting-row"><div><strong>Density</strong><small>Compact is optimized for engineering workstations.</small></div><div class="segmented"><button class="${state.density === "compact" ? "active" : ""}" data-setting-density="compact">Compact</button><button class="${state.density === "comfortable" ? "active" : ""}" data-setting-density="comfortable">Comfortable</button></div></div><div class="setting-row"><div><strong>Color-safe traces</strong><small>Use color, line style and marker redundancy.</small></div><label class="switch"><input aria-label="Enable color-safe traces" type="checkbox" checked><span></span></label></div><div class="setting-row"><div><strong>Canvas contrast</strong><small>Increase symbol and grid separation.</small></div><input type="range" min="0" max="100" value="62" aria-label="Canvas contrast"></div><div class="setting-row"><div><strong>Inactive hierarchy opacity</strong><small>Parent context remains visible without competing with the edit target.</small></div><input type="range" min="0" max="100" value="38" aria-label="Inactive hierarchy opacity"></div>`;
  }

  function openSettings(page = "appearance") {
    const dialog = $("#settings-dialog");
    if ($("#mobile-nav-dialog")?.open) $("#mobile-nav-dialog").close();
    $$(".settings-nav button").forEach((button) => {
      const active = button.dataset.settingsPage === page;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });
    $("#settings-content").innerHTML = settingsPageContent(page);
    if (!dialog.open) dialog.showModal();
    bindDynamicEvents();
  }

  function exportRunManifest() {
    const manifest = state.activeRunManifest || state.cancelledRunManifest || state.resultManifest;
    if (!manifest) return;
    const payload = JSON.stringify({
      product: "RSpice Workbench",
      schema: "rspice.run-manifest/1.0",
      exportedAt: new Date().toISOString(),
      manifest
    }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rspice-run-${manifest.id}-manifest.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    showToast("Run manifest exported", `Run ${manifest.id} provenance, analysis values and ${manifest.runSet.pointCount}-point run set were exported.`, "success");
  }

  function toggleWorkspaceFocus() {
    state.workspaceFocus = !state.workspaceFocus;
    renderView({ focusFallback: "#workspace-main" });
    showToast(state.workspaceFocus ? "Workspace focused" : "Workspace restored", state.workspaceFocus ? "Navigator, inspector and console are temporarily hidden. Use Ctrl+Shift+F to restore the saved dock layout." : "The saved navigator, inspector and console layout is restored.", "success");
    announce(state.workspaceFocus ? "Focused workspace enabled" : "Workspace layout restored");
  }

  function applyWorkspacePreset(preset) {
    state.workspacePreset = preset;
    state.workspaceFocus = preset === "canvas";
    state.consoleCollapsed = preset !== "diagnostics";
    state.consoleMaximized = false;
    writePreference("rspice-workspace-preset", preset);
    writePreference("rspice-console-default", state.consoleCollapsed ? "collapsed" : "open");
    updateConsoleLayout();
    renderView({ focusFallback: "#workspace-main" });
  }

  function toggleConsole() {
    const center = $(".center-stack");
    if (innerWidth <= 820 || state.platform === "mobile" || matchMedia("(pointer: coarse)").matches) {
      const open = !center.classList.contains("console-mobile-open");
      center.classList.toggle("console-mobile-open", open);
      $("#console-collapse").title = open ? "Collapse console" : "Expand console";
      $("#console-collapse").setAttribute("aria-label", open ? "Collapse console" : "Expand console");
      requestAnimationFrame(drawActiveCanvas);
      return;
    }
    state.consoleMaximized = false;
    state.consoleCollapsed = !state.consoleCollapsed;
    updateConsoleLayout();
    $("#console-collapse").title = state.consoleCollapsed ? "Expand console" : "Collapse console";
    $("#console-collapse").setAttribute("aria-label", state.consoleCollapsed ? "Expand console" : "Collapse console");
    requestAnimationFrame(drawActiveCanvas);
  }

  function refreshRunManagerPanel() {
    if (state.view !== "simulate" || !$("#right-panel-content")) return;
    $("#right-panel-content").innerHTML = rightPanelForView("simulate");
    hydrateIcons($("#right-panel-content"));
    bindDynamicEvents();
  }

  function startRun() {
    if (state.running) {
      showToast("Run already active", `Run ${state.activeRunManifest.id} is already executing. Use Stop to cancel it safely.`, "warning");
      return;
    }
    toggleRun();
  }

  function stopRun() {
    if (!state.running) {
      showToast("No active run", "Stop is available only while a run is executing; completed datasets are immutable.", "warning");
      return;
    }
    toggleRun();
  }

  function toggleRun() {
    if (state.running) {
      clearInterval(state.runTimer);
      const active = state.activeRunManifest;
      const elapsed = active ? active.estimatedDurationSeconds * state.runProgress / 100 : 0;
      if (active) state.cancelledRunManifest = createRunManifest({
        id: active.id,
        status: "cancelled",
        analyses: active.analyses,
        analysisValues: active.analysisValues,
        referenceCorner: active.referenceCorner,
        inputRevision: active.inputRevision,
        startedAt: active.startedAt,
        completedAt: new Date().toISOString(),
        durationSeconds: elapsed,
        estimatedDurationSeconds: active.estimatedDurationSeconds,
        targetPlatform: active.target.platform,
        sourceDigests: active.provenance.sourceDigests
      });
      state.running = false;
      state.runProgress = 0;
      state.activeRunCorner = null;
      state.activeRunAnalysisCount = null;
      state.activeRunAnalyses = null;
      state.activeRunManifest = null;
      refreshRunManagerPanel();
      updateRunChrome();
      showToast("Run cancelled", `Run ${active?.id ?? state.runId + 1} stopped by user. Completed PVT-point checkpoints and the immutable input manifest were retained.`, "warning");
      announce("Simulation cancelled");
      return;
    }
    const validation = (!state.checksCurrent || !state.planValidated) ? runPreflightChecks() : planValidationReport();
    if (validation.blockers.length) {
      announce("Simulation blocked by preflight.");
      return;
    }
    const nextRunId = Math.max(state.runId + 1, (state.cancelledRunManifest?.id || 0) + 1);
    state.activeRunManifest = createRunManifest({
      id: nextRunId,
      status: "running",
      analyses: state.enabledAnalyses,
      analysisValues: effectiveAnalysisValues(state.enabledAnalyses, state.analysisValues),
      referenceCorner: state.planCorner,
      inputRevision: state.inputRevision,
      startedAt: new Date().toISOString(),
      targetPlatform: state.platform,
      sourceDrafts: state.sourceDrafts
    });
    state.running = true;
    state.activeRunCorner = state.activeRunManifest.referenceCorner;
    state.activeRunAnalysisCount = state.activeRunManifest.analyses.length;
    state.activeRunAnalyses = new Set(state.activeRunManifest.analyses);
    state.runProgress = 3;
    syncWorkspaceStateChrome();
    refreshRunManagerPanel();
    updateRunChrome();
    const startTitle = !validation.engineReleaseEligible ? "Preview simulation started" : validation.releaseProfileReady ? "Simulation started" : "Simulation started · evidence incomplete";
    const planReadiness = !validation.engineReleaseEligible ? "preview runtime or analysis · non-sign-off" : validation.releaseProfileReady ? "release-profile evidence configured" : "qualified engine · release evidence incomplete";
    showToast(startTitle, `Run ${state.activeRunManifest.id} · ${state.activeRunManifest.runSet.pointCount} PVT points · ${state.activeRunManifest.runSet.taskCount.toLocaleString()} frozen tasks · ${planReadiness} · ${platformCopy()}`, validation.releaseEligible ? "success" : "warning");
    announce("Simulation started");
    state.runTimer = setInterval(() => {
      state.runProgress = Math.min(100, state.runProgress + Math.max(2, Math.round((100 - state.runProgress) / 7)));
      updateRunChrome();
      if (state.runProgress >= 100) completeRun();
    }, 180);
  }

  function updateRunChrome() {
    const button = $("#run-button");
    const label = $("#run-label");
    const status = $("#engine-status");
    const engineState = $(".engine-state");
    if (state.running) {
      button.classList.add("running");
      button.querySelector("[data-icon]").dataset.icon = "stop";
      button.querySelector("[data-icon]").dataset.hydrated = "false";
      label.textContent = "Stop";
      button.setAttribute("aria-label", "Stop active simulation");
      status.textContent = `Run ${state.activeRunManifest?.id ?? state.runId + 1} · ${PVT_RUN_POINTS.length} PVT · ${state.runProgress}%`;
      engineState.classList.add("running");
    } else {
      button.classList.remove("running");
      button.querySelector("[data-icon]").dataset.icon = "play";
      button.querySelector("[data-icon]").dataset.hydrated = "false";
      label.textContent = "Run plan";
      button.setAttribute("aria-label", "Run active simulation plan");
      status.textContent = state.cancelledRunManifest ? `Run ${state.cancelledRunManifest.id} cancelled · checkpoint retained` : "Engine ready";
      engineState.classList.remove("running");
    }
    hydrateIcons(button);
    const progress = $("#active-run-progress");
    if (progress) progress.style.setProperty("--progress", `${state.runProgress}%`);
    const progressLabel = $("#active-run-progress-label");
    if (progressLabel && state.activeRunManifest) progressLabel.textContent = `${state.runProgress}% · ${formatDuration(state.activeRunManifest.estimatedDurationSeconds * state.runProgress / 100)} simulated`;
    $("#console-body").innerHTML = consoleContent(state.consoleTab);
    $("#console-context").textContent = state.running ? `Run ${state.activeRunManifest.id} · ${PVT_RUN_POINTS.length} PVT points · ${state.runProgress}%` : `Run ${state.resultManifest.id} · ${state.resultManifest.status} · revision ${state.resultManifest.inputRevision}`;
    if ($("#jobs-dialog")?.open) {
      mutatePreservingFocus(() => {
        $("#jobs-manager-body").innerHTML = jobsManagerContent();
        hydrateIcons($("#jobs-manager-body"));
      }, "#jobs-run");
      $("#jobs-run").textContent = state.running ? "Stop active run" : "Run active plan";
    }
    syncWorkspaceStateChrome();
  }

  function completeRun() {
    clearInterval(state.runTimer);
    const active = state.activeRunManifest;
    if (!active) return;
    state.running = false;
    state.resultManifest = createRunManifest({
      id: active.id,
      status: !active.qualification.releaseEligible ? "complete-preview" : active.qualification.technicalGatePassed ? "complete" : "complete-review",
      analyses: active.analyses,
      analysisValues: active.analysisValues,
      referenceCorner: active.referenceCorner,
      inputRevision: active.inputRevision,
      startedAt: active.startedAt,
      completedAt: new Date().toISOString(),
      durationSeconds: active.estimatedDurationSeconds,
      estimatedDurationSeconds: active.estimatedDurationSeconds,
      targetPlatform: active.target.platform,
      sourceDigests: active.provenance.sourceDigests
    });
    state.runId = state.resultManifest.id;
    state.resultCorner = state.resultManifest.referenceCorner;
    state.resultDuration = formatDuration(state.resultManifest.durationSeconds);
    state.activeRunCorner = null;
    state.resultAnalyses = new Set(state.resultManifest.analyses);
    state.resultAnalysisCount = state.resultAnalyses.size;
    state.resultSpecCount = specificationCount(state.resultAnalyses);
    state.resultPassedSpecCount = specificationCount(new Set([...state.resultAnalyses].filter((analysis) => !NON_RELEASE_ANALYSES.has(analysis))));
    state.resultMode = firstResultMode(state.resultAnalyses);
    state.activeRunAnalysisCount = null;
    state.activeRunAnalyses = null;
    state.activeRunManifest = null;
    state.cancelledRunManifest = null;
    state.newResults = true;
    state.resultsStale = state.inputRevision !== state.resultManifest.inputRevision || currentPlanNetlistDigest() !== state.resultManifest.provenance.netlistDigest;
    if (!state.resultsStale) state.checksCurrent = true;
    state.runProgress = 0;
    state.activeDocuments.results = null;
    commandItems.forEach((item) => { if (item.group === "Signals" || item.title === "Open Waveform Results") item.detail = item.detail.replace(/Run \d+/, `Run ${state.runId}`); });
    refreshRunManagerPanel();
    updateRunChrome();
    const preview = !state.resultManifest.qualification.releaseEligible;
    const gateReview = state.resultManifest.qualification.releaseEligible && !state.resultManifest.qualification.signOffEligible;
    const completionCopy = `Run ${state.runId} finished ${state.resultManifest.runSet.pointCount} PVT points and ${state.resultManifest.runSet.taskCount.toLocaleString()} tasks · ${state.resultPassedSpecCount} / ${state.resultSpecCount} configured checks numerically passed · ${state.resultDuration}`;
    const completionTitle = state.resultsStale ? "Simulation complete · historical input" : preview ? "Preview simulation complete" : gateReview ? "Simulation complete · review required" : "Simulation complete · technically eligible";
    const completionDetail = state.resultsStale
      ? `${completionCopy}. Working inputs changed to ${state.inputRevision} during execution, so the result is historical.`
      : preview
        ? `${completionCopy}. Preview and compatibility outputs remain explicitly excluded from release evidence.`
        : gateReview
          ? `${completionCopy}. ${failedQualificationGates().length} release gate${failedQualificationGates().length === 1 ? "" : "s"} remain blocked; open the manifest for exact evidence.`
          : `${completionCopy}. Technical gates pass; engineering approval remains pending.`;
    showToast(completionTitle, completionDetail, state.resultsStale || preview || gateReview ? "warning" : "success");
    announce(`Simulation Run ${state.runId} complete across ${state.resultManifest.runSet.pointCount} PVT points; ${resultEligibilityCopy()}.`);
    setTimeout(() => switchView("results"), 550);
  }

  function showToast(title, message, tone = "success") {
    const region = $("#toast-region");
    const toastKey = `${tone}:${title}`;
    [...region.children].filter((item) => item.dataset.toastKey === toastKey).forEach((item) => item.remove());
    while (region.children.length >= 3) region.firstElementChild.remove();
    const toast = document.createElement("div");
    toast.className = `toast ${tone}`;
    toast.dataset.toastKey = toastKey;
    toast.innerHTML = `<span class="toast-icon">${iconSvg(tone === "warning" ? "warning" : "check")}</span><span><strong>${title}</strong><p>${message}</p></span><button type="button" aria-label="Dismiss notification">×</button>`;
    region.append(toast);
    hydrateIcons(toast);
    const remove = () => toast.remove();
    toast.querySelector("button").addEventListener("click", remove);
    setTimeout(remove, 5200);
  }

  function announce(message) {
    let region = $("#a11y-announcer");
    if (!region) {
      region = document.createElement("div");
      region.id = "a11y-announcer";
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-atomic", "true");
      region.style.cssText = "position:fixed;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap";
      document.body.append(region);
    }
    region.textContent = "";
    setTimeout(() => { region.textContent = message; }, 10);
  }

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function prepareCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  function roundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function drawGrid(ctx, width, height, spacing, color, dots = true) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    if (dots) {
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
    } else {
      ctx.beginPath();
      for (let x = spacing; x < width; x += spacing) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = spacing; y < height; y += spacing) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWire(ctx, points, color, width = 2) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
    ctx.stroke();
    ctx.restore();
  }

  function drawJunction(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawOpAmp(ctx, x, y, ref, model, colors, selected) {
    ctx.save();
    ctx.strokeStyle = colors.symbol;
    ctx.fillStyle = colors.canvas;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 46, y - 38);
    ctx.lineTo(x - 46, y + 38);
    ctx.lineTo(x + 48, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.font = '500 13px "IBM Plex Mono"';
    ctx.fillStyle = colors.symbol;
    ctx.fillText("+", x - 37, y - 16);
    ctx.fillText("−", x - 37, y + 22);
    ctx.font = '500 11px "IBM Plex Mono"';
    ctx.fillStyle = colors.net;
    ctx.fillText(ref, x - 6, y - 6);
    ctx.font = '400 10px "IBM Plex Mono"';
    ctx.fillStyle = colors.dim;
    ctx.fillText(model, x - 15, y + 9);
    ctx.strokeStyle = colors.symbol;
    ctx.beginPath();
    ctx.moveTo(x - 58, y - 20); ctx.lineTo(x - 46, y - 20);
    ctx.moveTo(x - 58, y + 20); ctx.lineTo(x - 46, y + 20);
    ctx.moveTo(x + 48, y); ctx.lineTo(x + 61, y);
    ctx.moveTo(x, y - 51); ctx.lineTo(x, y - 34);
    ctx.moveTo(x, y + 51); ctx.lineTo(x, y + 34);
    ctx.stroke();
    ctx.fillStyle = colors.dim;
    ctx.font = '400 10px "IBM Plex Mono"';
    ctx.fillText("V+", x + 5, y - 43);
    ctx.fillText("V−", x + 5, y + 49);
    if (selected) {
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(x - 65, y - 58, 134, 116);
      ctx.setLineDash([]);
      [[x - 65, y - 58], [x + 69, y - 58], [x - 65, y + 58], [x + 69, y + 58]].forEach(([hx, hy]) => {
        ctx.fillStyle = colors.canvas; ctx.strokeStyle = colors.accent; ctx.fillRect(hx - 3, hy - 3, 6, 6); ctx.strokeRect(hx - 3, hy - 3, 6, 6);
      });
    }
    ctx.restore();
  }

  function drawResistor(ctx, x1, y1, x2, y2, ref, value, colors, selected = false) {
    const vertical = Math.abs(y2 - y1) > Math.abs(x2 - x1);
    ctx.save();
    ctx.strokeStyle = colors.symbol;
    ctx.fillStyle = colors.canvas;
    ctx.lineWidth = 2;
    if (!vertical) {
      const cx = (x1 + x2) / 2;
      drawWire(ctx, [[x1, y1], [cx - 27, y1]], colors.symbol, 2);
      drawWire(ctx, [[cx + 27, y1], [x2, y2]], colors.symbol, 2);
      ctx.strokeRect(cx - 27, y1 - 8, 54, 16);
      ctx.font = '500 10px "IBM Plex Mono"'; ctx.fillStyle = colors.net; ctx.fillText(ref, cx - 13, y1 - 14);
      ctx.fillStyle = colors.dim; ctx.font = '400 10px "IBM Plex Mono"'; ctx.fillText(value, cx - 17, y1 + 24);
      if (selected) { ctx.strokeStyle = colors.accent; ctx.setLineDash([4, 3]); ctx.strokeRect(cx - 34, y1 - 30, 68, 60); }
    } else {
      const cy = (y1 + y2) / 2;
      drawWire(ctx, [[x1, y1], [x1, cy - 27]], colors.symbol, 2);
      drawWire(ctx, [[x1, cy + 27], [x2, y2]], colors.symbol, 2);
      ctx.strokeRect(x1 - 8, cy - 27, 16, 54);
      ctx.font = '500 10px "IBM Plex Mono"'; ctx.fillStyle = colors.net; ctx.fillText(ref, x1 + 13, cy - 5);
      ctx.fillStyle = colors.dim; ctx.font = '400 10px "IBM Plex Mono"'; ctx.fillText(value, x1 + 13, cy + 9);
      if (selected) { ctx.strokeStyle = colors.accent; ctx.setLineDash([4, 3]); ctx.strokeRect(x1 - 20, cy - 35, 70, 70); }
    }
    ctx.restore();
  }

  function drawCapacitor(ctx, x, y1, y2, ref, value, colors) {
    const cy = (y1 + y2) / 2;
    ctx.save();
    ctx.strokeStyle = colors.symbol;
    ctx.fillStyle = colors.net;
    ctx.lineWidth = 2;
    drawWire(ctx, [[x, y1], [x, cy - 6]], colors.symbol, 2);
    drawWire(ctx, [[x, cy + 6], [x, y2]], colors.symbol, 2);
    ctx.beginPath(); ctx.moveTo(x - 16, cy - 6); ctx.lineTo(x + 16, cy - 6); ctx.moveTo(x - 16, cy + 6); ctx.lineTo(x + 16, cy + 6); ctx.stroke();
    ctx.font = '500 10px "IBM Plex Mono"'; ctx.fillText(ref, x + 22, cy - 4);
    ctx.fillStyle = colors.dim; ctx.font = '400 10px "IBM Plex Mono"'; ctx.fillText(value, x + 22, cy + 10);
    ctx.restore();
  }

  function drawGround(ctx, x, y, colors) {
    ctx.save(); ctx.strokeStyle = colors.symbol; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 8); ctx.moveTo(x - 11, y + 8); ctx.lineTo(x + 11, y + 8); ctx.moveTo(x - 7, y + 12); ctx.lineTo(x + 7, y + 12); ctx.moveTo(x - 3, y + 16); ctx.lineTo(x + 3, y + 16); ctx.stroke(); ctx.restore();
  }

  function drawPort(ctx, x, y, label, direction, colors) {
    ctx.save();
    ctx.strokeStyle = colors.symbol; ctx.fillStyle = colors.canvas; ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (direction === "in") { ctx.moveTo(x, y - 8); ctx.lineTo(x + 20, y - 8); ctx.lineTo(x + 27, y); ctx.lineTo(x + 20, y + 8); ctx.lineTo(x, y + 8); }
    else { ctx.moveTo(x, y); ctx.lineTo(x + 7, y - 8); ctx.lineTo(x + 27, y - 8); ctx.lineTo(x + 27, y + 8); ctx.lineTo(x + 7, y + 8); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = colors.net; ctx.font = '500 10px "IBM Plex Mono"';
    ctx.fillText(label, direction === "in" ? x : x - ctx.measureText(label).width - 7, y - 13);
    ctx.restore();
  }

  function drawAnnotation(ctx, x, y, label, colors, tone = "accent") {
    ctx.save();
    ctx.font = '500 10px "IBM Plex Mono"';
    const width = ctx.measureText(label).width + 12;
    roundedRect(ctx, x, y, width, 18, 3);
    ctx.fillStyle = colors.panel; ctx.fill();
    ctx.strokeStyle = tone === "ok" ? colors.ok : colors.accent; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = tone === "ok" ? colors.ok : colors.accent; ctx.fillText(label, x + 6, y + 12);
    ctx.restore();
  }

  function armCanvasTool(tool) {
    state.canvasTool = tool;
    if (tool !== "wire" && tool !== "bus") state.pendingWireStart = null;
    $$('[data-canvas-tool]').forEach((item) => item.classList.toggle("active", item.dataset.canvasTool === tool));
    if (state.view === "design") {
      mutatePreservingFocus(() => {
        $("#context-toolbar").innerHTML = toolbarForView("design");
        hydrateIcons($("#context-toolbar"));
        bindDynamicEvents();
      }, "#context-toolbar");
    }
    const status = $("#selection-status");
    if (status) status.textContent = `${tool} tool · tap canvas to use`;
    drawSchematic();
    announce(`${tool} schematic tool active`);
  }

  function drawSchematicMutations(ctx, colors) {
    state.schematicMutations.forEach((mutation) => {
      if (mutation.type === "wire") {
        drawWire(ctx, [[mutation.x1, mutation.y1], [mutation.x2, mutation.y1], [mutation.x2, mutation.y2]], colors.wire, 2.4);
        drawJunction(ctx, mutation.x1, mutation.y1, colors.wire);
        drawJunction(ctx, mutation.x2, mutation.y2, colors.wire);
      } else if (mutation.type === "bus") {
        [-4, 0, 4].forEach((offset) => drawWire(ctx, [[mutation.x1, mutation.y1 + offset], [mutation.x2, mutation.y1 + offset], [mutation.x2, mutation.y2 + offset]], colors.wire, 1.2));
        ctx.fillStyle = colors.net;
        ctx.font = '600 10px "IBM Plex Mono"';
        ctx.fillText(mutation.name, mutation.x2 + 8, mutation.y2 - 8);
      } else if (mutation.type === "resistor") {
        drawResistor(ctx, mutation.x - 45, mutation.y, mutation.x + 45, mutation.y, mutation.ref, mutation.value, colors, false);
      } else if (mutation.type === "instance") {
        drawOpAmp(ctx, mutation.x, mutation.y, mutation.ref, mutation.model, colors, false);
      } else if (mutation.type === "label") {
        ctx.fillStyle = colors.net;
        ctx.font = '600 10px "IBM Plex Mono"';
        ctx.fillText(mutation.text, mutation.x + 7, mutation.y - 7);
        drawJunction(ctx, mutation.x, mutation.y, colors.wire);
      } else if (mutation.type === "probe") {
        ctx.save();
        ctx.strokeStyle = colors.accent; ctx.fillStyle = colors.panel; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(mutation.x, mutation.y, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(mutation.x - 13, mutation.y); ctx.lineTo(mutation.x + 13, mutation.y); ctx.moveTo(mutation.x, mutation.y - 13); ctx.lineTo(mutation.x, mutation.y + 13); ctx.stroke();
        ctx.fillStyle = colors.accent; ctx.font = '600 10px "IBM Plex Mono"'; ctx.fillText(mutation.ref, mutation.x + 13, mutation.y - 9);
        ctx.restore();
      } else if (mutation.type === "measure") {
        ctx.save();
        ctx.strokeStyle = colors.accent; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(mutation.x - 24, mutation.y); ctx.lineTo(mutation.x + 24, mutation.y); ctx.stroke(); ctx.setLineDash([]);
        drawAnnotation(ctx, mutation.x + 28, mutation.y - 9, mutation.label, colors, "accent");
        ctx.restore();
      }
    });
    if (state.pendingWireStart) {
      ctx.save();
      ctx.strokeStyle = colors.accent; ctx.fillStyle = colors.canvas; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(state.pendingWireStart.x, state.pendingWireStart.y, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }

  function applySchematicGesture(x, y) {
    const sx = Math.max(30, Math.min(910, Math.round(x / 10) * 10));
    const sy = Math.max(30, Math.min(560, Math.round(y / 10) * 10));
    const sequence = state.schematicSequence;
    let toastTitle = "Schematic updated";
    let toastCopy = "";
    if (state.canvasTool === "wire" || state.canvasTool === "bus") {
      if (!state.pendingWireStart) {
        state.pendingWireStart = { x: sx, y: sy };
        drawSchematic();
        showToast(state.canvasTool === "bus" ? "Bus started" : "Wire started", `Start point snapped to ${(sx / 20).toFixed(2)}, ${(sy / 20).toFixed(2)} mm. Tap the endpoint to commit.`, "success");
        return;
      }
      const bus = state.canvasTool === "bus";
      state.schematicMutations.push({ type: bus ? "bus" : "wire", id: `${bus ? "B" : "W"}${sequence}`, name: bus ? `DATA[7:0]_${sequence}` : undefined, x1: state.pendingWireStart.x, y1: state.pendingWireStart.y, x2: sx, y2: sy });
      state.pendingWireStart = null;
      toastTitle = bus ? "Bus committed" : "Wire committed";
      toastCopy = `${bus ? `DATA[7:0]_${sequence}` : `W${sequence}`} was added to the working schematic.`;
    } else if (state.canvasTool === "place") {
      state.schematicMutations.push({ type: "resistor", id: `RNEW${sequence}`, ref: `RNEW${sequence}`, value: "1 kΩ", x: sx, y: sy });
      toastTitle = "Instance placed";
      toastCopy = `RNEW${sequence} · 1 kΩ was added at ${(sx / 20).toFixed(2)}, ${(sy / 20).toFixed(2)} mm.`;
    } else if (state.canvasTool === "label") {
      state.schematicMutations.push({ type: "label", id: `L${sequence}`, text: `net_new_${sequence}`, x: sx, y: sy });
      toastTitle = "Net label placed";
      toastCopy = `net_new_${sequence} was added to the working schematic.`;
    } else if (state.canvasTool === "probe") {
      state.schematicMutations.push({ type: "probe", id: `P${sequence}`, ref: `P${sequence}`, x: sx, y: sy });
      toastTitle = "Probe placed";
      toastCopy = `P${sequence} was added to the saved-output set.`;
    } else if (state.canvasTool === "measure") {
      state.schematicMutations.push({ type: "measure", id: `M${sequence}`, label: `${(sx / 20).toFixed(2)} mm`, x: sx, y: sy });
      toastTitle = "Measurement added";
      toastCopy = `M${sequence} is retained with the working schematic.`;
    } else return;
    state.schematicRedo.length = 0;
    state.schematicSequence += 1;
    markWorkspaceChanged({ checksStale: true });
    renderDocuments();
    drawSchematic();
    showToast(toastTitle, `${toastCopy} Checks and previous results are now stale.`, "success");
  }

  function drawSchematic() {
    const canvas = $("#schematic-canvas");
    if (!canvas) return;
    const { ctx, width, height } = prepareCanvas(canvas);
    const colors = { canvas: css("--canvas"), grid: css("--canvas-grid"), wire: css("--wire"), symbol: css("--symbol"), net: css("--net-label"), text: css("--text"), dim: css("--text-dim"), faint: css("--text-faint"), accent: css("--accent"), panel: css("--panel"), ok: css("--ok") };
    ctx.fillStyle = colors.canvas; ctx.fillRect(0, 0, width, height);
    if (state.canvasGrid) drawGrid(ctx, width, height, 20, colors.grid, true);
    const logicalW = 940, logicalH = 590;
    const scale = Math.min((width - 30) / logicalW, (height - 20) / logicalH) * state.canvasZoom;
    const ox = (width - logicalW * scale) / 2;
    const oy = (height - logicalH * scale) / 2;
    ctx.save(); ctx.translate(ox, oy); ctx.scale(scale, scale);

    drawWire(ctx, [[60, 185], [190, 185], [190, 165], [242, 165]], colors.wire);
    drawWire(ctx, [[60, 405], [190, 405], [190, 385], [242, 385]], colors.wire);
    drawWire(ctx, [[361, 185], [430, 185], [430, 268], [552, 268]], colors.wire);
    drawWire(ctx, [[361, 405], [430, 405], [430, 328], [552, 328]], colors.wire);
    drawWire(ctx, [[651, 298], [832, 298]], colors.wire);
    drawWire(ctx, [[700, 298], [700, 455]], colors.wire);
    drawWire(ctx, [[190, 185], [190, 110], [335, 110], [335, 147]], colors.wire);
    drawWire(ctx, [[190, 405], [190, 480], [335, 480], [335, 423]], colors.wire);
    drawWire(ctx, [[277, 205], [277, 250]], colors.wire);
    drawWire(ctx, [[277, 365], [277, 340]], colors.wire);
    drawWire(ctx, [[277, 250], [277, 265]], colors.wire);
    drawWire(ctx, [[277, 325], [277, 340]], colors.wire);
    drawWire(ctx, [[590, 247], [590, 110], [335, 110]], colors.wire);
    drawWire(ctx, [[590, 349], [590, 480], [335, 480]], colors.wire);
    drawWire(ctx, [[590, 298], [590, 236]], colors.wire);
    drawWire(ctx, [[590, 360], [590, 455]], colors.wire);
    drawWire(ctx, [[505, 318], [505, 385], [530, 385]], colors.wire);
    drawWire(ctx, [[530, 385], [530, 455]], colors.wire);
    drawWire(ctx, [[505, 278], [505, 210], [530, 210]], colors.wire);
    drawWire(ctx, [[530, 210], [530, 130]], colors.wire);

    [ [190,185], [190,405], [430,185], [430,405], [700,298], [335,110], [335,480] ].forEach(([x,y]) => drawJunction(ctx,x,y,colors.wire));
    drawPort(ctx, 33, 185, "SENSOR_P", "in", colors);
    drawPort(ctx, 33, 405, "SENSOR_N", "in", colors);
    drawPort(ctx, 832, 298, "AFE_OUT", "out", colors);
    const display = (id, ref, value) => ({ ref: state.componentEdits[id]?.instance || ref, value: state.componentEdits[id]?.value || value });
    const u1 = display("U1", "U1", "OPA189"), u2 = display("U2", "U2", "OPA189"), u3 = display("U3", "U3:A", "OPA2189"), rg = display("RG", "RG", "499 Ω");
    drawOpAmp(ctx, 300, 185, u1.ref, u1.value, colors, state.selectedComponent === "U1");
    drawOpAmp(ctx, 300, 405, u2.ref, u2.value, colors, state.selectedComponent === "U2");
    drawOpAmp(ctx, 590, 298, u3.ref, u3.value, colors, state.selectedComponent === "U3");
    drawResistor(ctx, 277, 250, 277, 340, rg.ref, rg.value, colors, state.selectedComponent === "RG");
    drawResistor(ctx, 335, 110, 445, 110, "R1", "10 kΩ", colors);
    drawResistor(ctx, 335, 480, 445, 480, "R2", "10 kΩ", colors);
    drawResistor(ctx, 530, 130, 530, 210, "R3", "10 kΩ", colors);
    drawResistor(ctx, 530, 385, 530, 455, "R4", "10 kΩ", colors);
    drawResistor(ctx, 700, 340, 700, 410, "RLOAD", "10 kΩ", colors);
    drawCapacitor(ctx, 760, 298, 455, "CFILT", "22 nF", colors);
    drawGround(ctx, 700, 455, colors); drawGround(ctx, 760, 455, colors); drawGround(ctx, 530, 455, colors);
    drawWire(ctx, [[760, 298], [760, 350]], colors.wire);
    drawWire(ctx, [[760, 410], [760, 455]], colors.wire);
    ctx.fillStyle = colors.net; ctx.font = '500 10px "IBM Plex Mono"';
    ctx.fillText("u1_out", 380, 177); ctx.fillText("u2_out", 380, 397); ctx.fillText("vref_2v5", 470, 377); ctx.fillText("afe_out", 718, 288);
    ctx.fillStyle = colors.dim; ctx.font = '400 10px "IBM Plex Mono"';
    ctx.fillText("Instrumentation amplifier · gain = 1 + 2R/RG = 41.08 V/V", 243, 548);
    drawAnnotation(ctx, 365, 135, "+2.501 342 V", colors, "ok");
    drawAnnotation(ctx, 365, 415, "+2.498 811 V", colors, "ok");
    drawAnnotation(ctx, 660, 255, "+3.742 096 V", colors, "accent");
    drawAnnotation(ctx, 135, 150, "+5.000 41 mV", colors, "ok");
    drawAnnotation(ctx, 135, 420, "−5.000 39 mV", colors, "ok");
    drawSchematicMutations(ctx, colors);
    ctx.restore();
    canvas._scene = { scale, ox, oy, hotspots: [
      { id: "U1", x: 235, y: 127, w: 134, h: 116 }, { id: "U2", x: 235, y: 347, w: 134, h: 116 }, { id: "U3", x: 525, y: 240, w: 134, h: 116 }, { id: "RG", x: 245, y: 260, w: 65, h: 70 }
    ] };
  }

  function bindSchematicCanvas(canvas) {
    if (canvas.dataset.bound === "true") return;
    canvas.dataset.bound = "true";
    canvas.addEventListener("pointermove", (event) => {
      const scene = canvas._scene;
      if (!scene) return;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left - scene.ox) / scene.scale;
      const y = (event.clientY - rect.top - scene.oy) / scene.scale;
      $("#cursor-coordinates").textContent = `x ${(x / 20).toFixed(2)} · y ${(y / 20).toFixed(2)} mm`;
      const hit = scene.hotspots.some((h) => x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h);
      canvas.style.cursor = state.canvasTool === "select" && hit ? "pointer" : "crosshair";
    });
    canvas.addEventListener("pointerleave", () => { $("#cursor-coordinates").textContent = "x — · y — mm"; });
    canvas.addEventListener("click", (event) => {
      const scene = canvas._scene;
      if (!scene) return;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left - scene.ox) / scene.scale;
      const y = (event.clientY - rect.top - scene.oy) / scene.scale;
      const hit = scene.hotspots.find((h) => x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h);
      if (state.canvasTool === "select") {
        if (hit) selectComponent(hit.id);
        return;
      }
      applySchematicGesture(x, y);
    });
    canvas.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const order = ["U1", "U2", "U3", "RG"];
      const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      selectComponent(order[(order.indexOf(state.selectedComponent) + direction + order.length) % order.length]);
    });
  }

  function selectComponent(id) {
    state.selectedComponent = id;
    $("#right-panel-content").innerHTML = rightPanelForView("design");
    hydrateIcons($("#right-panel-content"));
    bindDynamicEvents();
    const edits = state.componentEdits[id] || {};
    $("#selection-status").textContent = `${edits.instance || id} · ${edits.value || (id === "RG" ? "499 Ω" : id === "U3" ? "OPA2189" : "OPA189")}`;
    syncWorkspaceStateChrome();
    drawSchematic();
    announce(`${id} selected in schematic`);
  }

  function plotFrame(ctx, x, y, w, h, labels, colors) {
    ctx.save();
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 10; i += 1) { const px = x + (w * i / 10); ctx.moveTo(px, y); ctx.lineTo(px, y + h); }
    for (let i = 0; i <= 5; i += 1) { const py = y + (h * i / 5); ctx.moveTo(x, py); ctx.lineTo(x + w, py); }
    ctx.stroke();
    ctx.strokeStyle = colors.border;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = colors.dim;
    ctx.font = '400 10px "IBM Plex Mono"';
    ctx.textAlign = "right";
    labels.forEach((label, index) => ctx.fillText(label, x - 8, y + (h * index / (labels.length - 1)) + 3));
    ctx.textAlign = "left";
    ctx.restore();
  }

  function drawTrace(ctx, fn, x, y, w, h, color, samples = 700, dash = [], alpha = 1) {
    ctx.save();
    ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = 1.7; ctx.setLineDash(dash); ctx.beginPath();
    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      const sourceT = state.plotPan + t / state.plotZoom;
      const value = Math.max(0, Math.min(1, fn(sourceT)));
      const px = x + t * w, py = y + (1 - value) * h;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke(); ctx.restore();
  }

  function setLegend(items) {
    const legend = $("#plot-legend");
    if (!legend) return;
    legend.innerHTML = items.map(([name, color, style = "solid"]) => `<span class="legend-item"><span class="trace-swatch" style="--trace-color:${color};${style === "dash" ? "background:repeating-linear-gradient(90deg," + color + " 0 6px,transparent 6px 9px)" : ""}"></span>${name}</span>`).join("");
  }

  function drawResultsPlot() {
    const canvas = $("#plot-canvas");
    if (!canvas) return;
    const { ctx, width, height } = prepareCanvas(canvas);
    const colors = { canvas: css("--canvas"), grid: css("--canvas-grid"), border: css("--border"), text: css("--text"), dim: css("--text-dim"), faint: css("--text-faint"), accent: css("--accent"), panel: css("--panel"), t1: css("--trace-1"), t2: css("--trace-2"), t3: css("--trace-3"), t4: css("--trace-4"), t5: css("--trace-5"), t6: css("--trace-6"), ok: css("--ok"), error: css("--error") };
    ctx.fillStyle = colors.canvas; ctx.fillRect(0, 0, width, height);
    const left = Math.max(55, Math.min(74, width * 0.075));
    const right = 20;
    const compactPlot = height < 220;
    const top = compactPlot ? 32 : 52;
    const bottom = compactPlot ? 18 : 29;
    const plotW = Math.max(100, width - left - right);
    const plotH = Math.max(28, height - top - bottom);
    ctx.fillStyle = colors.dim; ctx.font = '400 10px "IBM Plex Mono"';

    if (state.resultMode === "waves") {
      const gap = compactPlot ? 0 : 23;
      const h = compactPlot ? plotH : (plotH - gap) / 2;
      const mapY = (value) => state.plotLog ? Math.log10(1 + 9 * Math.max(0, value)) : value;
      plotFrame(ctx, left, top, plotW, h, state.plotLog ? ["5 V", "2 V", "500 mV", "100 mV", "10 mV", "1 mV"] : ["5 V", "4 V", "3 V", "2 V", "1 V", "0 V"], colors);
      if (!compactPlot) plotFrame(ctx, left, top + h + gap, plotW, h, ["2.0 mA", "1.6 mA", "1.2 mA", "0.8 mA", "0.4 mA", "0 mA"], colors);
      drawTrace(ctx, (t) => mapY(0.05 + 0.9 * (1 - Math.exp(-Math.max(0, t - 0.08) * 13)) + 0.025 * Math.exp(-Math.max(0, t - 0.08) * 20) * Math.sin(t * 95)), left, top, plotW, h, colors.t1);
      drawTrace(ctx, (t) => mapY(0.16 + 0.72 * (1 - Math.exp(-Math.max(0, t - 0.15) * 8))), left, top, plotW, h, colors.t2, 700, [6, 3]);
      if (!compactPlot) drawTrace(ctx, (t) => 0.18 + 0.65 * (1 - Math.exp(-Math.max(0, t - 0.08) * 10)) + 0.04 * Math.sin(t * 34) * Math.exp(-t * 1.2), left, top + h + gap, plotW, h, colors.t4);
      ctx.fillStyle = colors.dim; ctx.textAlign = "center";
      for (let i = 0; i <= 10; i += 1) ctx.fillText(`${((state.plotPan + i / 10 / state.plotZoom) * 20).toFixed(state.plotZoom > 1 ? 1 : 0)} ms`, left + plotW * i / 10, height - 10);
      ctx.textAlign = "left";
      if (state.cursorEnabled) {
        [0.23, 0.58].forEach((fraction, index) => {
          const x = left + plotW * fraction;
          ctx.strokeStyle = index === 0 ? colors.t2 : colors.accent; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + plotH); ctx.stroke(); ctx.setLineDash([]);
          roundedRect(ctx, x - 9, top + 4, 18, 16, 3); ctx.fillStyle = index === 0 ? colors.t2 : colors.accent; ctx.fill(); ctx.fillStyle = colors.canvas; ctx.font = '500 10px "IBM Plex Mono"'; ctx.textAlign = "center"; ctx.fillText(index === 0 ? "A" : "B", x, top + 15);
        });
      }
      setLegend(compactPlot ? [["V(afe_out)", colors.t1], ["V(sensor_p) × 400", colors.t2, "dash"]] : [["V(afe_out)", colors.t1], ["V(sensor_p) × 400", colors.t2, "dash"], ["I(VDD)", colors.t4]]);
    } else if (state.resultMode === "dc") {
      plotFrame(ctx, left, top, plotW, plotH, ["5.0 V", "4.0 V", "3.0 V", "2.0 V", "1.0 V", "0 V"], colors);
      drawTrace(ctx, (t) => 0.5 + 0.46 * Math.tanh((t - 0.5) * 5.4), left, top, plotW, plotH, colors.t1);
      drawTrace(ctx, (t) => 0.48 + 0.42 * Math.tanh((t - 0.54) * 4.8), left, top, plotW, plotH, colors.t2, 700, [6, 3]);
      ctx.fillStyle = colors.dim; ctx.textAlign = "center"; for (let i = 0; i <= 10; i += 1) ctx.fillText(`${-10 + i * 2} mV`, left + plotW * i / 10, height - 10);
      setLegend([["V(afe_out)", colors.t1], ["V(reference)", colors.t2, "dash"]]);
    } else if (state.resultMode === "sens") {
      plotFrame(ctx, left, top, plotW, plotH, ["+100%", "+60%", "+20%", "−20%", "−60%", "−100%"], colors);
      const sensitivities = [["RGAIN", .92], ["CFILT", .71], ["U1.VOS", .54], ["RFB", .39], ["CCOMP", .27], ["VREF", .13]];
      sensitivities.forEach(([name, value], index) => { const y = top + 18 + index * Math.max(22, (plotH - 30) / sensitivities.length); ctx.fillStyle = index < 2 ? colors.t1 : colors.t2; ctx.fillRect(left + plotW / 2, y, value * plotW * .42, 12); ctx.fillStyle = colors.dim; ctx.textAlign = "right"; ctx.fillText(name, left + plotW / 2 - 8, y + 10); ctx.textAlign = "left"; ctx.fillText(`${(value * 100).toFixed(1)}%`, left + plotW / 2 + value * plotW * .42 + 6, y + 10); });
      setLegend([["normalized influence", colors.t1], ["secondary contributors", colors.t2]]);
    } else if (state.resultMode === "op") {
      plotFrame(ctx, left, top, plotW, plotH, ["5 V", "4 V", "3 V", "2 V", "1 V", "0 V"], colors);
      const operatingPoints = [["afe_out", .75], ["u1_out", .50], ["u2_out", .50], ["vref_2v5", .50], ["sensor_p", .05], ["sensor_n", .04]];
      operatingPoints.forEach(([name, value], index) => { const slot = plotW / operatingPoints.length, barW = slot * .52, x = left + slot * (index + .24); ctx.fillStyle = index === 0 ? colors.t1 : colors.t2; ctx.fillRect(x, top + plotH * (1 - value), barW, plotH * value); ctx.fillStyle = colors.dim; ctx.textAlign = "center"; ctx.fillText(name, x + barW / 2, height - 10); });
      setLegend([["node operating-point voltage", colors.t1], ["internal nodes", colors.t2]]);
    } else if (state.resultMode === "noise") {
      plotFrame(ctx, left, top, plotW, plotH, ["100 nV/√Hz", "30 nV/√Hz", "10 nV/√Hz", "3 nV/√Hz", "1 nV/√Hz", "0.3 nV/√Hz"], colors);
      drawTrace(ctx, (t) => .82 - .62 * Math.log10(1 + t * 9) + .035 * Math.sin(t * 24), left, top, plotW, plotH, colors.t1);
      drawTrace(ctx, (t) => .62 - .45 * Math.log10(1 + t * 9), left, top, plotW, plotH, colors.t2, 700, [5, 3]);
      ctx.fillStyle = colors.dim; ctx.textAlign = "center"; ["1 Hz", "10 Hz", "100 Hz", "1 kHz", "10 kHz", "100 kHz", "1 MHz"].forEach((label, index, array) => ctx.fillText(label, left + plotW * index / (array.length - 1), height - 10));
      setLegend([["input-referred noise", colors.t1], ["U1 contribution", colors.t2, "dash"]]);
    } else if (state.resultMode === "specs") {
      plotFrame(ctx, left, top, plotW, plotH, ["200%", "160%", "120%", "80%", "40%", "0%"], colors);
      const specs = [["gain", 1.013, true], ["settling", 1.039, true], ["noise", 1.215, true], ["PM", 1.124, true], ["power", 1.522, true], ["offset", 1.442, true]];
      specs.forEach(([name, value, pass], index) => { const slot = plotW / specs.length, barW = slot * .54, x = left + slot * (index + .23); ctx.fillStyle = pass ? colors.ok : colors.error; ctx.fillRect(x, top + plotH * (1 - Math.min(1, value / 2)), barW, plotH * Math.min(1, value / 2)); ctx.fillStyle = colors.dim; ctx.textAlign = "center"; ctx.fillText(name, x + barW / 2, height - 10); });
      ctx.strokeStyle = colors.warn; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(left, top + plotH * .5); ctx.lineTo(left + plotW, top + plotH * .5); ctx.stroke(); ctx.setLineDash([]);
      setLegend([["passing margin", colors.ok], ["requirement boundary", colors.warn, "dash"]]);
    } else if (state.resultMode === "bode") {
      const gap = 23, h = (plotH - gap) / 2;
      plotFrame(ctx, left, top, plotW, h, ["60 dB", "48 dB", "36 dB", "24 dB", "12 dB", "0 dB"], colors);
      plotFrame(ctx, left, top + h + gap, plotW, h, ["0°", "−36°", "−72°", "−108°", "−144°", "−180°"], colors);
      drawTrace(ctx, (t) => 0.78 - Math.log10(1 + Math.pow(t * 8, 3)) / 2.7, left, top, plotW, h, colors.t1);
      drawTrace(ctx, (t) => 0.99 - 0.88 * (2 / Math.PI) * Math.atan(t * 6), left, top + h + gap, plotW, h, colors.t2);
      ctx.fillStyle = colors.dim; ctx.textAlign = "center"; ["1 Hz", "10 Hz", "100 Hz", "1 kHz", "10 kHz", "100 kHz", "1 MHz", "10 MHz"].forEach((label, i, arr) => ctx.fillText(label, left + plotW * i / (arr.length - 1), height - 10));
      setLegend([["dB20(V(afe_out)/V(diff))", colors.t1], ["phase(V(afe_out))", colors.t2]]);
    } else if (state.resultMode === "fft") {
      plotFrame(ctx, left, top, plotW, plotH, ["0 dBc", "−24 dBc", "−48 dBc", "−72 dBc", "−96 dBc", "−120 dBc"], colors);
      const peaks = [[0.1, .92], [.2, .34], [.3, .18], [.4, .12], [.5, .08], [.6, .06], [.7, .045], [.8, .035], [.9, .025]];
      peaks.forEach(([x, amp], i) => { ctx.strokeStyle = i === 0 ? colors.t1 : colors.t2; ctx.lineWidth = i === 0 ? 2 : 1.5; ctx.beginPath(); ctx.moveTo(left + plotW * x, top + plotH); ctx.lineTo(left + plotW * x, top + plotH * (1 - amp)); ctx.stroke(); });
      ctx.strokeStyle = colors.t4; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i <= 500; i++) { const t = i / 500; const noise = .015 + .018 * (0.5 + 0.5 * Math.sin(i * 2.731)) * (1 - t * .3); const px = left + plotW * t, py = top + plotH * (1 - noise); if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.stroke();
      ctx.fillStyle = colors.dim; ctx.textAlign = "center"; for (let i = 0; i <= 10; i++) ctx.fillText(`${i} kHz`, left + plotW * i / 10, height - 10);
      setLegend([["V(afe_out) spectrum", colors.t1], ["harmonics", colors.t2], ["noise floor", colors.t4]]);
    } else if (state.resultMode === "eye") {
      plotFrame(ctx, left, top, plotW, plotH, ["5 V", "4 V", "3 V", "2 V", "1 V", "0 V"], colors);
      for (let n = 0; n < 34; n++) {
        const phase = (n * 0.37) % 1;
        drawTrace(ctx, (t) => 0.5 + 0.42 * Math.tanh(Math.sin((t + phase * .025) * Math.PI * 2) * 7) + Math.sin(t * 17 + n) * .006, left, top, plotW, plotH, n % 3 === 0 ? colors.t2 : colors.t1, 260, [], n % 3 === 0 ? 0.7 : 0.25);
      }
      ctx.strokeStyle = colors.error; ctx.setLineDash([5, 4]); ctx.strokeRect(left + plotW * .39, top + plotH * .35, plotW * .22, plotH * .3); ctx.setLineDash([]);
      ctx.fillStyle = colors.dim; ctx.textAlign = "center"; for (let i = 0; i <= 4; i++) ctx.fillText(`${(i * .25).toFixed(2)} UI`, left + plotW * i / 4, height - 10);
      setLegend([["V(afe_out) · 34 overlays", colors.t1], ["mask · 0 violations", colors.error, "dash"]]);
    } else if (state.resultMode === "smith") {
      const radius = Math.min(plotW, plotH) * .42, cx = left + plotW / 2, cy = top + plotH / 2;
      ctx.strokeStyle = colors.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
      [0.2, 0.5, 1, 2, 5].forEach((r, i) => { ctx.beginPath(); ctx.arc(cx + radius * (i - 2) * .12, cy, radius * (.15 + i * .12), 0, Math.PI * 2); ctx.stroke(); });
      ctx.beginPath(); ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy); ctx.stroke();
      ctx.strokeStyle = colors.t1; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 260; i++) { const t = i / 260; const angle = -2.8 + t * 5.6; const rr = radius * (.18 + .62 * t); const px = cx + Math.cos(angle) * rr, py = cy + Math.sin(angle) * rr * .68; if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.stroke();
      setLegend([["S11 · Port 1 · Z₀ 50 Ω", colors.t1]]);
    } else if (state.resultMode === "nyquist" || state.resultMode === "pz") {
      const cx = left + plotW / 2, cy = top + plotH / 2;
      ctx.strokeStyle = colors.grid; ctx.beginPath(); ctx.moveTo(left, cy); ctx.lineTo(left + plotW, cy); ctx.moveTo(cx, top); ctx.lineTo(cx, top + plotH); ctx.stroke();
      if (state.resultMode === "nyquist") {
        ctx.strokeStyle = colors.t1; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 400; i++) { const t = i / 400 * Math.PI * 2; const r = 1.6 - .17 * t; const px = cx + Math.cos(t) * r * plotW * .13, py = cy + Math.sin(t) * r * plotH * .19; if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.stroke();
        ctx.fillStyle = colors.error; ctx.beginPath(); ctx.arc(cx - plotW * .12, cy, 4, 0, Math.PI * 2); ctx.fill(); setLegend([["loop_gain", colors.t1], ["critical −1+j0", colors.error]]);
      } else {
        [[-.28,.12],[-.28,-.12],[-.13,.31],[-.13,-.31]].forEach(([x,y]) => { const px=cx+x*plotW, py=cy-y*plotH; ctx.strokeStyle=colors.error;ctx.beginPath();ctx.moveTo(px-5,py-5);ctx.lineTo(px+5,py+5);ctx.moveTo(px+5,py-5);ctx.lineTo(px-5,py+5);ctx.stroke(); });
        [[-.06,.2],[-.06,-.2]].forEach(([x,y]) => { ctx.strokeStyle=colors.ok;ctx.beginPath();ctx.arc(cx+x*plotW,cy-y*plotH,5,0,Math.PI*2);ctx.stroke(); }); setLegend([["poles", colors.error], ["zeros", colors.ok]]);
      }
    } else if (state.resultMode === "hb") {
      plotFrame(ctx, left, top, plotW, plotH, ["0 dBc", "−20 dBc", "−40 dBc", "−60 dBc", "−80 dBc", "−100 dBc"], colors);
      const tones = [[1, .94], [2, .42], [3, .27], [4, .17], [5, .11], [6, .08], [7, .06], [8, .04], [9, .03]];
      tones.forEach(([harmonic, value], index) => { const x = left + plotW * harmonic / 10; ctx.strokeStyle = index === 0 ? colors.t1 : colors.t2; ctx.lineWidth = index === 0 ? 3 : 2; ctx.beginPath(); ctx.moveTo(x, top + plotH); ctx.lineTo(x, top + plotH * (1 - value)); ctx.stroke(); });
      ctx.fillStyle = colors.dim; ctx.textAlign = "center"; for (let i = 0; i <= 10; i += 1) ctx.fillText(`${i}f₀`, left + plotW * i / 10, height - 10);
      setLegend([["fundamental", colors.t1], ["harmonics / mixing products", colors.t2]]);
    } else if (state.resultMode === "phase-noise") {
      plotFrame(ctx, left, top, plotW, plotH, ["−40 dBc/Hz", "−60 dBc/Hz", "−80 dBc/Hz", "−100 dBc/Hz", "−120 dBc/Hz", "−140 dBc/Hz"], colors);
      drawTrace(ctx, (t) => .92 - .83 * Math.log10(1 + 25 * t) / Math.log10(26) + .025 * Math.sin(t * 35), left, top, plotW, plotH, colors.t1);
      ctx.fillStyle = colors.dim; ctx.textAlign = "center"; ["1 Hz", "10 Hz", "100 Hz", "1 kHz", "10 kHz", "100 kHz", "1 MHz"].forEach((label, index, array) => ctx.fillText(label, left + plotW * index / (array.length - 1), height - 10));
      setLegend([["phase noise · carrier 1 GHz", colors.t1], ["integrated jitter 82.4 fs", colors.t2]]);
    } else if (state.resultMode === "hist") {
      drawHistogram(ctx, left, top, plotW, plotH, colors, false); setLegend([["Monte Carlo samples", colors.t2], ["spec limit", colors.error, "dash"]]);
    } else {
      plotFrame(ctx, left, top, plotW, plotH, ["100%", "80%", "60%", "40%", "20%", "0%"], colors);
      const values = [0.92,.81,.72,.63,.58,.48,.36,.28,.19,.12];
      values.forEach((v,i) => { const bw=plotW/values.length*.62, x=left+(i+.19)*plotW/values.length; ctx.fillStyle=i<4?colors.t1:colors.t2; ctx.fillRect(x,top+plotH*(1-v),bw,plotH*v); });
      ctx.fillStyle=colors.dim;ctx.textAlign="center";values.forEach((_,i)=>ctx.fillText(String(i+1),left+(i+.5)*plotW/values.length,height-10));
      setLegend([[state.resultMode.toUpperCase()+" result data", colors.t1], ["secondary series", colors.t2]]);
    }
  }

  function drawHistogram(ctx, x, y, w, h, colors, verification) {
    const bins = [1,2,3,6,11,19,31,49,70,94,119,135,143,132,104,76,49,30,16,6,3,1];
    const max = Math.max(...bins);
    const barW = w / bins.length;
    ctx.strokeStyle = colors.grid; ctx.lineWidth = 1; ctx.beginPath();
    for (let i=0;i<=5;i++){const py=y+h*i/5;ctx.moveTo(x,py);ctx.lineTo(x+w,py);}ctx.stroke();
    bins.forEach((value,index)=>{const bh=(value/max)*(h-18);ctx.fillStyle=index>17?colors.error:colors.t2;ctx.fillRect(x+index*barW+1,y+h-bh,Math.max(1,barW-2),bh);});
    const limitX=x+w*.82;ctx.strokeStyle=colors.error;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(limitX,y);ctx.lineTo(limitX,y+h);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=colors.dim;ctx.font='400 10px "IBM Plex Mono"';ctx.textAlign="center";["39.5","39.7","39.9","40.1","40.3","40.5"].forEach((label,i,arr)=>ctx.fillText(`${label} dB`,x+w*i/(arr.length-1),y+h+15));
    if(verification){ctx.textAlign="left";ctx.fillStyle=colors.error;ctx.fillText("spec limit",limitX+5,y+12);}ctx.textAlign="left";
  }

  function drawYieldHistogram() {
    const canvas=$("#yield-histogram");if(!canvas)return;const {ctx,width,height}=prepareCanvas(canvas);const colors={canvas:css("--canvas"),grid:css("--canvas-grid"),border:css("--border"),dim:css("--text-dim"),t2:css("--trace-2"),error:css("--error")};ctx.fillStyle=colors.canvas;ctx.fillRect(0,0,width,height);const left=48,top=51,right=18,bottom=27;drawHistogram(ctx,left,top,Math.max(80,width-left-right),Math.max(80,height-top-bottom),colors,true);
  }

  function drawTunerPlot() {
    const canvas = $("#tuner-plot");
    if (!canvas) return;
    const { ctx, width, height } = prepareCanvas(canvas);
    const colors = { canvas: css("--canvas"), grid: css("--canvas-grid"), border: css("--border"), dim: css("--text-dim"), baseline: css("--trace-2"), candidate: css("--accent") };
    ctx.fillStyle = colors.canvas; ctx.fillRect(0, 0, width, height);
    const left = 52, top = 38, right = 18, bottom = 30, plotWidth = Math.max(80, width - left - right), plotHeight = Math.max(80, height - top - bottom);
    plotFrame(ctx, left, top, plotWidth, plotHeight, ["5 V", "4 V", "3 V", "2 V", "1 V", "0 V"], colors);
    const response = (metrics) => (t) => {
      const rate = 5.7 * 4.812 / Math.max(0.5, metrics.settlingMs);
      const damping = Math.max(0.15, Math.min(0.95, metrics.phaseMargin / 90));
      return 0.08 + 0.84 * (1 - Math.exp(-rate * t)) + (1 - damping) * 0.16 * Math.exp(-5 * t) * Math.sin(28 * t);
    };
    drawTrace(ctx, response(tuningMetrics(state.tuningBaseline)), left, top, plotWidth, plotHeight, colors.baseline, 360, [6, 4], 0.9);
    drawTrace(ctx, response(tuningMetrics()), left, top, plotWidth, plotHeight, colors.candidate, 360, [], 1);
    ctx.font = '500 10px "IBM Plex Mono"'; ctx.textAlign = "center"; ctx.fillStyle = colors.dim;
    for (let index = 0; index <= 5; index += 1) ctx.fillText(`${index * 2} ms`, left + plotWidth * index / 5, height - 9);
    ctx.textAlign = "left"; ctx.fillStyle = colors.candidate; ctx.fillText("provisional", left + 8, top + 14);
    ctx.fillStyle = colors.baseline; ctx.fillText("Run baseline", left + 96, top + 14);
  }

  function drawActiveCanvas(){if(state.view==="design")drawSchematic();if(state.view==="results")drawResultsPlot();if(state.view==="verify"){if(state.verifyMode==="tuning")drawTunerPlot();else drawYieldHistogram();}}

  function bindPaneSplitter(splitter, side) {
    if (!splitter) return;
    const workbench = $(".workbench");
    const property = side === "left" ? "--left-dock-column" : "--right-dock-column";
    const min = side === "left" ? 220 : 278;
    const defaultValue = side === "left" ? "clamp(220px, 18vw, 256px)" : "clamp(278px, 22vw, 312px)";
    const clampWidth = (value) => {
      const available = Math.max(min, workbench.getBoundingClientRect().width - 620);
      return Math.round(Math.max(min, Math.min(Math.min(440, available), value)));
    };
    const persistWidth = (width) => {
      state.dockSizes[state.view] = { ...(state.dockSizes[state.view] || {}), [side]: width };
      writePreference("rspice-dock-sizes", JSON.stringify(state.dockSizes));
    };
    const resetWidth = () => {
      workbench.style.setProperty(property, defaultValue);
      if (state.dockSizes[state.view]) {
        delete state.dockSizes[state.view][side];
        if (!Object.keys(state.dockSizes[state.view]).length) delete state.dockSizes[state.view];
        writePreference("rspice-dock-sizes", JSON.stringify(state.dockSizes));
      }
      splitter.setAttribute("aria-valuenow", side === "left" ? "256" : "312");
      requestAnimationFrame(drawActiveCanvas);
    };
    const applyClientX = (clientX) => {
      const rect = workbench.getBoundingClientRect();
      const rail = parseFloat(getComputedStyle(workbench).getPropertyValue("--rail-column")) || 51;
      const width = clampWidth(side === "left" ? clientX - rect.left - rail : rect.right - clientX);
      workbench.style.setProperty(property, `${width}px`);
      splitter.setAttribute("aria-valuemin", String(min));
      splitter.setAttribute("aria-valuemax", "440");
      splitter.setAttribute("aria-valuenow", String(width));
      persistWidth(width);
      requestAnimationFrame(drawActiveCanvas);
    };
    splitter.addEventListener("pointerdown", (event) => {
      if (innerWidth <= 1260) return;
      event.preventDefault();
      splitter.setPointerCapture(event.pointerId);
      splitter.classList.add("is-resizing");
      workbench.classList.add("resizing-columns");
      const move = (moveEvent) => applyClientX(moveEvent.clientX);
      const stop = () => {
        splitter.classList.remove("is-resizing");
        workbench.classList.remove("resizing-columns");
        splitter.removeEventListener("pointermove", move);
        splitter.removeEventListener("pointerup", stop);
        splitter.removeEventListener("pointercancel", stop);
      };
      splitter.addEventListener("pointermove", move);
      splitter.addEventListener("pointerup", stop);
      splitter.addEventListener("pointercancel", stop);
    });
    splitter.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home"].includes(event.key) || innerWidth <= 1260) return;
      event.preventDefault();
      if (event.key === "Home") {
        resetWidth();
        return;
      }
      const rect = splitter.getBoundingClientRect();
      applyClientX(rect.left + rect.width / 2 + (event.key === "ArrowRight" ? 12 : -12));
    });
    splitter.addEventListener("dblclick", resetWidth);
  }

  function updateConsoleLayout() {
    const center = $("#workspace-main");
    const touchLayout = innerWidth <= 820 || state.platform === "mobile" || state.platform === "tablet" || matchMedia("(pointer: coarse)").matches;
    center.classList.toggle("dock-maximized", !touchLayout && state.consoleMaximized);
    center.classList.toggle("console-collapsed", !touchLayout && state.consoleCollapsed && !state.consoleMaximized);
    if (touchLayout) center.style.removeProperty("--dock-row-size");
    else center.style.setProperty("--dock-row-size", `${state.consoleCollapsed ? 31 : state.consoleHeight}px`);
    const splitter = $("#console-splitter");
    if (splitter) {
      splitter.setAttribute("aria-valuenow", String(state.consoleHeight));
      splitter.tabIndex = touchLayout || state.consoleCollapsed || state.consoleMaximized ? -1 : 0;
    }
    const maximize = $("#console-maximize");
    if (maximize) {
      maximize.setAttribute("aria-pressed", String(state.consoleMaximized));
      maximize.setAttribute("aria-label", state.consoleMaximized ? "Restore console" : "Maximize console");
      maximize.title = state.consoleMaximized ? "Restore console" : "Maximize console";
    }
  }

  function bindConsoleSplitter(splitter) {
    if (!splitter) return;
    const center = $("#workspace-main");
    const clampHeight = (height) => Math.round(Math.max(90, Math.min(Math.min(520, center.getBoundingClientRect().height - 120), height)));
    const applyHeight = (height) => {
      state.consoleHeight = clampHeight(height);
      state.consoleCollapsed = false;
      state.consoleMaximized = false;
      state.dockSizes[state.view] = { ...(state.dockSizes[state.view] || {}), console: state.consoleHeight };
      writePreference("rspice-dock-sizes", JSON.stringify(state.dockSizes));
      updateConsoleLayout();
      requestAnimationFrame(drawActiveCanvas);
    };
    const resetHeight = () => {
      state.consoleHeight = 145;
      state.consoleCollapsed = false;
      state.consoleMaximized = false;
      if (state.dockSizes[state.view]) {
        delete state.dockSizes[state.view].console;
        if (!Object.keys(state.dockSizes[state.view]).length) delete state.dockSizes[state.view];
        writePreference("rspice-dock-sizes", JSON.stringify(state.dockSizes));
      }
      updateConsoleLayout();
      requestAnimationFrame(drawActiveCanvas);
    };
    splitter.addEventListener("pointerdown", (event) => {
      if (innerWidth <= 820 || state.platform === "mobile" || state.platform === "tablet" || matchMedia("(pointer: coarse)").matches) return;
      event.preventDefault();
      splitter.setPointerCapture(event.pointerId);
      splitter.classList.add("is-resizing");
      center.classList.add("resizing-dock");
      const move = (moveEvent) => applyHeight(center.getBoundingClientRect().bottom - moveEvent.clientY);
      const stop = () => {
        splitter.classList.remove("is-resizing");
        center.classList.remove("resizing-dock");
        splitter.removeEventListener("pointermove", move);
        splitter.removeEventListener("pointerup", stop);
        splitter.removeEventListener("pointercancel", stop);
      };
      splitter.addEventListener("pointermove", move);
      splitter.addEventListener("pointerup", stop);
      splitter.addEventListener("pointercancel", stop);
    });
    splitter.addEventListener("keydown", (event) => {
      if (!["ArrowUp", "ArrowDown", "Home"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "Home") resetHeight();
      else applyHeight(state.consoleHeight + (event.key === "ArrowUp" ? 16 : -16));
    });
    splitter.addEventListener("dblclick", resetHeight);
  }

  function bindShellEvents() {
    $$(".activity-button[data-view]").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
    $("#document-tabs").addEventListener("click", (event) => {
      const tab = event.target.closest(".document-tab");
      if (!tab) return;
      if (event.target.closest(".tab-close")) {
        state.closedDocs.add(`${state.view}:${tab.dataset.docName}`);
        if (state.activeDocuments[state.view] === tab.dataset.docName) activateDocument(state.view, resolvedDocuments(state.view).find((doc) => doc.active)?.name);
        renderView();
        showToast("Document closed", "The tab was removed from this workspace.", "success");
        return;
      }
      const activeName = tab.dataset.docName;
      activateDocument(state.view, activeName);
      renderView();
      requestAnimationFrame(() => $$(".document-tab").find((candidate) => candidate.dataset.docName === activeName)?.focus({ preventScroll: true }));
    });
    $("#document-tabs").addEventListener("keydown", (event) => {
      const tab = event.target.closest(".document-tab");
      if (!tab) return;
      const tabs = $$(".document-tab", event.currentTarget);
      const index = tabs.indexOf(tab);
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        const nextName = tabs[nextIndex].dataset.docName;
        activateDocument(state.view, nextName);
        renderView();
        requestAnimationFrame(() => $$(".document-tab").find((candidate) => candidate.dataset.docName === nextName)?.focus({ preventScroll: true }));
      } else if (event.key === "Delete" && index > 0) {
        event.preventDefault();
        state.closedDocs.add(`${state.view}:${tab.dataset.docName}`);
        activateDocument(state.view, resolvedDocuments(state.view).find((doc) => doc.active)?.name);
        renderView();
        requestAnimationFrame(() => $(".document-tab")?.focus());
        showToast("Document closed", `${tab.dataset.docName} was closed; underlying project data was not deleted.`, "success");
      }
    });
    $$('[data-menu]').forEach((button) => { button.setAttribute("aria-haspopup", "menu"); button.setAttribute("aria-expanded", "false"); });
    $$('[data-menu]').forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (state.menuTrigger === button) closeMenu(); else { closeMenu(); renderMenu(button.dataset.menu, button); }
    }));
    $("#command-trigger").addEventListener("click", openCommandPalette);
    $("#account-button").addEventListener("click", () => openSettings("licensing"));
    $("#mobile-more").addEventListener("click", () => {
      const dialog = $("#mobile-nav-dialog");
      if (!dialog.open) dialog.showModal();
    });
    $("#mobile-console-button").addEventListener("click", () => {
      const dialog = $("#mobile-nav-dialog");
      if (dialog.open) dialog.close();
      if (!$(".center-stack").classList.contains("console-mobile-open")) toggleConsole();
    });
    $$('[data-action="preferences"]').forEach((button) => button.addEventListener("click", () => openSettings("appearance")));
    $("#run-button").addEventListener("click", toggleRun);
    $("#run-config-button").addEventListener("click", () => { state.simulationSection = "runset"; switchView("simulate"); });
    $("#run-more").addEventListener("click", openJobsManager);
    $("#corner-select").value = state.planCorner;
    $("#corner-select").addEventListener("change", (event) => {
      state.planCorner = event.currentTarget.value;
      markWorkspaceChanged({ checksStale: false });
      if (state.view === "simulate") renderView();
      showToast("Reference PVT point", `${state.planCorner} is the highlighted reference within the next immutable ${PVT_RUN_POINTS.length}-point run set.`, "success");
    });
    $("#console-collapse").addEventListener("click", toggleConsole);
    $("#console-maximize").addEventListener("click", () => {
      state.consoleMaximized = !state.consoleMaximized;
      state.consoleCollapsed = false;
      updateConsoleLayout();
      requestAnimationFrame(drawActiveCanvas);
    });
    $("#console-clear").addEventListener("click", () => {
      $("#console-body").innerHTML = '<div class="empty-hint">Console output cleared. Run records remain available in Jobs.</div>';
      $("#console-context").textContent = "Console cleared locally";
      showToast("Console cleared", "Only the visible console buffer was cleared; immutable run logs were retained.", "success");
    });
    $$(".console-tab").forEach((button) => {
      button.id = `console-tab-${button.dataset.consoleTab}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(button.classList.contains("active")));
      button.setAttribute("aria-controls", "console-body");
      button.tabIndex = button.classList.contains("active") ? 0 : -1;
      button.addEventListener("click", () => {
        state.consoleTab = button.dataset.consoleTab;
        $$(".console-tab").forEach((b) => { const active = b === button; b.classList.toggle("active", active); b.setAttribute("aria-selected", String(active)); b.tabIndex = active ? 0 : -1; });
        $("#console-body").innerHTML = consoleContent(state.consoleTab);
        $("#console-body").setAttribute("aria-labelledby", button.id);
      });
    });
    $("#console-body").setAttribute("role", "tabpanel");
    $("#console-body").setAttribute("aria-labelledby", `console-tab-${state.consoleTab}`);
    $("#problem-summary").addEventListener("click", () => {
      const problems = $('.console-tab[data-console-tab="problems"]');
      problems?.click();
      const center = $(".center-stack");
      if (innerWidth <= 820 || state.platform === "mobile" || matchMedia("(pointer: coarse)").matches) {
        if (!center.classList.contains("console-mobile-open")) toggleConsole();
      } else if (state.consoleCollapsed) toggleConsole();
    });
    $("#zoom-control").addEventListener("click", () => {
      if (state.view === "design") {
        state.canvasZoom = 1;
        $("#zoom-value").textContent = "100%";
        drawSchematic();
      } else if (state.view === "results") handlePlotAction("fit");
    });
    $("#open-left-panel").setAttribute("aria-controls", "left-panel");
    $("#open-left-panel").setAttribute("aria-expanded", "false");
    $("#open-right-panel").setAttribute("aria-controls", "right-panel");
    $("#open-right-panel").setAttribute("aria-expanded", "false");
    $("#open-left-panel").addEventListener("click", (event) => openDrawer("#left-panel", event.currentTarget));
    $("#open-right-panel").addEventListener("click", (event) => openDrawer("#right-panel", event.currentTarget));
    $$('[data-close-drawer]').forEach((node) => node.addEventListener("click", closeDrawers));

    $("#command-input").addEventListener("input", (event) => { state.activeCommandIndex = 0; renderCommandResults(event.target.value); });
    $("#analysis-search").addEventListener("input", (event) => renderAnalysisPicker(event.currentTarget.value));
    $("#command-input").addEventListener("keydown", (event) => {
      const results = $$('[data-command-index]');
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        state.activeCommandIndex = (state.activeCommandIndex + direction + results.length) % Math.max(1, results.length);
        renderCommandResults(event.currentTarget.value);
        $(`#command-option-${state.activeCommandIndex}`)?.scrollIntoView({ block: "nearest" });
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const active = $(`#command-option-${state.activeCommandIndex}`);
        if (active) executeCommand(commandItems[Number(active.dataset.commandIndex)]);
      }
    });
    $$(".scope-chip").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.classList.contains("active")));
      button.addEventListener("click", () => {
        state.commandScope = button.textContent.trim();
        $$(".scope-chip").forEach((chip) => { const active = chip === button; chip.classList.toggle("active", active); chip.setAttribute("aria-pressed", String(active)); });
        state.activeCommandIndex = 0;
        renderCommandResults($("#command-input").value);
        $("#command-input").focus();
      });
    });
    $$(".dialog-close").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
    $$(".settings-nav button").forEach((button) => {
      button.setAttribute("aria-current", button.classList.contains("active") ? "page" : "false");
      button.addEventListener("click", () => {
        $$(".settings-nav button").forEach((b) => { b.classList.toggle("active", b === button); b.setAttribute("aria-current", b === button ? "page" : "false"); });
        $("#settings-content").innerHTML = settingsPageContent(button.dataset.settingsPage || "appearance");
        bindDynamicEvents();
      });
    });
    $("#jobs-run").addEventListener("click", () => {
      toggleRun();
      $("#jobs-manager-body").innerHTML = jobsManagerContent();
      hydrateIcons($("#jobs-manager-body"));
      $("#jobs-run").textContent = state.running ? "Stop active run" : "Run active plan";
    });
    $("#jobs-export").addEventListener("click", exportRunManifest);
    bindPaneSplitter($("#left-pane-splitter"), "left");
    bindPaneSplitter($("#right-pane-splitter"), "right");
    bindConsoleSplitter($("#console-splitter"));
    updateConsoleLayout();
    $("#menu-popover").addEventListener("keydown", (event) => {
      const items = $$(".menu-item", event.currentTarget);
      const index = items.indexOf(document.activeElement);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
      }
      if (event.key === "Escape") { event.preventDefault(); const trigger = state.menuTrigger; closeMenu(); trigger?.focus(); }
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest("#menu-popover") && !event.target.closest("[data-menu]")) closeMenu();
    });
    window.addEventListener("keydown", (event) => {
      const openDrawerPanel = $(".side-panel.drawer-open");
      if (event.key === "Tab" && openDrawerPanel) {
        const focusable = $$('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', openDrawerPanel).filter((node) => !node.closest('[aria-hidden="true"]'));
        if (focusable.length) {
          const first = focusable[0], last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "f") { event.preventDefault(); toggleWorkspaceFocus(); }
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openCommandPalette(); }
      if (event.key === "F5") { event.preventDefault(); if (event.shiftKey) stopRun(); else startRun(); }
      if (event.key === "Escape") { closeDrawers(); closeMenu(); }
      if (event.altKey && /^[1-7]$/.test(event.key)) {
        const order = ["project", "design", "simulate", "results", "verify", "models", "netlist"];
        event.preventDefault(); switchView(order[Number(event.key) - 1]);
      }
    });
    window.addEventListener("resize", () => {
      $(".status-platform span:last-child").textContent = platformCopy();
      updateConsoleLayout();
      drawActiveCanvas();
      if (innerWidth > 1260) closeDrawers();
      else syncPanelVisibility();
    });
  }

  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.density = state.density;
  hydrateIcons(document);
  bindShellEvents();
  renderView();
})();
