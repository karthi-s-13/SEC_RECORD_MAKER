// Manages opening/closing the preview pane and displaying the PDF blob
(function () {
  const appRoot = document.getElementById("app");
  const previewPane = document.getElementById("previewPane");
  const pdfPreviewFrame = document.getElementById("pdfPreviewFrame");
  const closePreviewBtn = document.getElementById("closePreviewBtn");

  let isOpen = false;
  let currentBlobUrl = null;

  function open() {
    if (isOpen) return;
    isOpen = true;
    appRoot.classList.add("split-preview");
    previewPane.classList.add("slide-in-right");
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    appRoot.classList.remove("split-preview");
    previewPane.classList.remove("slide-in-right");
    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
      currentBlobUrl = null;
    }
    pdfPreviewFrame.src = "";
  }

  function showBlobUrl(url) {
    if (!isOpen) {
      open();
    }
    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
    }
    currentBlobUrl = url;
    pdfPreviewFrame.src = url;
  }

  function getIsOpen() {
    return isOpen;
  }

  if (closePreviewBtn) {
    closePreviewBtn.addEventListener("click", () => {
      close();
    });
  }

  window.PreviewManager = {
    open,
    close,
    showBlobUrl,
    isOpen: getIsOpen
  };
})();
