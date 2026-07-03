(() => {
  const STORAGE_KEY = "portal-settings";

  const DEFAULTS = {
    theme: "light",
    highContrast: false,
    reduceMotion: false,
    largeText: false,
    textSpacing: false,
    focusMode: false,
    fontSize: 16,
    lineSpacing: 1.4,
    sidebarWidth: 290,
    language: "en-GB",
    fontMode: "lexend",
    emailAlerts: true,
    supportMessages: true,
    dispatchReminders: false,
  };

  const root = document.documentElement;
  const body = document.body;

  const loadSettings = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  };

  let state = loadSettings();

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem("theme", state.theme);
  };

  const syncControls = () => {
    const checkboxMap = {
      highContrastToggle: state.highContrast,
      reduceMotionToggle: state.reduceMotion,
      largeTextToggle: state.largeText,
      textSpacingToggle: state.textSpacing,
      focusModeToggle: state.focusMode,
      emailAlertsToggle: state.emailAlerts,
      supportMessagesToggle: state.supportMessages,
      dispatchRemindersToggle: state.dispatchReminders,
    };

    Object.entries(checkboxMap).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.checked = value;
    });

    const fontSizeRange = document.getElementById("fontSizeRange");
    if (fontSizeRange) fontSizeRange.value = state.fontSize;

    const lineSpacingRange = document.getElementById("lineSpacingRange");
    if (lineSpacingRange) lineSpacingRange.value = state.lineSpacing;

    const sidebarWidthRange = document.getElementById("sidebarWidthRange");
    if (sidebarWidthRange) sidebarWidthRange.value = state.sidebarWidth;

    const languageSelect = document.getElementById("languageSelect");
    if (languageSelect) languageSelect.value = state.language;

    const fontModeSelect = document.getElementById("fontModeSelect");
    if (fontModeSelect) fontModeSelect.value = state.fontMode;

    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.textContent = state.theme === "dark" ? "Light mode" : "Dark mode";
    }
  };

  const applySettings = () => {
    root.setAttribute("data-theme", state.theme);
    root.style.setProperty("--sidebar-width", `${state.sidebarWidth}px`);
    root.style.setProperty("--base-font-size", `${state.fontSize}px`);
    root.style.setProperty("--base-line-height", `${state.lineSpacing}`);

    body.classList.toggle("high-contrast", state.highContrast);
    body.classList.toggle("reduce-motion", state.reduceMotion);
    body.classList.toggle("large-text", state.largeText);
    body.classList.toggle("text-spacing", state.textSpacing);
    body.classList.toggle("focus-mode", state.focusMode);

    body.dataset.language = state.language;
    body.dataset.fontMode = state.fontMode;

    syncControls();
  };

  const setState = (updates) => {
    state = { ...state, ...updates };
    saveSettings();
    applySettings();
  };

  const bindCheckbox = (id, key) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", () => setState({ [key]: el.checked }));
  };

  const bindRange = (id, key, cast = Number) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => setState({ [key]: cast(el.value) }));
  };

  const bindSelect = (id, key) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", () => setState({ [key]: el.value }));
  };

  const resetToDefaults = () => {
    state = { ...DEFAULTS };
    saveSettings();
    applySettings();
  };

  const setupThemeToggle = () => {
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      setState({ theme: state.theme === "dark" ? "light" : "dark" });
    });
  };

  const setupSettingsPage = () => {
    bindCheckbox("highContrastToggle", "highContrast");
    bindCheckbox("reduceMotionToggle", "reduceMotion");
    bindCheckbox("largeTextToggle", "largeText");
    bindCheckbox("textSpacingToggle", "textSpacing");
    bindCheckbox("focusModeToggle", "focusMode");
    bindCheckbox("emailAlertsToggle", "emailAlerts");
    bindCheckbox("supportMessagesToggle", "supportMessages");
    bindCheckbox("dispatchRemindersToggle", "dispatchReminders");

    bindRange("fontSizeRange", "fontSize");
    bindRange("lineSpacingRange", "lineSpacing");
    bindRange("sidebarWidthRange", "sidebarWidth");
    bindSelect("languageSelect", "language");
    bindSelect("fontModeSelect", "fontMode");

    const resetBtn = document.getElementById("resetAccessibilityBtn");
    if (resetBtn) resetBtn.addEventListener("click", resetToDefaults);

    const applyDisplayBtn = document.getElementById("applyDisplayBtn");
    if (applyDisplayBtn) {
      applyDisplayBtn.addEventListener("click", () => {
        saveSettings();
        applySettings();
      });
    }

    const saveNotificationBtn = document.getElementById("saveNotificationBtn");
    if (saveNotificationBtn) {
      saveNotificationBtn.addEventListener("click", () => {
        saveSettings();
        alert("Notification settings saved.");
      });
    }

    const saveLanguageBtn = document.getElementById("saveLanguageBtn");
    if (saveLanguageBtn) {
      saveLanguageBtn.addEventListener("click", () => {
        saveSettings();
        alert("Language and font settings saved.");
      });
    }

    const saveSettingsBtn = document.getElementById("saveSettingsBtn");
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener("click", () => {
        saveSettings();
        alert("Settings saved.");
      });
    }

    const exportBtn = document.getElementById("exportSettingsBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(state, null, 2)], {
          type: "application/json",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "portal-settings.json";
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    const importBtn = document.getElementById("importSettingsBtn");
    const importInput = document.getElementById("importSettingsInput");

    if (importBtn && importInput) {
      importBtn.addEventListener("click", () => importInput.click());

      importInput.addEventListener("change", async () => {
        const file = importInput.files && importInput.files[0];
        if (!file) return;

        try {
          const text = await file.text();
          const imported = JSON.parse(text);
          state = { ...state, ...imported };
          saveSettings();
          applySettings();
        } catch {
          alert("Could not import settings file.");
        }
      });
    }
  };

  const setupKeyboardShortcuts = () => {
    document.addEventListener("keydown", (e) => {
      const validCombo =
        (e.altKey && !e.ctrlKey && !e.metaKey) ||
        (e.ctrlKey && e.altKey && !e.metaKey);

      if (!validCombo) return;

      const map = {
        1: "index.html",
        2: "successful_survey_applicants.html",
        3: "dispatch.html",
        4: "mo_support.html",
        5: "reports.html",
      };

      if (map[e.key]) {
        e.preventDefault();
        window.location.href = map[e.key];
      }
    });
  };

  applySettings();
  setupThemeToggle();
  setupSettingsPage();
  setupKeyboardShortcuts();
})();