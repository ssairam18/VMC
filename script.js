        let rows = 10, cols = 10;
        let selectedBorders = [];
        let currentCell = null;

        function createGrid(rows, cols) {
            const grid = document.getElementById('mainGrid');
            grid.innerHTML = '';
            grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

            for (let i = 0; i < rows * cols; i++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.onclick = () => editCell(cell);

                ['top', 'right', 'bottom', 'left'].forEach(side => {
                    const border = document.createElement('div');
                    border.className = `border border-${side}`;
                    border.onclick = (event) => selectBorder(border, cell, side, event);
                    cell.appendChild(border);
                });

                grid.appendChild(cell);
            }
            updateCounts();
        }

        function createNewGrid() {
            const gridSize = prompt('Enter grid size (e.g., 3x10):');
            if (gridSize) {
                const [r, c] = gridSize.split('x').map(num => parseInt(num.trim(), 10));
                if (!isNaN(r) && !isNaN(c) && r > 0 && c > 0) {
                    rows = r;
                    cols = c;
                    createGrid(rows, cols);
                }
            }
           document.getElementById('teacherHeading').style.display = 'block';
        }

        function loadGrid() {
            const saveName = prompt('Enter name to load:');
            if (saveName && localStorage.getItem(saveName)) {
                const savedData = JSON.parse(localStorage.getItem(saveName));
                if (savedData.rows && savedData.cols) {
                    rows = savedData.rows;
                    cols = savedData.cols;
                    createGrid(rows, cols);
                }

                const cells = document.getElementsByClassName('cell');
                savedData.data.forEach((entry, index) => {
                    if (entry && cells[index]) {
                        cells[index].dataset.data = JSON.stringify(entry);
                        cells[index].className = `cell ${entry.status}`;
                        
                        // Updated display format
                        const lines = [];
                        if (entry.name) lines.push(`<div class="cell-label">${entry.name}</div>`);
                        
                        const details = [];
                        if (entry.room) details.push(`R: ${entry.room}`);
                        if (entry.pagoda) details.push(`PA: ${entry.pagoda}`);
                        if (entry.plate) details.push(`PL: ${entry.plate}`);
                        if (details.length > 0) {
                            lines.push(`<div class="cell-label">${details.join(' | ')}</div>`);
                        }
                        
                        const langOldNew = [];
                        if (entry.lang) langOldNew.push(entry.lang);
                        if (entry.oldnew) langOldNew.push(entry.oldnew);
                        if (langOldNew.length > 0) {
                            lines.push(`<div class="cell-label">${langOldNew.join('/')}</div>`);
                        }
                        
                        lines.push(`<div class="cell-label">${entry.status}</div>`);
                        
                        cells[index].innerHTML = lines.join('');
                    }
                });
                updateCounts();
            }
           document.getElementById('teacherHeading').style.display = 'block';
        }

        function updateCounts() {
            const counts = {
                present: 0,
                absent: 0,
                left: 0,
                lang: {},
                oldnew: {}
            };

            const cells = Array.from(document.getElementsByClassName('cell'));
            cells.forEach(cell => {
                if (cell.dataset.data) {
                    const data = JSON.parse(cell.dataset.data);
                    if (data.status === 'present') {
                        counts.present++;
                        if (data.lang) {
                            counts.lang[data.lang] = (counts.lang[data.lang] || 0) + 1;
                        }
                        if (data.oldnew) {
                            counts.oldnew[data.oldnew] = (counts.oldnew[data.oldnew] || 0) + 1;
                        }
                    } else if (data.status === 'absent') {
                        counts.absent++;
                    } else if (data.status === 'left') {
                        counts.left++;
                    }
                }
            });

            document.getElementById('total-present').textContent = counts.present;
            document.getElementById('total-absent').textContent = counts.absent;
            document.getElementById('total-left').textContent = counts.left;

            const langStats = document.getElementById('lang-stats');
            langStats.innerHTML = Object.entries(counts.lang)
                .sort((a, b) => b[1] - a[1])
                .map(([lang, count]) => `
                    <div class="stat-item">
                        ${lang}: ${count}
                    </div>`).join('');

            const oldnewStats = document.getElementById('oldnew-stats');
            oldnewStats.innerHTML = Object.entries(counts.oldnew)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => `
                    <div class="stat-item">
                        ${type}: ${count}
                    </div>`).join('');
        }

        function selectBorder(border, cell, side, event) {
            event.stopPropagation();
            const borderData = { border, cell, side };

            if (selectedBorders.some(item => item.border === border)) {
                border.classList.remove("selected");
                selectedBorders = selectedBorders.filter(item => item.border !== border);
            } else {
                border.classList.add("selected");
                selectedBorders.push(borderData);
            }
        }

        function applyBorders() {
            if (selectedBorders.length === 0) {
                alert("Please select at least one border.");
                return;
            }

            const input = prompt("Enter border color and thickness (e.g., red'20):");
            if (!input) return;

            const match = input.match(/(.+)'(\d+)/);
            if (!match) {
                alert("Invalid format! Use format: color'thickness (e.g., red'20)");
                return;
            }

            const color = match[1].trim();
            const thickness = match[2].trim() + "px";

            selectedBorders.forEach(({ border, cell, side }) => {
                border.classList.remove("selected");
                cell.style[`border-${side}`] = `${thickness} solid ${color}`;
            });

            selectedBorders = [];
        }

        function editCell(cell) {
            currentCell = cell;
            document.getElementById('editModal').style.display = 'block';

            if (cell.dataset.data) {
                const data = JSON.parse(cell.dataset.data);
                document.getElementById('name').value = data.name || '';
                document.getElementById('room').value = data.room || '';
                document.getElementById('pagoda').value = data.pagoda || '';
                document.getElementById('plate').value = data.plate || '';
                document.getElementById('lang').value = data.lang || '';
                document.getElementById('oldnew').value = data.oldnew || '';
                document.getElementById('status').value = data.status || 'present';
            }
        }

        function saveCell() {
            const data = {
                name: document.getElementById('name').value,
                room: document.getElementById('room').value,
                pagoda: document.getElementById('pagoda').value,
                plate: document.getElementById('plate').value,
                lang: document.getElementById('lang').value,
                oldnew: document.getElementById('oldnew').value,
                status: document.getElementById('status').value
            };

            currentCell.dataset.data = JSON.stringify(data);
            currentCell.className = `cell ${data.status}`;

            // New display format
            const lines = [];
            if (data.name) lines.push(`<div class="cell-label">${data.name}</div>`);

            const details = [];
            if (data.room) details.push(`R: ${data.room}`);
            if (data.pagoda) details.push(`PA: ${data.pagoda}`);
            if (data.plate) details.push(`PL: ${data.plate}`);
            if (details.length > 0) {
                lines.push(`<div class="cell-label">${details.join(' | ')}</div>`);
            }

            const langOldNew = [];
            if (data.lang) langOldNew.push(data.lang);
            if (data.oldnew) langOldNew.push(data.oldnew);
            if (langOldNew.length > 0) {
                lines.push(`<div class="cell-label">${langOldNew.join('/')}</div>`);
            }

            lines.push(`<div class="cell-label">${data.status}</div>`);

            currentCell.innerHTML = lines.join('');

            closeModal();
            updateCounts();
        }

        function closeModal() {
            document.getElementById('editModal').style.display = 'none';
        }

        function saveData() {
            const saveName = prompt('Enter save name:');
            if (!saveName) return;

            const cells = Array.from(document.getElementsByClassName('cell'));
            const data = cells.map(cell => cell.dataset.data ? JSON.parse(cell.dataset.data) : null);

            localStorage.setItem(saveName, JSON.stringify({ 
                rows, 
                cols, 
                data,
                timestamp: new Date().toISOString()
            }));
            alert('Saved successfully!');
        }

        function exportData() {
            const cells = Array.from(document.getElementsByClassName('cell'));
            const data = cells.map(cell => cell.dataset.data ? JSON.parse(cell.dataset.data) : null)
                             .filter(entry => entry !== null);

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data");
            XLSX.writeFile(wb, "data.xlsx");
        }

   function copyScript() {
        const elementToCopy = document.querySelector('doc001'); // Select the <copi001> element
        if (elementToCopy) {
            const textArea = document.createElement('textarea');
            textArea.value = elementToCopy.innerHTML; // Get only the inner HTML (content between the tags)
            document.body.appendChild(textArea);
            textArea.select(); // Select the text
            document.execCommand('copy'); // Copy the selected text
            document.body.removeChild(textArea);
            alert("copied to clipboard!");
        } else {
            alert("not found!");
        }
    }
 
// Add these functions to your existing script
function swapCells() {
    const input = prompt('Enter swap command (e.g., A3>B6):');
    if (!input) return;

    // Parse input
    const [sourceRef, targetRef] = input.split('>').map(s => s.trim().toUpperCase());
    if (!sourceRef || !targetRef) {
        alert('Invalid format! Use format: A3>B6');
        return;
    }

    // Convert references to cell indexes
    const sourceIndex = getCellIndex(sourceRef);
    const targetIndex = getCellIndex(targetRef);
    
    if (sourceIndex === -1 || targetIndex === -1) {
        alert('Invalid cell reference!');
        return;
    }

    // Get cell elements
    const cells = document.getElementsByClassName('cell');
    if (sourceIndex >= cells.length || targetIndex >= cells.length) {
        alert('Cell reference out of grid bounds!');
        return;
    }

    // Perform swap
    const tempData = cells[sourceIndex].dataset.data;
    const tempHTML = cells[sourceIndex].innerHTML;
    const tempClass = cells[sourceIndex].className;

    cells[sourceIndex].dataset.data = cells[targetIndex].dataset.data;
    cells[sourceIndex].innerHTML = cells[targetIndex].innerHTML;
    cells[sourceIndex].className = cells[targetIndex].className;

    cells[targetIndex].dataset.data = tempData;
    cells[targetIndex].innerHTML = tempHTML;
    cells[targetIndex].className = tempClass;

    updateCounts();
}

function getCellIndex(cellRef) {
    // Convert cell reference (e.g., A3) to grid index
    const match = cellRef.match(/^([A-Z]+)(\d+)$/);
    if (!match) return -1;

    const rowLetters = match[1];
    const colNumber = parseInt(match[2], 10);
    
    // Convert row letters to row number (A=1, B=2, ...)
    let rowNumber = 0;
    for (let i = 0; i < rowLetters.length; i++) {
        rowNumber = rowNumber * 26 + (rowLetters.charCodeAt(i) - 64);
    }

    // Validate grid bounds
    if (rowNumber < 1 || rowNumber > rows || colNumber < 1 || colNumber > cols) {
        return -1;
    }

    // Calculate index (0-based)
    return (rowNumber - 1) * cols + (colNumber - 1);
}
</script>
  <script>
// Function to create a new cell (so we avoid code repetition)
function createNewCell() {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.onclick = () => editCell(cell);
  
  ['top', 'right', 'bottom', 'left'].forEach(side => {
    const border = document.createElement('div');
    border.className = `border border-${side}`;
    border.onclick = (event) => selectBorder(border, cell, side, event);
    cell.appendChild(border);
  });
  
  return cell;
}

// Function to add a new row at the end of the grid
function addRow() {
  const grid = document.getElementById('mainGrid');
  // Create new cells equal to the current number of columns
  for (let i = 0; i < cols; i++) {
    const newCell = createNewCell();
    grid.appendChild(newCell);
  }
  // Increase the row count
  rows++;
  updateCounts();
}

// Function to add a new column to every existing row
function addColumn() {
  const grid = document.getElementById('mainGrid');
  const cells = Array.from(grid.children);
  
  // We need to insert one new cell into each row.
  // Since the grid is a flat container in row-major order,
  // we work from the last row upward to avoid index shifts.
  for (let rowIndex = rows - 1; rowIndex >= 0; rowIndex--) {
    // Calculate the insertion index.
    // In a grid with 'cols' columns, the first cell of row (rowIndex) is at index rowIndex * cols.
    // The new cell should be inserted after the last cell of that row.
    const insertionIndex = rowIndex * cols + cols;
    const newCell = createNewCell();
    
    // Insert the new cell before the cell currently at the calculated index.
    // If insertionIndex equals the current number of children, appendChild works too.
    if (insertionIndex >= grid.children.length) {
      grid.appendChild(newCell);
    } else {
      grid.insertBefore(newCell, grid.children[insertionIndex]);
    }
  }
  
  // Increase the column count
  cols++;
  // Update the grid's column template so that it distributes cells evenly.
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  updateCounts();
}
