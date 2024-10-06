# Alu-sparse-matrix

This project provides a utility to read, manipulate, and perform operations (addition, subtraction, and multiplication) on sparse matrices. The matrices are represented efficiently using `Map` objects in JavaScript to minimize memory usage.

## Features

- **Read Sparse Matrices**: From custom-formatted text files.
- **Perform Matrix Operations**:
  - **Addition** of two matrices.
  - **Subtraction** of two matrices.
  - **Multiplication** of two matrices.

## Project Structure

- `code/src/index.js`: Main script that reads matrices from input files, performs the specified operation, and outputs the result.
- `sample_inputs/`: Directory containing sample input files for the matrix operations.

## Input File Format

The input file format is expected as follows:

1. The first line contains the number of rows: `rows=<number>`.
2. The second line contains the number of columns: `cols=<number>`.
3. Each subsequent line contains a matrix entry in the format `(row, col, value)`.

Example:
```
rows=3 
cols=3 
(0, 0, 5) 
(1, 2, 10) 
(2, 1, 3)
```

## Setup

### Prerequisites

- Ensure you have Node.js installed.

### Clone the Repository

```bash
git clone https://github.com/MikeManzi/Alu-sparse-matrix.git
cd Alu-sparse-matrix
```
### Running the Code

- Place Input Files: Ensure your matrix input files are placed inside the sample_inputs/ directory or provide their paths when configuring the file paths in the script.

- Configure the Operation: In the processMatrixFiles function in the index.js file, set the operation variable to one of the following values based on the desired operation:
  - 'add' for matrix addition.
  - 'subtract' for matrix subtraction.
  - 'multiply' for matrix multiplication.

- Run the Script:
```bash
cd code/src
node index.js
```

