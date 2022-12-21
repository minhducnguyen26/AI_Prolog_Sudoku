const shared = require("./shared");
const { dependencies, constants } = shared;

const getPuzzle = async () => {
	console.log("Start getting a new puzzle");

	const browser = await dependencies.puppeteer.launch({ headless: true });
	const [page] = await browser.pages();

	await page.goto(`${constants.webPage}`);
	await page.waitForSelector("#sudoku");

	console.log("Format puzzle");
	const puzzles = await page.evaluate(() => {
		const rows = document.querySelectorAll("#sudoku > table > tbody > tr");

		const solvedPuzzle = [];
		const purePuzzle = [];

		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			const cells = row.querySelectorAll("td");

			const solvedRows = [];
			const pureRows = [];

			for (let j = 0; j < cells.length; j++) {
				const cell = cells[j];
				// each cell might contain 1 or two spans
				// 1 span -> give clue
				// 2 spans -> first span is solution, second span is &nbsp;
				const spans = cell.querySelectorAll("span");

				const span = spans[0];
				const clue = parseInt(span.innerText);
				solvedRows.push(clue);

				if (spans.length === 1) pureRows.push(clue);
				if (spans.length === 2) pureRows.push("_");
			}
			solvedPuzzle.push(solvedRows);
			purePuzzle.push(pureRows);
		}
		return {
			solvedPuzzle,
			purePuzzle,
		};
	});
	const input = `puzzle(1, ${JSON.stringify(puzzles.purePuzzle)}).`;
	dependencies.write.sync(constants.inputFile, input.replace(/"/g, ""));
	console.log("Write to input file");

	const expectedOutput = JSON.stringify(puzzles.solvedPuzzle);
	dependencies.write.sync(constants.expectedOutputFile, expectedOutput);
	console.log("Write to expected output file");
};

module.exports = { getPuzzle };
