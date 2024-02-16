/****
  * File containing PDFA descriptions
  *
  */

// PDFA to accept strings of the form 0^n1^n
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
    "t1": {"0": ["Z/0", "0/0", "00/0"], "1": [], "e": [], "S": []},
    "t2": {"0": [], "1": ["0/e", "00/0"], "e": [], "S": []},
    "t3": {"0": [], "1": ["0/e", "00/0"], "e": [], "S": []},
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
      "string": "00011S",
      "states": ["A", "A", "A", "A", "B", "B", "B"],
      "stack": [
        [],
        ["0"],
        ["0", "0"],
        ["0", "0", "0"],
        ["0", "0"],
        ["0"],
        ["0"]
      ]
    }
  ]
}

// PDFA to accept palindrome strings
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
    {"start": "B", "end": "C", "text": "t4", "type": "forward"}
  ],
  "transition": {
    "t1": {"0": ["e/0"], "1": ["e/1"], "e": [], "S": []},
    "t2": {"0": [], "1": [], "e": ["e/e"], "S": []},
    "t3": {"0": ["0/e"], "1": ["1/e"], "e": [], "S": []},
    "t4": {"0": [], "1": [], "e": [], "S": ["Z/Z"]}
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
}