(function () {
  "use strict";

  if (typeof window.ITINERARY_DATA === "undefined") {
    return;
  }

  var D = window.ITINERARY_DATA;
  var R = window.ItineraryRender;
  var STORAGE_KEY = "maurice-itinerary-custom-v1";
  var SESSION_KEY = "maurice-itinerary-edit-session";
  var PASSWORD_HASH = "789c48f0b88c19679eb272cb20a4762fab975b3ade350bd30f02d6f33a2636d5";

  var originalSnapshot = null;
  var editMode = false;

  function $(id) {
    return document.getElementById(id);
  }

  function sha256(text) {
    if (!window.crypto || !window.crypto.subtle) {
      return Promise.resolve(text === "eddy1989" ? PASSWORD_HASH : "");
    }
    var encoder = new TextEncoder();
    return window.crypto.subtle.digest("SHA-256", encoder.encode(text)).then(function (buf) {
      return Array.prototype.map
        .call(new Uint8Array(buf), function (b) {
          return ("00" + b.toString(16)).slice(-2);
        })
        .join("");
    });
  }

  function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function loadCustomData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function applyCustomData(custom) {
    if (!custom) {
      return false;
    }
    if (custom.ITINERARY) {
      D.ITINERARY = custom.ITINERARY;
    }
    if (custom.PRACTICAL_TIPS) {
      D.PRACTICAL_TIPS = custom.PRACTICAL_TIPS;
    }
    if (custom.TRIP_META) {
      Object.assign(D.TRIP_META, custom.TRIP_META);
    }
    return true;
  }

  function saveCustomData() {
    var payload = {
      ITINERARY: D.ITINERARY,
      PRACTICAL_TIPS: D.PRACTICAL_TIPS,
      TRIP_META: D.TRIP_META,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    showToast("Programme sauvegardé sur cet appareil.");
  }

  function resetCustomData() {
    if (!originalSnapshot) {
      return;
    }
    D.ITINERARY = cloneData(originalSnapshot.ITINERARY);
    D.PRACTICAL_TIPS = cloneData(originalSnapshot.PRACTICAL_TIPS);
    D.TRIP_META = cloneData(originalSnapshot.TRIP_META);
    localStorage.removeItem(STORAGE_KEY);
    refreshView();
    showToast("Programme d'origine restauré.");
  }

  function isAuthenticated() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  }

  function setAuthenticated(value) {
    if (value) {
      sessionStorage.setItem(SESSION_KEY, "1");
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  function showToast(message) {
    var toast = $("editorToast");
    if (!toast) {
      return;
    }
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(function () {
      toast.hidden = true;
    }, 2800);
  }

  function setEditMode(active) {
    editMode = active;
    document.body.classList.toggle("is-edit-mode", active);
    var toolbar = $("editorToolbar");
    if (toolbar) {
      toolbar.hidden = !active;
    }
    Array.prototype.forEach.call(document.querySelectorAll(".edit-day-btn"), function (btn) {
      btn.hidden = !active;
    });
    var unlockBtn = $("editorUnlockBtn");
    if (unlockBtn) {
      unlockBtn.textContent = active ? "🔒 Verrouiller" : "✏️ Modifier le programme";
    }
  }

  function refreshView() {
    var grid = $("daysGrid");
    if (grid && R) {
      grid.innerHTML = R.renderAllDays(D.ITINERARY, D);
    }
    if (window.MauriceItineraryApp && window.MauriceItineraryApp.refresh) {
      window.MauriceItineraryApp.refresh();
    }
  }

  function linesToActivities(text) {
    return text
      .split("\n")
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean)
      .map(function (line) {
        var parts = line.split("|");
        if (parts.length > 1) {
          return { text: parts[0].trim(), link: parts[1].trim() };
        }
        return line;
      });
  }

  function activitiesToLines(activities) {
    return (activities || [])
      .map(function (a) {
        if (typeof a === "string") {
          return a;
        }
        if (a.link) {
          return a.text + " | " + a.link;
        }
        return a.text || "";
      })
      .join("\n");
  }

  function parsePhotos(text) {
    return text
      .split("\n")
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean)
      .map(function (line) {
        var parts = line.split("|");
        return { url: parts[0].trim(), caption: (parts[1] || "").trim() };
      });
  }

  function photosToLines(photos) {
    return (photos || [])
      .map(function (p) {
        return p.caption ? p.url + " | " + p.caption : p.url;
      })
      .join("\n");
  }

  function parseLinks(text) {
    return text
      .split("\n")
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean)
      .map(function (line) {
        var parts = line.split("|");
        return {
          label: parts[0].trim(),
          url: (parts[1] || "").trim(),
          description: (parts[2] || "").trim()
        };
      })
      .filter(function (l) {
        return l.label && l.url;
      });
  }

  function linksToLines(links) {
    return (links || [])
      .map(function (l) {
        var line = l.label + " | " + l.url;
        if (l.description) {
          line += " | " + l.description;
        }
        return line;
      })
      .join("\n");
  }

  function openDayEditor(dayNum) {
    var day = D.ITINERARY.find(function (d) {
      return d.day === dayNum;
    });
    if (!day) {
      return;
    }
    $("editDayTitle").textContent = "Modifier le jour " + day.day;
    $("editDayNum").value = String(day.day);
    $("editTitle").value = day.title || "";
    $("editDate").value = day.date || "";
    $("editSummary").value = day.summary || "";
    $("editActivities").value = activitiesToLines(day.activities);
    $("editBeach").value = day.beach || "";
    $("editTips").value = day.tips || "";
    $("editDrive").value = day.driveMinutes || 0;
    $("editPhotos").value = photosToLines(day.photos);
    $("editLinks").value = linksToLines(day.links);
    $("dayEditorModal").hidden = false;
  }

  function closeDayEditor() {
    $("dayEditorModal").hidden = true;
  }

  function saveDayEditor() {
    var dayNum = Number($("editDayNum").value);
    var day = D.ITINERARY.find(function (d) {
      return d.day === dayNum;
    });
    if (!day) {
      return;
    }
    day.title = $("editTitle").value.trim();
    day.date = $("editDate").value.trim();
    day.summary = $("editSummary").value.trim();
    day.activities = linesToActivities($("editActivities").value);
    day.beach = $("editBeach").value.trim();
    day.tips = $("editTips").value.trim();
    day.driveMinutes = Number($("editDrive").value) || 0;
    day.photos = parsePhotos($("editPhotos").value);
    day.links = parseLinks($("editLinks").value);
    saveCustomData();
    closeDayEditor();
    refreshView();
    setEditMode(true);
  }

  function exportData() {
    var blob = new Blob([JSON.stringify({ ITINERARY: D.ITINERARY, PRACTICAL_TIPS: D.PRACTICAL_TIPS, TRIP_META: D.TRIP_META }, null, 2)], {
      type: "application/json"
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "programme-maurice.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        applyCustomData(data);
        saveCustomData();
        refreshView();
        showToast("Import réussi.");
      } catch (e) {
        showToast("Fichier invalide.");
      }
    };
    reader.readAsText(file);
  }

  function openPasswordModal() {
    $("passwordModal").hidden = false;
    $("editorPassword").value = "";
    window.setTimeout(function () {
      $("editorPassword").focus();
    }, 50);
  }

  function closePasswordModal() {
    $("passwordModal").hidden = true;
  }

  function tryUnlock() {
    var password = $("editorPassword").value;
    sha256(password).then(function (hash) {
      if (hash === PASSWORD_HASH) {
        setAuthenticated(true);
        closePasswordModal();
        setEditMode(true);
        showToast("Mode édition activé.");
      } else {
        showToast("Mot de passe incorrect.");
      }
    });
  }

  function lockEditor() {
    setAuthenticated(false);
    setEditMode(false);
    showToast("Mode édition verrouillé.");
  }

  function toggleEditor() {
    if (editMode) {
      lockEditor();
      return;
    }
    if (isAuthenticated()) {
      setEditMode(true);
      return;
    }
    openPasswordModal();
  }

  function bindUi() {
    $("editorUnlockBtn").addEventListener("click", toggleEditor);
    $("editorSaveBtn").addEventListener("click", saveCustomData);
    $("editorExportBtn").addEventListener("click", exportData);
    $("editorImportBtn").addEventListener("click", function () {
      $("editorImportFile").click();
    });
    $("editorImportFile").addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (file) {
        importData(file);
      }
      event.target.value = "";
    });
    $("editorResetBtn").addEventListener("click", function () {
      if (window.confirm("Restaurer le programme d'origine ? Vos modifications locales seront perdues.")) {
        resetCustomData();
      }
    });
    $("passwordSubmitBtn").addEventListener("click", tryUnlock);
    $("passwordCancelBtn").addEventListener("click", closePasswordModal);
    $("editorPassword").addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        tryUnlock();
      }
    });
    $("dayEditorForm").addEventListener("submit", function (event) {
      event.preventDefault();
      saveDayEditor();
    });
    $("dayEditorCancelBtn").addEventListener("click", closeDayEditor);

    document.addEventListener("click", function (event) {
      var editBtn = event.target.closest(".edit-day-btn");
      if (editBtn) {
        event.stopPropagation();
        var card = editBtn.closest(".day-card");
        if (card) {
          openDayEditor(Number(card.getAttribute("data-day")));
        }
      }
    });

    document.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", function () {
        var modal = el.closest(".editor-modal");
        if (modal) {
          modal.hidden = true;
        }
      });
    });
  }

  originalSnapshot = {
    ITINERARY: cloneData(D.ITINERARY),
    PRACTICAL_TIPS: cloneData(D.PRACTICAL_TIPS),
    TRIP_META: cloneData(D.TRIP_META)
  };

  if (applyCustomData(loadCustomData())) {
    window.__ITINERARY_CUSTOM_LOADED__ = true;
  }

  function initEditor() {
    bindUi();
    if (isAuthenticated()) {
      setEditMode(true);
    }
  }

  window.ItineraryEditor = { init: initEditor, refreshView: refreshView, isEditMode: function () { return editMode; } };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEditor);
  } else {
    initEditor();
  }
})();
