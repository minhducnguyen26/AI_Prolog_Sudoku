:- use_module(library(clpfd)).

% Compare different search strategies
% This also somewhat determines the difficulty of the puzzle
compareStrategies(Rows, GivenClues, WeakSolved, ConstraintSolved, FFSearchSolved):-
    append(Rows, Cs),
    count(Cs, GivenClues),

    weakPropagationSolver(Rows, WeakSolved),
    constraintPropagationSolver(Rows, ConstraintSolved),
    failFirstSearchSolver(Rows, FFSearchSolved),

    calculatePerformances(GivenClues, WeakSolved, ConstraintSolved, FFSearchSolved).

%! All Search Strategies
simpleSolver(Rows) :-
    % simpleSolver - is a predicate
    % Rows - is a list of lists (a list of rows)

    % Check if the puzzle is 9 rows long
    length(Rows, 9),
    % Check if each row is 9 elements long
    % => Check if the puzzle has 9 columns
    maplist(same_length(Rows), Rows),
    % concatenate all rows into a single list
    append(Rows, NewList),
    % Check if each element is a number between 1 and 9
    NewList ins 1..9,
    % Check if each element in each row is unique
    maplist(all_distinct, Rows),
    % Convert rows to columns
    transpose(Rows, Columns),
    % Check if each element in each column is unique
    maplist(all_distinct, Columns), 

    % Check if each sub square is unique
    Rows = [A,B,C,D,E,F,G,H,I],
    squares(A, B, C),
    squares(D, E, F),
    squares(G, H, I),

    maplist(labeling([ff]), Rows).

weakPropagationSolver(Rows, N):-
    length(Rows, 9),
    maplist(same_length(Rows), Rows),
    append(Rows, Vs),
    Vs ins 1..9,
    % all_different is ONLY a weak propagation
    % and cannot do constraint propagation
    maplist(all_different, Rows),
    transpose(Rows, Columns),
    maplist(all_different, Columns),

    Rows = [A,B,C,D,E,F,G,H,I],
    squares(A, B, C),
    squares(D, E, F),
    squares(G, H, I),

    append(Rows, Cs),
    count(Cs, N).

constraintPropagationSolver(Rows, N):-
    length(Rows, 9),
    maplist(same_length(Rows), Rows),
    append(Rows, Vs),
    Vs ins 1..9,
    maplist(all_distinct, Rows),
    transpose(Rows, Columns),
    maplist(all_distinct, Columns),

    Rows = [A,B,C,D,E,F,G,H,I],
    squares(A, B, C),
    squares(D, E, F),
    squares(G, H, I),

    append(Rows, Cs),
    count(Cs, N).

failFirstSearchSolver(Rows, N):-
    % First fail
    % Label the leftmost variable with smallest domain next, 
    % in order to detect infeasibility early. 

    % This is often a good strategy,
    % but is not the most efficient way of solving this problem

    length(Rows, 9),
    maplist(same_length(Rows), Rows),
    append(Rows, Vs),
    Vs ins 1..9,
    % Only use labeling to fill in the puzzle
    maplist(label, Rows),
    transpose(Rows, Columns),
    maplist(label, Columns),

    Rows = [A,B,C,D,E,F,G,H,I],
    squares(A, B, C),
    squares(D, E, F),
    squares(G, H, I),

    append(Rows, Cs),
    count(Cs, N).

%! Helper Functions
squares([], [], []). % halt if the lists are empty
squares( [A, B, C | Ss1],
         [D, E, F | Ss2],
         [G, H, I | Ss3]) :-
    % Ss - sub squares 
    % Make sure each sub square is unique
    all_distinct([A, B, C, D, E, F, G, H, I]),
    % Recursively call squares on the remaining elements within the rows
    squares(Ss1, Ss2, Ss3).

count([],0).
count([Head|Tail], N) :-
    % loop through the list
    %   if the element is a number, increment N
    %   else, continue
    count(Tail, N1),
    (  number(Head)
    -> N is N1 + 1
    ;  N = N1
    ).

calculatePerformances(GivenClues, WeakSolved, ConstraintSolved, FFSearchSolved):-
    % This is the percentage of the puzzle solved from the start
    Weak is ((WeakSolved - GivenClues) / (81 - GivenClues)) * 100,
    % This is ONLY intelligent propagation, not including weak propogation
    % that also exists within constraint propagation 
    Constraint is ((ConstraintSolved - GivenClues) / (81 - GivenClues)) * 100,
    % Unless the input is invalid, this should always be 1.0
    FFSearch is ((FFSearchSolved - GivenClues) / (81 - GivenClues)) * 100,

    displayPerformances(Weak, Constraint, FFSearch).

displayPerformances(Weak, Constraint, FFSearch):-
    write('\nPercent Solved from start:'),
    write('\nWeak Propagation: %'),
    format('~2f~n', [Weak]),
    write('Constraint Propagation: %'),
    format('~2f~n', [Constraint]),
    write('Search: %'),
    format('~2f~n', [FFSearch]),
    write('\n').

readFileAndAssign(File, Rows):-
    % Read the file to get the puzzle
    open(File, read, Stream),
    read(Stream, Term),
    close(Stream),
    % Assign the puzzle to Rows
    Term = puzzle(_, Rows).

%! Command Examples
% Assign puzzle 1 to Rows
% maplist(portray_clause, Rows) - outputs the puzzle

% readFileAndAssign('src/sample_puzzles/puzzle1.txt', Rows), simpleSolver(Rows), maplist(portray_clause, Rows).
% readFileAndAssign('src/sample_puzzles/puzzle1.txt', Rows), compareStrategies(Rows, GivenClues, WeakSolved, ConstraintSolved, FFSearchSolved).