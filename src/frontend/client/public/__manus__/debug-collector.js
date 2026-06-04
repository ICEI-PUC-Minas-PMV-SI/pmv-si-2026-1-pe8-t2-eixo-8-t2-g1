/**
 * Manus Debug Collector (agent-friendly)
 *
 * Captures:
 * 1) Console logs
 * 2) Network requests (fetch + XHR)
 * 3) User interactions (semantic uiEvents: click/type/submit/nav/scroll/etc.)
 *
 * Data is periodically sent to /__manus__/logs
 * Note: uiEvents are mirrored to sessionEvents for sessionReplay.log
 */
(function () {
  "use strict";

  // Prevent double initialization
  if (window.__MANUS_DEBUG_COLLECTOR__) return;

  // ==========================================================================
  // Configuration
  // ==========================================================================
  const CONFIG = {
    reportEndpoint: "/__manus__/logs",
    bufferSize: {
      console: 500,
      network: 200,
      // semantic, agent-friendly UI events
      ui: 500,
    },
    reportInterval: 2000,
    sensitiveFields: [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
      "cookie",
      "session",
    ],
    maxBodyLength: 10240,
    // UI event logging privacy policy:
    // - inputs matching sensitiveFields or type=password are masked by default
    // - non-sensitive inputs log up to 200 chars
    uiInputMaxLen: 200,
    uiTextMaxLen: 80,
    // Scroll throttling: minimum ms between scroll events
    scrollThrottleMs: 500,
  };

  var STREAMING_CONTENT_TYPES = [
    "text/event-stream",
    "application/stream",
    "application/x-ndjson",
  ];

  var BINARY_CONTENT_TYPES = [
    "image/",
    "video/",
    "audio/",
    "application/octet-stream",
    "application/pdf",
    "application/zip",
  ];

  // ==========================================================================
  // Storage
  // ==========================================================================
  const store = {
    consoleLogs: [],
    networkRequests: [],
    uiEvents: [],
    lastReportTime: Date.now(),
    lastScrollTime: 0,
  };

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  function truncateString(value, maxLen, suffix) {
    return value.length > maxLen ? value.slice(0, maxLen) + suffix : value;
  }

  function isElement(value) {
    return !!value && value instanceof Element;
  }

  function isSensitiveKey(key) {
    var normalizedKey = key.toLowerCase();
    return CONFIG.sensitiveFields.some(function (f) {
      return normalizedKey.indexOf(f) !== -1;
    });
  }

  function sanitizeArray(value, depth) {
    return value.slice(0, 100).map(function (v) {
      return sanitizeValue(v, depth + 1);
    });
  }

  function sanitizeObject(value, depth) {
    var sanitized = {};
    for (var k in value) {
      if (!Object.prototype.hasOwnProperty.call(value, k)) continue;
      sanitized[k] = isSensitiveKey(k)
        ? "[REDACTED]"
        : sanitizeValue(value[k], depth + 1);
    }
    return sanitized;
  }

  function sanitizeValue(value, depth) {
    if (depth === void 0) depth = 0;
    if (depth > 5) return "[Max Depth]";
    if (value === null || value === undefined) return value;

    if (typeof value === "string") {
      return truncateString(value, 1000, "...[truncated]");
    }

    if (typeof value !== "object") return value;

    if (Array.isArray(value)) return sanitizeArray(value, depth);

    return sanitizeObject(value, depth);
  }

  function formatArg(arg) {
    try {
      if (arg instanceof Error) {
        return { type: "Error", message: arg.message, stack: arg.stack };
      }
      if (typeof arg === "object") return sanitizeValue(arg);
      return String(arg);
    } catch (e) {
      return "[Unserializable]";
    }
  }

  function formatArgs(args) {
    var result = [];
    for (var i = 0; i < args.length; i++) result.push(formatArg(args[i]));
    return result;
  }

  function pruneBuffer(buffer, maxSize) {
    if (buffer.length > maxSize) buffer.splice(0, buffer.length - maxSize);
  }

  function tryParseJson(str) {
    if (typeof str !== "string") return str;
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
  }

  // ==========================================================================
  // Semantic UI Event Logging (agent-friendly)
  // ==========================================================================

  function shouldIgnoreTarget(target) {
    try {
      if (!isElement(target)) return false;
      return !!target.closest(".manus-no-record");
    } catch (e) {
      return false;
    }
  }

  function compactText(s, maxLen) {
    try {
      var t = (s || "").trim().replace(/\s+/g, " ");
      if (!t) return "";
      return t.length > maxLen ? t.slice(0, maxLen) + "…" : t;
    } catch (e) {
      return "";
    }
  }

  function elText(el) {
    try {
      var t = el.innerText || el.textContent || "";
      return compactText(t, CONFIG.uiTextMaxLen);
    } catch (e) {
      return "";
    }
  }

  function attrOrNull(el, name) {
    return el.getAttribute(name) || null;
  }

  function elementTag(el) {
    return el.tagName ? el.tagName.toLowerCase() : null;
  }

  function elementTestId(el) {
    return (
      attrOrNull(el, "data-testid") ||
      attrOrNull(el, "data-test-id") ||
      attrOrNull(el, "data-test")
    );
  }

  function elementType(tag, el) {
    return tag === "input" ? attrOrNull(el, "type") || "text" : null;
  }

  function elementHref(tag, el) {
    return tag === "a" ? attrOrNull(el, "href") : null;
  }

  function selectorHintForElement(tag, id, dataLoc, testId) {
    if (testId) return '[data-testid="' + testId + '"]';
    if (dataLoc) return '[data-loc="' + dataLoc + '"]';
    if (id) return "#" + id;
    return tag || "unknown";
  }

  function describeElement(el) {
    if (!isElement(el)) return null;

    var tag = elementTag(el);
    var id = el.id || null;
    var name = attrOrNull(el, "name");
    var role = attrOrNull(el, "role");
    var ariaLabel = attrOrNull(el, "aria-label");
    var dataLoc = attrOrNull(el, "data-loc");
    var testId = elementTestId(el);

    return {
      tag: tag,
      id: id,
      name: name,
      type: elementType(tag, el),
      role: role,
      ariaLabel: ariaLabel,
      testId: testId,
      dataLoc: dataLoc,
      href: elementHref(tag, el),
      text: elText(el),
      selectorHint: selectorHintForElement(tag, id, dataLoc, testId),
    };
  }

  function isSensitiveField(el) {
    if (!isElement(el)) return false;
    var tag = elementTag(el) || "";
    if (tag !== "input" && tag !== "textarea") return false;

    var type = (el.getAttribute("type") || "").toLowerCase();
    if (type === "password") return true;

    var name = (el.getAttribute("name") || "").toLowerCase();
    var id = (el.id || "").toLowerCase();

    return CONFIG.sensitiveFields.some(function (f) {
      return name.indexOf(f) !== -1 || id.indexOf(f) !== -1;
    });
  }

  function isValueElementTag(tag) {
    return tag === "input" || tag === "textarea" || tag === "select";
  }

  function readElementValue(el) {
    try {
      return el.value != null ? String(el.value) : "";
    } catch (e) {
      return "";
    }
  }

  function getInputValueSafe(el) {
    if (!isElement(el)) return null;
    var tag = elementTag(el) || "";
    if (!isValueElementTag(tag)) return null;

    var v = readElementValue(el);

    if (isSensitiveField(el)) return { masked: true, length: v.length };

    if (v.length > CONFIG.uiInputMaxLen) v = v.slice(0, CONFIG.uiInputMaxLen) + "…";
    return v;
  }

  function logUiEvent(kind, payload) {
    var entry = {
      timestamp: Date.now(),
      kind: kind,
      url: location.href,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      payload: sanitizeValue(payload),
    };
    store.uiEvents.push(entry);
    pruneBuffer(store.uiEvents, CONFIG.bufferSize.ui);
  }

  function installUiEventListeners() {
    // Clicks
    document.addEventListener(
      "click",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("click", {
          target: describeElement(t),
          x: e.clientX,
          y: e.clientY,
        });
      },
      true
    );

    // Typing "commit" events
    document.addEventListener(
      "change",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("change", {
          target: describeElement(t),
          value: getInputValueSafe(t),
        });
      },
      true
    );

    document.addEventListener(
      "focusin",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("focusin", { target: describeElement(t) });
      },
      true
    );

    document.addEventListener(
      "focusout",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("focusout", {
          target: describeElement(t),
          value: getInputValueSafe(t),
        });
      },
      true
    );

    // Enter/Escape are useful for form flows & modals
    document.addEventListener(
      "keydown",
      function (e) {
        if (e.key !== "Enter" && e.key !== "Escape") return;
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("keydown", { key: e.key, target: describeElement(t) });
      },
      true
    );

    // Form submissions
    document.addEventListener(
      "submit",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("submit", { target: describeElement(t) });
      },
      true
    );

    // Throttled scroll events
    window.addEventListener(
      "scroll",
      function () {
        var now = Date.now();
        if (now - store.lastScrollTime < CONFIG.scrollThrottleMs) return;
        store.lastScrollTime = now;

        logUiEvent("scroll", {
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          documentHeight: document.documentElement.scrollHeight,
          viewportHeight: window.innerHeight,
        });
      },
      { passive: true }
    );

    // Navigation tracking for SPAs
    function nav(reason) {
      logUiEvent("navigate", { reason: reason });
    }

    var origPush = history.pushState;
    history.pushState = function () {
      origPush.apply(this, arguments);
      nav("pushState");
    };

    var origReplace = history.replaceState;
    history.replaceState = function () {
      origReplace.apply(this, arguments);
      nav("replaceState");
    };

    window.addEventListener("popstate", function () {
      nav("popstate");
    });
    window.addEventListener("hashchange", function () {
      nav("hashchange");
    });
  }

  // ==========================================================================
  // Console Interception
  // ==========================================================================

  var originalConsole = {
    log: console.log.bind(console),
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  ["log", "debug", "info", "warn", "error"].forEach(function (method) {
    console[method] = function () {
      var args = Array.prototype.slice.call(arguments);

      var entry = {
        timestamp: Date.now(),
        level: method.toUpperCase(),
        args: formatArgs(args),
        stack: method === "error" ? new Error().stack : null,
      };

      store.consoleLogs.push(entry);
      pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);

      originalConsole[method].apply(console, args);
    };
  });

  window.addEventListener("error", function (event) {
    store.consoleLogs.push({
      timestamp: Date.now(),
      level: "ERROR",
      args: [
        {
          type: "UncaughtError",
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error ? event.error.stack : null,
        },
      ],
      stack: event.error ? event.error.stack : null,
    });
    pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);

    // Mark an error moment in UI event stream for agents
    logUiEvent("error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    store.consoleLogs.push({
      timestamp: Date.now(),
      level: "ERROR",
      args: [
        {
          type: "UnhandledRejection",
          reason: reason && reason.message ? reason.message : String(reason),
          stack: reason && reason.stack ? reason.stack : null,
        },
      ],
      stack: reason && reason.stack ? reason.stack : null,
    });
    pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);

    logUiEvent("unhandledrejection", {
      reason: reason && reason.message ? reason.message : String(reason),
    });
  });

  // ==========================================================================
  // Fetch Interception
  // ==========================================================================

  function contentTypeMatches(contentType, markers) {
    var contentTypeText = String(contentType);

    for (var i = 0; i < markers.length; i++) {
      if (contentTypeText.indexOf(markers[i]) !== -1) return true;
    }
    return false;
  }

  function isStreamingContent(contentType) {
    return contentTypeMatches(contentType, STREAMING_CONTENT_TYPES);
  }

  function isBinaryContent(contentType) {
    return contentTypeMatches(contentType, BINARY_CONTENT_TYPES);
  }

  function pushNetworkEntry(entry) {
    store.networkRequests.push(entry);
    pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
  }

  function getFetchUrl(input) {
    if (typeof input === "string") return input;
    return (input && (input.url || input.href || String(input))) || "";
  }

  function getFetchMethod(input, init) {
    return init.method || (input && input.method) || "GET";
  }

  function parseRequestHeaders(headers) {
    if (!headers) return {};
    try {
      return Object.fromEntries(new Headers(headers).entries());
    } catch (e) {
      return { _parseError: true };
    }
  }

  function sanitizedRequestBody(body) {
    return body ? sanitizeValue(tryParseJson(body)) : null;
  }

  function createFetchEntry(input, init, startTime) {
    var url = getFetchUrl(input);
    var method = getFetchMethod(input, init);

    return {
      timestamp: startTime,
      type: "fetch",
      method: method.toUpperCase(),
      url: url,
      request: {
        headers: parseRequestHeaders(init.headers),
        body: sanitizedRequestBody(init.body),
      },
      response: null,
      duration: null,
      error: null,
    };
  }

  function createFetchResponse(response) {
    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: null,
    };
  }

  function logFetchStatusError(entry, response) {
    if (response.status < 400) return;
    logUiEvent("network_error", {
      kind: "fetch",
      method: entry.method,
      url: entry.url,
      status: response.status,
      statusText: response.statusText,
    });
  }

  function fetchBodySkipReason(contentType, contentLength) {
    if (isStreamingContent(contentType)) {
      return "[Streaming response - not captured]";
    }
    if (contentLength && parseInt(contentLength, 10) > CONFIG.maxBodyLength) {
      return "[Response too large: " + contentLength + " bytes]";
    }
    if (isBinaryContent(contentType)) {
      return "[Binary content: " + contentType + "]";
    }
    return null;
  }

  function normalizeResponseTextBody(text) {
    if (text.length <= CONFIG.maxBodyLength) {
      return sanitizeValue(tryParseJson(text));
    }
    return text.slice(0, CONFIG.maxBodyLength) + "...[truncated]";
  }

  function readFetchBodyInBackground(response, entry) {
    response
      .clone()
      .text()
      .then(function (text) {
        entry.response.body = normalizeResponseTextBody(text);
      })
      .catch(function () {
        entry.response.body = "[Unable to read body]";
      })
      .finally(function () {
        pushNetworkEntry(entry);
      });
  }

  function handleFetchResponse(response, entry, startTime) {
    var contentType = (response.headers.get("content-type") || "").toLowerCase();
    var contentLength = response.headers.get("content-length");
    var skipReason = fetchBodySkipReason(contentType, contentLength);

    entry.duration = Date.now() - startTime;
    entry.response = createFetchResponse(response);
    logFetchStatusError(entry, response);

    if (skipReason) {
      entry.response.body = skipReason;
      pushNetworkEntry(entry);
      return response;
    }

    readFetchBodyInBackground(response, entry);
    return response;
  }

  function handleFetchError(error, entry, startTime) {
    entry.duration = Date.now() - startTime;
    entry.error = { message: error.message, stack: error.stack };

    pushNetworkEntry(entry);

    logUiEvent("network_error", {
      kind: "fetch",
      method: entry.method,
      url: entry.url,
      message: error.message,
    });
  }

  var originalFetch = window.fetch.bind(window);

  window.fetch = function (input, init) {
    init = init || {};
    var startTime = Date.now();
    var entry = createFetchEntry(input, init, startTime);

    // Don't intercept internal requests
    if (entry.url.indexOf("/__manus__/") === 0) {
      return originalFetch(input, init);
    }

    return originalFetch(input, init)
      .then(function (response) {
        return handleFetchResponse(response, entry, startTime);
      })
      .catch(function (error) {
        handleFetchError(error, entry, startTime);
        throw error;
      });
  };

  // ==========================================================================
  // XHR Interception
  // ==========================================================================

  function shouldCaptureXhr(xhr) {
    if (!xhr._manusData) return false;
    if (!xhr._manusData.url) return false;
    return xhr._manusData.url.indexOf("/__manus__/") !== 0;
  }

  function xhrBodySkipReason(contentType) {
    if (isStreamingContent(contentType)) {
      return "[Streaming response - not captured]";
    }
    if (isBinaryContent(contentType)) {
      return "[Binary content: " + contentType + "]";
    }
    return null;
  }

  function readXhrTextBody(xhr) {
    try {
      return normalizeResponseTextBody(xhr.responseText || "");
    } catch (e) {
      // responseText may throw for non-text responses
      return "[Unable to read response: " + e.message + "]";
    }
  }

  function readXhrResponseBody(xhr) {
    var contentType = (xhr.getResponseHeader("content-type") || "").toLowerCase();
    var skipReason = xhrBodySkipReason(contentType);
    return skipReason || readXhrTextBody(xhr);
  }

  function createXhrLoadEntry(xhr) {
    return {
      timestamp: xhr._manusData.startTime,
      type: "xhr",
      method: xhr._manusData.method,
      url: xhr._manusData.url,
      request: { body: xhr._manusData.requestBody },
      response: {
        status: xhr.status,
        statusText: xhr.statusText,
        body: readXhrResponseBody(xhr),
      },
      duration: Date.now() - xhr._manusData.startTime,
      error: null,
    };
  }

  function createXhrErrorEntry(xhr) {
    return {
      timestamp: xhr._manusData.startTime,
      type: "xhr",
      method: xhr._manusData.method,
      url: xhr._manusData.url,
      request: { body: xhr._manusData.requestBody },
      response: null,
      duration: Date.now() - xhr._manusData.startTime,
      error: { message: "Network error" },
    };
  }

  function logXhrStatusError(entry) {
    if (entry.response.status < 400) return;
    logUiEvent("network_error", {
      kind: "xhr",
      method: entry.method,
      url: entry.url,
      status: entry.response.status,
      statusText: entry.response.statusText,
    });
  }

  function handleXhrLoad(xhr) {
    var entry = createXhrLoadEntry(xhr);
    pushNetworkEntry(entry);
    logXhrStatusError(entry);
  }

  function handleXhrError(xhr) {
    var entry = createXhrErrorEntry(xhr);
    pushNetworkEntry(entry);

    logUiEvent("network_error", {
      kind: "xhr",
      method: entry.method,
      url: entry.url,
      message: "Network error",
    });
  }

  var originalXHROpen = XMLHttpRequest.prototype.open;
  var originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._manusData = {
      method: (method || "GET").toUpperCase(),
      url: url,
      startTime: null,
    };
    return originalXHROpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    var xhr = this;

    if (shouldCaptureXhr(xhr)) {
      xhr._manusData.startTime = Date.now();
      xhr._manusData.requestBody = sanitizedRequestBody(body);

      xhr.addEventListener("load", function () {
        handleXhrLoad(xhr);
      });

      xhr.addEventListener("error", function () {
        handleXhrError(xhr);
      });
    }

    return originalXHRSend.apply(this, arguments);
  };

  // ==========================================================================
  // Data Reporting
  // ==========================================================================

  function reportLogs() {
    var consoleLogs = store.consoleLogs.splice(0);
    var networkRequests = store.networkRequests.splice(0);
    var uiEvents = store.uiEvents.splice(0);

    // Skip if no new data
    if (
      consoleLogs.length === 0 &&
      networkRequests.length === 0 &&
      uiEvents.length === 0
    ) {
      return Promise.resolve();
    }

    var payload = {
      timestamp: Date.now(),
      consoleLogs: consoleLogs,
      networkRequests: networkRequests,
      // Mirror uiEvents to sessionEvents for sessionReplay.log
      sessionEvents: uiEvents,
      // agent-friendly semantic events
      uiEvents: uiEvents,
    };

    return originalFetch(CONFIG.reportEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(function () {
      // Put data back on failure (but respect limits)
      store.consoleLogs = consoleLogs.concat(store.consoleLogs);
      store.networkRequests = networkRequests.concat(store.networkRequests);
      store.uiEvents = uiEvents.concat(store.uiEvents);

      pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);
      pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
      pruneBuffer(store.uiEvents, CONFIG.bufferSize.ui);
    });
  }

  // Periodic reporting
  setInterval(reportLogs, CONFIG.reportInterval);

  // Report on page unload
  window.addEventListener("beforeunload", function () {
    var consoleLogs = store.consoleLogs;
    var networkRequests = store.networkRequests;
    var uiEvents = store.uiEvents;

    if (
      consoleLogs.length === 0 &&
      networkRequests.length === 0 &&
      uiEvents.length === 0
    ) {
      return;
    }

    var payload = {
      timestamp: Date.now(),
      consoleLogs: consoleLogs,
      networkRequests: networkRequests,
      // Mirror uiEvents to sessionEvents for sessionReplay.log
      sessionEvents: uiEvents,
      uiEvents: uiEvents,
    };

    if (navigator.sendBeacon) {
      var payloadStr = JSON.stringify(payload);
      // sendBeacon has ~64KB limit, truncate if too large
      var MAX_BEACON_SIZE = 60000; // Leave some margin
      if (payloadStr.length > MAX_BEACON_SIZE) {
        // Prioritize: keep recent events, drop older logs
        var truncatedPayload = {
          timestamp: Date.now(),
          consoleLogs: consoleLogs.slice(-50),
          networkRequests: networkRequests.slice(-20),
          sessionEvents: uiEvents.slice(-100),
          uiEvents: uiEvents.slice(-100),
          _truncated: true,
        };
        payloadStr = JSON.stringify(truncatedPayload);
      }
      navigator.sendBeacon(CONFIG.reportEndpoint, payloadStr);
    }
  });

  // ==========================================================================
  // Initialization
  // ==========================================================================

  // Install semantic UI listeners ASAP
  try {
    installUiEventListeners();
  } catch (e) {
    console.warn("[Manus] Failed to install UI listeners:", e);
  }

  // Mark as initialized
  window.__MANUS_DEBUG_COLLECTOR__ = {
    version: "2.0-no-rrweb",
    store: store,
    forceReport: reportLogs,
  };

  console.debug("[Manus] Debug collector initialized (no rrweb, UI events only)");
})();
