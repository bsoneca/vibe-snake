import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

// Import Firebase libraries
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Move Firebase configuration to environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Cache the login state on page reload
onAuthStateChanged(auth, (user) => {
  if (user) {
    updateUIOnLogin(user); // Update the UI with the cached login state
  }
});

// Add a logout function
function logout() {
  auth.signOut().then(() => {
    alert('You have been logged out.');
    location.reload(); // Reload the page to reset the UI
  }).catch((error) => {
    console.error('Error during logout:', error);
  });
}

// Add a logout button to the UI
function addLogoutButton() {
  const logoutButton = document.createElement('button');
  logoutButton.id = 'logout-button';
  logoutButton.textContent = 'Logout';
  logoutButton.style.position = 'absolute';
  logoutButton.style.top = '10px';
  logoutButton.style.right = '60px';
  logoutButton.addEventListener('click', logout);
  document.body.appendChild(logoutButton);
}

// Modify the login button to show the user's profile picture when logged in
function updateUIOnLogin(user) {
  const existingButton = document.querySelector('#login-button');
  if (existingButton) {
    existingButton.remove();
  }

  const profilePic = document.createElement('img');
  profilePic.src = user.photoURL;
  profilePic.alt = user.displayName;
  profilePic.style.position = 'absolute';
  profilePic.style.top = '10px';
  profilePic.style.right = '10px';
  profilePic.style.width = '40px';
  profilePic.style.height = '40px';
  profilePic.style.borderRadius = '50%';
  document.body.appendChild(profilePic);

  addLogoutButton();
}

function loginWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      alert(`Welcome, ${user.displayName}!`);
      updateUIOnLogin(user);
    })
    .catch((error) => {
      console.error('Error during login:', error);
    });
}

// Update the login button creation to include an ID for easier manipulation
const loginButton = document.createElement('button');
loginButton.id = 'login-button';
loginButton.textContent = 'Login with Google';
loginButton.style.position = 'absolute';
loginButton.style.top = '10px';
loginButton.style.right = '10px';
loginButton.addEventListener('click', loginWithGoogle);
document.body.appendChild(loginButton);

document.querySelector('#app').innerHTML = '';

const counterElement = document.querySelector('#counter');
setupCounter(counterElement);
let counter = 0;

setupCounter(document.querySelector('#counter'))

// Snake Game Implementation

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;

// Adjust the canvas size to account for the wall thickness
const wallThickness = gridSize;
canvas.width = 400 + wallThickness * 2;
canvas.height = 400 + wallThickness * 2;
document.body.appendChild(canvas);

// Set the canvas background color to dark green
canvas.style.backgroundColor = '#013220';

// Fix the snake initialization to ensure it starts within the visible area
let snake = [{ x: wallThickness + gridSize * 2, y: wallThickness + gridSize * 2 }]; // Adjusted starting position
let direction = { x: 0, y: 0 };
let lastDirection = { x: 0, y: 0 }; // Track the last direction to prevent reversing
let food = { x: Math.floor(Math.random() * 400 / gridSize) * gridSize, y: Math.floor(Math.random() * 400 / gridSize) * gridSize };
let isGameOver = false; // Track if the game is over
let specialItem = null; // Track the special item position (green apple, bomb, or alternate apple)
let specialItemType = null; // Track the type of special item ('greenApple', 'bomb', or 'altApple')
let specialItemTimeout = null; // Timeout for removing special item
let yellowSnake = null; // Track the yellow snake position
let yellowSnakeTimeout = null; // Timeout for removing the yellow snake

// Adjust the initial game speed to make the snake move faster
let initialGameSpeed = 100; // Faster initial game speed in milliseconds
let gameSpeed = initialGameSpeed; // Set the starting speed to the initial value

// Adjust the snake and food positions to account for the new wall placement
function adjustPositionForWalls(position) {
  return {
    x: position.x + wallThickness,
    y: position.y + wallThickness
  };
}

snake = snake.map(adjustPositionForWalls);
food = adjustPositionForWalls(food);
if (specialItem) {
  specialItem = adjustPositionForWalls(specialItem);
}

// Load sprite images
const sprites = {
  snakeHead: new Image(),
  snakeBody: new Image(),
  food: new Image(),
  wall: new Image(),
  snakeYellowHead: new Image(),
  snakeYellowBlob: new Image()
};

sprites.snakeHead.src = '/imgs/png/snake_green_head_32.png';
sprites.snakeBody.src = '/imgs/png/snake_green_blob_32.png';
sprites.food.src = '/imgs/png/apple_red_32.png';
sprites.wall.src = '/imgs/png/wall_block_32_0.png';
sprites.snakeYellowHead.src = '/imgs/png/snake_yellow_head_32.png';
sprites.snakeYellowBlob.src = '/imgs/png/snake_yellow_blob_32.png';

// Ensure all images are loaded before starting the game
const spritePromises = Object.values(sprites).map((sprite) => {
  return new Promise((resolve, reject) => {
    sprite.onload = resolve;
    sprite.onerror = reject;
  });
});

Promise.all(spritePromises)
  .then(() => {
    console.log('All sprites loaded successfully.');
  })
  .catch((error) => {
    console.error('Error loading sprites:', error);
  });

// Ensure all resources are loaded before calling the draw function
Promise.all(spritePromises).then(() => {
  draw(); // Render the gameplay area and snake after resources are loaded
}).catch((error) => {
  console.error('Error loading resources:', error);
});

// Create a leaderboard element and append it to the body
const leaderboard = document.createElement('div');
leaderboard.className = 'leaderboard';
leaderboard.innerHTML = `
  <h2>Leaderboard</h2>
  <ul id="leaderboard-list">
    <!-- Scores will be dynamically added here -->
  </ul>
`;
document.body.appendChild(leaderboard);

// Add language selection and translations
const translations = {
  en: {
    gameOver: 'Game Over!',
    loginMessage: 'You must be logged in to go to the leaderboard',
    leaderboardTitle: 'Leaderboard'
  },
  es: {
    gameOver: '¡Juego Terminado!',
    loginMessage: 'Debes iniciar sesión para ir al tablero de líderes',
    leaderboardTitle: 'Tabla de Clasificación'
  },
  fr: {
    gameOver: 'Jeu Terminé!',
    loginMessage: 'Vous devez être connecté pour accéder au classement',
    leaderboardTitle: 'Classement'
  },
  "pt-br": {
    gameOver: 'Fim de Jogo!',
    loginMessage: 'Você precisa estar logado para acessar o placar',
    leaderboardTitle: 'Placar'
  },
  // ... Add translations for 17 more languages here ...
};

let currentLanguage = 'en'; // Default language

// Save the selected language to localStorage
function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('selectedLanguage', lang); // Save the language
  document.querySelector('.leaderboard h2').textContent = translations[currentLanguage].leaderboardTitle;

  // Show a spinner while the leaderboard updates
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = '<li>Loading...</li>';

  // Reload the leaderboard when the language changes
  fetchTopScoresFromFirestore().then((topScores) => {
    updateLeaderboard(topScores);
  });
}

// Load the saved language from localStorage on page load
const savedLanguage = localStorage.getItem('selectedLanguage');

// Ensure the language selector is created before applying the saved language
createLanguageSelector();

if (savedLanguage) {
  setLanguage(savedLanguage);
  const languageSelector = document.getElementById('language-selector');
  if (languageSelector) {
    languageSelector.value = savedLanguage; // Update the selector value
  }
}

function createLanguageSelector() {
  const languageSelector = document.createElement('select');
  languageSelector.id = 'language-selector';
  languageSelector.style.position = 'absolute';
  languageSelector.style.top = '10px';
  languageSelector.style.left = '10px';

  Object.keys(translations).forEach((lang) => {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = lang.toUpperCase();
    languageSelector.appendChild(option);
  });

  languageSelector.addEventListener('change', (e) => {
    setLanguage(e.target.value);
  });

  document.body.appendChild(languageSelector);

  setLanguage(languageSelector.value); // Ensure the default language is applied on load
}

// Update the leaderboard rendering logic to format the date and score in a user-friendly way
function updateLeaderboard(scores) {
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = '';
  const top10Scores = scores.slice(0, 10); // Limit to top 10 scores
  top10Scores.forEach(({ name, score, photoURL, timestamp }) => {
    const listItem = document.createElement('li');
    if (photoURL) {
      const img = document.createElement('img');
      img.src = photoURL;
      img.alt = name;
      img.style.width = '20px';
      img.style.height = '20px';
      img.style.borderRadius = '50%';
      img.style.marginRight = '10px';
      listItem.appendChild(img);
    }
    const date = new Date(timestamp.seconds * 1000); // Convert Firestore timestamp to JavaScript Date
    // Translate the date based on the selected language
    const formattedDate = date.toLocaleDateString(currentLanguage, {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }); // Remove the day of the week
    listItem.innerHTML += `<span>${name}:</span> ${score}<br><small>(${formattedDate})</small>`;
    leaderboardList.appendChild(listItem);
  });
}

// Function to save score to Firestore
async function saveScoreToFirestore(user, score) {
  await addDoc(collection(db, 'leaderboard'), {
    name: user.displayName,
    photoURL: user.photoURL,
    score,
    timestamp: new Date()
  });
}

// Function to fetch top scores from Firestore
async function fetchTopScoresFromFirestore() {
  const scores = [];
  const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(10));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    scores.push(doc.data());
  });
  return scores;
}

// Ensure the leaderboard updates immediately after the game ends
async function updateLeaderboardOnGameOver(score) {
  if (auth.currentUser) {
    const user = auth.currentUser;
    await saveScoreToFirestore(user, score);
  }

  const topScores = await fetchTopScoresFromFirestore();
  updateLeaderboard(topScores);

  // Force a refresh of the leaderboard UI
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.scrollTop = 0; // Scroll to the top to indicate refresh
}

// Fetch and display the leaderboard when the application loads
async function displayLeaderboardOnLoad() {
  const topScores = await fetchTopScoresFromFirestore();
  updateLeaderboard(topScores);
}

displayLeaderboardOnLoad();

let gameStarted = false; // Track if the game has started

// Update the keydown event listener to start the game only when an arrow key is pressed
document.addEventListener('keydown', (e) => {
  if (!gameStarted && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    gameStarted = true;
    direction = e.key === 'ArrowUp' ? { x: 0, y: -1 } :
                e.key === 'ArrowDown' ? { x: 0, y: 1 } :
                e.key === 'ArrowLeft' ? { x: -1, y: 0 } :
                { x: 1, y: 0 }; // Set initial direction based on the pressed arrow key
    gameLoop(); // Start the game loop
  }
});

// Ensure all game states are reset properly when restarting after a game over
// Updated to ensure `gameStarted` is set to true and the snake starts moving

document.addEventListener('keydown', (e) => {
  if (isGameOver) {
    restartGame();
  }
});

// Ensure the gameLoop is triggered correctly and continuously updates the game
function gameLoop() {
  if (isGameOver) return; // Stop the loop if the game is over

  update(); // Update the game state
  draw(); // Render the game

  setTimeout(gameLoop, gameSpeed); // Schedule the next iteration of the loop
}

// Clear the gameplay area on game over
function clearGameplayArea() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBorders(); // Redraw the borders
}

// Update the showGameOverMessage function to remove the timer and hide the message when the user starts a new game
function showGameOverMessage(reason) {
  isGameOver = true; // Prevent starting a new game
  clearGameplayArea(); // Clear the gameplay area
  const gameOverMessage = document.createElement('div');
  gameOverMessage.id = 'game-over-message';
  gameOverMessage.textContent = `${translations[currentLanguage].gameOver} ${reason}`;
  gameOverMessage.style.position = 'absolute';
  gameOverMessage.style.top = '40%';
  gameOverMessage.style.left = '50%';
  gameOverMessage.style.transform = 'translate(-50%, -50%)';
  gameOverMessage.style.fontSize = '2rem';
  gameOverMessage.style.color = 'red';
  gameOverMessage.style.backgroundColor = 'white';
  gameOverMessage.style.padding = '20px';
  gameOverMessage.style.border = '2px solid black';
  gameOverMessage.style.borderRadius = '10px';
  gameOverMessage.style.textAlign = 'center';
  document.body.appendChild(gameOverMessage);

  // Disable restarting during the game over message
  const restartListener = (e) => {
    if (isGameOver) {
      e.preventDefault();
    }
  };
  document.addEventListener('keydown', restartListener);

  // Add a listener to remove the game over message when the user starts a new game
  document.addEventListener('keydown', (e) => {
    if (!gameStarted && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      const gameOverMessageElement = document.getElementById('game-over-message');
      if (gameOverMessageElement) {
        document.body.removeChild(gameOverMessageElement);
      }
      document.removeEventListener('keydown', restartListener); // Re-enable restarting
      isGameOver = false; // Reset the game over state
      gameStarted = true;
      direction = e.key === 'ArrowUp' ? { x: 0, y: -1 } :
                  e.key === 'ArrowDown' ? { x: 0, y: 1 } :
                  e.key === 'ArrowLeft' ? { x: -1, y: 0 } :
                  { x: 1, y: 0 }; // Set initial direction based on the pressed arrow key
      gameLoop(); // Start the game loop
    }
  });
}

// Extracted restart game logic into a separate function
function restartGame() {
  // Remove the game over message if it exists
  const gameOverMessageElement = document.getElementById('game-over-message');
  if (gameOverMessageElement) {
    document.body.removeChild(gameOverMessageElement);
  }

  isGameOver = false; // Reset the game over state
  snake = [{ x: 200, y: 200 }]; // Reset the snake position
  direction = { x: 0, y: -1 }; // Reset the direction to start moving up
  lastDirection = { x: 0, y: 0 }; // Reset the last direction
  counter = 0; // Reset the score
  counterElement.innerHTML = `count is ${counter}`; // Update the score display
  specialItem = null; // Clear any special items
  specialItemType = null; // Clear the special item type
  clearTimeout(specialItemTimeout); // Clear any special item timeout
  yellowSnake = null; // Clear the yellow snake
  clearTimeout(yellowSnakeTimeout); // Clear the yellow snake timeout
  spawnFoodWithinWalls(); // Respawn food
  gameSpeed = initialGameSpeed; // Reset the game speed

  // Clear the canvas to remove any lingering game over messages
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBorders(); // Redraw the borders

  gameStarted = true; // Ensure the game loop starts
  gameLoop(); // Restart the game loop
}

// Prevent game updates if the game is over
function update() {
  if (isGameOver) return; // Skip updates if the game is over

  const head = { x: snake[0].x + direction.x * gridSize, y: snake[0].y + direction.y * gridSize };
  snake.unshift(head);

  lastDirection = { ...direction }; // Update the last direction after moving

  if (head.x === food.x && head.y === food.y) {
    spawnFoodWithinWalls();
    counter++;
    counterElement.innerHTML = `count is ${counter}`;
  } else if (specialItem && head.x === specialItem.x && head.y === specialItem.y) {
    if (specialItemType === 'greenApple') {
      specialItem = null; // Remove the special item
      clearTimeout(specialItemTimeout); // Clear the timeout
      counter += 10; // Add 10 points
      counterElement.innerHTML = `count is ${counter}`;

      // Grow the snake by 3 segments
      for (let i = 0; i < 3; i++) {
        snake.push({ ...snake[snake.length - 1] });
      }
    } else if (specialItemType === 'bomb') {
      showGameOverMessage('You hit a bomb!'); // End the game if the bomb is hit
      const topScore = Math.max(counter, localStorage.getItem('topScore') || 0);
      localStorage.setItem('topScore', topScore);
      updateLeaderboardOnGameOver(counter);
      snake = [{ x: 200, y: 200 }];
      direction = { x: 0, y: 0 };
      counter = 0;
      counterElement.innerHTML = `count is ${counter}`;
    } else if (specialItemType === 'altApple') {
      specialItem = null; // Remove the special item
      clearTimeout(specialItemTimeout); // Clear the timeout
      counter = Math.max(0, counter - 1); // Subtract 1 point, but not below 0
      counterElement.innerHTML = `count is ${counter}`;

      // Shrink the snake by 1 segment if it has more than 1 segment
      if (snake.length > 1) {
        snake.pop();
      }
    }
  } else {
    snake.pop();
  }

  if (yellowSnake) {
    updateYellowSnakeDirection();
  }

  // Update the yellow snake's size to match the player's score
  if (yellowSnake) {
    const targetSize = counter; // The player's score determines the yellow snake's size

    // Adjust the yellow snake's segments to match the target size
    while (yellowSnake.segments.length < targetSize) {
      const lastSegment = yellowSnake.segments[yellowSnake.segments.length - 1];
      yellowSnake.segments.push({ x: lastSegment.x, y: lastSegment.y });
    }

    while (yellowSnake.segments.length > targetSize) {
      yellowSnake.segments.pop();
    }
  }

  // Check if the green snake collides with the yellow snake
  if (yellowSnake && yellowSnake.segments) {
    if (yellowSnake.segments.some(segment => segment.x === head.x && segment.y === head.y)) {
      showGameOverMessage('You collided with the yellow snake!'); // End the game if the green snake hits the yellow snake
      const topScore = Math.max(counter, localStorage.getItem('topScore') || 0);
      localStorage.setItem('topScore', topScore);
      updateLeaderboardOnGameOver(counter);
      snake = [{ x: 200, y: 200 }];
      direction = { x: 0, y: 0 };
      counter = 0;
      counterElement.innerHTML = `count is ${counter}`;
      return; // Stop further updates
    }
  }

  if (head.x < wallThickness || head.y < wallThickness || head.x >= canvas.width - wallThickness || head.y >= canvas.height - wallThickness) {
    showGameOverMessage('You hit the wall!');
    const topScore = Math.max(counter, localStorage.getItem('topScore') || 0);
    localStorage.setItem('topScore', topScore);
    updateLeaderboardOnGameOver(counter);
    snake = [{ x: 200, y: 200 }];
    direction = { x: 0, y: 0 };
    counter = 0;
    counterElement.innerHTML = `count is ${counter}`;
  } else if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
    showGameOverMessage('You collided with yourself!');
    const topScore = Math.max(counter, localStorage.getItem('topScore') || 0);
    localStorage.setItem('topScore', topScore);
    updateLeaderboardOnGameOver(counter);
    snake = [{ x: 200, y: 200 }];
    direction = { x: 0, y: 0 };
    counter = 0;
    counterElement.innerHTML = `count is ${counter}`;
  }
}

// Ensure the draw function renders the snake correctly
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBorders();
  drawSprite(sprites.food, food.x, food.y, gridSize);

  if (specialItem) {
    const specialItemImage = new Image();
    specialItemImage.src =
      specialItemType === 'greenApple'
        ? '/imgs/png/apple_green_32.png'
        : specialItemType === 'bomb'
        ? '/imgs/png/bomb_32.png'
        : '/imgs/png/easter_egg_32.png';
    drawSprite(specialItemImage, specialItem.x, specialItem.y, gridSize);
  }

  snake.forEach((segment, index) => {
    if (index === 0) {
      drawSprite(sprites.snakeHead, segment.x, segment.y, gridSize);
    } else {
      drawSprite(sprites.snakeBody, segment.x, segment.y, gridSize);
    }
  });

  // Ensure the yellow snake is only rendered when it is active and properly initialized
  if (yellowSnake) {
    yellowSnake.segments.forEach((segment, index) => {
      const sprite = index === 0 ? sprites.snakeYellowHead : sprites.snakeYellowBlob;
      drawSprite(sprite, segment.x, segment.y, gridSize);
    });
  }
}

// Define the drawSprite function to draw images on the canvas
function drawSprite(image, x, y, size) {
  ctx.drawImage(image, x, y, size, size);
}

// Define the drawBorders function to resolve the ReferenceError
function drawBorders() {
  const wallImage = sprites.wall;

  // Top and bottom borders
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.drawImage(wallImage, x, 0, gridSize, gridSize); // Top border
    ctx.drawImage(wallImage, x, canvas.height - gridSize, gridSize, gridSize); // Bottom border
  }

  // Left and right borders
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.drawImage(wallImage, 0, y, gridSize, gridSize); // Left border
    ctx.drawImage(wallImage, canvas.width - gridSize, y, gridSize, gridSize); // Right border
  }
}

// Function to spawn a bomb in front of the snake's trajectory
function spawnBomb() {
  const head = snake[0];
  const nextPosition = {
    x: head.x + direction.x * gridSize * 5,
    y: head.y + direction.y * gridSize * 5
  };

  // Ensure the bomb does not go outside the walls
  if (
    nextPosition.x >= wallThickness &&
    nextPosition.y >= wallThickness &&
    nextPosition.x < canvas.width - wallThickness &&
    nextPosition.y < canvas.height - wallThickness
  ) {
    specialItem = nextPosition;
    specialItemType = 'bomb';

    // Remove the bomb after 2 seconds
    specialItemTimeout = setTimeout(() => {
      specialItem = null;
      specialItemType = null;
    }, 2000);
  }
}

// Update the spawnSpecialItem function to adjust the proportions to 40% green apple, 30% bomb, and 30% easter egg
function spawnSpecialItem() {
  const randomValue = Math.random();
  if (randomValue < 0.4) {
    specialItem = {
      x: Math.floor(Math.random() * (canvas.width - 2 * wallThickness) / gridSize) * gridSize + wallThickness,
      y: Math.floor(Math.random() * (canvas.height - 2 * wallThickness) / gridSize) * gridSize + wallThickness
    };
    specialItemType = 'greenApple';

    // Remove the special item after 2 seconds
    specialItemTimeout = setTimeout(() => {
      specialItem = null;
      specialItemType = null;
    }, 2000);
  } else if (randomValue < 0.7) {
    spawnBomb(); // 30% chance to spawn a bomb
  } else {
    specialItem = {
      x: Math.floor(Math.random() * (canvas.width - 2 * wallThickness) / gridSize) * gridSize + wallThickness,
      y: Math.floor(Math.random() * (canvas.height - 2 * wallThickness) / gridSize) * gridSize + wallThickness
    };
    specialItemType = 'altApple';

    // Remove the special item after 2 seconds
    specialItemTimeout = setTimeout(() => {
      specialItem = null;
      specialItemType = null;
    }, 2000);
  }
}

// Spawn special items at random intervals
setInterval(() => {
  if (!specialItem) {
    spawnSpecialItem();
  }
}, 10000); // Spawn every 10 seconds

// Adjust the green apple spawning logic to ensure it does not overlap with the wall
function spawnFoodWithinWalls() {
  food = {
    x: Math.floor(Math.random() * (canvas.width - 2 * wallThickness) / gridSize) * gridSize + wallThickness,
    y: Math.floor(Math.random() * (canvas.height - 2 * wallThickness) / gridSize) * gridSize + wallThickness
  };
}

// Replace the existing food spawning logic with the new function
function spawnFoodIfEaten() {
  if (!food || snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    spawnFoodWithinWalls();
  }
}

setInterval(() => {
  spawnFoodIfEaten();
}, 100); // Check every 100ms

function updateGameSpeed() {
  gameSpeed = Math.max(50, 100 - Math.floor(counter / 5) * 10); // Decrease speed every 5 points, minimum 50ms
}

// Update the spawnYellowSnake function to ensure the yellow snake and its segments do not overlap with the green snake
function spawnYellowSnake() {
  let validPosition = false;
  let yellowSnakeHead;

  // Find a valid position for the yellow snake that does not overlap with the green snake
  while (!validPosition) {
    yellowSnakeHead = {
      x: wallThickness + Math.floor(Math.random() * (canvas.width - 2 * wallThickness) / gridSize) * gridSize,
      y: wallThickness + Math.floor(Math.random() * (canvas.height - 2 * wallThickness) / gridSize) * gridSize
    };

    // Check if the yellow snake's head and its segments will overlap with the green snake
    validPosition = !snake.some(segment => {
      for (let i = 0; i < 10; i++) {
        const segmentX = yellowSnakeHead.x - i * gridSize;
        const segmentY = yellowSnakeHead.y;
        if (segment.x === segmentX && segment.y === segmentY) {
          return true;
        }
      }
      return false;
    });
  }

  yellowSnake = {
    x: yellowSnakeHead.x,
    y: yellowSnakeHead.y,
    direction: { x: 0, y: 0 }, // Initial direction
    segments: [] // Initialize segments
  };

  // Add 10 segments to the yellow snake
  for (let i = 0; i < 10; i++) {
    yellowSnake.segments.push({
      x: yellowSnake.x - i * gridSize,
      y: yellowSnake.y
    });
  }

  // Randomly set the yellow snake's direction
  const directions = [
    { x: 1, y: 0 }, // Right
    { x: -1, y: 0 }, // Left
    { x: 0, y: 1 }, // Down
    { x: 0, y: -1 } // Up
  ];
  yellowSnake.direction = directions[Math.floor(Math.random() * directions.length)];

  // Remove the yellow snake after 10 seconds
  yellowSnakeTimeout = setTimeout(() => {
    yellowSnake = null;
  }, 10000);
}

// Update the yellow snake's movement to be smoother and random
function updateYellowSnakeDirection() {
  if (!yellowSnake) return;

  // Randomly change direction occasionally
  if (Math.random() < 0.1) { // 10% chance to change direction
    const directions = [
      { x: 1, y: 0 }, // Right
      { x: -1, y: 0 }, // Left
      { x: 0, y: 1 }, // Down
      { x: 0, y: -1 } // Up
    ];
    yellowSnake.direction = directions[Math.floor(Math.random() * directions.length)];
  }

  // Move the yellow snake's head
  yellowSnake.x += yellowSnake.direction.x * gridSize;
  yellowSnake.y += yellowSnake.direction.y * gridSize;

  // Update the yellow snake's segments to follow its head
  for (let i = yellowSnake.segments.length - 1; i > 0; i--) {
    yellowSnake.segments[i] = { ...yellowSnake.segments[i - 1] };
  }
  yellowSnake.segments[0] = { x: yellowSnake.x, y: yellowSnake.y };

  // Ensure the yellow snake stays within the walls
  if (
    yellowSnake.x < wallThickness ||
    yellowSnake.y < wallThickness ||
    yellowSnake.x >= canvas.width - wallThickness ||
    yellowSnake.y >= canvas.height - wallThickness
  ) {
    yellowSnake.x = Math.max(wallThickness, Math.min(yellowSnake.x, canvas.width - wallThickness - gridSize));
    yellowSnake.y = Math.max(wallThickness, Math.min(yellowSnake.y, canvas.height - wallThickness - gridSize));
    yellowSnake.direction = { x: -yellowSnake.direction.x, y: -yellowSnake.direction.y }; // Reverse direction
  }
}

// Spawn the yellow snake at random intervals
setInterval(() => {
  if (!yellowSnake) {
    spawnYellowSnake();
  }
}, Math.random() * (30000 - 10000) + 10000); // Spawn at a random interval between 10 and 30 seconds

// Ensure the direction variable is updated correctly and prevent reversing direction
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' && lastDirection.y === 0) {
    direction = { x: 0, y: -1 };
  } else if (e.key === 'ArrowDown' && lastDirection.y === 0) {
    direction = { x: 0, y: 1 };
  } else if (e.key === 'ArrowLeft' && lastDirection.x === 0) {
    direction = { x: -1, y: 0 };
  } else if (e.key === 'ArrowRight' && lastDirection.x === 0) {
    direction = { x: 1, y: 0 };
  }
});

// Prevent the browser from scrolling when arrow keys are pressed
document.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }
});

// Ensure the snake is rendered initially without starting the game
function renderInitialSnake() {
  snake.forEach((segment, index) => {
    if (index === 0) {
      drawSprite(sprites.snakeHead, segment.x, segment.y, gridSize);
    } else {
      drawSprite(sprites.snakeBody, segment.x, segment.y, gridSize);
    }
  });
}

// Call the renderInitialSnake function to display the snake on page load
renderInitialSnake();

// Ensure the gameplay area is rendered when the application opens
drawBorders(); // Draw the borders of the gameplay area
renderInitialSnake(); // Render the initial snake

// Call the draw function to render the gameplay area and snake on page load
draw();
