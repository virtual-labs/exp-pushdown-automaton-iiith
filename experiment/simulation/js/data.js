/****
  * File containing PDFA descriptions
  *
  */

// PDFA to accept strings of the form 0^n1^n
const pdfa1 = {
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
    "t1": ["0,Z/0", "0,0/0", "0,00/0"],
    "t2": ["1,0/e", "1,00/e"],
    "t3": ["1,0/e", "1,00/e"],
    "t4": ["S,Z/Z"]
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
