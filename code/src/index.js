const fs = require('fs')

const parseEntry = (entry) => {
    entry = entry.trim()
    if (!entry.startsWith('(') || !entry.endsWith(')')) {
        throw new Error("Input file has wrong format")
    }

    entry = entry.substring(1, entry.length - 1)
    const parts = entry.split(',')
    if (parts.length !== 3) {
        throw new Error("Input file has wrong format")
    }

    const row = parseInt(parts[0].trim())
    const col = parseInt(parts[1].trim())
    const value = parseInt(parts[2].trim())

    if (isNaN(row) || isNaN(col) || isNaN(value)) {
        throw new Error("Input file has wrong format")
    }

    return { row, col, value }
}


const readMatrix = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8')
        const lines = data.split('\n').map(line => line.trim()).filter(line => line !== '')

        let rows, cols
        const matrixEntries = []

        lines.forEach((line, index) => {
            if (index === 0) {
                if (line.startsWith('rows=')) {
                    rows = parseInt(line.split('=')[1])
                } else {
                    throw new Error("Input file has wrong format")
                }
            } else if (index === 1) {
                if (line.startsWith('cols=')) {
                    cols = parseInt(line.split('=')[1])
                } else {
                    throw new Error("Input file has wrong format")
                }
            } else {
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

const getValue = (matrix, row, col) => {
    if (matrix.has(row) && matrix.get(row).has(col)) {
        return matrix.get(row).get(col)
    }
    return 0
}

const setValue = (matrix, row, col, value) => {
    if (value === 0) return
    if (!matrix.has(row)) {
        matrix.set(row, new Map())
    }
    matrix.get(row).set(col, value)
}

const addMatrices = (matrixA, matrixB) => {
    if (matrixA.rows !== matrixB.rows || matrixA.cols !== matrixB.cols) {
        throw new Error('Matrices dimensions must match for addition')
    }

    const resultMatrix = new Map()


    matrixA.matrix.forEach((rowMap, row) => {
        rowMap.forEach((value, col) => {
            setValue(resultMatrix, row, col, value)
        })
    })


    matrixB.matrix.forEach((rowMap, row) => {
        rowMap.forEach((value, col) => {
            const currentValue = getValue(resultMatrix, row, col)
            setValue(resultMatrix, row, col, currentValue + value)
        })
    })

    return { rows: matrixA.rows, cols: matrixA.cols, matrix: resultMatrix }
}

const subtractMatrices = (matrixA, matrixB) => {
    if (matrixA.rows !== matrixB.rows || matrixA.cols !== matrixB.cols) {
        throw new Error('Matrices dimensions must match for subtraction')
    }

    const resultMatrix = new Map()


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

const multiplyMatrices = (matrixA, matrixB) => {
    if (matrixA.cols !== matrixB.rows) {
        throw new Error('Invalid matrix dimensions for multiplication')
    }

    const resultMatrix = new Map()

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

const matrixToString = (matrixObj) => {
    let result = `Rows: ${matrixObj.rows}, Cols: ${matrixObj.cols}\n`
    matrixObj.matrix.forEach((rowMap, row) => {
        rowMap.forEach((value, col) => {
            result += `(${row}, ${col}, ${value})\n`
        })
    })
    return result
}

const processMatrixFiles = () => {
    try {
        const operation = 'add' // Choose between 'add', 'subtract', 'multiply'

        const matrixOnePath = '../../sample_inputs/easy_sample_02_1.txt'
        const matrixTwoPath = '../../sample_inputs/easy_sample_02_2.txt'

        const matrixOneData = readMatrix(matrixOnePath)
        const matrixTwoData = readMatrix(matrixTwoPath)

        const matrixOne = createMatrix(matrixOneData.rows, matrixOneData.cols, matrixOneData.matrixEntries)
        const matrixTwo = createMatrix(matrixTwoData.rows, matrixTwoData.cols, matrixTwoData.matrixEntries)

        let result
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

        console.log("Resulting Matrix:")
        console.log(matrixToString(result))

    } catch (error) {
        console.error(error.message)
    }
}

processMatrixFiles()
