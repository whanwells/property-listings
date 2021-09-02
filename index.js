const fs = require('fs');
const readline = require('readline');

const INPUT_FILE = 'property_listings.json';
const STATES = ['CA', 'FL', 'NY'];

// skip [node, __filename]
const [, , stateAbbreviation, minBathString] = process.argv;
const minBaths = parseInt(minBathString);

if (!STATES.includes(stateAbbreviation)) {
  console.error(`stateAbbreviation must be one of: ${STATES.join(', ')}`);
  process.exit(1);
}

if (isNaN(minBaths)) {
  console.error('minBaths must be a number');
  process.exit(1);
}

// since the input array is separated by new lines, we can easily extract each
// individual element using readline
const rl = readline.createInterface({
  input: fs.createReadStream(INPUT_FILE),
});

const results = [];
let totalPrice = 0;
let totalSquareFeet = 0;

rl.on('line', (line) => {
  if (line[0] === '[') {
    // ignore the opening bracket and drop the trailing comma
    line = line.substr(1, line.length - 2);
  } else {
    // ignore the trailing comma/closing bracket
    line = line.substr(0, line.length - 1);
  }

  const {
    id,
    street: addressLine1,
    locality: city,
    administrativeAreaLevel1: state,
    postalCode,
    price,
    squareFeet,
    beds,
    baths,
  } = JSON.parse(line);

  if (state === stateAbbreviation && baths >= minBaths) {
    totalPrice += price;
    totalSquareFeet += squareFeet;

    results.push({
      id,
      addressLine1,
      addressLine2: `${city}, ${state} ${postalCode}`,
      price,
      squareFeet,
      beds,
      baths,
    });
  }
});

rl.on('close', () => {
  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  let averagePrice = 0;
  let averagePricePerSqft = 0;

  if (results.length > 0) {
    averagePrice = totalPrice / results.length;
    averagePricePerSqft = totalPrice / totalSquareFeet / results.length;
  }

  results.sort((a, b) => a.squareFeet - b.squareFeet);

  console.log('RESULTS:')
  console.log(JSON.stringify(results, null, 2));
  console.log(`Average Price: ${currency.format(averagePrice)}`);
  console.log(`Average Price per sqft: ${currency.format(averagePricePerSqft)}`);
});
