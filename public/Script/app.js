//IIFE or Immediately invoked function expression
(function () {
  console.log("App started...");
  console.log("Welcome to Our Speed Type Writer Game");

  // DOM elements
  var startButton = document.getElementById("startTestButton");
  var resetButton = document.getElementById("resetTestButton");
  var timeLeftDisplay = document.getElementById("timeLeftDisplay");
  var wpmDisplay = document.getElementById("wpmDisplay");
  var accuracyDisplay = document.getElementById("accuracyDisplay");
  var promptDisplay = document.getElementById("promptDisplay");
  var playerInput = document.getElementById("playerInput");
  var gameStats = document.getElementById("gameStats");
  var gamePromptWrapper = document.getElementById("gamePromptWrapper");
  var gameInputWrapper = document.getElementById("gameInputWrapper");
  var gameResultMessage = document.getElementById("gameResultMessage");

  // game state
  var gameActive = false;
  var gameTimer = null;
  var totalTimeSeconds = 60;
  var timeRemaining = totalTimeSeconds;
  var currentPromptText = "";
  var currentPromptLength = 0;
  var elapsedSeconds = 0;
  var gameFinishedByLength = false;
  var totalKeyPresses = 0;
  var mistakeWords = [];
  var lastTypedValue = "";
  var currentWordHasError = false;
  var lastWordIndex = -1;

  function chooseRandomPrompt() {
    var index = Math.floor(Math.random() * prompts.length);
    currentPromptText = prompts[index];
    currentPromptLength = currentPromptText.length;
  }

  function resetGameState() {
    gameActive = false;
    timeRemaining = totalTimeSeconds;
    currentPromptText = "";
    currentPromptLength = 0;
    elapsedSeconds = 0;
    gameFinishedByLength = false;
    totalKeyPresses = 0;
    mistakeWords = [];
    lastTypedValue = "";
    currentWordHasError = false;
    lastWordIndex = -1;
    clearInterval(gameTimer);
    gameTimer = null;

    timeLeftDisplay.textContent = totalTimeSeconds;
    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "0";
    promptDisplay.textContent = "";
    playerInput.value = "";
    gameResultMessage.textContent = "";

    gameStats.style.display = "none";
    gamePromptWrapper.style.display = "none";
    gameInputWrapper.style.display = "none";
    gameResultMessage.style.display = "none";

    playerInput.disabled = true;
    resetButton.disabled = true;
    startButton.disabled = false;
  }

  function startGame() {
    resetGameState();

    chooseRandomPrompt();
    promptDisplay.textContent = currentPromptText;

    gameActive = true;
    timeRemaining = totalTimeSeconds;
    elapsedSeconds = 0;
    timeLeftDisplay.textContent = timeRemaining;

    gameStats.style.display = "flex";
    gamePromptWrapper.style.display = "block";
    gameInputWrapper.style.display = "block";
    gameResultMessage.style.display = "none";

    playerInput.disabled = false;
    lastTypedValue = "";
    currentWordHasError = false;
    lastWordIndex = -1;
    playerInput.focus();

    startButton.disabled = true;
    resetButton.disabled = false;

    gameTimer = setInterval(function () {
      elapsedSeconds = elapsedSeconds + 1;
      timeRemaining = totalTimeSeconds - elapsedSeconds;
      if (timeRemaining < 0) {
        timeRemaining = 0;
      }
      timeLeftDisplay.textContent = timeRemaining;

      if (timeRemaining <= 0 && !gameFinishedByLength) {
        endGame();
      }
    }, 1000);
  }

  function endGame() {
    if (!gameActive) {
      return;
    }

    gameActive = false;
    clearInterval(gameTimer);
    gameTimer = null;
    playerInput.disabled = true;
    startButton.disabled = false;

    var typedText = playerInput.value;
    var secondsUsed = elapsedSeconds;
    if (secondsUsed <= 0) {
        secondsUsed = 1;
    }
    var stats = calculateStats(typedText, currentPromptText, secondsUsed);

    var mistakes = mistakeWords.length;

    var totalWords = stats.wordsTyped;
    var adjustedAccuracy = 0;
    if (totalWords > 0) {
      adjustedAccuracy = Math.round(((totalWords - mistakes) / totalWords) * 100);
    }
    stats.accuracy = adjustedAccuracy;
    wpmDisplay.textContent = stats.wordsPerMinute;
    accuracyDisplay.textContent = stats.accuracy;

    gameResultMessage.style.display = "block";

    var resultHtml =
    "<strong>Test Finished!</strong> You typed " +
    stats.wordsTyped +
    " words with " +
    stats.correctCharacters +
    " correct characters in " +
    secondsUsed +
    " seconds and made " +
    mistakes +
    " mistakes.";

    if (mistakeWords.length > 0) {
      resultHtml = resultHtml +
        "<br><strong>Words with mistakes:</strong> " +
        mistakeWords.join(", ");
    }

gameResultMessage.innerHTML = resultHtml;

    var usernameField = document.getElementById("usernameTextField");
    var wpmField = document.getElementById("wpmTextField");
    var accuracyField = document.getElementById("accuracyTextField");
    var timeField = document.getElementById("timeTextField");
    var textPromptField = document.getElementById("textPromptTextArea");

    if (
      usernameField &&
      wpmField &&
      accuracyField &&
      timeField &&
      textPromptField
    ) {
      timeField.value = secondsUsed;
      wpmField.value = stats.wordsPerMinute;
      accuracyField.value = stats.accuracy;
      textPromptField.value = currentPromptText;
    }
  }

  function calculateStats(typedText, promptText, usedSeconds) {
    var trimmedTyped = typedText.trim();
    var trimmedPrompt = promptText.trim();

    var typedWordsArray = trimmedTyped.length > 0 ? trimmedTyped.split(/\s+/) : [];
    var promptWordsArray = trimmedPrompt.length > 0 ? trimmedPrompt.split(/\s+/) : [];

    var wordsTyped = typedWordsArray.length;

    var charactersTyped = trimmedTyped.length;
    var correctCharacters = 0;

    var maxLength = Math.min(trimmedTyped.length, trimmedPrompt.length);
    var index = 0;
    while (index < maxLength) {
      if (trimmedTyped.charAt(index) === trimmedPrompt.charAt(index)) {
        correctCharacters = correctCharacters + 1;
      }
      index = index + 1;
    }

    var accuracy = 0;
    if (charactersTyped > 0) {
      accuracy = Math.round((correctCharacters / charactersTyped) * 100);
    }

    var wpm = 0;
    if (usedSeconds > 0) {
        wpm = Math.round((wordsTyped / usedSeconds) * 60);
    }

    return {
      wordsTyped: wordsTyped,
      charactersTyped: charactersTyped,
      correctCharacters: correctCharacters,
      accuracy: accuracy,
      wordsPerMinute: wpm
    };
  }

  if (startButton) {
    startButton.addEventListener("click", function () {
      startGame();
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      resetGameState();
    });
  }

  if (playerInput) {
    playerInput.addEventListener("keydown", function (event) {
      if (!gameActive) {
        return;
      }
      if (timeRemaining <= 0 && !gameFinishedByLength) {
        event.preventDefault();
        return;
      }

      totalKeyPresses = totalKeyPresses + 1;

      setTimeout(function () {
        var typedNow = playerInput.value;

        var promptWords = currentPromptText.split(/\s+/);
        var typedWords = typedNow.trim().length > 0 ? typedNow.trim().split(/\s+/) : [];

        if (typedWords.length > 0) {
          var wordIndex = typedWords.length - 1;
          var typedWord = typedWords[wordIndex];
          var promptWord = wordIndex < promptWords.length ? promptWords[wordIndex] : "";

          if (wordIndex !== lastWordIndex) {
            if (lastWordIndex >= 0) {
              var prevPromptWord = promptWords[lastWordIndex];
              if (currentWordHasError && mistakeWords.indexOf(prevPromptWord) === -1) {
                mistakeWords.push(prevPromptWord);
              }
            }
            currentWordHasError = false;
            lastWordIndex = wordIndex;
          }

          var compareLength = Math.min(typedWord.length, promptWord.length);
          var i = 0;
          while (i < compareLength) {
            if (typedWord.charAt(i) !== promptWord.charAt(i)) {
              currentWordHasError = true;
              break;
            }
            i = i + 1;
          }
        }

        lastTypedValue = typedNow;

        if (!gameFinishedByLength && typedNow.length >= currentPromptLength) {
          var endPromptWords = currentPromptText.split(/\s+/);
          var endTypedWords = typedNow.trim().length > 0 ? typedNow.trim().split(/\s+/) : [];
          if (endTypedWords.length > 0) {
            var endIndex = endTypedWords.length - 1;
            if (endIndex < endPromptWords.length) {
              var endPromptWord = endPromptWords[endIndex];
              if (currentWordHasError && mistakeWords.indexOf(endPromptWord) === -1) {
                mistakeWords.push(endPromptWord);
              }
            }
          }

          gameFinishedByLength = true;
          endGame();
        }
      }, 0);
    });
  }
})();