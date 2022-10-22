const side = 8;

var draggedImage = null;

function createChessboard() {
    console.log('hi');
    var board = document.createElement('div');
    for (var i = 0; i < side; i++) {
        var row = document.createElement('tr');  
        row.id = "row" + (side - i);
        for (var j = 0; j < side; j++) {
            var block = document.createElement("td");
            block.classList.add('chessboardItem');
            if ((i + j) % 2  == 0) {
                block.classList.add('whiteSquare');
            } else {
                block.classList.add('blackSquare');
            }
            block.id = "" + (side - i) + j;
            block.setAttribute('row', side - i);
            block.setAttribute('column', j);
            block.addEventListener('dragenter', handleDragEnter);
            block.addEventListener('dragleave', handleDragLeave);
            row.appendChild(block);
        }
        board.appendChild(row);
    }
    document.body.appendChild(board);

    // Set pawns
    for (var i = 0; i < side; i++) {
        setPiece(6, i, "Pawn", i, "White");
        setPiece(1, i, "Pawn", i, "Black");
    }

    // Set rooks
    setPiece(0, 0, "Rook", 1, "Black");
    setPiece(0, 7, "Rook", 2, "Black");
    setPiece(7, 0, "Rook", 1, "White");
    setPiece(7, 7, "Rook", 2, "White");

    // Set knights
    setPiece(0, 1, "Knight", 1, "Black");
    setPiece(0, 6, "Knight", 2, "Black");
    setPiece(7, 1, "Knight", 1, "White");
    setPiece(7, 6, "Knight", 2, "White");

    // Set bishops
    setPiece(0, 2, "Bishop", 1, "Black");
    setPiece(0, 5, "Bishop", 2, "Black");
    setPiece(7, 2, "Bishop", 1, "White");
    setPiece(7, 5, "Bishop", 2, "White");

    // Set Queens
    setPiece(0, 3, "Queen", 1, "Black");
    setPiece(7, 3, "Queen", 1, "White");

    // Set Kings
    setPiece(0, 4, "King", 1, "Black");
    setPiece(7, 4, "King", 1, "White");
} 

function setPiece(x, y, piece, num, color) {
    var pawnCell = document.getElementById("" + (side - x) + y);
    var pawn = document.createElement("img");
    pawn.classList.add('chessboardItem');
    pawn.src = 'pieces/' + color + '_' + piece + '.png';
    pawn.setAttribute("color", color);
    pawn.setAttribute("piece", piece);
    pawn.setAttribute("num", num);
    pawn.addEventListener('dragstart', handleDragStart);
    pawn.addEventListener('dragend', handleDragEnd);
    pawnCell.appendChild(pawn);
}

function handleDragStart(e) {
    this.style.opacity = '0';
}

function handleDragEnd(e) { 
    this.style.opacity = '1';
    addPiece(this);
    draggedImage = null;
}

function handleDragEnter(e) {
    this.classList.add('over');
    draggedImage = this;
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function addPiece(piece) {
    if (draggedImage == null || !checkValidMove(piece)) {
        return;
    }

    if (draggedImage.childNodes.length > 0) {
        draggedImage.removeChild(draggedImage.firstChild);
    }
    draggedImage.appendChild(piece);
}

// Check if we can take the piece (i.e., they are the opposite colors)
function checkTake(piece1, piece2) {
    return piece1 != null && ((piece1.getAttribute('color') === 'White' && piece2.getAttribute('color') === 'Black') ||
        (piece1.getAttribute('color') === 'Black' && piece2.getAttribute('color') === 'White'));
}

// Helper function to determine if two pieces are equal
function checkPiecesEqual(piece1, piece2) {
    return piece1.getAttribute('color') === piece2.getAttribute('color') && piece1.getAttribute('piece') === piece2.getAttribute('piece') && piece1.getAttribute('num') === piece2.getAttribute('num');
}

const pawnFlags = [[false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false]];

// Check if we can make a valid move based on the given square
function checkValidMove(piece) {
    var originalSquare = piece.parentNode;

    // If the squares are the same, we do not add a piece
    if (checkPiecesEqual(piece, draggedImage)) {
        return false;
    } 

    // Check if the square we are trying to put the piece in has the same color
    if (draggedImage.childNodes.length > 0 && !checkTake(piece, draggedImage.childNodes[0])) {
        return false;
    }
    
    // Check for each piece whether a move can be made
    if (piece.getAttribute('piece') === 'Pawn') {
        return checkPawnValid(originalSquare, piece);
    } else if (piece.getAttribute('piece') === 'Knight') {
        var knightMoves = getKnightMoves(originalSquare);

        // Check all possible knight moves and see if any match
        for (var i = 0; i < 8; i++) {
            if (knightMoves[i][0] == draggedImage.getAttribute('row') && knightMoves[i][1] == draggedImage.getAttribute('column'))  {
                return true;
            }
        }

        return false;

    } else if (piece.getAttribute('piece') === 'Rook') {
        return checkRookValid(originalSquare);

    } else if (piece.getAttribute('piece') === 'Bishop') {
        return checkBishopValid(originalSquare);

    } else if (piece.getAttribute('piece') === 'Queen') {
        return checkRookValid(originalSquare) || checkBishopValid(originalSquare);

    } else if (piece.getAttribute('piece') === 'King') {
        // The King can only be moved by one square
        return Math.abs(draggedImage.getAttribute('row') - originalSquare.getAttribute('row')) <= 1 && Math.abs(draggedImage.getAttribute('column') - originalSquare.getAttribute('column')) <= 1;
    }

    return true;
}

// Helper function to see if a move made by a pawn is valid
function checkPawnValid(originalSquare, piece) {

    // Check whether the piece is white or black
    var colorIndex = (piece.getAttribute('color') === 'White') ? 0 : 1;
    var notMoved = pawnFlags[colorIndex][piece.getAttribute('num')];

    var draggedImageRow = parseInt(draggedImage.getAttribute('row'));
    var draggedImageColumn = parseInt(draggedImage.getAttribute('column'));
    var originalImageRow = parseInt(originalSquare.getAttribute('row'));
    var originalImageColumn = parseInt(originalSquare.getAttribute('column'));

    // Check if the pawn is moved back; if so this is automatically illegal
    if ((colorIndex == 0 && draggedImageRow - originalImageRow <= 0) || (colorIndex == 1 && draggedImageRow - originalImageRow >= 0)) {
        return false;
    }

    // Do we move the pawn up 2 spaces?
    if (Math.abs(draggedImageRow - originalImageRow) == 2) {
        
        // If the piece has not been touched yet and the column is the same, moving a pawn up 2 spaces is valid.
        canMove = !notMoved && draggedImageColumn == originalImageColumn;

    // Do we move the pawn up 1 space?
    } //else if (Math.abs(draggedImageRow - originalImageRow) == 1 && Math.abs(draggedImageColumn - originalImageColumn) == 1){
       // canMove = checkTake(piece, draggedImage.childNodes[0]);
    else if (Math.abs(draggedImageRow - originalImageRow) == 1) {
        
        // Check if we can take a piece
        canMove = ((Math.abs(draggedImageColumn - originalImageColumn) == 1) && checkTake(piece, draggedImage.childNodes[0])) 
        || Math.abs(draggedImageColumn - originalImageColumn) == 0;
    }

    if (canMove) {
        pawnFlags[colorIndex][piece.getAttribute('num')] = true;
    }

    // Check for pawn promotion


    return canMove;
}

// Helper function to see if a move made by a rook is valid
function checkRookValid(originalSquare) {
    var draggedImageRow = parseInt(draggedImage.getAttribute('row'));
    var draggedImageColumn = parseInt(draggedImage.getAttribute('column'));
    var originalImageRow = parseInt(originalSquare.getAttribute('row'));
    var originalImageColumn = parseInt(originalSquare.getAttribute('column'));

    if (draggedImageRow != originalImageRow && draggedImageColumn != originalImageColumn) {
        return false;
    }

    for (var i = originalImageRow + 1; i <= draggedImageRow - 1; i++) {
        if (document.getElementById("" + i + originalImageColumn).childNodes.length != 0) {
            return false;
        }
    }

    for (var i = originalImageColumn + 1; i <= draggedImageColumn - 1; i++) {
        if (document.getElementById("" + originalImageRow + i).childNodes.length != 0) {
            return false;
        }
    }

    for (var i = draggedImageRow + 1; i <= originalImageRow - 1; i++) {
        if (document.getElementById("" + i + originalImageColumn).childNodes.length != 0) {
            return false;
        }
    }

    for (var i = draggedImageColumn + 1; i <= originalImageColumn - 1; i++) {
        if (document.getElementById("" + originalImageRow + i).childNodes.length != 0) {
            return false;
        }
    }

    return true;
 }

 // Helper function to see if a move made by a bishop is valid
 function checkBishopValid(originalSquare) {
    var draggedImageRow = parseInt(draggedImage.getAttribute('row'));
    var draggedImageColumn = parseInt(draggedImage.getAttribute('column'));
    var originalImageRow = parseInt(originalSquare.getAttribute('row'));
    var originalImageColumn = parseInt(originalSquare.getAttribute('column'));
    
    if (Math.abs(draggedImageRow - originalImageRow) != Math.abs(draggedImageColumn - originalImageColumn)) {
        return false;
    }

    for (var i = originalImageRow + 1; i <= draggedImageRow - 1; i++) {
        var place;

        if (draggedImageColumn - originalImageColumn < 0) {
            place = -i + originalImageRow;
        } else {
            place = i - originalImageRow;
        }

        if (document.getElementById("" + i + (originalImageColumn + place)).childNodes.length != 0) {
            return false;
        }
    }

    for (var i = draggedImageRow + 1; i <= originalImageRow - 1; i++) {
        var place;

        if (draggedImageColumn - originalImageColumn < 0) {
            place = -i + originalImageRow;
        } else {
            place = i - originalImageRow;
        }

        if (document.getElementById("" + i + (draggedImageColumn + place)).childNodes.length != 0) {
            return false;
        }
    }

    return true;
 }

// Helper function to get all possible moves of a Knight from a given position
function getKnightMoves(currentSquare) {
    var positions = [];
    var row = parseInt(currentSquare.getAttribute('row'));
    var column = parseInt(currentSquare.getAttribute('column'));

    positions.push([row + 2, column + 1]);
    positions.push([row + 2, column - 1]);
    positions.push([row + 1, column - 2]);
    positions.push([row + 1, column + 2]);
    positions.push([row - 1, column + 2]);
    positions.push([row - 1, column - 2]);
    positions.push([row - 2, column + 1]);
    positions.push([row - 2, column - 1]);

    return positions;
}

function inCheck() {

}

createChessboard();