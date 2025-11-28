// DOCX Generator
(function () {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } = docx;

  function generateDocxBlob(data, courseTitle) {
    const {
      courseTitle: title,
      studentName,
      registerNumber,
      confirmDate,
      experiments
    } = data;

    // Extract title for filename format
    let cleanedTitle = title.includes("-")
      ? title.split("-")[1].trim()
      : title;

    // DOCX document
    const doc = new Document({
      sections: [{
        children: [
          
          // --- Logo ---
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "", break: 1 })
            ]
          }),

          // --- Course Title ---
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 32
              })
            ]
          }),

          // --- Table of Contents ---
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Table of Contents", bold: true, size: 28 })
            ]
          }),

          new Paragraph({ text: "", spacing: { before: 200 } }),

          // --- Table Header ---
          createTableHeader(),

          // --- Table Rows ---
          ...experiments.map((exp, index) => createExperimentRow(exp, index)),

          new Paragraph({ text: "", spacing: { before: 300 } }),

          // --- Confirmation ---
          new Paragraph({
            children: [
              new TextRun({
                text: "I confirm that the experiments and GitHub links provided are entirely my own work.",
                bold: true
              })
            ]
          }),

          new Paragraph({ text: "", spacing: { before: 200 } }),

          // --- Student Details ---
          new Paragraph({
            children: [
              new TextRun(`Name: ${studentName || "___________"}               `),
              new TextRun(`Register Number: ${registerNumber || "___________"}`)
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`Date: ${confirmDate || "___________"}               `),
              new TextRun(`Learner Signature: ____________________`)
            ]
          })
        ]
      }]
    });

    return Packer.toBlob(doc);
  }

  function createTableHeader() {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            headerCell("S.No"),
            headerCell("Date"),
            headerCell("Experiment Title"),
            headerCell("QR Code"),
            headerCell("Marks"),
            headerCell("Signature")
          ]
        })
      ]
    });
  }

  function headerCell(text) {
    return new TableCell({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, bold: true })]
        })
      ]
    });
  }

  function createExperimentRow(exp, index) {
    return new TableRow({
      children: [
        tableCellCentered(String(index + 1)),
        tableCellCentered(exp.date || ""),
        tableCellLeft(exp.title + "\n" + (exp.link || "")),
        tableCellCentered("[QR]"),
        tableCellCentered(exp.marks || ""),
        tableCellCentered("")
      ]
    });
  }

  function tableCellCentered(text) {
    return new TableCell({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun(text)]
        })
      ]
    });
  }

  function tableCellLeft(text) {
    return new TableCell({
      children: [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [new TextRun(text)]
        })
      ]
    });
  }

  window.DocxGenerator = {
    generateDocxBlob
  };

})();
