var scoreBox = document.querySelector('#end-page');
var scoreEl = document.querySelector('#score');
var submitBtn = document.querySelector('#submit-btn');
var inputEl = document.querySelector('#user-input');

submitBtn.addEventListener('click', function handleSaveHighscore(e) {
    e.preventDefault();
    // get value of input box
    var initials = inputEl.value.trim();
    if (initials === "") {
        alert('Input cannot be blank!')
        return '';
    }
    else if (initials.length > 3) {
        alert('Initials must be no longer than 3 characters in length!')
        return '';
    }
    // get saved scores from localstorage
    var highscores;
    if (JSON.parse(localStorage.getItem("highscores")) != null)
        highscores = JSON.parse(window.localStorage.getItem("highscores"));
    else
        highscores = [];

    // format new score object for current user
    var score = {
        initials: initials,
        highscore: game.score
    };
    highscores.push(score);
    // save to localstorage
    localStorage.setItem("highscores", JSON.stringify(highscores));
    // redirect to next page
    location.href = "./public/highscores.html";

    handleSaveHighscore();
});