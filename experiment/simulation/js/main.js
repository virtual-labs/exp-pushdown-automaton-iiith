/*****
 * File containing main logic to display DFA
 *
 */

width = 500;
height = 200;
radius = 25;

// Suppose pdfa1, pdfa2 are defined in data.js
pdfa = [pdfa1, pdfa2];
pdfaIndex = 0;

inputIndex = 0;
inputPointer = -1;

nodes = [];
edges = [];

function refreshCanvas() {
  clearElem(canvas);
  clearElem(push_down_stack);

  let curr = "";
  if (inputPointer != -1) {
    curr = pdfa[pdfaIndex]["input"][inputIndex]["states"][inputPointer];
  }

  // PDFA description
  const PDFADescriptionContainer = document.getElementById("PDFA_description_container");
  clearElem(PDFADescriptionContainer);

  // <font> element for description (old-style but preserved)
  const span = newElement("font", [
    ["id", "PDFA_description"],
    ["color", "brown"],
    ["size", "5.5"]
  ]);
  const text = document.createTextNode(pdfa[pdfaIndex]["description"]);
  span.appendChild(text);
  PDFADescriptionContainer.appendChild(span);

  // Draw the DFA
  const res = displayCanvas(
    canvas,
    push_down_stack,
    pdfa[pdfaIndex],
    inputPointer,
    inputIndex,
    curr
  );
  nodes = res[0];
  edges = res[1];
}

function resetInput() {
  inputIndex = 0;
  inputPointer = -1;
  refreshInput();
}

function refreshInput() {
  const inputContainer = document.getElementById("input_container");
  clearElem(inputContainer);

  const inputString = pdfa[pdfaIndex]["input"][inputIndex]["string"];
  for (let i = 0; i < inputString.length; ++i) {
    let textColor = "black";
    if (inputPointer == i) {
      textColor = "red";
    }
    const span = newElement("font", [["id", "text_" + i], ["color", textColor]]);
    const text = document.createTextNode(inputString[i]);
    span.appendChild(text);
    inputContainer.appendChild(span);
  }
}

function resetStack() {
  const stack = document.getElementById("stack_list");
  clearElem(stack);
}

function addToStack(str) {
  const stack = document.getElementById("stack_list");
  const listElem = newElement("li", []);
  const textNode = document.createTextNode(str);
  listElem.appendChild(textNode);

  // Insert new item at top
  if (stack.firstChild) {
    stack.firstChild.style.fontWeight = "normal";
    stack.insertBefore(listElem, stack.firstChild);
  } else {
    stack.appendChild(listElem);
  }
  // Highlight newest
  stack.firstChild.style.fontWeight = "bold";
}

function removeFromStack() {
  const stack = document.getElementById("stack_list");
  if (stack.firstChild) {
    stack.removeChild(stack.firstChild);
    if (stack.firstChild) {
      stack.firstChild.style.fontWeight = "bold";
    }
  }
}

function updateTransitions() {
  const transitionTable = document.getElementById("transition_table_container");
  clearElem(transitionTable);

  // Create a <table> for the transitions
  const table = newElement("table", [["id", "transition_table"]]);

  // ★ Make table only as wide as its content => center alignment is easier
  table.style.display = "inline-block";

  // Header row
  const tr0 = newElement("tr", []);
  const thTransitions = newElement("th", []);
  thTransitions.appendChild(document.createTextNode("Transitions"));
  const th0 = newElement("th", []);
  th0.appendChild(document.createTextNode("0"));
  const th1 = newElement("th", []);
  th1.appendChild(document.createTextNode("1"));
  const thE = newElement("th", []);
  thE.appendChild(document.createTextNode("e"));
  const thS = newElement("th", []);
  thS.appendChild(document.createTextNode("S"));

  tr0.appendChild(thTransitions);
  tr0.appendChild(th0);
  tr0.appendChild(th1);
  tr0.appendChild(thE);
  tr0.appendChild(thS);

  table.appendChild(tr0);

  // Transition rows
  const transitionsObj = pdfa[pdfaIndex]["transition"];
  let transitionIndex = 0;
  Object.keys(transitionsObj).forEach((transitionName) => {
    const tr = newElement("tr", [["id", "tr_" + transitionIndex]]);
    transitionIndex++;

    const tdName = newElement("td", []);
    tdName.appendChild(document.createTextNode(transitionName));
    tr.appendChild(tdName);

    // For symbol '0'
    const td0 = newElement("td", []);
    let text0 = "";
    transitionsObj[transitionName]["0"].forEach((elem) => {
      text0 += elem + " ";
    });
    td0.appendChild(document.createTextNode(text0));
    tr.appendChild(td0);

    // For symbol '1'
    const td1 = newElement("td", []);
    let text1 = "";
    transitionsObj[transitionName]["1"].forEach((elem) => {
      text1 += elem + " ";
    });
    td1.appendChild(document.createTextNode(text1));
    tr.appendChild(td1);

    // For symbol 'e'
    const tdE = newElement("td", []);
    let textE = "";
    transitionsObj[transitionName]["e"].forEach((elem) => {
      textE += elem + " ";
    });
    tdE.appendChild(document.createTextNode(textE));
    tr.appendChild(tdE);

    // For symbol 'S'
    const tdS = newElement("td", []);
    let textS = "";
    transitionsObj[transitionName]["S"].forEach((elem) => {
      textS += elem + " ";
    });
    tdS.appendChild(document.createTextNode(textS));
    tr.appendChild(tdS);

    table.appendChild(tr);
  });

  transitionTable.appendChild(table);
}

window.addEventListener('load', function () {
  canvas = document.getElementById("canvas1");
  push_down_stack = document.getElementById("push_down_stack");

  // Initial setup
  refreshInput();
  refreshCanvas();
  resetStack();
  updateTransitions();

  // Change PDFA
  const changePDFA = document.getElementById("change_pdfa");
  changePDFA.addEventListener("click", function () {
    clearElem(canvas);
    pdfaIndex++;
    if (pdfaIndex >= pdfa.length) {
      pdfaIndex = 0;
    }
    resetInput();
    refreshCanvas();
    updateTransitions();
    resetStack();
  });

  // Change Input
  const changeInput = document.getElementById("change_input");
  changeInput.addEventListener("click", function () {
    inputIndex++;
    if (inputIndex >= pdfa[pdfaIndex]["input"].length) {
      inputIndex = 0;
    }
    inputPointer = -1;
    refreshInput();
    refreshCanvas();
    resetStack();
  });

  // Next step
  const nextBtn = document.getElementById("next");
  nextBtn.addEventListener("click", function () {
    const inputLength = pdfa[pdfaIndex]["input"][inputIndex]["string"].length;
    if (inputPointer != inputLength) {
      inputPointer++;
      refreshInput();
      refreshCanvas();

      let str = "";
      if (inputPointer != 0) {
        const lastChar = pdfa[pdfaIndex]["input"][inputIndex]["string"][inputPointer - 1];
        str += "Read character " + lastChar + ", ";

        const pushDownStackLength =
          pdfa[pdfaIndex]["input"][inputIndex]["stack"][inputPointer].length;
        const prevPushDownStackLength =
          pdfa[pdfaIndex]["input"][inputIndex]["stack"][inputPointer - 1].length;

        // Pushed or popped?
        if (pushDownStackLength > prevPushDownStackLength) {
          const pushedItem =
            pdfa[pdfaIndex]["input"][inputIndex]["stack"][inputPointer][pushDownStackLength - 1];
          str += "pushed " + pushedItem + " into stack, ";
        } else if (pushDownStackLength < prevPushDownStackLength) {
          const poppedItem =
            pdfa[pdfaIndex]["input"][inputIndex]["stack"][inputPointer - 1][
            prevPushDownStackLength - 1
            ];
          str += "popped " + poppedItem + " from stack, ";
        }

        const fromState = pdfa[pdfaIndex]["input"][inputIndex]["states"][inputPointer - 1];
        const toState = pdfa[pdfaIndex]["input"][inputIndex]["states"][inputPointer];
        str += "moved from State " + fromState + " to State " + toState;
      } else {
        // inputPointer == 0
        str += "Moved to Start State";
      }
      addToStack(str);

      // End of input string?
      if (inputPointer == inputLength) {
        let computationStatus = "Rejected";
        const currState = pdfa[pdfaIndex]["input"][inputIndex]["states"][inputPointer];

        // Check if currState is accept
        for (let itr = 0; itr < pdfa[pdfaIndex]["vertices"].length; ++itr) {
          if (pdfa[pdfaIndex]["vertices"][itr]["text"] == currState) {
            if (pdfa[pdfaIndex]["vertices"][itr]["type"] == "accept") {
              computationStatus = "Accepted";
            }
            break;
          }
        }
        swal("Input string was " + computationStatus);
      }
    }
  });

  // Prev step
  const prevBtn = document.getElementById("prev");
  prevBtn.addEventListener("click", function () {
    if (inputPointer != -1) {
      inputPointer--;
      refreshInput();
      refreshCanvas();
      removeFromStack();
    }
  });

  // Panel toggles
  let controlContainerDisplay = 0;
  let instructionContainerDisplay = 0;
  let traceContainerDisplay = 0;

  // Toggle controls
  const controlsToggle = document.getElementById("pdfa-controls-toggle");
  controlsToggle.addEventListener("click", function () {
    const controlContainer = document.getElementById("control-container");
    if (controlContainerDisplay == 0) {
      controlContainer.classList.remove("control-container-hide");
      controlContainer.classList.add("control-container-show");
      controlContainerDisplay = 1;
    } else {
      controlContainer.classList.remove("control-container-show");
      controlContainer.classList.add("control-container-hide");
      controlContainerDisplay = 0;
    }
  });

  // Toggle instructions
  const instructionToggle = document.getElementById("pdfa-instructions-toggle");
  instructionToggle.addEventListener("click", function () {
    const instructionContainer = document.getElementById("instruction-container");
    if (instructionContainerDisplay == 0) {
      instructionContainer.classList.remove("instruction-container-hide");
      instructionContainer.classList.add("instruction-container-show");
      instructionContainerDisplay = 1;
    } else {
      instructionContainer.classList.remove("instruction-container-show");
      instructionContainer.classList.add("instruction-container-hide");
      instructionContainerDisplay = 0;
    }
  });

  // Toggle trace
  const traceToggle = document.getElementById("pdfa-stack-trace-toggle");
  traceToggle.addEventListener("click", function () {
    const traceContainer = document.getElementById("trace-container");
    if (traceContainerDisplay == 0) {
      traceContainer.classList.remove("trace-container-hide");
      traceContainer.classList.add("trace-container-show");
      traceContainerDisplay = 1;
    } else {
      traceContainer.classList.remove("trace-container-show");
      traceContainer.classList.add("trace-container-hide");
      traceContainerDisplay = 0;
    }
  });
});
