const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const difficultyElement = document.querySelector(".difficulty");
const playerNameElement = document.querySelector(".player-name");
const playerNameModalElement = document.getElementById("player-name-modal");
const difficultyModalElement = document.getElementById("difficulty-modal");
let playerDifficulty = "easy";
let gameOver = false;
let foodX, foodY;
let snakeX = 5,
    snakeY = 5;
let velocityX = 0,
    velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;

const avatars = [
    "avatar_1.svg",
    "avatar_2.svg",
    "avatar_3.svg",
    "avatar_4.svg",
    "avatar_5.svg",
    "avatar_6.svg"
  ];
  



const restartButtom = document.querySelector(".restart-button");

let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

// Цей фрагмент коду визначає функцію handleGameOver, яка викликається, коли гравець прочинаэ гру. 
const handleGameOver = () => {
    // Цей рядок припиняє виконання інтервалу, який відповідає за оновлення гри. Це необхідно, оскільки гра завершується.
    clearInterval(setIntervalId);
    // Якщо гравець натисне "OK", змінна playAgain буде true, і гра розпочнеться знову.
    const playAgain = confirm("Game Over! Press OK to replay...");
    if (playAgain) {
        startGame();
    }

    // Отримуємо ім'я гравця, яке введено у модальному вікні. Якщо гравець не ввів жодне ім'я, то значення за замовчуванням буде "Player".
    const playerName = playerNameModalElement.value || "Player";
    //Отримуємо рiвень гри яку вибрав гравець. Якщо гравець не обрав нiчого, то значення за замовчуванням буде "easy".
    const playerDifficulty = difficultyElement.value || "easy";

    // Формуєм унікальний ключ для зберігання рейтингу гравця. Ключ складається з імені гравця, рівня складності та слова "score".
    const playerScoreKey = `${playerName}-${playerDifficulty}-score`;
    //Отримуємо збережений рейтинг гравця з локального сховища.
    const existingScore = localStorage.getItem(playerScoreKey, score.toString());

    // Обчислюєм новий найвищий рейтинг. Він вибирається як більше зі значень highScore
    highScore = Math.max(highScore, score);
    localStorage.setItem("high-score", highScore.toString());
    //Оновлюється відображення найвищого рейтингу на сторінці.
    highScoreElement.innerText = `High Score: ${highScore}`;

    // Оновлюється рейтинг гравця в локальному сховищі.
    localStorage.setItem(`${playerName}-${playerDifficulty}-score`, highScore.toString());
}

// Цей код реалізує зміну напрямку руху гравця в грі. Він слухає події клавіатури
const changeDirection = e => {
    if (e.key === "ArrowUp" && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

// Цей фрагмент коду відповідає за відображення гри у браузері.
const initGame = () => {
    // Перевіряє, чи гра завершилася. Якщо так, то викликається функція handleGameOver(), яка обробляє кінець гри.
    if (gameOver) return handleGameOver();

    // (velocityX і velocityY). Це реалізує рух змійки вгору, вниз, вліво та вправо.
    snakeX += velocityX;
    snakeY += velocityY;

    
    // Наступні чотири рядки змінюють координати голови змійки відповідно до поточного напрямку руху 
    if (snakeX <= 0) snakeX = 25;
    if (snakeX > 25) snakeX = 1;
    if (snakeY <= 0) snakeY = 25;
    if (snakeY > 25) snakeY = 1;

    // Створюється рядок html, який представляє їжу для змійки з відповідними координатами foodY та foodX.
    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    //Умова if (snakeX === foodX && snakeY === foodY) перевіряє, чи змійка з'їла їжу. Якщо так, то викликається функція updateFoodPosition(), яка оновлює позицію їжі, додає до тіла змійки новий елемент та збільшує рахунок гравця. Також оновлюються найвищий рахунок і відповідні тексти на екрані.
    if (snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]);
        score++;
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;
    }

    // У масив snakeBody додається нова координата голови змійки (snakeY та snakeX), а останній елемент масиву (хвіст) видаляється.
    snakeBody.unshift([snakeY, snakeX]);
    snakeBody.pop();

    // У циклі for (let i = 0; i < snakeBody.length; i++) створюються блоки для кожного елементу тіла змійки. Якщо елемент - голова, йому надається клас "head", інакше - "body". Також оновлюється html з координатами.
    for (let i = 0; i < snakeBody.length; i++) {
        html += `<div class="${i == 0 ? "head" : "body"}" style="grid-area: ${snakeBody[i][0]} / ${snakeBody[i][1]}"></div>`;

        if (i !== 0 && snakeBody[0][0] === snakeBody[i][0] && snakeBody[0][1] === snakeBody[i][1]) {
            gameOver = true;
        }
    }

    // На останньому рядку оновлюється вміст елемента з класом "play-board" (playBoard.innerHTML) із зміненою гравцем змійкою та їжею.
    playBoard.innerHTML = html;
}

// Ця частина коду визначає функцію з назвою updateFoodPosition, яка відповідає за оновлення позиції їжі на ігровому полі.
let updateFoodPosition = () => {
    foodX = Math.floor(Math.random() * 25) + 1;
    foodY = Math.floor(Math.random() * 25) + 1;
}

setIntervalId = setInterval(initGame, 100);

document.addEventListener("keyup", changeDirection);

// Цей фрагмент коду створює сітку з комірок, яка представляє гравецьке поле. У цьому циклі використовується подвійна ітерація, яка створює рядки і стовпці, і для кожної комбінації створюється div-елемент з класом "grid-cell". За допомогою CSS цей клас визначає зовнішній вигляд комірки, встановлюючи їй межі і колір фону.
for (let i = 1; i <= 25; i++) {
    for (let j = 1; j <= 25; j++) {
        playBoard.innerHTML += `<div class="grid-cell" style="grid-area: ${i} / ${j}"></div>`;
    }
}

// Функцію з назвою getPlayerScore, яка отримує два параметри: playerName (ім'я гравця) та playerDifficulty (рівень складності). Функція призначена для отримання рейтингу гравця для певного рівня складності гри.
const getPlayerScore = (playerName, playerDifficulty) => {
    const existingScore = localStorage.getItem(`${playerName}-${playerDifficulty}-score`);
    return existingScore !== null ? parseInt(existingScore) : 0;
}

// Функція відповідає за початок гри.
const startGame = () => {
    // Обнулення поточного рахунку гравця перед початком нової гри.
    score = 0;

    // Забирає з кнопки "Restart Game" клас flex-none, що робить її видимою. Тобто, після початку гри, кнопка для рестарту стає видимою.
    restartButtom.classList.remove("flex-none");
    // Додає обробник подій, який слухає клік на кнопці "Restart Game" і викликає функцію startGame знову.
    restartButtom.addEventListener("click", startGame);

    // Оновлює відображення найвищого рахунку (high score) в ігровому інтерфейсі.
    highScoreElement.innerText = `High Score: ${highScore}`;
    // Оновлює відображення поточного рахунку гравця в ігровому інтерфейсі.
    scoreElement.innerText = `Score: ${score}`;
    // Отримує ім'я гравця з інпуту з класом .player-name або встановлює його як "Player", якщо в інпуті нічого не вказано.
    playerName = playerNameElement.value || "Player";
    // Отримує рівень складності гри з вибору з класом .difficulty або встановлює його як "easy", якщо вибір не зроблено.
    playerDifficulty = difficultyElement.value || "easy";

    // Створює унікальний ключ для зберігання рахунку гравця в локальному сховищі.
    const playerScoreKey = `${playerName}-${playerDifficulty}-score`;
    // Перевіряє, чи існує вже рахунок для даного гравця та рівня складності у локальному сховищі.
    const existingScore = localStorage.getItem(playerScoreKey);
    // Якщо рахунок для даного гравця та рівня складності вже існує, і новий рахунок (score) менше, ніж існуючий, то використовується існуючий рахунок, а не поточний.
    if (existingScore !== null && score < parseInt(existingScore)) {
        score = parseInt(existingScore);
        scoreElement.innerText = `Score: ${score}`;
    }

    // Оновлює позицію їжі в грі.
    updateFoodPosition();
    // Встановлює початкові координати голови змії.
    snakeX = 1;
    snakeY = 1;
    // Встановлює масив snakeBody з 5 елементами - початковим положенням голови змії.
    snakeBody = [[snakeY, snakeX], [snakeY, snakeX], [snakeY, snakeX], [snakeY, snakeX], [snakeY, snakeX]];
    // Встановлює початкову швидкість руху гравця (в даному випадку рухається вправо).
    velocityX = 1;
    velocityY = 0;
    // Встановлює прапорець gameOver в false, щоб позначити, що гра ще не закінчилася.
    gameOver = false;
    // Запускає таймер, який викликає функцію initGame з певною частотою. Частота залежить від рівня складності гри.
    setIntervalId = setInterval(initGame, playerDifficulty === "easy" ? 250 : playerDifficulty === "medium" ? 200 : 150);
}

const startButton = document.querySelector(".start-button");
const startButtonModal = document.getElementById("start-button-modal");
const modal = document.getElementById("modal");

modal.style.display = "block";

// Ця частина коду реалізує відображення рейтингу гравців у грі.
const showRatings = () => {
    // Початку, вона отримує елемент таблиці з класом "ratings" і зберігає його в змінну ratingsTable.
    const ratingsTable = document.querySelector(".ratings");
    // Потім, вона очищає вміст цього елементу за допомогою ratingsTable.innerHTML = "". Це потрібно, щоб очистити попередні дані перед оновленням рейтингу.
    ratingsTable.innerHTML = "";

    // Далі, вона(программа) створює порожній масив playersData, який буде містити дані про гравців 
    const playersData = [];
    // За допомогою циклу for, вона переглядає всі ключі в локальному сховищі (localStorage). Якщо ключ містить "-score" (ознаку, що це ключ з рахунком гравця), то вона розділяє його ім'я та отримує його рахунок, перетворивши його на число (parseInt(localStorage.getItem(key))), а потім додає ці дані до масиву playersData.
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes("-score")) {
            const playerName = key.split("-")[0];
            const playerScore = parseInt(localStorage.getItem(key)); // Преобразуем в число
            playersData.push({ playerName, playerScore });
        }
    }

    // Після того, як вона зібрала всі дані, вона сортує масив playersData за спаданням рахунків гравців, використовуючи .sort((a, b) => b.playerScore - a.playerScore).
    playersData.sort((a, b) => b.playerScore - a.playerScore);

    // Потім, вона створює новий заголовок <h2> для таблиці рейтингу, додає йому клас "ratings-title" і вставляє його в елемент таблиці.
    const listTitle = document.createElement("h2");
    listTitle.innerHTML = `<h2 class="ratings-title">Rating</h2>`;
    ratingsTable.appendChild(listTitle);
    // Далі, вона отримує ім'я гравця і складність гри з відповідних елементів на сторінці (playerNameModalElement та difficultyElement) або, якщо вони не вказані, встановлює значення за замовчуванням ("Player" і "easy").
    const playerName = playerNameModalElement.value || "Player";
    const playerDifficulty = difficultyElement.value || "easy";

    const playerScoreKey = `${playerName}-${playerDifficulty}-score`;
    const existingScore = localStorage.getItem(playerScoreKey, score.toString());

    for (const player of playersData) {
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        const listItem = document.createElement("li");

        if(playerDifficulty) {
            listItem.innerHTML = `
            <span class="list-element">
                <img src="img/${randomAvatar}" alt="${player.playerName} Avatar">
                <span>${player.playerName}: ${player.playerScore}</span>
            </span>
        `;
        }
        // Нарешті, вона додає listItem до таблиці рейтингу (ratingsTable).
        ratingsTable.appendChild(listItem);
    }
}

showRatings()

document.addEventListener("keydown", changeDirection);

// Цей фрагмент коду відповідає за обробку натискання на кнопку "Start Game" у модальному вікні
const handleStartButtonClick = () => {
    // У цьому рядку коду отримується значення, яке ввів користувач в поле вводу з іменем гравця у модальному вікні.
    const playerName = playerNameModalElement.value;
    // У цьому рядку коду перевіряється, чи існує вже результат гравця для обраної складності в локальному сховищі браузера. Якщо такий результат існує, він отримується і присвоюється змінній existingScore.
    const playerDifficulty = difficultyElement.value;

    // У цьому рядку коду перевіряється, чи існує вже результат гравця для обраної складності в локальному сховищі браузера. Якщо такий результат існує, він отримується і присвоюється змінній existingScore.
    const existingScore = localStorage.getItem(`${playerName}-${playerDifficulty}-score`, score);
    // Тут перевіряється, чи був знайдений попередній результат для гравця на обраній складності.
    if (existingScore !== null) {
        // Якщо результат існує, він конвертується в ціле число (integer) і присвоюється змінній score. Це дозволяє відновити попередній результат гравця.
        score = parseInt(existingScore);
    } else {
        // У цьому рядку коду, якщо результату не існує, новий результат (значення score) зберігається в локальному сховищі браузера для обраного гравця та складності гри.
        localStorage.setItem(`${playerName}-${playerDifficulty}-score`, score);
    }
    // У модальному вікні змінна modal, яка представляє собою модальне вікно, отримує стиль display: none;, що приховує його і відображає основну гру.
    modal.style.display = "none";
    startGame();
}
startButton.addEventListener("click", handleStartButtonClick);
startButtonModal.addEventListener("click", handleStartButtonClick);