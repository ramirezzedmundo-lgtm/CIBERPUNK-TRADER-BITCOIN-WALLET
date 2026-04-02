// dashboard.js

const wallets = [
  "0x1234567890abcdef...", // aquí pones tus wallets
  "0xabcdef1234567890..."
];

let refreshInterval = 30000; // 30 segundos por defecto
let refreshTimer;

async function fetchWalletData(wallet) {
  try {
    const response = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "clearinghouseState", user: wallet })
    });
    return await response.json();
  } catch (error) {
    console.error("Error al consultar API:", error);
    return null;
  }
}

function renderWallet(wallet, data) {
  const container = document.getElementById("walletContainer");
  const section = document.createElement("div");
  section.className = "wallet-section";

  const header = document.createElement("div");
  header.className = "wallet-header";
  header.innerHTML = `
    <span class="wallet-index">${wallet}</span>
    <span class="wallet-equity">Equity: ${data?.marginSummary?.accountValueUsd?.toFixed(2) || "—"} USD</span>
  `;
  section.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "positions-grid";

  // Cabecera
  const headerRow = document.createElement("div");
  headerRow.className = "header-row";
  ["Coin", "Side", "Size", "Entry", "Mark", "PnL", "Liq", "Leverage", "Funding", "Rate"].forEach(h => {
    const cell = document.createElement("div");
    cell.textContent = h;
    headerRow.appendChild(cell);
  });
  grid.appendChild(headerRow);

  // Posiciones
  data?.assetPositions?.forEach(pos => {
    const row = document.createElement("div");
    row.className = "position-row";

    const pnlClass = pos.unrealizedPnlUsd >= 0 ? "pnl-positive" : "pnl-negative";

    [
      pos.coin,
      `<span class="side-badge ${pos.side.toLowerCase()}">${pos.side}</span>`,
      pos.positionSize.toFixed(4),
      pos.entryPx.toFixed(2),
      pos.markPx.toFixed(2),
      `<span class="${pnlClass}">${pos.unrealizedPnlUsd.toFixed(2)}</span>`,
      pos.liquidationPx ? pos.liquidationPx.toFixed(2) : "—",
      pos.leverage.toFixed(2),
      `<button class="funding-btn" onclick="openFundingModal('${wallet}', '${pos.coin}')">Ver</button>`,
      pos.fundingRate.toFixed(6)
    ].forEach(val => {
      const cell = document.createElement("div");
      cell.innerHTML = val;
      row.appendChild(cell);
    });

    grid.appendChild(row);
  });

  section.appendChild(grid);
  container.appendChild(section);
}

async function refreshAll() {
  document.getElementById("walletContainer").innerHTML = "";
  for (const wallet of wallets) {
    const data = await fetchWalletData(wallet);
    if (data) renderWallet(wallet, data);
  }
}

function setRefreshInterval() {
  const val = document.getElementById("refreshInterval").value;
  refreshInterval = parseInt(val) * 1000;
  clearInterval(refreshTimer);
  refreshTimer = setInterval(refreshAll, refreshInterval);
}

// Modal Funding
function openFundingModal(wallet, coin) {
  const modal = document.getElementById("fundingModal");
  modal.classList.add("open");
  document.getElementById("modalCoinTag").textContent = `Coin: ${coin}`;
  document.getElementById("modalWalletTag").textContent = `Wallet: ${wallet}`;
  // Aquí puedes añadir lógica para mostrar funding histórico
}

function closeFundingModal(event) {
  if (event.target.id === "fundingModal") {
    document.getElementById("fundingModal").classList.remove("open");
  }
}

// Inicialización
window.onload = () => {
  refreshAll();
  refreshTimer = setInterval(refreshAll, refreshInterval);
};
