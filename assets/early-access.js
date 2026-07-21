(function () {
  "use strict";

  var form = document.querySelector("[data-intake-form]");
  if (!form) return;

  var status = form.querySelector("[data-intake-status]");
  var fallback = form.querySelector("[data-email-fallback]");
  var requirements = form.querySelector("#requirements");
  var requirementsCount = form.querySelector("[data-requirements-count]");
  var plan = form.querySelector("#plan");
  var endpoint = (form.getAttribute("data-intake-endpoint") || "").trim();

  function setStatus(message, state) {
    if (!status) return;
    status.textContent = message;
    status.setAttribute("data-state", state || "");
  }

  function updateCount() {
    if (requirements && requirementsCount) {
      requirementsCount.textContent = String(requirements.value.length);
    }
  }

  function selectRequestedPlan() {
    if (!plan) return;
    var requested = new URLSearchParams(window.location.search).get("plan");
    var values = {
      professional: "Professional",
      team: "Team",
      enterprise: "Enterprise",
      evaluation: "Evaluation"
    };
    if (requested && values[requested.toLowerCase()]) {
      plan.value = values[requested.toLowerCase()];
    }
  }

  function formRecord() {
    var data = new FormData(form);
    return {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      organization: String(data.get("organization") || ""),
      role: String(data.get("role") || ""),
      current_simulator: String(data.get("current_simulator") || ""),
      plan: String(data.get("plan") || ""),
      seats: String(data.get("seats") || ""),
      timeframe: String(data.get("timeframe") || ""),
      annual_budget: String(data.get("annual_budget") || ""),
      procurement: String(data.get("procurement") || ""),
      primary_workload: String(data.get("primary_workload") || ""),
      deployment: String(data.get("deployment") || ""),
      hosted_compute: String(data.get("hosted_compute") || ""),
      collaboration: String(data.get("collaboration") || ""),
      requirements: String(data.get("requirements") || "")
    };
  }

  function emailUrl(record) {
    var subject = "RSpice " + record.plan + " evaluation — " + record.organization;
    var lines = [
      "RSPICE COMMERCIAL DISCOVERY",
      "",
      "Contact: " + record.name,
      "Work email: " + record.email,
      "Organization: " + record.organization,
      "Role: " + (record.role || "Not provided"),
      "Current simulator / flow: " + (record.current_simulator || "Not provided"),
      "",
      "Plan: " + record.plan,
      "Expected editors: " + record.seats,
      "Decision timeframe: " + record.timeframe,
      "Annual software budget: " + (record.annual_budget || "Not provided"),
      "Procurement requirement: " + (record.procurement || "None identified"),
      "",
      "Primary workload: " + record.primary_workload,
      "Deployment: " + record.deployment,
      "Hosted compute: " + (record.hosted_compute || "Not required"),
      "Collaboration: " + (record.collaboration || "Local work only"),
      "",
      "Evaluation requirements:",
      record.requirements
    ];
    return "mailto:sales@rspice.app?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
  }

  function sameOriginEndpoint(value) {
    if (!value) return "";
    try {
      var url = new URL(value, window.location.href);
      return url.origin === window.location.origin && /^https?:$/.test(url.protocol) ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  if (requirements) requirements.addEventListener("input", updateCount);
  form.addEventListener("invalid", function () {
    setStatus("Complete the marked fields before preparing the inquiry.", "error");
  }, true);
  updateCount();
  selectRequestedPlan();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) {
      setStatus("Complete the marked fields before preparing the inquiry.", "error");
      return;
    }

    var record = formRecord();
    var mailto = emailUrl(record);
    var safeEndpoint = sameOriginEndpoint(endpoint);
    if (fallback) {
      fallback.href = mailto;
      fallback.hidden = false;
    }

    if (!safeEndpoint) {
      setStatus("The inquiry is prepared. Review and send it from your email client; no form data was sent by this website.", "ready");
      window.location.href = mailto;
      return;
    }

    setStatus("Sending the inquiry to the configured RSpice intake endpoint…", "ready");
    fetch(safeEndpoint, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(record)
    }).then(function (response) {
      if (!response.ok) throw new Error("intake request failed");
      setStatus("Inquiry received. RSpice will reply to the work email supplied above.", "sent");
      form.reset();
      updateCount();
    }).catch(function () {
      setStatus("The configured intake endpoint did not accept the request. Use the prepared email instead; nothing has been recorded by this page.", "error");
    });
  });
})();
