const genericAudio = new Audio();
const stepAudio = new Audio('audio/step.wav');
const francescaHeight = 80; // px
const francescaWidth = 100; // px

const WIDTH = 10000;
const HEIGHT = 10000;

const items = {
    none: {  // for tile switching. Try to think of a better way
      name: 'none',
      quantity: {
        starting: 0,
        collected: ""
      },
      image: { x: 0, y: 0 }
    },
  
    flower: {
      name: 'flower',
      quantity: {
        starting: 0,
        collected: 0
      },
      itemType: 'for-use',
      image: { x: 34, y: 0 },
      sound: 'audio/coin.wav'
    }
}

const container = document.getElementById('container');
const francesca = document.getElementById('francesca');

const elements = {
    score: document.getElementById('score')
}

function random(lower, upper) {
    return Math.round(Math.random() * (upper - lower) + lower);
}

function hasCollision(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();

    return aRect.bottom > bRect.top
        && aRect.top < bRect.bottom
        && aRect.left < bRect.right
        && aRect.right > bRect.left;
}

// Initialization
function newItemElement(item, x = 0, y = 0) {
    const element = document.createElement('div');

    element.classList.add(item.name, item.itemType, 'item');
    if (item.isCollectible) element.classList.add('collectable');
    element.dataset.type = item.name;

    element.style.top = y;
    element.style.left = x;
    // element.style.backgroundPosition = `${-itemPixelSize * item.image.x}px ${-itemPixelSize * item.image.y}px`;

    return element;
}

Object.values(items).forEach(item => {
    for(let i = 0; i < item.quantity.starting; i++) {
      container.appendChild(newItemElement(item,
        `${Math.random() * 0}px`,
        `${Math.random() * 0}px`));
    }
})

function newFlower(x, y, size, petalQuantity, centerColor, petalColor, isCollectable) {
    flowerCenter = document.createElement('div');
    flowerCenter.style.left = x + 'px';
    flowerCenter.style.top = y + 'px';
    flowerCenter.style.height = size + 'px';
    flowerCenter.style.width = size + 'px';
    flowerCenter.style.background = centerColor;

    flowerCenter.classList.add('flower-center');

    if (isCollectable) {
        flowerCenter.classList.add('item');
        flowerCenter.dataset.type = 'flower';

        const score = random(1, 10);
        flowerCenter.dataset.score = score;
        flowerCenter.innerText = score;
    }
    
    const petalSpread = size * 2/3;

    for(let i = 0; i < petalQuantity; i++) {
        const petal = document.createElement('div');
        petal.classList.add('petal');

        petal.style.top = Math.sin(i * 2 * Math.PI / petalQuantity) * petalSpread + 'px';
        petal.style.left = Math.cos(i * 2 * Math.PI / petalQuantity) * petalSpread + 'px';
        petal.style.height = size + 'px';
        petal.style.width = size + 'px';
        petal.style.background = petalColor;

        flowerCenter.appendChild(petal);
    }

    return flowerCenter;
}

for(let i = 0; i < 1500; i++) {
    const flower = newFlower(
        Math.random() * WIDTH, 
        Math.random() * HEIGHT,
        Math.round(Math.random() * 10 + 10),
        Math.round(Math.random() * 3 + 5),
        `rgb(${ random(80, 255)}, ${ random(80, 255) }, ${ random(80, 255) }`,
        `rgb(${ random(80, 255)}, ${ random(80, 255) }, ${ random(80, 255) }`
    )

    container.append(flower);
}

for(let i = 0; i < 1250; i++) {
    const flower = newFlower(
        Math.random() * WIDTH, 
        Math.random() * HEIGHT,
        20,
        4,
        'yellow',
        'magenta',
        'isCollectable'
    )

    container.appendChild(flower);
}

elements.items = [...document.getElementsByClassName('item')];

// Moving
const francescaWalkingSpeed = 30;

const direction = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight' 
}

const directions = {
    [direction.right]: { row: 1, scrollOptions: { left: francescaWalkingSpeed } },
    [direction.left]: { row: 2, scrollOptions: { left: -francescaWalkingSpeed } },
    [direction.down]: { row: 3, scrollOptions: { top: francescaWalkingSpeed } },
    [direction.up]: { row: 4, scrollOptions: { top: -francescaWalkingSpeed } }
}

const isArrowKey = key => Object.keys(directions).includes(key);

function lowerOffset(element) {
    const rect = element.getBoundingClientRect();
    return String(Math.round(rect.bottom + window.scrollY));
}

let currentKey;
let francescaWalkInterval;

function step(direction, counter) {
    // posture
    francesca.style.backgroundPosition = `${ counter * francescaWidth }px ${ direction.row * -francescaHeight }px`;
    francesca.style.zIndex = lowerOffset(francesca);

    // position
    window.scrollBy(direction.scrollOptions);

    // sound
    stepAudio.currentTime = 0;
    stepAudio.play();

        // sound
    stepAudio.currentTime = 0;
    stepAudio.play();

    // interaction
    const itemElement = elements.items.find(i => hasCollision(francesca, i));
    if (itemElement) {
      const itemName = itemElement.dataset.type
      const item = items[itemName];

      genericAudio.src = item.sound;
      genericAudio.play();

      elements.score.innerText = parseInt(elements.score.innerText) + parseInt(itemElement.dataset.score);
      container.removeChild(itemElement);
    }

    return counter + 1;
}

let counter = 0;
function walk(direction) {  
    // is there a better way to limit the counter?
    if (counter > 999) counter = 0;

    clearInterval(francescaWalkInterval);

    // invoked first for immmediate response
    counter = step(direction, counter);

    // continued within interval
    francescaWalkInterval = setInterval(
    () => { counter = step(direction, counter); }
    , 200)
}

document.addEventListener("keydown", e => {

    e.preventDefault();

    // do not clear if already walking
    if (isArrowKey(e.key) && currentKey != e.key) {
      currentKey = e.key;
      walk(directions[e.key]);
    }
})

document.addEventListener("keyup", e => {
  clearInterval(francescaWalkInterval);
  currentKey = null;
})