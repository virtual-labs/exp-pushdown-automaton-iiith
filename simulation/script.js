// PDA definitions from the reference code
const pdfa1 = {
  "description": "Check if input is balanced.",
  "vertices": [
    {"text": "A", "type": "start"},
    {"text": "B", "type": "none"},
    {"text": "C", "type": "accept"}
  ],
  "edges": [
    {"start": "A", "end": "A", "text": "t1", "type": "self"},
    {"start": "A", "end": "B", "text": "t2", "type": "forward"},
    {"start": "B", "end": "B", "text": "t3", "type": "self"},
    {"start": "B", "end": "C", "text": "t4", "type": "forward"}
  ],
  "transition": {
    "t1": {"0": ["e/0"], "1": [], "e": [], "S": []},
    "t2": {"0": [], "1": ["0/e"], "e": [], "S": []},
    "t3": {"0": [], "1": ["0/e"], "e": [], "S": []},
    "t4": {"0": [], "1": [], "e": [], "S": ["Z/Z"]}
  },
  "input": [
    {
      "string": "000111S",
      "states": ["A", "A", "A", "A", "B", "B", "B", "C"],
      "stack": [
        [],
        ["0"],
        ["0", "0"],
        ["0", "0", "0"],
        ["0", "0"],
        ["0"],
        [],
        []
      ]
    },
    {
      "string": "00001111S",
      "states": ["A", "A", "A", "A", "A", "B", "B", "B", "B", "C"],
      "stack": [
        [],
        ["0"],
        ["0", "0"],
        ["0", "0", "0"],
        ["0", "0", "0", "0"],
        ["0", "0", "0"],
        ["0", "0"],
        ["0"],
        [],
        []
      ]
    },
    {
      "string": "000111S",
      "states": ["A", "A", "A", "A", "B", "B", "B", "C"],
      "stack": [
        [],
        ["0"],
        ["0", "0"],
        ["0", "0", "0"],
        ["0", "0"],
        ["0"],
        [],
        []
      ]
    }
  ]
};

const pdfa2 = {
  "description": "Check if input is a palindrome.",
  "vertices": [
    {"text": "A", "type": "start"},
    {"text": "B", "type": "none"},
    {"text": "C", "type": "accept"}
  ],
  "edges": [
    {"start": "A", "end": "A", "text": "t1", "type": "self"},
    {"start": "A", "end": "B", "text": "t2", "type": "forward"},
    {"start": "B", "end": "B", "text": "t3", "type": "self"},
    {"start": "B", "end": "B", "text": "t5", "type": "self"}, // ← skip middle symbol
    {"start": "B", "end": "C", "text": "t4", "type": "forward"}
  ],
  "transition": {
    "t1": {"0": ["e/0"], "1": ["e/1"], "e": [], "S": []},
    "t2": {"0": [], "1": [], "e": ["e/e"], "S": []},
    "t3": {"0": ["0/e"], "1": ["1/e"], "e": [], "S": []},
    "t4": {"0": [], "1": [], "e": [], "S": ["Z/Z"]},
    // in B, consume one 0 or 1 at middle without touching stack
    "t5": {"0": ["e/e"], "1": ["e/e"], "e": [], "S": []}
  },
  "input": [
    {
      "string": "110011S",
      "states": ["A", "A", "A", "A", "B", "B", "B", "C"],
      "stack": [
        [],
        ["1"],
        ["1", "1"],
        ["1", "1", "0"],
        ["1", "1"],
        ["1"],
        [],
        []
      ]
    },
    {
      "string": "10100101S",
      "states": ["A", "A", "A", "A", "A", "B", "B", "B", "B", "C"],
      "stack": [
        [],
        ["1"],
        ["1", "0"],
        ["1", "0", "1"],
        ["1", "0", "1", "0"],
        ["1", "0", "1"],
        ["1", "0"],
        ["1"],
        [],
        []
      ]
    },
    {
      "string": "01100110S",
      "states": ["A", "A", "A", "A", "A", "B", "B", "B", "B", "C"],
      "stack": [
        [],
        ["0"],
        ["0", "1"],
        ["0", "1", "1"],
        ["0", "1", "1", "0"],
        ["0", "1", "1"],
        ["0", "1"],
        ["0"],
        [],
        []
      ]
    }
  ]
};

const pdfas = [pdfa1, pdfa2];
let currentPDFA = null;
let currentInput = null;
let currentState = null;
let currentStep = 0;
let simulationActive = false;
let userStack = [];
let width = 800;
let height = 300;
let radius = 30;

// Track simulation history for step back
let simulationHistory = [];

// Helper functions
function newElementNS(tag, attr) {
  const elem = document.createElementNS("http://www.w3.org/2000/svg", tag);
  attr.forEach(function ([name, value]) {
    elem.setAttribute(name, value);
  });
  return elem;
}

function clearElem(elem) {
  while (elem.firstChild) {
    elem.removeChild(elem.lastChild);
  }
}

function pdaChanged() {
  const pdaIndex = parseInt(document.getElementById('pda-select').value);
  currentPDFA = pdfas[pdaIndex];
  document.getElementById('pda-description').textContent = currentPDFA.description;
  
  // Update input options
  const inputSelect = document.getElementById('input-select');
  inputSelect.innerHTML = '';
  currentPDFA.input.forEach((input, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = input.string;
    inputSelect.appendChild(option);
  });
  
  inputChanged();
}

function inputChanged() {
  const inputIndex = parseInt(document.getElementById('input-select').value);
  currentInput = currentPDFA.input[inputIndex];
  updateInputBuffer();
  resetSimulation();
}

function updateInputBuffer() {
  const buffer = document.getElementById('input-buffer');
  buffer.innerHTML = '';
  
  if (!currentInput) return;
  
  const chars = currentInput.string.split('');
  chars.forEach((char, index) => {
    const span = document.createElement('span');
    span.className = 'input-char';
    span.textContent = char;
    span.id = `char-${index}`;
    buffer.appendChild(span);
  });
}

function startSimulation() {
  simulationActive = true;
  currentStep = 0;
  currentState = currentPDFA.vertices.find(v => v.type === 'start').text;
  userStack = [];
  simulationHistory = [{
    step: 0,
    state: currentState,
    stack: [...userStack]
  }];
  
  document.getElementById('step-back-btn').disabled = true;
  updateDisplay();
  showAllAvailableTransitions();
}

function resetSimulation() {
  simulationActive = false;
  currentStep = 0;
  currentState = null;
  userStack = [];
  simulationHistory = [];
  
  document.getElementById('step-back-btn').disabled = true;
  const stepsCountEl = document.getElementById('steps-count');
  if (stepsCountEl) stepsCountEl.textContent = '0';
  const currentStateEl = document.getElementById('current-state');
  if (currentStateEl) currentStateEl.textContent = '-';
  document.getElementById('stack-top').textContent = 'Z (bottom)';
  const resultMessageEl = document.getElementById('result-message');
  if (resultMessageEl) resultMessageEl.innerHTML = '';
  document.getElementById('transitions-container').innerHTML = '<p class="text-gray-500 text-center text-sm">Start simulation to see available transitions</p>';
  
  updateInputBuffer();
  updateDisplay();
}

function stepBackward() {
  if (simulationHistory.length <= 1) {
    return;
  }
  
  // Remove current state from history
  simulationHistory.pop();
  
  // Get previous state
  const previousState = simulationHistory[simulationHistory.length - 1];
  
  currentStep = previousState.step;
  currentState = previousState.state;
  userStack = [...previousState.stack];
  
  updateDisplay();
  showAllAvailableTransitions();
  
  // Clear any result messages
  const resultMessageEl = document.getElementById('result-message');
  if (resultMessageEl) resultMessageEl.innerHTML = '';
}

function updateDisplay() {
  // Update step count
  const stepsCountEl = document.getElementById('steps-count');
  if (stepsCountEl) stepsCountEl.textContent = currentStep;
  
  // Update current state
  const currentStateEl = document.getElementById('current-state');
  if (currentState && currentStateEl) {
    currentStateEl.textContent = currentState;
  }
  
  // Update input buffer highlighting
  const chars = document.querySelectorAll('.input-char');
  chars.forEach((char, index) => {
    char.classList.remove('current', 'consumed');
    if (index < currentStep) {
      char.classList.add('consumed');
    } else if (index === currentStep) {
      char.classList.add('current');
    }
  });
  
  // Update stack display
  updateStackDisplay();
  
  // Update PDA visualization
  updatePDAVisualization();
  
  // Update step back button
  document.getElementById('step-back-btn').disabled = simulationHistory.length <= 1;
}

function updateStackDisplay() {
  // Use the auto-scaling renderStack to ensure the SVG always fits the stack
  renderStack(userStack);

  // Update stack top display
  const stackTopElement = document.getElementById('stack-top');
  if (userStack.length === 0) {
    stackTopElement.textContent = 'Z (bottom)';
  } else {
    stackTopElement.textContent = userStack[userStack.length - 1];
  }
}

function drawStack(canvas, stack) {
  clearElem(canvas);
  
  const stackItemHeight = 30;
  const stackItemWidth = 80;
  const startY = 180;
  
  // Draw stack base
  const base = newElementNS("rect", [
    ["x", "10"],
    ["y", startY],
    ["width", stackItemWidth],
    ["height", "5"],
    ["fill", "#374151"],
    ["rx", "2"]
  ]);
  canvas.appendChild(base);
  
  // Draw Z (bottom marker)
  const zMarker = newElementNS("text", [
    ["x", "50"],
    ["y", startY - 10],
    ["text-anchor", "middle"],
    ["font-family", "Courier New, monospace"],
    ["font-size", "14"],
    ["font-weight", "bold"],
    ["fill", "#6b7280"]
  ]);
  zMarker.textContent = "Z";
  canvas.appendChild(zMarker);
  
  // Draw stack items
  stack.forEach((item, index) => {
    const y = startY - (index + 1) * stackItemHeight - 20;
    
    // Stack item rectangle
    const rect = newElementNS("rect", [
      ["x", "10"],
      ["y", y],
      ["width", stackItemWidth],
      ["height", stackItemHeight],
      ["fill", "#fef3c7"],
      ["stroke", "#f59e0b"],
      ["stroke-width", "2"],
      ["rx", "5"]
    ]);
    canvas.appendChild(rect);
    
    // Stack item text
    const text = newElementNS("text", [
      ["x", "50"],
      ["y", y + stackItemHeight / 2 + 5],
      ["text-anchor", "middle"],
      ["font-family", "Courier New, monospace"],
      ["font-size", "16"],
      ["font-weight", "bold"],
      ["fill", "#92400e"]
    ]);
    text.textContent = item;
    canvas.appendChild(text);
  });
}

function updatePDAVisualization() {
  const canvas = document.getElementById('pda-canvas');
  displayCanvas(canvas, null, currentPDFA, currentStep, 0, currentState);
}

// Show ALL possible transitions from current state, not just valid ones
function showAllAvailableTransitions() {
  const container = document.getElementById('transitions-container');
  container.innerHTML = '';
  
  if (!simulationActive) {
    container.innerHTML = '<p class="text-gray-500 text-center text-sm">Start simulation to see available transitions</p>';
    return;
  }
  
  if (currentStep >= currentInput.string.length) {
    // let student choose accept/reject
    container.innerHTML = '';
    const btnAccept = document.createElement('button');
    btnAccept.textContent = 'Accept string';
    btnAccept.className = 'mx-2 px-4 py-2 bg-green-600 text-white rounded';
    btnAccept.onclick = () => handleFinalChoice(true);

    const btnReject = document.createElement('button');
    btnReject.textContent = 'Reject string';
    btnReject.className = 'mx-2 px-4 py-2 bg-red-600 text-white rounded';
    btnReject.onclick = () => handleFinalChoice(false);

    container.appendChild(btnAccept);
    container.appendChild(btnReject);
    return;
  }
  
  const currentChar = currentInput.string[currentStep];
  const stackTop = userStack.length > 0 ? userStack[userStack.length - 1] : 'Z';
  
  // Find ALL transitions from current state (not filtering by validity)
  const allTransitions = [];
  
  currentPDFA.edges.forEach(edge => {
    if (edge.start === currentState) {
      const transitionId = edge.text;
      const transition = currentPDFA.transition[transitionId];
      
      if (transition) {
        // Add all transitions for all possible symbols
        Object.keys(transition).forEach(symbol => {
          if (transition[symbol] && transition[symbol].length > 0) {
            transition[symbol].forEach(rule => {
              allTransitions.push({
                id: transitionId,
                from: edge.start,
                to: edge.end,
                symbol: symbol === 'e' ? 'ε' : symbol,
                rule: rule,
                inputSymbol: currentChar,
                stackTop: stackTop
              });
            });
          }
        });
      }
    }
  });
  
  if (allTransitions.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center text-sm">No transitions available from this state</p>';
    return;
  }
  
  // Display ALL transitions (let user make mistakes)
  allTransitions.forEach(trans => {
    const div = document.createElement('div');
    div.className = 'transition-rule cursor-pointer hover:bg-gray-100 p-3 rounded border mb-2';
    
    const symbolDisplay = trans.symbol === 'ε' ? 'ε' : trans.symbol;
    const [stackRead, stackWrite] = trans.rule.split('/');
    
    div.innerHTML = `
      <div class="font-medium text-lg">${trans.from} → ${trans.to}</div>
      <div class="text-sm text-gray-600 mt-1">
        <strong>Read:</strong> ${symbolDisplay} | 
        <strong>Stack:</strong> ${stackRead}/${stackWrite}
      </div>
      <div class="text-xs text-gray-500 mt-1">
        Current input: "${trans.inputSymbol}" | Current stack top: "${trans.stackTop}"
      </div>
    `;
    
    div.onclick = () => applyUserTransition(trans);
    container.appendChild(div);
  });
  
  // Add instruction text
  const instructionDiv = document.createElement('div');
  instructionDiv.className = 'text-sm text-blue-600 mt-3 p-2 bg-blue-50 rounded';
  instructionDiv.innerHTML = `
    <strong>Choose a transition:</strong> Click on the transition you think should be applied. 
    You can make mistakes - the system will tell you if your choice is correct!
  `;
  container.appendChild(instructionDiv);
}

function applyUserTransition(userTransition) {
  const currentChar = currentInput.string[currentStep];
  const stackTop = userStack.length > 0 ? userStack[userStack.length - 1] : 'Z';
  
  // Check if the user's transition is valid
  const isValidTransition = validateTransition(userTransition, currentChar, stackTop);
  
  if (!isValidTransition.valid) {
    // Show error message
    swal("Invalid Transition!", isValidTransition.reason, "error");
    return;
  }
  
  // Apply the transition
  const [stackRead, stackWrite] = userTransition.rule.split('/');
  
  // Update stack based on transition
  if (stackRead !== 'e') {
    if (stackRead === 'Z' && userStack.length === 0) {
      // Valid - reading from empty stack (Z)
    } else if (stackRead === stackTop) {
      // Pop the stack
      userStack.pop();
    } else {
      swal("Invalid Transition!", `Cannot read "${stackRead}" when stack top is "${stackTop}"`, "error");
      return;
    }
  }
  
  // Push to stack if needed
  if (stackWrite !== 'e' && stackWrite !== 'Z') {
    userStack.push(stackWrite);
  }
  
  // Move to next step and state
  const nextStep = userTransition.symbol === 'ε' ? currentStep : currentStep + 1;
  const nextState = userTransition.to;
  
  // Save current state to history
  simulationHistory.push({
    step: nextStep,
    state: nextState,
    stack: [...userStack]
  });
  
  currentStep = nextStep;
  currentState = nextState;
  
  // Check if this matches the expected path (for feedback)
  checkUserProgress();
  
  updateDisplay();
  
  // Continue or finish
  if (currentStep >= currentInput.string.length) {
    checkFinalResult();
  } else {
    showAllAvailableTransitions();
  }
}

function validateTransition(transition, currentChar, stackTop) {
  // Check if the input symbol matches
  if (transition.symbol !== 'ε' && transition.symbol !== currentChar) {
    return {
      valid: false,
      reason: `This transition reads "${transition.symbol}" but current input is "${currentChar}"`
    };
  }
  
  // Check stack condition
  const [stackRead, stackWrite] = transition.rule.split('/');
  
  if (stackRead !== 'e') {
    if (stackRead === 'Z') {
      if (userStack.length > 0) {
        return {
          valid: false,
          reason: `This transition requires empty stack (Z) but stack has items`
        };
      }
    } else {
      if (stackTop !== stackRead) {
        return {
          valid: false,
          reason: `This transition reads "${stackRead}" from stack but stack top is "${stackTop}"`
        };
      }
    }
  }
  
  return { valid: true };
}

function checkUserProgress() {
  // Check if user is following the correct path
  if (currentStep < currentInput.states.length) {
    const expectedState = currentInput.states[currentStep];
    const expectedStack = currentInput.stack[currentStep];
    
    if (currentState === expectedState && arraysEqual(userStack, expectedStack)) {
      // User is on the right track
      showTemporaryMessage("Good! You're following the correct path.", "success");
    } else {
      // User deviated but transition was still valid
      showTemporaryMessage("Valid transition, but this might not lead to acceptance.", "warning");
    }
  }
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function showTemporaryMessage(message, type) {
  const resultDiv = document.getElementById('result-message');
  if (!resultDiv) return; // Exit if element doesn't exist
  
  const className = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' :
                   type === 'warning' ? 'bg-yellow-100 border-yellow-400 text-yellow-700' :
                   'bg-blue-100 border-blue-400 text-blue-700';
  
  resultDiv.innerHTML = `
    <div class="${className} border px-4 py-3 rounded">
      ${message}
    </div>
  `;
  
  // Clear message after 3 seconds
  setTimeout(() => {
    if (simulationActive) {
      resultDiv.innerHTML = '';
    }
  }, 3000);
}

function checkFinalResult() {
  const isAcceptState = currentPDFA.vertices.some(v => 
    v.text === currentState && v.type === 'accept'
  );
  
  const isStackEmpty = userStack.length === 0;
  
  const resultDiv = document.getElementById('result-message');
  
  if (isAcceptState && isStackEmpty) {
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>Congratulations!</strong> String accepted! You reached an accept state with empty stack.
        </div>
      `;
    }
    swal("Success!", "The string has been accepted by the PDA!", "success");
  } else {
    let reason = "";
    if (!isAcceptState) reason += "Not in accept state. ";
    if (!isStackEmpty) reason += "Stack is not empty. ";
    
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>String Rejected!</strong> ${reason}
        </div>
      `;
    }
    swal("String Rejected", reason, "error");
  }
  
  simulationActive = false;
}

/**
 * User clicks final “Accept”/“Reject” at end of input.
 */
function handleFinalChoice(userAccept) {
  const isAcceptState = currentPDFA.vertices.some(v =>
    v.text === currentState && v.type === 'accept'
  );
  const isStackEmpty = userStack.length === 0;
  const actuallyAccept = isAcceptState && isStackEmpty;
  if (userAccept === actuallyAccept) {
    swal("Correct!", userAccept
      ? "🎉 You correctly accepted the string."
      : "🎉 You correctly rejected the string.", "success");
  } else {
    swal("Oops!", userAccept
      ? "This string is not accepted by the PDA."
      : "This string is actually accepted by the PDA.", "error");
  }
  // Show the true final verdict below for learning purposes
  checkFinalResult();
  simulationActive = false;
}

function displayCanvas(canvas, pushDownStack, pdfa, inputPointer, inputIndex, currNode) {
  clearElem(canvas);
  
  const defs = newElementNS("defs", []);
  const marker = newElementNS("marker", [
    ["id", "arrowhead"],
    ["markerWidth", "10"],
    ["markerHeight", "7"],
    ["refX", "9"],
    ["refY", "3.5"],
    ["orient", "auto"],
    ["markerUnits", "strokeWidth"],
  ]);
  const arrowPath = newElementNS("path", [
    ["d", "M0,0 L10,3.5 L0,7 Z"],
    ["fill", "#374151"],
  ]);
  marker.appendChild(arrowPath);
  defs.appendChild(marker);
  canvas.appendChild(defs);
  
  // Position nodes
  const nodes = [];
  pdfa.vertices.forEach((v, i) => {
    nodes.push({
      text: v.text,
      type: v.type,
      x: 150 + (i * 250),
      y: height / 2,
    });
  });
  
  // Draw edges
  pdfa.edges.forEach((e) => {
    const startNode = nodes.find(n => n.text === e.start);
    const endNode = nodes.find(n => n.text === e.end);
    
    if (!startNode || !endNode) return;
    
    let path;
    if (e.type === "self") {
      // Self loop
      const cx = startNode.x;
      const cy = startNode.y - radius;
      path = newElementNS("path", [
        ["d", `M ${cx - radius * 0.7} ${cy} A ${radius * 1.5} ${radius * 1.5} 0 1 1 ${cx + radius * 0.7} ${cy}`],
        ["fill", "none"],
        ["stroke", "#374151"],
        ["stroke-width", "2"],
        ["marker-end", "url(#arrowhead)"]
      ]);
      
      // Add label for self loop
      const label = newElementNS("text", [
        ["x", cx],
        ["y", cy - radius * 1.5],
        ["text-anchor", "middle"],
        ["font-size", "14"],
        ["fill", "#374151"]
      ]);
      label.textContent = e.text;
      canvas.appendChild(label);
    } else {
      // Regular edge
      const angle = Math.atan2(endNode.y - startNode.y, endNode.x - startNode.x);
      const startX = startNode.x + radius * Math.cos(angle);
      const startY = startNode.y + radius * Math.sin(angle);
      const endX = endNode.x - radius * Math.cos(angle);
      const endY = endNode.y - radius * Math.sin(angle);
      
      path = newElementNS("path", [
        ["d", `M ${startX} ${startY} L ${endX} ${endY}`],
        ["fill", "none"],
        ["stroke", "#374151"],
        ["stroke-width", "2"],
        ["marker-end", "url(#arrowhead)"]
      ]);
      
      // Add label
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const label = newElementNS("text", [
        ["x", midX],
        ["y", midY - 10],
        ["text-anchor", "middle"],
        ["font-size", "14"],
        ["fill", "#374151"]
      ]);
      label.textContent = e.text;
      canvas.appendChild(label);
    }
    
    canvas.appendChild(path);
  });
  
  // Draw nodes
  nodes.forEach((n) => {
    let fillColor = "#ffffff";
    let strokeColor = "#374151";
    let strokeWidth = "2";
    
    if (n.type === "start") {
      fillColor = "#dbeafe";
      // Add start arrow
      const startArrow = newElementNS("path", [
        ["d", `M ${n.x - radius - 40} ${n.y} L ${n.x - radius} ${n.y}`],
        ["fill", "none"],
        ["stroke", strokeColor],
        ["stroke-width", strokeWidth],
        ["marker-end", "url(#arrowhead)"],
      ]);
      canvas.appendChild(startArrow);
    }
    
    if (n.type === "accept") {
      fillColor = "#d1fae5";
      // Add double circle for accept state
      const outer = newElementNS("circle", [
        ["cx", n.x],
        ["cy", n.y],
        ["r", radius + 5],
        ["stroke", strokeColor],
        ["fill", "none"],
        ["stroke-width", strokeWidth],
      ]);
      canvas.appendChild(outer);
    }
    
    if (n.text === currNode) {
      fillColor = "#fef3c7";
      strokeColor = "#f59e0b";
      strokeWidth = "3";
    }
    
    const circle = newElementNS("circle", [
      ["cx", n.x],
      ["cy", n.y],
      ["r", radius],
      ["stroke", strokeColor],
      ["fill", fillColor],
      ["stroke-width", strokeWidth],
    ]);
    canvas.appendChild(circle);
    
    const label = newElementNS("text", [
      ["x", n.x],
      ["y", n.y + 5],
      ["fill", "#111827"],
      ["text-anchor", "middle"],
      ["font-size", "20"],
      ["font-weight", "bold"],
    ]);
    label.textContent = n.text;
    canvas.appendChild(label);
  });
}

// Initialize on load
window.addEventListener('load', function() {
  pdaChanged();
});

function renderStack(stack) {
  const container = document.querySelector('.stack-display-container');
  const svg = document.getElementById('stack-canvas');

  // Calculate required dimensions
  const itemHeight = 35;
  const itemWidth = 80;
  const padding = 20;
  const baseHeight = 30;

  // Calculate total height needed
  const stackHeight = stack.length * itemHeight;
  const totalHeight = stackHeight + baseHeight + padding * 2;

  // Set SVG dimensions
  const svgWidth = 100;
  const svgHeight = Math.max(totalHeight, 150);

  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);
  svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

  // Clear previous content
  svg.innerHTML = '';

  // Calculate starting position (base at bottom)
  const baseY = svgHeight - padding;

  // Draw stack base line
  const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  baseLine.setAttribute('x1', 10);
  baseLine.setAttribute('y1', baseY);
  baseLine.setAttribute('x2', 90);
  baseLine.setAttribute('y2', baseY);
  baseLine.setAttribute('stroke', '#374151');
  baseLine.setAttribute('stroke-width', '3');
  svg.appendChild(baseLine);

  // Draw Z marker (bottom of stack indicator)
  const zText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  zText.setAttribute('x', 50);
  zText.setAttribute('y', baseY + 15);
  zText.setAttribute('text-anchor', 'middle');
  zText.setAttribute('font-family', 'Courier New, monospace');
  zText.setAttribute('font-size', '12');
  zText.setAttribute('font-weight', 'bold');
  zText.setAttribute('fill', '#6b7280');
  zText.textContent = 'Z (bottom)';
  svg.appendChild(zText);

  // Draw stack items from bottom to top (index 0 = bottom, last index = top)
  stack.forEach((item, index) => {
    // Stack grows UPWARD: first item goes just above base, last item at the top
    const y = baseY - (index + 1) * itemHeight;

    // Stack item rectangle
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', 10);
    rect.setAttribute('y', y);
    rect.setAttribute('width', itemWidth);
    rect.setAttribute('height', itemHeight - 5);
    rect.setAttribute('fill', '#e9d5ff');
    rect.setAttribute('stroke', '#8b5cf6');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('rx', '8');
    svg.appendChild(rect);

    // Stack item text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', 50);
    text.setAttribute('y', y + (itemHeight - 5) / 2 + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', 'Courier New, monospace');
    text.setAttribute('font-size', '16');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', '#6d28d9');
    text.textContent = item;
    svg.appendChild(text);
  });

  // Auto-scroll to show the top of the stack when it gets tall
  if (stack.length > 4) {
    container.scrollTop = 0; // Scroll to top to show latest items
  }
}
