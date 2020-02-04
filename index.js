// Get pixel color under the mouse.
var robot = require('robotjs');
const axios = require('axios');
const qs = require('qs');
const SerialPort = require('serialport');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let colorsToPlayers = {};

let serialPort = new SerialPort('/dev/ttyUSB0', {
  baudRate: 9600,
  // defaults for Arduino serial communication
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false
});

function askNumberOfPlayersQuestion() {
  return new Promise(resolve => {
    readline.question(`How many players? `, numberOfPlayers => {
      resolve(numberOfPlayers);
    });
  });
}
function askColorQuestion(color) {
  return new Promise(resolve => {
    readline.question(`Who is ${color}? `, name => {
      colorsToPlayers[color] = name;
      resolve();
    });
  });
}

const colors = [
  'Red',
  'Blue',
  'Tan',
  'Green',
  'Orange',
  'Purple',
  'Teal',
  'Pink'
];

const sampleX = 2;
const sampleY = 5;

const RED = [142, 28, 21];
const BLUE = [40, 59, 115];
const TAN = [144, 112, 80];
const GREEN = [50, 108, 31];
const ORANGE = [187, 102, 39];
const PURPLE = [102, 48, 120];
const TEAL = [63, 102, 101];
const PINK = [147, 97, 101];

function startColorReader(onChangeTurn) {
  var lastColor = '#ffffff';
  var lastPlayer = '';
  setInterval(() => {
    // var mouse = robot.getMousePos();
    var hex = robot.getPixelColor(sampleX, sampleY);
    if (hex != lastColor) {
      lastColor = hex;
      var rgb = hexToRgb(hex);
      // console.log(rgb, mouse.x, mouse.y);
      var player = rgbToPlayer(rgb);
      if (player && player !== lastPlayer) {
        lastPlayer = player;
        console.log('Should have changed turn to', player);
        onChangeTurn(player);
      }
    }
  }, 200);
}

function hexToRgb(hex) {
  var bigint = parseInt(hex, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;
  return [r, g, b];
}

function rgbToPlayer(rgb) {
  if (colorIsCloseTo(rgb, RED)) {
    return colorsToPlayers.Red;
  } else if (colorIsCloseTo(rgb, BLUE)) {
    return colorsToPlayers.Blue;
  } else if (colorIsCloseTo(rgb, TAN)) {
    return colorsToPlayers.Tan;
  } else if (colorIsCloseTo(rgb, GREEN)) {
    return colorsToPlayers.Green;
  } else if (colorIsCloseTo(rgb, ORANGE)) {
    return colorsToPlayers.Orange;
  } else if (colorIsCloseTo(rgb, PURPLE)) {
    return colorsToPlayers.Purple;
  } else if (colorIsCloseTo(rgb, TEAL)) {
    return colorsToPlayers.Teal;
  } else if (colorIsCloseTo(rgb, PINK)) {
    return colorsToPlayers.Pink;
  } else return null;
}

function colorIsCloseTo(rgb, color) {
  for (let i = 0; i < 3; i++) {
    if (Math.abs(color[i] - rgb[i]) > 20) {
      return false;
    }
  }
  return true;
}

async function sendTurnToSlack(message) {
  const data = {
    channel: '#homm3',
    username: 'Heroes Turn Helper',
    text: message,
    icon_emoji: ':homm3:'
  };
  const url = 'https://hooks.slack.com/services/*****';
  try {
    const response = await axios.post(url, JSON.stringify(data));
  } catch (error) {
    console.log('Could not post to slack. ' + error.message);
  }
}

function sendTurnToArdunio(data) {
  serialPort.write(data + 'X');
}

function onChangeTurn(player) {
  console.log(`It's ${player}'s turn`);
  sendTurnToArdunio(`It's ${player}'s turn`);
  sendTurnToSlack(`It's ${player}'s turn`);
}

async function mapColorToPlayers() {
  const numberOfPlayers = parseInt(await askNumberOfPlayersQuestion());
  for (let i = 0; i < numberOfPlayers; i++) {
    await askColorQuestion(colors[i]);
  }
  readline.close();
  console.log(colorsToPlayers);
  startColorReader(onChangeTurn);
}

mapColorToPlayers();
