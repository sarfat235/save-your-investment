async function fetchIndex(symbol, valueId, changeId) {
  const proxy = "https://api.allorigins.win/raw?url=";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`;

  try {
    const res = await fetch(proxy + encodeURIComponent(url));
    const data = await res.json();

    const result = data.chart.result[0];
    const price = result.meta.regularMarketPrice;
    const prevClose = result.meta.chartPreviousClose;
    const change = (price - prevClose).toFixed(2);

    document.getElementById(valueId).innerText = price.toLocaleString();

    const changeEl = document.getElementById(changeId);
    changeEl.innerText = (change > 0 ? "+" : "") + change;

    changeEl.className = change > 0 ? "up" : "down";
  } catch (err) {
    console.error("API error", err);
  }
}

// NIFTY & SENSEX symbols
fetchIndex("^NSEI", "niftyValue", "niftyChange");
fetchIndex("^BSESN", "sensexValue", "sensexChange");

// Auto refresh every 1 minute
setInterval(() => {
  fetchIndex("^NSEI", "niftyValue", "niftyChange");
  fetchIndex("^BSESN", "sensexValue", "sensexChange");
}, 60000);
