/****
 * File containing helper functions
 *
 */

function newElementNS(tag, attr){
 elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
 attr.forEach(function(item){
   elem.setAttribute(item[0], item[1]);
 });
 return elem;
}

function newElement(tag, attr){
 elem = document.createElement(tag);
 attr.forEach(function(item){
   elem.setAttribute(item[0], item[1]);
 });
 return elem;
}

function clearElem(elem){
  while(elem.firstChild){
    elem.removeChild(elem.lastChild);
  }
}

// Global variables width, height and radius need to be set before invoking this function
function displayCanvas(canvas, dfa, inputPointer, currNode){
  sine45 = 0.707;

  nodes = [];
  edges = [];

  // Parse nodes in DFA
  dfa["vertices"].forEach(function(elem, index){
    newnode = {
      "text": elem["text"],
      "type": elem["type"],
      "x": width/5+index*width/5,
      "y": height/2
    };
    nodes.push(newnode);
  });

  // Display nodes in DFA
  nodes.forEach(function(elem){
    color = "black"
    stroke_width = "1px"
    if(elem["type"] == "start"){
      color = "blue"
      stroke_width = "3px"
    }else if(elem["type"] == "accept"){
      color = "green"
      stroke_width = "3px"
    }
    fillColor = "#ffe4c4"
    if(currNode == elem["text"]){
      fillColor = "#adff2f"
    }
    circleElem = newElementNS('circle', [
      ["id", elem["text"]+"_circle"],
      ["cx", elem["x"]],
      ["cy", elem["y"]],
      ["r", radius],
      ["stroke", color],
      ["fill", fillColor],
      ["stroke-width", stroke_width]
    ]);

    textElem = newElementNS('text', [
      ["id", elem["text"]+"_circle_text"],
      ['x', elem["x"]],
      ['y', elem["y"]],
      ['fill', '#000']
    ]);
    textElem.textContent = elem["text"];

    canvas.appendChild(circleElem);
    canvas.appendChild(textElem);
  });

  // Parse edges in DFA
  dfa["edges"].forEach(function(elem, index){
    newEdge = {
      "text": elem["text"],
      "type": elem["type"],
      "start": {
        "text": elem["start"],
        "x": 0,
        "y": 0
      },
      "mid": {
        "x": 0,
        "y": 0
      },
      "end": {
        "text": elem["end"],
        "x": 0,
        "y": 0
      }
    };

    nodes.forEach(function(nodeElem){
      if(nodeElem["text"] == elem["start"]){
        newEdge["start"]["x"] = nodeElem["x"];
        newEdge["start"]["y"] = nodeElem["y"];
      }
      if(nodeElem["text"] == elem["end"]){
        newEdge["end"]["x"] = nodeElem["x"];
        newEdge["end"]["y"] = nodeElem["y"];
      }
    });

    if(elem["type"] == "forward"){
      newEdge["start"]["x"] = newEdge["start"]["x"]+radius*sine45;
      newEdge["end"]["x"] = newEdge["end"]["x"]-radius*sine45;

      newEdge["start"]["y"] = newEdge["start"]["y"]-radius*sine45;
      newEdge["end"]["y"] = newEdge["end"]["y"]-radius*sine45;

      newEdge["mid"]["x"] = (newEdge["start"]["x"]+newEdge["end"]["x"])/2;
      newEdge["mid"]["y"] = newEdge["start"]["y"]-radius;
    }else if(elem["type"] == "backward"){
      newEdge["start"]["x"] = newEdge["start"]["x"]-radius*sine45;
      newEdge["end"]["x"] = newEdge["end"]["x"]+radius*sine45;

      newEdge["start"]["y"] = newEdge["start"]["y"]+radius*sine45;
      newEdge["end"]["y"] = newEdge["end"]["y"]+radius*sine45;

      newEdge["mid"]["x"] = (newEdge["start"]["x"]+newEdge["end"]["x"])/2;
      newEdge["mid"]["y"] = newEdge["start"]["y"]+radius;
    }else if(elem["type"] == "self"){
      newEdge["start"]["x"] = newEdge["start"]["x"]+radius*sine45;
      newEdge["start"]["y"] = newEdge["start"]["y"]+radius*sine45;

      newEdge["end"]["x"] = newEdge["end"]["x"]-radius*sine45;
      newEdge["end"]["y"] = newEdge["end"]["y"]+radius*sine45;

      newEdge["mid"]["x"] = (newEdge["start"]["x"]+newEdge["end"]["x"])/2;
      newEdge["mid"]["y"] = newEdge["start"]["y"]+3*radius;
    }

    edges.push(newEdge);
  });

  // Display edges in DFA
  edges.forEach(function(elem){
    baseId = elem["start"]["text"]+"_"+elem["end"]["text"];

    linepoints = "";
    if(elem["type"] == "forward"){
      linepoints = "M "+elem["start"]["x"]+" "+elem["start"]["y"]+
                    " C "+elem["start"]["x"]+" "+elem["start"]["y"]+", "+
                    elem["mid"]["x"]+" "+elem["mid"]["y"]+", "+
                    elem["end"]["x"]+" "+elem["end"]["y"];
      // linepoints = "M "+elem["start"]["x"]+" "+elem["start"]["y"]+
      //               " L "+elem["end"]["x"]+" "+elem["end"]["y"];
    }else if(elem["type"] == "backward"){
      linepoints = "M "+elem["start"]["x"]+" "+elem["start"]["y"]+
                    " C "+elem["start"]["x"]+" "+elem["start"]["y"]+", "+
                    elem["mid"]["x"]+" "+elem["mid"]["y"]+", "+
                    elem["end"]["x"]+" "+elem["end"]["y"];
    }else if(elem["type"] == "self"){
      linepoints = "M "+elem["start"]["x"]+" "+elem["start"]["y"]+
                    " C "+elem["start"]["x"]+" "+elem["start"]["y"]+", "+
                    elem["mid"]["x"]+" "+elem["mid"]["y"]+", "+
                    elem["end"]["x"]+" "+elem["end"]["y"];
    }

    edgeColor = "black"
    line = newElementNS('path', [
      ["id", baseId],
      ["d", linepoints],
      ["fill", "none"],
      ["stroke", edgeColor]
    ]);

    mid_x = elem["mid"]["x"];
    mid_y = elem["mid"]["y"];

    linemarkerpoints = "";
    if(elem["type"] == "forward"){
      mid_y = elem["start"]["y"]*0.25 + elem["mid"]["y"]*0.5 + elem["end"]["y"]*0.25;
      linemarkerpoints = (mid_x)+","+(mid_y-5)+" "+(mid_x+5)+","+(mid_y)+" "+(mid_x)+","+(mid_y+5);
    }else if(elem["type"] == "backward"){
      mid_y = elem["start"]["y"]*0.25 + elem["mid"]["y"]*0.5 + elem["end"]["y"]*0.25;
      linemarkerpoints = (mid_x)+","+(mid_y-5)+" "+(mid_x-5)+","+(mid_y)+" "+(mid_x)+","+(mid_y+5);
    }else if(elem["type"] == "self"){
      mid_y = elem["start"]["y"]*0.25 + elem["mid"]["y"]*0.5 + elem["end"]["y"]*0.25;
      linemarkerpoints = (mid_x)+","+(mid_y-5)+" "+(mid_x-5)+","+(mid_y)+" "+(mid_x)+","+(mid_y+5);
    }

    linemarker = newElementNS('polygon', [
      ["id", baseId+"_arrow"],
      ["points", linemarkerpoints]
    ]);

    textline = newElementNS('text', [
      ["id", baseId+"_text"]
    ]);
    textlinepath = newElementNS('textPath', [
      ["id", baseId+"_textpath"],
      ["href", "#"+baseId],
      ["startOffset", "15%"]
    ]);
    textlinepath.textContent = elem["text"];

    canvas.appendChild(line);
    canvas.appendChild(linemarker);
    textline.appendChild(textlinepath);
    canvas.appendChild(textline);
  });

  return [nodes, edges];

}
