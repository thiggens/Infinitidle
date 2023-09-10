import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let numberBoards = 0; //boards run from 1 upwards
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)]
let rightGuessStringArray = []
console.log(rightGuessString)

/* TODO, everytime there is a guess add something tokeyboard test - done
boards to array - done
Move board creation to a separate function - done
Fill all boards on init - done
Fill al lboards on keypress - done
there is some subtle error in filling hte board later on,
Link boards + guesses + everything: 
Different guess for each board
stop createing boards when all leters have been guessed
move from listing boards to iterativing over them
host on aws
*/

function initBoard() {
    /* Create the board */
    let boards = document.getElementById("game-boards");

    let board = document.createElement("div")
    board.id = "board"+numberBoards
    numberBoards=numberBoards+1
    rightGuessStringArray.push(rightGuessString)

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
    let boardn = board.id.substring(5)
    let rightGuess=Array.from(rightGuessStringArray[boardn])
    // Fencepost nightmare, numboards seems to be in two places
    for (let i = 0; i < numberBoards-1; i++) {
        let row=getLetterRow(i,boardn);  
        let firstBoardRow=getLetterRow(i,1);
        let firstBoardRowGuess=[]
        for (let j = 0; j<5; j++ ){
            let box = row.children[j]
            let firstBoardBox = firstBoardRow.children[j]
            box.textContent=firstBoardBox.textContent
            firstBoardRowGuess.push(firstBoardBox.textContent)
        }

        colourRow(row,firstBoardRowGuess,rightGuess)
    }
}


function getLetterRow(numRow,numBoard = 1){
    return document.getElementsByClassName("letter-row")[numRow + (numBoard-1) * 6]
}


document.addEventListener("keyup", (e) => {

    if (guessesRemaining === 0) {
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

    for (let i = 0; i < numberBoards; i++) {
        let row = getLetterRow(NUMBER_OF_GUESSES-guessesRemaining,i+1) //document.getElementsByClassName("letter-row")[6 - guessesRemaining]
        let box = row.children[nextLetter]
        animateCSS(box, "pulse")
        box.textContent = pressedKey
        box.classList.add("filled-box")
    }
    currentGuess.push(pressedKey)
    nextLetter += 1
}

function deleteLetter () {
    for (let i = 0; i < numberBoards; i++) {
        let row = getLetterRow(NUMBER_OF_GUESSES-guessesRemaining,i+1) //document.getElementsByClassName("letter-row")[6 - guessesRemaining]
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
    toastr.info(currentGuess+":"+rightGuessString)
    let guessString = ''
    let rightGuess = Array.from(rightGuessString)

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
    
    for (let i = 0; i < numberBoards; i++) {
        let row = getLetterRow(NUMBER_OF_GUESSES-guessesRemaining,i+1)
        colourRow(row, currentGuess ,rightGuess) 
    }

    if (guessString === rightGuessString) {
        toastr.success("You guessed right! Game over!")
        guessesRemaining = 0
        return
    } else {
        guessesRemaining -= 1;
        //create an additional board if it's not an error above
        initBoard() 
        currentGuess = [];
        nextLetter = 0;
        // why can't I put init board here?
        if (guessesRemaining === 0) {
            toastr.error("You've run out of guesses! Game over!")
            toastr.info(`The right word was: "${rightGuessString}"`)
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