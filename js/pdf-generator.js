// Generates PDF Blob URL based on current form values & experiment blocks
(function () {
  console.log("PdfGenerator v2.3 loaded"); // debug marker

  const { jsPDF } = window.jspdf;

  const logoImg = document.getElementById("collegeLogo");

  // Utility to format date dd-mm-yyyy
  function formatDateDisplay(isoDateString) {
    if (!isoDateString) return "";
    const parts = isoDateString.split("-");
    if (parts.length !== 3) return isoDateString;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  function createQrDataUrl(text) {
    if (!text) return null;
    const qr = new QRious({
      value: text,
      size: 160
    });
    return qr.toDataURL("image/png");
  }

  function generatePdfBlobUrl(data) {
    const {
      courseTitle,
      studentName,
      registerNumber,
      confirmDate,
      experiments
    } = data;

    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marginLeft = 15;
    const marginRight = 15;
    const marginTop = 12;
    const marginBottom = 15;

    const tableWidth = pageWidth - marginLeft - marginRight;

    // Column widths - Signature wide
    // 13 + 20 + 75 + 30 + 20 = 158 → Signature = 180 - 158 = 22mm
    const colSno = 13;
    const colDate = 20;
    const colTitle = 75;
    const colQr = 30;
    const colMarks = 20;
    const colSign = tableWidth - (colSno + colDate + colTitle + colQr + colMarks);

    const headerRowHeight = 9;
    const rowHeight = 28;

    doc.setFont("times", "normal");
    doc.setFontSize(11);

    function drawHeader(isFirstPage) {
      let y = marginTop;

      if (isFirstPage) {
        if (logoImg && logoImg.complete) {
          const logoWidth = 100;
          const logoHeight = 20;
          const xLogo = (pageWidth - logoWidth) / 2;
          doc.addImage(logoImg, "PNG", xLogo, y, logoWidth, logoHeight);
          y += logoHeight + 6;
        } else {
          y += 24;
        }
      }

      // Course Title first
      doc.setFont("times", "bold");
      doc.setFontSize(18);
      if (courseTitle) {
        doc.text(courseTitle, pageWidth / 2, y, { align: "center" });
      }
      y += 7;

      // Table of Contents
      doc.setFontSize(14);
      doc.text("Table of Contents", pageWidth / 2, y, { align: "center" });
      y += 6;

      return y;
    }

    function drawTableHeader(yTop) {
      const xSno = marginLeft;
      const xDate = xSno + colSno;
      const xTitle = xDate + colDate;
      const xQr = xTitle + colTitle;
      const xMarks = xQr + colQr;
      const xSign = xMarks + colMarks;

      doc.setFont("times", "bold");
      doc.setFontSize(10);

      doc.rect(xSno, yTop, colSno, headerRowHeight);
      doc.rect(xDate, yTop, colDate, headerRowHeight);
      doc.rect(xTitle, yTop, colTitle, headerRowHeight);
      doc.rect(xQr, yTop, colQr, headerRowHeight);
      doc.rect(xMarks, yTop, colMarks, headerRowHeight);
      doc.rect(xSign, yTop, colSign, headerRowHeight);

      const centerY = yTop + headerRowHeight / 2 + 0.5;

      doc.text("S. No", xSno + colSno / 2, centerY, { align: "center" });
      doc.text("Date", xDate + colDate / 2, centerY, { align: "center" });
      doc.text("Experiment Title", xTitle + colTitle / 2, centerY, { align: "center" });
      doc.text("QR Code", xQr + colQr / 2, centerY, { align: "center" });
      doc.text("Marks", xMarks + colMarks / 2, centerY, { align: "center" });
      doc.text("Signature", xSign + colSign / 2, centerY, { align: "center" });
    }

    const qrImages = experiments.map((exp) => {
      const link = (exp.link || "").trim();
      return link ? createQrDataUrl(link) : null;
    });

    let currentPageIndex = 0;
    let rowsOnCurrentPage = 0;
    let dataStartY = 0;
    let lastRowBottomY = marginTop;

    function startNewPage() {
      currentPageIndex++;
      if (currentPageIndex > 1) {
        doc.addPage();
      }
      doc.setFont("times", "normal");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);

      const yHeaderBottom = drawHeader(currentPageIndex === 1);
      drawTableHeader(yHeaderBottom);

      dataStartY = yHeaderBottom + headerRowHeight;
      rowsOnCurrentPage = 0;
      lastRowBottomY = dataStartY;
    }

    function drawExperimentRow(expIndex) {
      const exp = experiments[expIndex];

      if (rowsOnCurrentPage === 6) {
        startNewPage();
      }

      const xSno = marginLeft;
      const xDate = xSno + colSno;
      const xTitle = xDate + colDate;
      const xQr = xTitle + colTitle;
      const xMarks = xQr + colQr;
      const xSign = xMarks + colMarks;

      const yTop = dataStartY + rowsOnCurrentPage * rowHeight;
      const yCenter = yTop + rowHeight / 2;

      // borders
      doc.rect(xSno, yTop, colSno, rowHeight);
      doc.rect(xDate, yTop, colDate, rowHeight);
      doc.rect(xTitle, yTop, colTitle, rowHeight);
      doc.rect(xQr, yTop, colQr, rowHeight);
      doc.rect(xMarks, yTop, colMarks, rowHeight);
      doc.rect(xSign, yTop, colSign, rowHeight);

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      // S. No
      doc.text(String(expIndex + 1), xSno + colSno / 2, yCenter, { align: "center" });

      // Date
      const displayDate = formatDateDisplay(exp.date);
      if (displayDate) {
        doc.text(displayDate, xDate + colDate / 2, yCenter, { align: "center" });
      }

      // Title + Link (left, wrapped)
      const titleStartX = xTitle + 2;
      const contentTopY = yTop + 6;
      const textMaxWidth = colTitle - 4;
      let currentY = contentTopY;

      if (exp.title) {
        doc.setFont("times", "bold");
        doc.setTextColor(0, 0, 0);
        let titleLines = doc.splitTextToSize(exp.title, textMaxWidth);
        const maxTitleLines = 3;
        if (titleLines.length > maxTitleLines) {
          titleLines = titleLines.slice(0, maxTitleLines);
        }
        titleLines.forEach((line) => {
          doc.text(line, titleStartX, currentY);
          currentY += 4;
        });
        currentY += 1;
      }

      if (exp.link) {
        const linkText = exp.link;
        doc.setFont("times", "normal");
        doc.setTextColor(0, 0, 238);
        let linkLines = doc.splitTextToSize(linkText, textMaxWidth);
        const maxLinkLines = 3;
        if (linkLines.length > maxLinkLines) {
          linkLines = linkLines.slice(0, maxLinkLines);
        }
        linkLines.forEach((line) => {
          doc.textWithLink(line, titleStartX, currentY, {
            url: linkText
          });
          currentY += 4;
        });
        doc.setTextColor(0, 0, 0);
      }

      // Marks
      if (exp.marks) {
        doc.text(String(exp.marks), xMarks + colMarks / 2, yCenter, { align: "center" });
      }

      // QR
      const qrDataUrl = qrImages[expIndex];
      if (qrDataUrl) {
        const qrSize = colQr - 6;
        const qrCenterX = xQr + colQr / 2;
        const qrCenterY = yTop + rowHeight / 2;
        const qrX = qrCenterX - qrSize / 2;
        const qrY = qrCenterY - qrSize / 2;
        doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      }

      rowsOnCurrentPage++;
      lastRowBottomY = yTop + rowHeight;
    }

    startNewPage();
    for (let i = 0; i < experiments.length; i++) {
      drawExperimentRow(i);
    }

    if (!experiments.length) {
      lastRowBottomY = dataStartY;
    }

    // Confirmation + student details
    let confirmationStartY = lastRowBottomY + 10;
    const neededSpace = 20;

    if (confirmationStartY + neededSpace > pageHeight - marginBottom) {
      doc.addPage();
      currentPageIndex++;
      const yHeaderBottom = drawHeader(false);
      confirmationStartY = yHeaderBottom + 8;
    }

    // Confirmation statement in bold
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    const statement =
      "I confirm that the experiments and GitHub links provided are entirely my own work.";
    doc.text(statement, marginLeft, confirmationStartY);

    // Student details (normal)
    doc.setFont("times", "normal");

    const nameVal = (studentName || "").trim();
    const regVal = (registerNumber || "").trim();
    const dateVal = formatDateDisplay((confirmDate || "").trim());

    const nameText = "Name: " + (nameVal || "________________________");
    const regText = "Register Number: " + (regVal || "____________");
    const dateText = "Date: " + (dateVal || "____________");

    const yLine1 = confirmationStartY + 7;
    const yLine2 = confirmationStartY + 14;

    doc.text(nameText, marginLeft, yLine1);
    doc.text(regText, pageWidth - marginRight, yLine1, { align: "right" });
    doc.text(dateText, marginLeft, yLine2);

    const blob = doc.output("blob");
    return URL.createObjectURL(blob);
  }

  window.PdfGenerator = {
    generatePdfBlobUrl
  };
})();
