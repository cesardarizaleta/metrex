const http = require('http');

console.log('Starting load test on http://localhost:3000/hello ...');
console.log('Press Ctrl+C to stop.\n');

let count = 0;
const start = Date.now();

function attack() {
  const req = http.get('http://localhost:3000/hello', (res) => {
    // Consume response to free socket
    res.resume();
    count++;
    if (count % 1000 === 0) {
      const elapsed = (Date.now() - start) / 1000;
      console.log(`Requests: ${count} | RPS: ${(count / elapsed).toFixed(0)}`);
    }
    // Loop
    setImmediate(attack);
  });
  
  req.on('error', (e) => {
    // Ignore errors (connection refused, reset, etc)
    // console.error(e.message);
    setTimeout(attack, 100);
  });
}

// Launch 50 concurrent agents
for (let i = 0; i < 50; i++) {
  attack();
}
