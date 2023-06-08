### Aim of the experiment

Towards the end of our study of Finite Automata (both deterministic and non-deterministic), we observed that they are not "equipped" to deal with languages like $\{0^n1^n|n>0\}$. A fundamental question that one could ask is - what can we do to augment the power of finite automata, to recognise strings of the afore mentioned form. 

Pushdown automaton accepts a string if there is a run of the PDA that consumes the entire string and ends in a final state and/or with an empty stack.