import { WORDS } from "./words.js";

let NUMBER_OF_GUESSES = 6;
//let guessesRemaining = NUMBER_OF_GUESSES;
let currentRow = 0
let currentGuess = [];
let guessBlock = []
let nextLetter = 0;
let numberBoards = 0; //boards run from 1 upwards
//let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)]
//let rightGuessStringArray = []
//let rightGuessBool = []
//console.log(rightGuessString)

/* TODO, everytime there is a guess add something tokeyboard test - done
boards to array - done
Move board creation to a separate function - done
Fill all boards on init - done
Fill al lboards on keypress - done
there is some subtle error in filling hte board later on,
Link boards + guesses + everything: - done
Different guess for each board - done
move from for loops to iterate over boards and row objects - done
consistent iterators n for borads, r for rows etc... - done
Stop enternign when the guess is right - done
TODO fix issue with pinting at first board - done
add a row after every guess, pointer to the current row  - done
stop createing boards when all leters have been guessed
move from listing boards to iterativing over them
fix yellow in two places, if the first it gets it wrong
host on aws
*/

function initBoard() {
    /* Create the board */
    let boards = document.getElementById("game-boards");

    let board = document.createElement("div")
    board.id = "board"+numberBoards
    board.className="board"
    numberBoards=numberBoards+1
    board["rightGuess"]=WORDS[Math.floor(Math.random() * WORDS.length)]
    board["boolGuess"]=false


   // rightGuessStringArray.push(board.rightGuess)
    // rightGuessBool.push(false)

 
    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }

        board.appendChild(row)
    }
    boards.append(board)
    fillBoard(board)
    let line = document.createElement("hr")
    boards.append(line)
}

function fillBoard(board){
    //let boardn = board.id.substring(5)
    //let rightGuess=board.rightGuess
    //let rightGuess=Array.from(rightGuessStringArray[boardn])
    // Fencepost nightmare, numboards seems to be in two places
    for (let i = 0; i < numberBoards-1; i++) {
        let row=getLetterRowBoard(i,board);  
        //let firstBoardRow=getLetterRow(i,1); // I've changed the scheme TODO
        //let firstBoardRowGuess=[]
        for (let j = 0; j<5; j++ ){
            let box = row.children[j]
           //let firstBoardBox = firstBoardRow.children[j]
            box.textContent= guessBlock[i].substr(j,1) //.push(guessString)//irstBoardBox.textContent
            //firstBoardRowGuess.push(firstBoardBox.textContent)
        }

        colourRow(row,guessBlock[i],board.rightGuess)
    }
}

//TODO get rid of this
//function getLetterRow(numRow,numBoard = 1){
//    return document.getElementsByClassName("letter-row")[numRow + (numBoard-1) * 6]
//}

function getLetterRowBoard(numRow,board){
    return board.getElementsByClassName("letter-row")[numRow]
}

document.addEventListener("keyup", (e) => {

    //if (guessesRemaining === 0) {
    if (currentRow === NUMBER_OF_GUESSES) {
        return
    }

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        checkGuess()
        return
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }
})

function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    for (let board of document.getElementById("game-boards").getElementsByClassName("board")){
        if (!board.boolGuess) {
            //let row = getLetterRowBoard(NUMBER_OF_GUESSES-guessesRemaining,board) 
            let row = getLetterRowBoard(currentRow,board) 
            let box = row.children[nextLetter]
            animateCSS(box, "pulse")
            box.textContent = pressedKey
            box.classList.add("filled-box")
        }
    }
    currentGuess.push(pressedKey)
    nextLetter += 1
}

function deleteLetter () {
    for (let board of document.getElementById("game-boards").getElementsByClassName("board")){
        //let row = getLetterRowBoard(NUMBER_OF_GUESSES-guessesRemaining,board) 
        let row = getLetterRowBoard(currentRow,board) 
        let box = row.children[nextLetter - 1]
        box.textContent = ""
        box.classList.remove("filled-box")
    }
    currentGuess.pop()
    nextLetter -= 1
}

function colourRow (row, testWord, rightGuess) {
    //how we deal with multi letters, it picks the first one to check from the left
    let rightGuessUpdate=[...rightGuess] //copy without refernce
    for (let i = 0; i < 5; i++) {
        let letterColor = ''
        let box = row.children[i]
        let letter = testWord[i]
        
        let letterPosition = rightGuessUpdate.indexOf(testWord[i])
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = 'grey'
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position 
            if (testWord[i] === rightGuessUpdate[i]) {
                // shade green 
                letterColor = 'green'
            } else {
                // shade box yellow
                letterColor = 'yellow'
            }
           rightGuessUpdate[letterPosition] = "#"
        }

        let delay = 250 * i
        setTimeout(()=> {
            //shade box
            animateCSS(box, 'flipInX')
            box.style.backgroundColor = letterColor
            shadeKeyBoard(letter, letterColor)
        }, delay)
    }
}

function checkGuess () {
    let guessString = ''
    for (const val of currentGuess) {
        guessString += val
    }

    if (guessString.length != 5) {
        toastr.error("Not enough letters!")
        return
    }

    if (!WORDS.includes(guessString)) {
        toastr.error("Word not in list!")
        return
    }

    guessBlock.push(guessString)

    for (let board of document.getElementById("game-boards").getElementsByClassName("board")){
        if (!board.boolGuess){ 
            toastr.info(board.id+":"+board.rightGuess+":"+currentGuess)
            let rightGuess = Array.from(board.rightGuess)
            //let row = getLetterRowBoard(NUMBER_OF_GUESSES-guessesRemaining,board) 
            let row = getLetterRowBoard(currentRow,board) 
            colourRow(row, currentGuess ,rightGuess) 
            if (guessString ==board.rightGuess ){
                board.boolGuess=true
            }
        }
    }

    let allRightGuess = true
    for (let board of document.getElementById("game-boards").getElementsByClassName("board")){
        if (!board.boolGuess){
            allRightGuess=false
        }
    }

    if (allRightGuess == true){//! rightGuessBool.includes(false)) {
        toastr.success("You guessed right! Game over!")
        //guessesRemaining = 0
        currentRow=NUMBER_OF_GUESSES
        return
    } else {
       // guessesRemaining -= 1;
        currentRow += 1;
        //create an additional board if it's not an error above
        initBoard() 
        currentGuess = [];
        nextLetter = 0;
        // increase number of gueses + rows if we haven't guessed all letters
        let guessLetterSet = new Set(guessBlock.toString()
            .toLowerCase()
            .replace(/[^a-z]/g, '')
        )
        if(guessLetterSet.size < 26){
            NUMBER_OF_GUESSES += 1
            for (let board of document.getElementById("game-boards").getElementsByClassName("board")){
                if (!board.boolGuess){
                    let row = document.createElement("div")
                    row.className = "letter-row"
                    for (let j = 0; j < 5; j++) {
                        let box = document.createElement("div")
                        box.className = "letter-box"
                        row.appendChild(box)
                    }
                    board.appendChild(row)
                }   
            }
        }
        //if (guessesRemaining === 0) {
        if (currentRow == NUMBER_OF_GUESSES) {
            toastr.error("You've run out of guesses! Game over!")
            toastr.info(`The right words were: "${rightGuessStringArray}"`)
        }
    } 
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === 'green') {
                return
            } 

            if (oldColor === 'yellow' && color !== 'green') {
                return
            }

            elem.style.backgroundColor = color
            break
        }
    }
}

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    
    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (key === "Del") {
        key = "Backspace"
    } 

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})


const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element
    node.style.setProperty('--animate-duration', '0.3s');
    
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});


initBoard()