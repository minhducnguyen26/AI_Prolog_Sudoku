const dependencies = {
	swipl: require("swipl-stdio"),
	puppeteer: require("puppeteer"),
	write: require("write"),
	fs: require("fs"),
};

const constants = {
	sudokuFile: "src/sudoku.pl",
	inputFile: "src/puzzles/input.txt",
	outputFile: "src/puzzles/output.txt",
	expectedOutputFile: "src/puzzles/expected_output.txt",
	webPage: "https://www.sudokuweb.org",
	csvFile: "src/statistics/statistics.csv",
};

module.exports = { dependencies, constants };
