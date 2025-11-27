// Main wiring between UI, BlockHandler, PdfGenerator, and PreviewManager
(function () {
  const courseTitleInput = document.getElementById("courseTitle");
  const studentNameInput = document.getElementById("studentName");
  const registerNumberInput = document.getElementById("registerNumber");
  const confirmDateInput = document.getElementById("confirmDate");

  const previewPdfBtn = document.getElementById("previewPdfBtn");
  const downloadPdfBtn = document.getElementById("downloadPdfBtn");
  const errorMessageEl = document.getElementById("errorMessage");

  console.log("app.js with smooth preview loaded");

  function setError(msg) {
    if (!errorMessageEl) return;
    errorMessageEl.textContent = msg || "";
  }

  function haveAnyContent() {
    const experiments = window.BlockHandler.getExperimentsData();
    if (experiments && experiments.length > 0) {
      const anyNonEmpty = experiments.some(
        (e) => e.date || e.title || e.link || e.marks
      );
      if (anyNonEmpty) return true;
    }
    if (courseTitleInput.value.trim() !== "") return true;
    if (studentNameInput.value.trim() !== "") return true;
    if (registerNumberInput.value.trim() !== "") return true;
    if (confirmDateInput.value.trim() !== "") return true;
    return false;
  }

  function ensureContentOrError() {
    if (!haveAnyContent()) {
      setError(
        "There is no content to include in the PDF. Please add some details or at least one experiment."
      );
      return false;
    }
    setError("");
    return true;
  }

  function collectFormData() {
    const experiments = window.BlockHandler.getExperimentsData();
    return {
      courseTitle: courseTitleInput.value.trim(),
      studentName: studentNameInput.value.trim(),
      registerNumber: registerNumberInput.value.trim(),
      confirmDate: confirmDateInput.value.trim(),
      experiments
    };
  }

  // Smooth preview handling
  let previewTimer = null;

  function schedulePreviewRefresh() {
    if (!window.PreviewManager.isOpen()) return;

    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      if (!ensureContentOrError()) return;
      const data = collectFormData();
      const blobUrl = window.PdfGenerator.generatePdfBlobUrl(data);
      window.PreviewManager.showBlobUrl(blobUrl);
    }, 600);
  }

  function refreshPreviewNow() {
    if (!ensureContentOrError()) return;
    const data = collectFormData();
    const blobUrl = window.PdfGenerator.generatePdfBlobUrl(data);
    window.PreviewManager.showBlobUrl(blobUrl);
  }

  const inputsToWatch = [
    courseTitleInput,
    studentNameInput,
    registerNumberInput,
    confirmDateInput
  ];
  inputsToWatch.forEach((inp) => {
    if (!inp) return;
    inp.addEventListener("input", () => {
      schedulePreviewRefresh();
    });
  });

  window.BlockHandler.setOnChange(() => {
    schedulePreviewRefresh();
  });

  if (previewPdfBtn) {
    previewPdfBtn.addEventListener("click", () => {
      refreshPreviewNow();
    });
  }

  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener("click", () => {
      if (!ensureContentOrError()) return;
      const data = collectFormData();
      const blobUrl = window.PdfGenerator.generatePdfBlobUrl(data);
      
      // Get raw course title
      let rawTitle = courseTitleInput.value.trim();

      // Extract text after the first hypen
      let cleaned = rawTitle.includes("-")
        ? rawTitle.split("-")[1].trim()
        : rawTitle;

      //replace spaces with underscores & remove special chars
      let fileName = cleaned
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, "_") + ".pdf";
      
      //Fall back if something goes wrong
      if(fileName === ".pdf"){
        fileName = "Lab_Record.pdf";
      }

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    });
  }
})();
