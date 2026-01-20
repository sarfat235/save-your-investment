];
async function fetchIndex(symbol, valueId, changeId) {
  const proxy = "https://api.allorigins.win/raw?url=";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`;

  try {
    const res = await fetch(proxy + encodeURIComponent(url));
    const data = await res.json();
    const meta = data.chart.result[0].meta;

    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose;
    const change = (price - prev).toFixed(2);

    document.getElementById(valueId).innerText = price.toLocaleString();

    const el = document.getElementById(changeId);
    el.innerText = (change > 0 ? "+" : "") + change;
    el.className = change > 0 ? "up" : "down";
  } catch (e) {
    console.log("API error", e);
  }
}

fetchIndex("^NSEI", "niftyValue", "niftyChange");
fetchIndex("^BSESN", "sensexValue", "sensexChange");
fetchIndex("^NSEBANK", "bankniftyValue", "bankniftyChange");

setInterval(() => {
  fetchIndex("^NSEI", "niftyValue", "niftyChange");
  fetchIndex("^BSESN", "sensexValue", "sensexChange");
  fetchIndex("^NSEBANK", "bankniftyValue", "bankniftyChange");
}, 60000);

// STOCK SEARCH
async function searchStock() {
  const input = document.getElementById("stockInput").value.toUpperCase();
  if (!input) return alert("Enter stock symbol");

  const symbol = input + ".NS";
  const proxy = "https://api.allorigins.win/raw?url=";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`;

  try {
    const res = await fetch(proxy + encodeURIComponent(url));
    const data = await res.json();
    const meta = data.chart.result[0].meta;

    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose;
    const change = (price - prev).toFixed(2);

    document.getElementById("stockName").innerText = meta.symbol;
    document.getElementById("stockPrice").innerText = price.toLocaleString();

    const el = document.getElementById("stockChange");
    el.innerText = (change > 0 ? "+" : "") + change;
    el.className = change > 0 ? "up" : "down";

    document.getElementById("stockResult").style.display = "block";
  } catch {
    alert("Stock not found");
  }
}

// DUMMY SCREENER DATA
const stocks = [
  { symbol: "RELIANCE", price: 2500, change: 1.2 },
  { symbol: "TCS", price: 3400, change: -0.4 },
  { symbol: "HDFCBANK", price: 1500, change: 2.1 },
  { symbol: "INFY", price: 1400, change: 0.8 }
];

function applyFilters() {
  const p = Number(document.getElementById("priceFilter").value);
  const c = Number(document.getElementById("changeFilter").value);

  const filtered = stocks.filter(s =>
    (!p || s.price >= p) && (!c || s.change >= c)
  );

  document.getElementById("results").innerHTML = filtered.map(s =>
    `<div class="index-card">${s.symbol} | ₹${s.price} | ${s.change}%</div>`
  ).join("");
}
let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

function addToWatchlist() {
  const symbol = document.getElementById("stockName").innerText;
  if (!symbol || watchlist.includes(symbol)) return;

  watchlist.push(symbol);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  renderWatchlist();
}

async function renderWatchlist() {
  const box = document.getElementById("watchlistItems");
  box.innerHTML = "";

  for (let sym of watchlist) {
    const data = await fetchStock(sym + ".NS");
    box.innerHTML += `
      <div class="card">
        <strong>${sym}</strong><br>
        ₹ ${data.price}
        <span class="${data.change > 0 ? "up" : "down"}">
          ${data.change}
        </span>
      </div>
    `;
  }
}

async function fetchStock(symbol) {
  const proxy = "https://api.allorigins.win/raw?url=";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`;

  const res = await fetch(proxy + encodeURIComponent(url));
  const json = await res.json();
  const meta = json.chart.result[0].meta;

  return {
    price: meta.regularMarketPrice,
    change: (meta.regularMarketPrice - meta.chartPreviousClose).toFixed(2)
  };
}

renderWatchlist();
// RSI CALCULATION
function calculateRSI(closes, period = 14) {
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}
const rsiStocks = [
  "RELIANCE.NS",
  "TCS.NS",
  "INFY.NS",
  "HDFCBANK.NS",
  "ICICIBANK.NS",
  "SBIN.NS"
];
async function runRSIScreener() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>Running RSI Screener...</p>";

  const proxy = "https://api.allorigins.win/raw?url=";
  const finalResults = [];

  for (let symbol of rsiStocks) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1mo&interval=1d`;
      const res = await fetch(proxy + encodeURIComponent(url));
      const json = await res.json();

      const closes = json.chart.result[0].indicators.quote[0].close;
      if (!closes || closes.length < 15) continue;

      const rsi = calculateRSI(closes.slice(-15));
      if (rsi > 60) {
        finalResults.push({
          symbol: symbol.replace(".NS", ""),
          rsi: rsi.toFixed(2)
        });
      }
    } catch (e) {
      console.log("RSI error for", symbol);
    }
  }

  if (finalResults.length === 0) {
    resultsDiv.innerHTML = "<p>No stocks matched RSI condition.</p>";
    return;
  }

  resultsDiv.innerHTML = finalResults.map(s =>
    `<div class="card">
      <strong>${s.symbol}</strong><br>
      RSI: ${s.rsi}
    </div>`
  ).join("");
}
const trendingUniverse = [
  "RELIANCE.NS",
  "TCS.NS",
  "INFY.NS",
  "HDFCBANK.NS",
  "ICICIBANK.NS",
  "SBIN.NS",
  "ITC.NS",
  "LT.NS"
];

async function loadTrendingStocks() {
  const box = document.getElementById("trendingStocks");
  box.innerHTML = "Loading trending stocks...";

  const proxy = "https://api.allorigins.win/raw?url=";
  let results = [];

  for (let symbol of trendingUniverse) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`;
      const res = await fetch(proxy + encodeURIComponent(url));
      const json = await res.json();
      const meta = json.chart.result[0].meta;

      const price = meta.regularMarketPrice;
      const change = ((price - meta.chartPreviousClose) / meta.chartPreviousClose * 100).toFixed(2);

      results.push({
        symbol: symbol.replace(".NS", ""),
        price,
        change: Number(change)
      });
    } catch { }
  }

  // sort by % change DESC
  results.sort((a, b) => b.change - a.change);

  // top 5 trending
  box.innerHTML = results.slice(0, 5).map(s =>
    `<div class="index-card">
      <strong>${s.symbol}</strong><br>
      ₹ ${s.price}<br>
      <span class="${s.change > 0 ? "up" : "down"}">
        ${s.change}%
      </span>
    </div>`
  ).join("");
}

// auto load on page load
loadTrendingStocks();
