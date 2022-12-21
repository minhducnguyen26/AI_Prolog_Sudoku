const get = require("./get_puzzle");
const solve = require("./solve_puzzle");

const main = async () => {
	for (let i = 0; i < 100; i++) {
		await get.getPuzzle();
		await solve.solvePuzzle();
	}
};
main().catch((err) => console.log(err));
