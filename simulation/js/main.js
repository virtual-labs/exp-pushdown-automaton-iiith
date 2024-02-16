/*****
 * File containing main logic to display DFA
 *
 */

width = 500;
height = 200;
radius = 25;

pdfa = [pdfa1, pdfa2];
pdfaIndex = 0

inputIndex = 0
inputPointer = -1

nodes = []
edges = []

function refreshCanvas(){
  clearElem(canvas);
  clearElem(push_down_stack);

  curr = ""
  if(inputPointer != -1){
    console.log("before", inputPointer, curr);
    // console.log(dfa[dfaIndex]["input"]);
    curr = pdfa[pdfaIndex]["input"][inputIndex]["states"][inputPointer];
    console.log("after", inputPointer, curr);
  }

  PDFADescriptionContainer = document.getElementById("PDFA_description_container");
  clearElem(PDFADescriptionContainer);
  span = newElement("font", [["id", "PDFA_description"], ["color", textColor]]);
  text = document.createTextNode(pdfa[pdfaIndex]["description"]);
  span.appendChild(text);
  PDFADescriptionContainer.appendChild(text);

  res = displayCanvas(canvas, push_down_stack, pdfa[pdfaIndex], inputPointer, inputIndex, curr);

  nodes = res[0]
  edges = res[1]
}

function resetInput(){
  inputIndex = 0
  inputPointer = -1

  refreshInput();
}

function refreshInput(){
  inputContainer = document.getElementById("input_container");
  clearElem(inputContainer);
  for(let i=0;i<pdfa[pdfaIndex]["input"][inputIndex]["string"].length;++i){
    textColor = "black";
    if(inputPointer == i){
      textColor = "red";
    }
    span = newElement("font", [["id", "text_"+i], ["color", textColor]]);
    text = document.createTextNode(pdfa[pdfaIndex]["input"][inputIndex]["string"][i]);
    span.appendChild(text);
    inputContainer.appendChild(span);
  }
}

function resetStack(){
  stack = document.getElementById("stack_list");
  clearElem(stack);
}

function addToStack(str){
  stack = document.getElementById("stack_list");
  listElem = newElement("li", []);
  textNode = document.createTextNode(str);
  listElem.appendChild(textNode)
  stack.appendChild(listElem);

}

function removeFromStack(){
  stack = document.getElementById("stack_list");
  if(stack.firstChild){
    stack.removeChild(stack.lastChild);
  }
}

function updateTransitions(){
  transitionTable = document.getElementById("transition_table_container");
  clearElem(transitionTable);

  table = newElement("table", [["id", "transition_table"]]);
  tr0 = newElement("tr", [["id", "tr_0"]]);

  tr0th1 = newElement("th", [["id", "tr_0th_1"]]);
  tr0th1.appendChild(document.createTextNode("transitions"));
  tr0th2 = newElement("th", [["id", "tr_0th_2"]]);
  tr0th2.appendChild(document.createTextNode("0"));
  tr0th3 = newElement("th", [["id", "tr_0th_3"]]);
  tr0th3.appendChild(document.createTextNode("1"));
  tr0th4 = newElement("th", [["id", "tr_0th_4"]]);
  tr0th4.appendChild(document.createTextNode("e"));
  tr0th5 = newElement("th", [["id", "tr_0th_5"]]);
  tr0th5.appendChild(document.createTextNode("S"));

  tr0.appendChild(tr0th1);
  tr0.appendChild(tr0th2);
  tr0.appendChild(tr0th3);
  tr0.appendChild(tr0th4);
  tr0.appendChild(tr0th5);

  table.appendChild(tr0);

  Object.keys(pdfa[pdfaIndex]["transition"]).forEach(function(transitionName, transitionIndex){
    tr = newElement("tr", [["id", "tr_"+transitionIndex]]);

    trtd0 = newElement("td", [["id", "tr_"+transitionIndex+"td_0"]]);
    trtd0.appendChild(document.createTextNode(transitionName));

    trtd1 = newElement("td", [["id", "tr_"+transitionIndex+"td_1"]]);
    text = "";
    pdfa[pdfaIndex]["transition"][transitionName]["0"].forEach(function(elem){
      text+=elem;
      text+=" ";
    });
    trtd1.appendChild(document.createTextNode(text));

    trtd2 = newElement("td", [["id", "tr_"+transitionIndex+"td_2"]]);
    text = "";
    pdfa[pdfaIndex]["transition"][transitionName]["1"].forEach(function(elem){
      text+=elem;
      text+=" ";
    });
    trtd2.appendChild(document.createTextNode(text));

    trtd3 = newElement("td", [["id", "tr_"+transitionIndex+"td_3"]]);
    text = "";
    pdfa[pdfaIndex]["transition"][transitionName]["e"].forEach(function(elem){
      text+=elem;
      text+=" ";
    });
    trtd3.appendChild(document.createTextNode(text));

    trtd4 = newElement("td", [["id", "tr_"+transitionIndex+"td_4"]]);
    text = "";
    pdfa[pdfaIndex]["transition"][transitionName]["S"].forEach(function(elem){
      text+=elem;
      text+=" ";
    });
    trtd4.appendChild(document.createTextNode(text));

    tr.appendChild(trtd0);
    tr.appendChild(trtd1);
    tr.appendChild(trtd2);
    tr.appendChild(trtd3);
    tr.appendChild(trtd4);

    table.appendChild(tr);
  });

  transitionTable.appendChild(table);
}

// function updateTransitions(){
//   transitionList = document.getElementById("transitions_list");
//   clearElem(transitionList);
//   Object.keys(pdfa[pdfaIndex]["transition"]).forEach(function(transitionName, transitionIndex){
//     outerDiv = newElement("div", [
//       ["id", "outer_div_"+String(transitionIndex)],
//       ["style", "display:flex;flex-direction:row;align-items:center;justify-content:space-evenly;width:100%;"]
//     ]);
//     transitionNameDiv = newElement("div", []);
//     transitionNameText = document.createTextNode(transitionName);
//     transitionNameDiv.appendChild(transitionNameText);
//     transitionDetailDiv = newElement("div", []);
//     pdfa[pdfaIndex]["transition"][transitionName].forEach(function(transitionRule){
//       transitionDetailText = document.createTextNode(transitionRule);
//       transitionDetailDiv.appendChild(transitionDetailText);
//       transitionDetailDiv.appendChild(newElement("br", []));
//     });
//     outerDiv.appendChild(transitionNameDiv);
//     outerDiv.appendChild(transitionDetailDiv);
//     transitionList.appendChild(outerDiv);
//   });
// }

window.addEventListener('load', function(e){
  canvas = document.getElementById("canvas1");
  push_down_stack = document.getElementById("push_down_stack");

  refreshInput();
  refreshCanvas();
  resetStack();
  updateTransitions();

  // Event listener for changing DFA
  changePDFA = document.getElementById("change_pdfa");
  changePDFA.addEventListener("click", function(e){
    clearElem(canvas);
    pdfaIndex = pdfaIndex + 1;
    if(pdfaIndex >= pdfa.length){
      pdfaIndex = 0;
    }
    resetInput();
    refreshCanvas();
    updateTransitions();
    resetStack();
  });

  // Event listener for changing input
  changeInput = document.getElementById("change_input");
  changeInput.addEventListener("click", function(e){
    inputIndex = inputIndex + 1;
    if(inputIndex >= pdfa[pdfaIndex]["input"].length){
      inputIndex = 0;
    }
    inputPointer = -1;
    refreshInput();
    refreshCanvas();
    resetStack();
  });

  // Event listener for next
  next = document.getElementById("next");
  next.addEventListener("click", function(e){
    if(inputPointer != pdfa[pdfaIndex]["input"][inputIndex]["string"].length){
      inputPointer = inputPointer + 1;
      refreshInput();
      refreshCanvas();
      str = "";
      if(inputPointer!=0){
        str += "read character "+pdfa[pdfaIndex]["input"][inputIndex]["string"][inputPointer-1]+",";
        pushDownStackLength = pdfa[pdfaIndex]["input"][inputIndex]["stack"][inputPointer].length;
        prevPushDownStackLength = pdfa[pdfaIndex]["input"][inputIndex]["stack"][inputPointer-1].length;
        if(pushDownStackLength > prevPushDownStackLength){
          str += " pushed "+pdfa[pdfaIndex]["input"][inputIndex]["stack"][inputPointer][pushDownStackLength-1]+" into stack";
        }else if(pushDownStackLength < prevPushDownStackLength){
          str += " popped "+pdfa[pdfaIndex]["input"][inputIndex]["stack"][inputPointer-1][prevPushDownStackLength-1]+" from stack";
        }
        str += " and moved from state "+pdfa[pdfaIndex]["input"][inputIndex]["states"][inputPointer-1];
        str += " to state "+pdfa[pdfaIndex]["input"][inputIndex]["states"][inputPointer];
      }
      if(inputPointer==0){
        str += "moved to start state";
      }
      addToStack(str);

      // Display popup at end
      if(inputPointer==pdfa[pdfaIndex]["input"][inputIndex]["string"].length){

        computationStatus = "Rejected";

        for(itr=0;itr<pdfa[pdfaIndex]["vertices"].length;++itr){
          if(pdfa[pdfaIndex]["vertices"][itr]["text"] == curr){
            if(pdfa[pdfaIndex]["vertices"][itr]["type"] == "accept"){
              computationStatus = "Accepted";
            }
            break;
          }
        }
        swal("Input string was "+computationStatus);
      }
    }
  });

  // Event listener for prev
  prev = document.getElementById("prev");
  prev.addEventListener("click", function(e){
    if(inputPointer != -1){
      inputPointer = inputPointer - 1;
      refreshInput();
      refreshCanvas();
      removeFromStack();
    }
  });

  controlContainerDisplay = 0;
  instructionContainerDisplay = 0;
  traceContainerDisplay = 0;

  controlsToggle = document.getElementById("pdfa-controls-toggle");
  controlsToggle.addEventListener("click", function(e){
    
    controlContainer = document.getElementById("control-container");
    
    if(controlContainerDisplay == 0){
      controlContainer.classList.remove("control-container-hide");
      controlContainer.classList.add("control-container-show");
      controlContainerDisplay = 1;
    }else{
      controlContainer.classList.remove("control-container-show");
      controlContainer.classList.add("control-container-hide");
      controlContainerDisplay = 0;
    }

  });

  instructionToggle = document.getElementById("pdfa-instructions-toggle");
  instructionToggle.addEventListener("click", function(e){

    instructionContainer = document.getElementById("instruction-container");

    if(instructionContainerDisplay == 0){
      instructionContainer.classList.remove("instruction-container-hide");
      instructionContainer.classList.add("instruction-container-show");
      instructionContainerDisplay = 1;
    }else{
      instructionContainer.classList.remove("instruction-container-show");
      instructionContainer.classList.add("instruction-container-hide");
      instructionContainerDisplay = 0;
    }

  });

  traceToggle = document.getElementById("pdfa-stack-trace-toggle");
  traceToggle.addEventListener("click", function(e){
    
    traceContainer = document.getElementById("trace-container");

    if(traceContainerDisplay == 0){
      traceContainer.classList.remove("trace-container-hide");
      traceContainer.classList.add("trace-container-show");
      traceContainerDisplay = 1;
    }else{
      traceContainer.classList.remove("trace-container-show");
      traceContainer.classList.add("trace-container-hide");
      traceContainerDisplay = 0;
    }

  });

});
//Your JavaScript goes in here
