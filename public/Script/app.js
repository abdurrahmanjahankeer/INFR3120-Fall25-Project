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
  var gameMistakeBox = document.getElementById("gameMistakeBox");

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
  var correctCharsTyped = 0;
  var incorrectCharsTyped = 0;
  var mistakeWordsDuringGame = [];
  var currentWordHasMistake = false;
  var currentWordIndex = 0;

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
    correctCharsTyped = 0;
    incorrectCharsTyped = 0;
    mistakeWordsDuringGame = [];
    currentWordHasMistake = false;
    currentWordIndex = 0;
    clearInterval(gameTimer);
    gameTimer = null;

    timeLeftDisplay.textContent = totalTimeSeconds;
    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "0";
    promptDisplay.textContent = "";
    playerInput.value = "";
    gameResultMessage.textContent = "";
    if (gameMistakeBox) {
      gameMistakeBox.style.display = "none";
      gameMistakeBox.textContent = "";
    }

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
    renderPromptWithHighlight();

    gameActive = true;
    timeRemaining = totalTimeSeconds;
    elapsedSeconds = 0;
    timeLeftDisplay.textContent = timeRemaining;

    gameStats.style.display = "flex";
    gamePromptWrapper.style.display = "block";
    gameInputWrapper.style.display = "block";
    gameResultMessage.style.display = "none";

    playerInput.disabled = false;
    correctCharsTyped = 0;
    incorrectCharsTyped = 0;
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

      // Update live stats
      updateLiveStats();

      if (timeRemaining <= 0 && !gameFinishedByLength) {
        endGame();
      }
    }, 1000);
  }

  function renderPromptWithHighlight() {
    var typedText = playerInput.value;
    var html = "";

    for (var i = 0; i < currentPromptText.length; i++) {
      var char = currentPromptText.charAt(i);
      var typedChar = i < typedText.length ? typedText.charAt(i) : null;

      if (typedChar === null) {
        // Not typed yet
        if (i === typedText.length) {
          // Current cursor position
          html += '<span style="background-color: #ffffcc; border-left: 2px solid #000;">' + (char === ' ' ? ' ' : char) + '</span>';
        } else {
          html += '<span style="color: #999;">' + (char === ' ' ? ' ' : char) + '</span>';
        }
      } else if (typedChar === char) {
        // Correct
        html += '<span style="color: #28a745; font-weight: bold;">' + (char === ' ' ? ' ' : char) + '</span>';
      } else {
        // Incorrect
        html += '<span style="background-color: #dc3545; color: white; font-weight: bold;">' + (char === ' ' ? ' ' : char) + '</span>';
      }
    }

    promptDisplay.innerHTML = html;
  }

  function updateLiveStats() {
    if (!gameActive) return;

    var typedText = playerInput.value;
    var stats = calculateStats(typedText, currentPromptText, elapsedSeconds);

    wpmDisplay.textContent = stats.wordsPerMinute;
    accuracyDisplay.textContent = stats.accuracy;
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

    wpmDisplay.textContent = stats.wordsPerMinute;
    accuracyDisplay.textContent = stats.accuracy;

    gameResultMessage.style.display = "block";

    var resultHtml =
      "<strong>Test Finished!</strong> You typed " +
      stats.correctCharacters +
      "/" +
      stats.charactersTyped +
      " correct characters in " +
      secondsUsed +
      " seconds. WPM: " +
      stats.wordsPerMinute +
      ", Accuracy: " +
      stats.accuracy + "%.";

    gameResultMessage.style.display = "block";
    gameResultMessage.innerHTML = resultHtml;

    // RED BOX: words with mistakes
    if (gameMistakeBox) {
      var uniqueWords = [];
      for (var i = 0; i < mistakeWordsDuringGame.length; i++) {
        if (uniqueWords.indexOf(mistakeWordsDuringGame[i]) === -1) {
          uniqueWords.push(mistakeWordsDuringGame[i]);
        }
      }

      if (uniqueWords.length > 0) {
        gameMistakeBox.style.display = "block";
        gameMistakeBox.innerHTML =
          "<strong>Words with mistakes:</strong> " +
          uniqueWords.join(", ");
      } else {
        gameMistakeBox.style.display = "none";
        gameMistakeBox.innerHTML = "";
      }
    }

    // Auto-submit to leaderboard if logged in
    if (window.displayName && window.displayName.trim() !== "") {
      // User is logged in, auto-submit via AJAX
      var submitData = {
        wordsPerMinute: stats.wordsPerMinute,
        accuracy: stats.accuracy,
        timeTaken: secondsUsed,
        textPrompt: currentPromptText
      };

      fetch("/typingRecords/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(submitData)
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (data.success) {
          gameResultMessage.innerHTML = resultHtml + "<br><strong style='color: green;'>✓ Record added to leaderboard!</strong>";
        } else {
          console.error("Failed to submit record:", data.error);
        }
      })
      .catch(function(error) {
        console.error("Error submitting record:", error);
      });
    } else {
      // User not logged in, show message
      gameResultMessage.innerHTML = resultHtml + "<br><strong style='color: orange;'>Please log in to save your record to the leaderboard!</strong>";
    }
  }

  function calculateStats(typedText, promptText, usedSeconds) {
    var correctCharacters = 0;
    var incorrectCharacters = 0;
    var mistakeWordsSet = {};

    var promptWords = promptText.split(/\s+/);
    var typedWords = typedText.trim().length > 0 ? typedText.trim().split(/\s+/) : [];

    // Character-by-character comparison
    var maxLength = Math.max(typedText.length, promptText.length);
    for (var i = 0; i < maxLength; i++) {
      var typedChar = i < typedText.length ? typedText.charAt(i) : "";
      var promptChar = i < promptText.length ? promptText.charAt(i) : "";

      if (typedChar === promptChar && typedChar !== "") {
        correctCharacters++;
      } else if (typedChar !== "") {
        incorrectCharacters++;
      }
    }

    // Word-level mistake tracking
    for (var w = 0; w < typedWords.length; w++) {
      if (w < promptWords.length) {
        var typedWord = typedWords[w];
        var promptWord = promptWords[w];

        if (typedWord !== promptWord) {
          mistakeWordsSet[promptWord] = true;
        }
      }
    }

    var mistakeWords = [];
    for (var word in mistakeWordsSet) {
      if (mistakeWordsSet.hasOwnProperty(word)) {
        mistakeWords.push(word);
      }
    }

    var totalCharsTyped = typedText.length;
    var accuracy = 0;
    if (totalCharsTyped > 0) {
      accuracy = Math.round((correctCharacters / totalCharsTyped) * 100);
      if (accuracy > 100) accuracy = 100;
      if (accuracy < 0) accuracy = 0;
    }

    // WPM calculation based on CORRECT characters only
    // Standard: 1 word = 5 characters
    var correctWords = correctCharacters / 5;
    var wpm = 0;
    if (usedSeconds > 0) {
      wpm = Math.round((correctWords / usedSeconds) * 60);
    }

    return {
      wordsTyped: typedWords.length,
      charactersTyped: totalCharsTyped,
      correctCharacters: correctCharacters,
      incorrectCharacters: incorrectCharacters,
      accuracy: accuracy,
      wordsPerMinute: wpm,
      mistakeWords: mistakeWords
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
    // Prevent copy and paste
    playerInput.addEventListener("copy", function (event) {
      event.preventDefault();
      return false;
    });

    playerInput.addEventListener("paste", function (event) {
      event.preventDefault();
      return false;
    });

    playerInput.addEventListener("cut", function (event) {
      event.preventDefault();
      return false;
    });

    playerInput.addEventListener("input", function () {
      if (!gameActive) return;

      var typedNow = playerInput.value;

      // Update the visual highlighting in real-time
      renderPromptWithHighlight();

      var promptWords = currentPromptText.split(/\s+/);
      var typedWords = typedNow.trim().length > 0 ? typedNow.trim().split(/\s+/) : [];

      // Find which word the user is currently typing (by spaces)
      var wordIndex = typedWords.length - 1;
      var tWord = typedWords[wordIndex] || "";
      var pWord = promptWords[wordIndex] || "";

      if (wordIndex !== currentWordIndex) {
        if (currentWordHasMistake && promptWords[currentWordIndex] && mistakeWordsDuringGame.indexOf(promptWords[currentWordIndex]) === -1) {
          mistakeWordsDuringGame.push(promptWords[currentWordIndex]);
        }
        currentWordHasMistake = false;
        currentWordIndex = wordIndex;
      }

      // Check for mistakes in the currently typed word (compare char by char)
      var current = Math.min(tWord.length, pWord.length);
      for (var i = 0; i < current; i++) {
        if (tWord.charAt(i) !== pWord.charAt(i)) {
          currentWordHasMistake = true;
          break;
        }
      }
      if (tWord.length > pWord.length) currentWordHasMistake = true;

      // Auto-finish when prompt is completed
      if (!gameFinishedByLength && typedNow.length >= currentPromptLength) {
        // On finish: finalize the last word if it had a mistake
        if (currentWordHasMistake && promptWords[currentWordIndex] && mistakeWordsDuringGame.indexOf(promptWords[currentWordIndex]) === -1) {
          mistakeWordsDuringGame.push(promptWords[currentWordIndex]);
        }
        gameFinishedByLength = true;
        endGame();
      }
    });

    playerInput.addEventListener("keydown", function (event) {
      if (!gameActive) {
        return;
      }
      if (timeRemaining <= 0 && !gameFinishedByLength) {
        event.preventDefault();
        return;
      }

      totalKeyPresses = totalKeyPresses + 1;
    });
  }
})();