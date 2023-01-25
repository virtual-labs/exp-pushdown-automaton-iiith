/*****
 * File containing main logic to display DFA
 *
 */

width = 500;
height = 200;
radius = 25;

pdfa = [pdfa1];
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

window.addEventListener('load', function(e){
  canvas = document.getElementById("canvas1");
  push_down_stack = document.getElementById("push_down_stack");

  refreshInput();
  refreshCanvas();
  resetStack();

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

});
//Your JavaScript goes in here
