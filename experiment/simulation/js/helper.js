/****
 * File containing helper functions
 *
 */

function newElementNS(tag, attr) {
  const elem = document.createElementNS("http://www.w3.org/2000/svg", tag);
  attr.forEach(function ([name, value]) {
    elem.setAttribute(name, value);
  });
  return elem;
}

function newElement(tag, attr) {
  const elem = document.createElement(tag);
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

/**
 * Create a Quadratic path string:
 * M (start.x, start.y) Q (mid.x, mid.y) (end.x, end.y)
 */
function createQPath(start, mid, end) {
  return (
    "M " +
    start.x +
    " " +
    start.y +
    " Q " +
    mid.x +
    " " +
    mid.y +
    " " +
    end.x +
    " " +
    end.y
  );
}

/**
 * Compute the direction (angle in degrees) of the path near its midpoint
 * by sampling points slightly before/after half-length.
 */
function getMidAngle(pathElem) {
  const length = pathElem.getTotalLength();
  const half = length / 2;
  const sampleDist = 0.1;

  // Points just before and after midpoint
  const ptBefore = pathElem.getPointAtLength(Math.max(0, half - sampleDist));
  const ptAfter = pathElem.getPointAtLength(Math.min(length, half + sampleDist));

  const dx = ptAfter.x - ptBefore.x;
  const dy = ptAfter.y - ptBefore.y;
  const radians = Math.atan2(dy, dx);
  return (radians * 180) / Math.PI; // in degrees
}

/**
 * Decide vertical offset for text near midpoint of an arrow, depending on direction.
 * If arrow is mostly "downish" (~135..315 deg), place text below. Otherwise above.
 */
function getVerticalOffset(angleDeg) {
  let a = angleDeg % 360;
  if (a < 0) a += 360;

  if (a > 135 && a < 315) {
    return 12; // ~12 px below
  } else {
    // otherwise above
    return -10; // ~10 px above
  }
}

/**
 * Main function to display the DFA in an SVG <canvas> (plus optional pushDownStack rendering).
 * Requires global width, height, radius set externally.
 *
 * @param {SVGElement} canvas        - The main SVG element where the DFA will be drawn
 * @param {SVGElement} pushDownStack - A separate SVG (or container) for stack rendering
 * @param {Object}     pdfa          - Your PDF/DFA definition object, containing vertices, edges, input, etc.
 * @param {number}     inputPointer  - Current pointer/index in the stack array
 * @param {number}     inputIndex    - Which input sequence we are using (if multiple)
 * @param {string}     currNode      - The node label that is currently active
 */
function displayCanvas(canvas, pushDownStack, pdfa, inputPointer, inputIndex, currNode) {
  const sine45 = 0.707; 

  clearElem(canvas);

  if (pushDownStack) {
    clearElem(pushDownStack);
  }

  const defs = newElementNS("defs", []);
  const marker = newElementNS("marker", [
    ["id", "arrowhead"],
    ["markerWidth", "10"],
    ["markerHeight", "7"],
    ["refX", "5"],
    ["refY", "3.5"],
    ["orient", "auto"],
    ["markerUnits", "strokeWidth"],
  ]);
  const arrowPath = newElementNS("path", [
    ["d", "M0,0 L10,3.5 L0,7 Z"],
    ["fill", "black"],
  ]);
  marker.appendChild(arrowPath);
  defs.appendChild(marker);
  canvas.appendChild(defs);

  const nodes = [];
  pdfa.vertices.forEach((v, i) => {
    nodes.push({
      text: v.text,
      type: v.type,
      x: width / 5 + (i * width) / 5, 
      y: height / 2,
    });
  });

  nodes.forEach((n) => {
    let fillColor = "#ffffff";
    let strokeColor = "black";
    let strokeWidth = "1px";

    if (n.type === "start") {
      fillColor = "#6699CC";
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
      fillColor = "#97d23d";
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
      fillColor = "Gray";
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
      ["y", n.y],
      ["fill", "black"],
      ["text-anchor", "middle"],
      ["dominant-baseline", "middle"],
    ]);
    label.textContent = n.text;
    canvas.appendChild(label);
  });

  const edges = [];
  pdfa.edges.forEach((e) => {
    const newEdge = {
      text: e.text,
      type: e.type,
      start: { text: e.start, x: 0, y: 0 },
      mid: { x: 0, y: 0 },
      end: { text: e.end, x: 0, y: 0 },
    };

    nodes.forEach((n) => {
      if (n.text === e.start) {
        newEdge.start.x = n.x;
        newEdge.start.y = n.y;
      }
      if (n.text === e.end) {
        newEdge.end.x = n.x;
        newEdge.end.y = n.y;
      }
    });

    const offset = radius;
    const isMultiple = Array.isArray(e.text) && e.text.length > 1;
    const extra = isMultiple ? e.text.length * 10 : 0;

    if (e.type === "forward") {
      newEdge.start.x += offset * sine45;
      newEdge.start.y -= offset * sine45;
      newEdge.end.x -= offset * sine45;
      newEdge.end.y -= offset * sine45;

      newEdge.mid.x = (newEdge.start.x + newEdge.end.x) / 2;
      newEdge.mid.y = newEdge.start.y - (radius + extra);
    } else if (e.type === "backward") {
      newEdge.start.x -= offset * sine45;
      newEdge.start.y += offset * sine45;
      newEdge.end.x += offset * sine45;
      newEdge.end.y += offset * sine45;

      newEdge.mid.x = (newEdge.start.x + newEdge.end.x) / 2;
      newEdge.mid.y = newEdge.start.y + (radius + extra);
    } else if (e.type === "self") {
      newEdge.start.x += offset * sine45;
      newEdge.start.y += offset * sine45;
      newEdge.end.x -= offset * sine45;
      newEdge.end.y += offset * sine45;

      newEdge.mid.x = (newEdge.start.x + newEdge.end.x) / 2;
      newEdge.mid.y = newEdge.start.y + 3 * radius + extra;
    }

    edges.push(newEdge);
  });

  edges.forEach((edge) => {
    const pathStr = createQPath(edge.start, edge.mid, edge.end);
    const pathElem = newElementNS("path", [
      ["d", pathStr],
      ["fill", "none"],
      ["stroke", "black"],
      ["marker-end", "url(#arrowhead)"],
    ]);
    canvas.appendChild(pathElem);

    const pathLen = pathElem.getTotalLength();
    const midPt = pathElem.getPointAtLength(pathLen / 2);

    const angleDeg = getMidAngle(pathElem);
    const vOffset = getVerticalOffset(angleDeg);

    let labelStr = "";
    if (Array.isArray(edge.text)) {
      labelStr = edge.text.join(",");
    } else {
      labelStr = edge.text;
    }

    const edgeLabel = newElementNS("text", [
      ["fill", "black"],
      ["text-anchor", "middle"],
      ["dominant-baseline", "middle"],
    ]);
    edgeLabel.setAttribute("x", midPt.x);
    edgeLabel.setAttribute("y", midPt.y + vOffset);
    edgeLabel.textContent = labelStr;

    canvas.appendChild(edgeLabel);
  });

  if (
    pushDownStack &&
    inputIndex >= 0 &&
    inputPointer >= 0 &&
    pdfa.input &&
    pdfa.input[inputIndex] &&
    pdfa.input[inputIndex].stack
  ) {
    const stackArray = pdfa.input[inputIndex].stack[inputPointer];
    if (stackArray) {
      const color = "black";
      const strokeWidth = "1px";
      const fillColor = "#ffe4c4";
      const stackItemHeight = 40;

      // Draw each stack item as a rectangle
      stackArray.forEach((stackItem, stackItemIndex) => {
        const yPos = 150 - stackItemHeight * stackItemIndex;
        const rect = newElementNS("rect", [
          ["x", "10"],
          ["y", String(yPos)],
          ["width", "80"],
          ["height", String(stackItemHeight)],
          ["rx", "10"],
          ["stroke", color],
          ["fill", fillColor],
          ["stroke-width", strokeWidth],
        ]);
        pushDownStack.appendChild(rect);
      });

      // Add text labels in center of each rectangle
      stackArray.forEach((stackItem, stackItemIndex) => {
        const yPos = 150 - stackItemHeight * stackItemIndex + stackItemHeight / 2;
        const txt = newElementNS("text", [
          ["x", "50"], 
          ["y", String(yPos)],
          ["fill", "black"],
          ["text-anchor", "middle"],
          ["dominant-baseline", "middle"],
        ]);
        txt.textContent = stackItem;
        pushDownStack.appendChild(txt);
      });
    }
  }

  return [nodes, edges];
}
