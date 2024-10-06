const fs = require('fs')

/**
 * Parses a single matrix entry from the input file.
 * Expects the entry to be in the format (row, col, value).
 * Throws an error if the format is incorrect.
 * 
 * @param {string} entry - The string representing the matrix entry.
 * @returns {object} - An object containing row, col, and value.
 */
const parseEntry = (entry) => {
    // Remove leading/trailing spaces
    entry = entry.trim()

    // Check if entry starts with '(' and ends with ')'
    if (!entry.startsWith('(') || !entry.endsWith(')')) {
        throw new Error("Input file has wrong format")
    }

    // Remove parentheses and split by comma to get row, col, and value
    entry = entry.substring(1, entry.length - 1)
    const parts = entry.split(',')

    // Ensure we have exactly 3 parts
    if (parts.length !== 3) {
        throw new Error("Input file has wrong format")
    }

    // Parse each part as integers (row, col, value)
    const row = parseInt(parts[0].trim())
    const col = parseInt(parts[1].trim())
    const value = parseInt(parts[2].trim())

    // Check for invalid (NaN) values
    if (isNaN(row) || isNaN(col) || isNaN(value)) {
        throw new Error("Input file has wrong format")
    }

    return { row, col, value }
}

/**
 * Reads a sparse matrix from a file.
 * Expects the file to contain row and column counts on the first two lines,
 * followed by matrix entries in the format (row, col, value).
 * 
 * @param {string} filePath - Path to the input file.
 * @returns {object} - An object containing rows, cols, and matrix entries.
 */
const readMatrix = (filePath) => {
    try {
        // Read the entire file and split into lines
        const data = fs.readFileSync(filePath, 'utf-8')
        const lines = data.split('\n').map(line => line.trim()).filter(line => line !== '')

        let rows, cols
        const matrixEntries = []

        // Process each line
        lines.forEach((line, index) => {
            if (index === 0) {
                // First line should contain the row count (rows=...)
                if (line.startsWith('rows=')) {
                    rows = parseInt(line.split('=')[1])
                } else {
                    throw new Error("Input file has wrong format")
                }
            } else if (index === 1) {
                // Second line should contain the column count (cols=...)
                if (line.startsWith('cols=')) {
                    cols = parseInt(line.split('=')[1])
                } else {
                    throw new Error("Input file has wrong format")
                }
            } else {
                // Remaining lines are matrix entries
                const entry = parseEntry(line)
                matrixEntries.push(entry)
            }
        })

        return { rows, cols, matrixEntries }
    } catch (error) {
        console.error("Error reading matrix file:", error.message)
        throw error
    }
}

/**
 * Creates a sparse matrix represented as a Map, with rows and columns as keys.
 * 
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @param {Array} entries - List of matrix entries (row, col, value).
 * @returns {object} - Sparse matrix object with rows, cols, and matrix data.
 */
const createMatrix = (rows, cols, entries) => {
    const matrix = new Map()

    entries.forEach(({ row, col, value }) => {
        if (!matrix.has(row)) {
            matrix.set(row, new Map())
        }
        matrix.get(row).set(col, value)
    })

    return { rows, cols, matrix }
}

/**
 * Retrieves the value at a specific row and column in the matrix.
 * Returns 0 if no value is set.
 * 
 * @param {Map} matrix - The sparse matrix.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @returns {number} - The value at (row, col) or 0 if not found.
 */
const getValue = (matrix, row, col) => {
    if (matrix.has(row) && matrix.get(row).has(col)) {
        return matrix.get(row).get(col)
    }
    return 0
}

/**
 * Sets a value in the matrix at a specific row and column.
 * 
 * @param {Map} matrix - The sparse matrix.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @param {number} value - The value to set.
 */
const setValue = (matrix, row, col, value) => {
    if (value === 0) return  // Do not store zeros
    if (!matrix.has(row)) {
        matrix.set(row, new Map())
    }
    matrix.get(row).set(col, value)
}

/**
 * Adds two sparse matrices together.
 * 
 * @param {object} matrixA - The first sparse matrix.
 * @param {object} matrixB - The second sparse matrix.
 * @returns {object} - The resulting sparse matrix after addition.
 */
const addMatrices = (matrixA, matrixB) => {
    if (matrixA.rows !== matrixB.rows || matrixA.cols !== matrixB.cols) {
        throw new Error('Matrices dimensions must match for addition')
    }

    const resultMatrix = new Map()

    // Add values from matrixA
    matrixA.matrix.forEach((rowMap, row) => {
        rowMap.forEach((value, col) => {
            setValue(resultMatrix, row, col, value)
        })
    })

    // Add values from matrixB
    matrixB.matrix.forEach((rowMap, row) => {
        rowMap.forEach((value, col) => {
            const currentValue = getValue(resultMatrix, row, col)
            setValue(resultMatrix, row, col, currentValue + value)
        })
    })

    return { rows: matrixA.rows, cols: matrixA.cols, matrix: resultMatrix }
}

/**
 * Subtracts matrixB from matrixA.
 * 
 * @param {object} matrixA - The first sparse matrix.
 * @param {object} matrixB - The second sparse matrix.
 * @returns {object} - The resulting sparse matrix after subtraction.
 */
const subtractMatrices = (matrixA, matrixB) => {
    if (matrixA.rows !== matrixB.rows || matrixA.cols !== matrixB.cols) {
        throw new Error('Matrices dimensions must match for subtraction')
    }

    const resultMatrix = new Map()

    // Subtract values from matrixB from matrixA
    matrixA.matrix.forEach((rowMap, row) => {
        rowMap.forEach((value, col) => {
            setValue(resultMatrix, row, col, value)
        })
    })

    matrixB.matrix.forEach((rowMap, row) => {
        rowMap.forEach((value, col) => {
            const currentValue = getValue(resultMatrix, row, col)
            setValue(resultMatrix, row, col, currentValue - value)
        })
    })

    return { rows: matrixA.rows, cols: matrixA.cols, matrix: resultMatrix }
}

/**
 * Multiplies two sparse matrices together.
 * 
 * @param {object} matrixA - The first sparse matrix.
 * @param {object} matrixB - The second sparse matrix.
 * @returns {object} - The resulting sparse matrix after multiplication.
 */
const multiplyMatrices = (matrixA, matrixB) => {
    if (matrixA.cols !== matrixB.rows) {
        throw new Error('Invalid matrix dimensions for multiplication')
    }

    const resultMatrix = new Map()

    // Perform matrix multiplication
    matrixA.matrix.forEach((rowMapA, rowA) => {
        rowMapA.forEach((valueA, colA) => {
            if (matrixB.matrix.has(colA)) {
                matrixB.matrix.get(colA).forEach((valueB, colB) => {
                    const currentValue = getValue(resultMatrix, rowA, colB)
                    setValue(resultMatrix, rowA, colB, currentValue + valueA * valueB)
                })
            }
        })
    })

    return { rows: matrixA.rows, cols: matrixB.cols, matrix: resultMatrix }
}

/**
 * Converts a sparse matrix object into a human-readable string.
 * 
 * @param {object} matrixObj - The sparse matrix object.
 * @returns {string} - A string representation of the matrix.
 */
const matrixToString = (matrixObj) => {
    let result = `Rows: ${matrixObj.rows}, Cols: ${matrixObj.cols}\n`
    matrixObj.matrix.forEach((rowMap, row) => {
        rowMap.forEach((value, col) => {
            result += `(${row}, ${col}, ${value})\n`
        })
    })
    return result
}

/**
 * Function to read, process, and perform operations on two matrix files.
 */
const processMatrixFiles = () => {
    try {
        const operation = 'add' // Choose between 'add', 'subtract', 'multiply'

        const matrixOnePath = '../../sample_inputs/easy_sample_02_1.txt'
        const matrixTwoPath = '../../sample_inputs/easy_sample_02_2.txt'

        // Read and parse the sparse matrix files
        const matrixOneData = readMatrix(matrixOnePath)
        const matrixTwoData = readMatrix(matrixTwoPath)

        // Create sparse matrix objects
        const matrixOne = createMatrix(matrixOneData.rows, matrixOneData.cols, matrixOneData.matrixEntries)
        const matrixTwo = createMatrix(matrixTwoData.rows, matrixTwoData.cols, matrixTwoData.matrixEntries)

        let result
        // Perform the specified operation
        switch (operation) {
            case 'add':
                result = addMatrices(matrixOne, matrixTwo)
                break
            case 'subtract':
                result = subtractMatrices(matrixOne, matrixTwo)
                break
            case 'multiply':
                result = multiplyMatrices(matrixOne, matrixTwo)
                break
            default:
                throw new Error("Invalid operation")
        }

        // Output the resulting matrix
        console.log(`Result from the ${operation} operation`)
        console.log(matrixToString(result))

    } catch (error) {
        console.error(error.message)
    }
}

// Run the matrix processing function
processMatrixFiles()
