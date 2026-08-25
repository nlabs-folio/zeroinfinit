export class Conway {

    constructor() {

        this.cols = 45;
        this.rows = 25;

        this.generation = 0;

        this.grid = [];
        this.previousGrid = [];

        this.reset();
    }


    reset() {

        this.grid = [];

        for (let y = 0; y < this.rows; y++) {

            this.grid[y] = [];

            for (let x = 0; x < this.cols; x++) {

                this.grid[y][x] = false;
            }
        }

        this.previousGrid = this.cloneGrid();

        this.generation = 0;
    }

seed() {

    for (let y = 0; y < this.rows; y++) {

        for (let x = 0; x < this.cols; x++) {

            this.grid[y][x] =
                Math.random() < 0.10;
        }
    }

    this.previousGrid = this.cloneGrid();

    this.generation = 0;
}


    cloneGrid() {

        return this.grid.map(
            row => [...row]
        );
    }


    isAlive() {

        for (let y = 0; y < this.rows; y++) {

            for (let x = 0; x < this.cols; x++) {

                if (this.grid[y][x]) {
                    return true;
                }
            }
        }

        return false;
    }


    neighbours(x, y) {

        let count = 0;

        for (let yy = -1; yy <= 1; yy++) {

            for (let xx = -1; xx <= 1; xx++) {

                if (xx === 0 && yy === 0) {
                    continue;
                }

                const nx = x + xx;
                const ny = y + yy;

                if (
                    nx >= 0 &&
                    nx < this.cols &&
                    ny >= 0 &&
                    ny < this.rows
                ) {

                    if (this.grid[ny][nx]) {
                        count++;
                    }
                }
            }
        }

        return count;
    }


    next() {

        this.previousGrid =
            this.cloneGrid();

        const next = [];

        for (let y = 0; y < this.rows; y++) {

            next[y] = [];

            for (let x = 0; x < this.cols; x++) {

                const alive =
                    this.grid[y][x];

                const n =
                    this.neighbours(x, y);

                // B3 / S23
                next[y][x] =
                    alive
                        ? (n === 2 || n === 3)
                        : (n === 3);
            }
        }

        this.grid = next;

        this.generation++;
    }


    analyse() {

        let population = 0;
        let changes = 0;
        let activeNeighbours = 0;

        for (let y = 0; y < this.rows; y++) {

            for (let x = 0; x < this.cols; x++) {

                const alive =
                    this.grid[y][x];

                if (alive) {

                    population++;

                    activeNeighbours +=
                        this.neighbours(x, y);
                }

                if (
                    this.grid[y][x] !==
                    this.previousGrid[y][x]
                ) {

                    changes++;
                }
            }
        }

        const total =
            this.cols * this.rows;


        const energy =
            population / total;


        /*
         * No és simplement energy.
         *
         * La resposta sqrt conserva sensibilitat
         * quan la població és baixa.
         */

        const density =
            Math.sqrt(energy);


        /*
         * Moviment real entre generacions.
         */

        const movement =
            changes / total;


        /*
         * Activitat interna de la colònia.
         */

        const activity =
            population > 0
                ? activeNeighbours /
                  (population * 8)
                : 0;


        return {

            population,

            energy,

            density,

            movement,

            activity
        };
    }
}