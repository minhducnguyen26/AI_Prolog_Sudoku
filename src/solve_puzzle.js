const shared = require("./shared");
const { dependencies, constants } = shared;

// Engine represents on SWI-Prolog process.
const engine = new dependencies.swipl.Engine();

const getRows = async (result) => {
	let rows = [];
	let currentRow = result.Rows;

	while (currentRow) {
		const row = [];
		let currentCell = currentRow.head;

		while (currentCell) {
			const cellValue = currentCell.head;
			if (cellValue) row.push(cellValue);
			currentCell = currentCell.tail;
		}
		if (row.length > 0) rows.push(row);
		currentRow = currentRow.tail;
	}
	return rows;
};

const calculatePerformance = (givenClues, solvedClues) => {
	const performance = ((solvedClues - givenClues) / (81 - givenClues)) * 100;
	return performance.toFixed(2) + "%";
};

const getAllPerformances = (result) => {
	const givenClues = result.Start;

	const weakSolved = result.WeakSolved;
	const constraintSolved = result.ConstraintSolved;
	const SearchSolved = result.FFSearchSolved;

	return {
		weakPerformance: calculatePerformance(givenClues, weakSolved),
		constraintPerformance: calculatePerformance(givenClues, constraintSolved),
		searchPerformance: calculatePerformance(givenClues, SearchSolved),
	};
};

const compareSolvers = async () => {
	const command = `readFileAndAssign('${constants.inputFile}', Rows), 
					 compareStrategies(Rows, Start, WeakSolved, ConstraintSolved, FFSearchSolved).`;
	const query = await engine.createQuery(command);

	try {
		const result = await query.next();

		const performances = getAllPerformances(result);
		console.log(performances);
		const rows = await getRows(result);

		return {
			performances,
			rows,
		};
	} finally {
		await query.close();
	}
};

const evaluateOutput = (rows) => {
	console.log("Evaluate output");

	// Write to output file
	const output = JSON.stringify(rows);
	dependencies.write.sync(constants.outputFile, output);
	console.log("Write to output file");

	// Compare output file with expected output file
	const expectedOutput = dependencies.fs.readFileSync(constants.expectedOutputFile);
	if (output !== expectedOutput) throw new Error("Output file is incorrect");
};

const evaluatePerformances = (performances) => {
	console.log("Evaluate performances");

	// Read csv file
	const csv = dependencies.fs.readFileSync(constants.csvFile);
	const csvLines = csv.toString().split("\r ");

	// Get the last line
	const lastLine = csvLines[csvLines.length - 1];
	const lastLineValues = lastLine.split(",");
	const puzzleLevel = lastLineValues[0];

	// Add new entry to the csv file
	const newEntry = `${puzzleLevel},${performances.weakPerformance},${performances.constraintPerformance},${performances.searchPerformance}`;
	dependencies.write.sync(constants.csvFile, newEntry);
};

const solvePuzzle = async () => {
	console.log("Start solving puzzle");

	await engine.call(`consult('${constants.sudokuFile}').`);

	const result = await compareSolvers();

	evaluateOutput(result.rows);

	evaluatePerformances(result.performances);

	engine.close();
};

module.exports = { solvePuzzle };
