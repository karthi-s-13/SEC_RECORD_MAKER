// Handles dynamic experiment blocks: add, remove, collect data
(function () {
  const container = document.getElementById("experimentBlocksContainer");
  const template = document.getElementById("experimentBlockTemplate");
  const expCountBadge = document.getElementById("expCountBadge");

  let onChangeCallback = null;

  function notifyChange() {
    if (typeof onChangeCallback === "function") {
      onChangeCallback();
    }
    updateBadge();
  }

  function updateBadge() {
    const count = container.querySelectorAll(".exp-block").length;
    if (!expCountBadge) return;
    if (count === 0) {
      expCountBadge.textContent = "0 experiments";
    } else if (count === 1) {
      expCountBadge.textContent = "1 experiment";
    } else {
      expCountBadge.textContent = `${count} experiments`;
    }
  }

  function renumberBlocks() {
    const blocks = container.querySelectorAll(".exp-block");
    blocks.forEach((block, index) => {
      const idxSpan = block.querySelector(".exp-index");
      if (idxSpan) {
        idxSpan.textContent = String(index + 1);
      }
    });
  }

  function attachBlockEvents(block) {
    const clearBtn = block.querySelector(".btn-clear-block");
    const addBelowBtn = block.querySelector(".btn-add-below");

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        const blocks = container.querySelectorAll(".exp-block");
        if (blocks.length > 1) {
          block.classList.add("fade-out");
          setTimeout(() => {
            block.remove();
            renumberBlocks();
            notifyChange();
          }, 150);
        } else {
          clearBlockFields(block);
          notifyChange();
        }
      });
    }

    if (addBelowBtn) {
      addBelowBtn.addEventListener("click", () => {
        const newBlock = createBlock();
        block.insertAdjacentElement("afterend", newBlock);
        renumberBlocks();
        notifyChange();
        newBlock.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    const inputs = block.querySelectorAll("input");
    inputs.forEach((inp) => {
      inp.addEventListener("input", () => {
        notifyChange();
      });
    });
  }

  function clearBlockFields(block) {
    const dateInput = block.querySelector(".exp-date");
    const titleInput = block.querySelector(".exp-title");
    const linkInput = block.querySelector(".exp-link");
    const marksInput = block.querySelector(".exp-marks");

    if (dateInput) dateInput.value = "";
    if (titleInput) titleInput.value = "";
    if (linkInput) linkInput.value = "";
    if (marksInput) marksInput.value = "";
  }

  function createBlock() {
    const clone = template.content.cloneNode(true);
    const block = clone.querySelector(".exp-block");
    attachBlockEvents(block);
    return block;
  }

  function init() {
    const firstBlock = createBlock();
    container.appendChild(firstBlock);
    renumberBlocks();
    updateBadge();
  }

  function getExperimentsData() {
    const blocks = container.querySelectorAll(".exp-block");
    const result = [];
    blocks.forEach((block) => {
      const date = (block.querySelector(".exp-date")?.value || "").trim();
      const title = (block.querySelector(".exp-title")?.value || "").trim();
      const link = (block.querySelector(".exp-link")?.value || "").trim();
      const marks = (block.querySelector(".exp-marks")?.value || "").trim();
      result.push({ date, title, link, marks });
    });
    return result;
  }

  function setOnChange(callback) {
    onChangeCallback = callback;
  }

  window.BlockHandler = {
    init,
    getExperimentsData,
    setOnChange
  };

  init();
})();
