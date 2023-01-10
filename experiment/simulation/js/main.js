/*****
 * File containing main logic to display DFA
 *
 */

width = 500;
height = 200;
radius = 25;

dfa = [dfa1, dfa2, dfa3, dfa4, dfa5];
dfaIndex = 0

inputIndex = 0
inputPointer = -1

nodes = []
edges = []

function refreshCanvas(){
  clearElem(canvas);

  curr = ""
  if(inputPointer != -1){
    console.log("before", inputPointer, curr);
    // console.log(dfa[dfaIndex]["input"]);
    curr = dfa[dfaIndex]["input"][inputIndex]["states"][inputPointer];
    console.log("after", inputPointer, curr);
  }
  res = displayCanvas(canvas, dfa[dfaIndex], inputPointer, curr);

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
  for(let i=0;i<dfa[dfaIndex]["input"][inputIndex]["string"].length;++i){
    textColor = "black";
    if(inputPointer == i){
      textColor = "red";
    }
    span = newElement("font", [["id", "text_"+i], ["color", textColor]]);
    text = document.createTextNode(dfa[dfaIndex]["input"][inputIndex]["string"][i]);
    span.appendChild(text);
    inputContainer.appendChild(span);
  }
}

window.addEventListener('load', function(e){
  canvas = document.getElementById("canvas1");

  refreshInput();
  refreshCanvas();

  // Event listener for changing DFA
  changeDFA = document.getElementById("change_dfa");
  changeDFA.addEventListener("click", function(e){
    clearElem(canvas);
    dfaIndex = dfaIndex + 1;
    if(dfaIndex >= dfa.length){
      dfaIndex = 0;
    }
    resetInput();
    refreshCanvas();
  });

  // Event listener for changing input
  changeInput = document.getElementById("change_input");
  changeInput.addEventListener("click", function(e){
    inputIndex = inputIndex + 1;
    if(inputIndex >= dfa[dfaIndex]["input"].length){
      inputIndex = 0;
    }
    inputPointer = -1;
    refreshInput();
    refreshCanvas();
  });

  // Event listener for next
  next = document.getElementById("next");
  next.addEventListener("click", function(e){
    if(inputPointer != dfa[dfaIndex]["input"][inputIndex]["string"].length){
      inputPointer = inputPointer + 1;
      refreshInput();
      refreshCanvas();
    }
  });

  // Event listener for prev
  prev = document.getElementById("prev");
  prev.addEventListener("click", function(e){
    if(inputPointer != -1){
      inputPointer = inputPointer - 1;
      refreshInput();
      refreshCanvas();
    }
  });

});
//Your JavaScript goes in here
