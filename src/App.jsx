import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  DollarSign,
  Home,
  LineChart,
  Menu,
  Search,
  Trophy,
  Wallet,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";

const initialStocks = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    price: 2450,
    previous: 2418,
    sector: "Energy",
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    price: 3890,
    previous: 3915,
    sector: "Technology",
  },
  {
    symbol: "INFY",
    name: "Infosys",
    price: 1520,
    previous: 1498,
    sector: "Technology",
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    price: 1740,
    previous: 1722,
    sector: "Banking",
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank",
    price: 1380,
    previous: 1402,
    sector: "Banking",
  },
  {
    symbol: "WIPRO",
    name: "Wipro",
    price: 510,
    previous: 502,
    sector: "Technology",
  },
];

const initialPortfolio = {
  RELIANCE: 0,
  TCS: 0,
  INFY: 0,
  HDFCBANK: 0,
  ICICIBANK: 0,
  WIPRO: 0,
};

const leaderboard = [
  { name: "Aarav Sharma", value: 148500, return: 48.5 },
  { name: "Priya Reddy", value: 139800, return: 39.8 },
  { name: "Pushpak", value: 128400, return: 28.4 },
  { name: "Rahul Kumar", value: 121750, return: 21.75 },
  { name: "Karthik Nair", value: 115600, return: 15.6 },
];

const education = [
  {
    title: "What is a Stock?",
    text: "A stock represents a small ownership share in a publicly traded company. Investors can potentially earn returns when the company grows and its share price increases.",
  },
  {
    title: "Bull vs Bear Market",
    text: "A bull market describes a period of generally rising prices, while a bear market describes a sustained period of declining prices.",
  },
  {
    title: "Diversification",
    text: "Diversification means spreading investments across different companies or sectors instead of putting all your money into one investment.",
  },
  {
    title: "Market Capitalization",
    text: "Market capitalization is the total market value of a company's outstanding shares and is commonly used to compare company sizes.",
  },
  {
    title: "Risk Management",
    text: "Good investors consider risk before investing. Position sizing, diversification and having a clear investment strategy can help manage risk.",
  },
  {
    title: "Compound Growth",
    text: "Compound growth occurs when returns generate additional returns over time. Starting early and maintaining consistency can significantly affect long-term results.",
  },
];

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [stocks, setStocks] = useState(() => {
    const saved = localStorage.getItem("tradesim-stocks");
    return saved ? JSON.parse(saved) : initialStocks;
  });

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem("tradesim-balance");
    return saved ? Number(saved) : 100000;
  });

  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem("tradesim-portfolio");
    return saved ? JSON.parse(saved) : initialPortfolio;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("tradesim-transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedStock, setSelectedStock] = useState("RELIANCE");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const selected = stocks.find((stock) => stock.symbol === selectedStock);

  useEffect(() => {
    localStorage.setItem("tradesim-stocks", JSON.stringify(stocks));
    localStorage.setItem("tradesim-balance", balance);
    localStorage.setItem("tradesim-portfolio", JSON.stringify(portfolio));
    localStorage.setItem(
      "tradesim-transactions",
      JSON.stringify(transactions)
    );
  }, [stocks, balance, portfolio, transactions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((currentStocks) =>
        currentStocks.map((stock) => {
          const movement = (Math.random() - 0.48) * stock.price * 0.012;
          const newPrice = Math.max(10, stock.price + movement);

          return {
            ...stock,
            previous: stock.price,
            price: Number(newPrice.toFixed(2)),
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const portfolioValue = useMemo(() => {
    return stocks.reduce((total, stock) => {
      return total + stock.price * (portfolio[stock.symbol] || 0);
    }, 0);
  }, [stocks, portfolio]);

  const totalValue = balance + portfolioValue;
  const profit = totalValue - 100000;
  const profitPercentage = (profit / 100000) * 100;

  const chartData = useMemo(() => {
    const base = selected?.price || 2000;

    return Array.from({ length: 12 }, (_, index) => {
      const variation = (Math.random() - 0.5) * base * 0.03;

      return {
        time: `${index + 1}`,
        price: Number(
          (
            base +
            variation -
            (11 - index) * base * 0.002
          ).toFixed(2)
        ),
      };
    });
  }, [selected?.symbol, selected?.price]);

  function getChange(stock) {
    return ((stock.price - stock.previous) / stock.previous) * 100;
  }

  function buyStock() {
    const totalCost = selected.price * quantity;

    if (quantity <= 0) {
      setMessage("Enter a valid quantity.");
      return;
    }

    if (totalCost > balance) {
      setMessage("Insufficient virtual balance.");
      return;
    }

    setBalance((current) => current - totalCost);

    setPortfolio((current) => ({
      ...current,
      [selected.symbol]: (current[selected.symbol] || 0) + quantity,
    }));

    setTransactions((current) => [
      {
        type: "BUY",
        symbol: selected.symbol,
        quantity,
        price: selected.price,
        time: new Date().toLocaleTimeString(),
      },
      ...current,
    ]);

    setMessage(
      `Bought ${quantity} ${selected.symbol} share(s) for ₹${totalCost.toLocaleString(
        "en-IN"
      )}.`
    );
  }

  function sellStock() {
    const owned = portfolio[selected.symbol] || 0;

    if (quantity <= 0) {
      setMessage("Enter a valid quantity.");
      return;
    }

    if (quantity > owned) {
      setMessage(`You only own ${owned} share(s) of ${selected.symbol}.`);
      return;
    }

    const totalSale = selected.price * quantity;

    setBalance((current) => current + totalSale);

    setPortfolio((current) => ({
      ...current,
      [selected.symbol]: current[selected.symbol] - quantity,
    }));

    setTransactions((current) => [
      {
        type: "SELL",
        symbol: selected.symbol,
        quantity,
        price: selected.price,
        time: new Date().toLocaleTimeString(),
      },
      ...current,
    ]);

    setMessage(
      `Sold ${quantity} ${selected.symbol} share(s) for ₹${totalSale.toLocaleString(
        "en-IN"
      )}.`
    );
  }

  function resetSimulation() {
    setBalance(100000);
    setPortfolio(initialPortfolio);
    setTransactions([]);
    setMessage("Simulation has been reset.");
  }

  function navigate(page) {
    setActivePage(page);
    setMobileMenu(false);
    setMessage("");
  }

  return (
    <div className="app">
      <aside className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}>
        <div className="logo">
          <div className="logo-icon">
            <LineChart size={22} />
          </div>

          <div>
            <strong>TradeSim</strong>
            <span>Virtual Markets</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav>
          <button
            className={activePage === "dashboard" ? "nav-active" : ""}
            onClick={() => navigate("dashboard")}
          >
            <Home size={19} />
            Dashboard
          </button>

          <button
            className={activePage === "markets" ? "nav-active" : ""}
            onClick={() => navigate("markets")}
          >
            <BarChart3 size={19} />
            Markets
          </button>

          <button
            className={activePage === "portfolio" ? "nav-active" : ""}
            onClick={() => navigate("portfolio")}
          >
            <BriefcaseBusiness size={19} />
            Portfolio
          </button>

          <button
            className={activePage === "leaderboard" ? "nav-active" : ""}
            onClick={() => navigate("leaderboard")}
          >
            <Trophy size={19} />
            Leaderboard
          </button>

          <button
            className={activePage === "education" ? "nav-active" : ""}
            onClick={() => navigate("education")}
          >
            <BookOpen size={19} />
            Learn
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="market-status">
            <span className="status-dot"></span>

            <div>
              <strong>Market Open</strong>
              <small>Simulation running</small>
            </div>
          </div>

          <button className="reset-button" onClick={resetSimulation}>
            Reset Simulation
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={22} />
          </button>

          <div className="search">
            <Search size={18} />
            <input placeholder="Search stocks..." />
          </div>

          <div className="profile">
            <div className="avatar">P</div>

            <div>
              <strong>Pushpak</strong>
              <small>Trader</small>
            </div>
          </div>
        </header>

        <section className="content">
          {activePage === "dashboard" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">WELCOME BACK</p>
                  <h1>Market Dashboard</h1>
                  <p>
                    Practice investing with virtual money in a risk-free
                    environment.
                  </p>
                </div>

                <div className="live-indicator">
                  <span></span>
                  LIVE SIMULATION
                </div>
              </div>

              <div className="stats-grid">
                <StatCard
                  icon={<Wallet size={21} />}
                  title="Available Balance"
                  value={`₹${balance.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}`}
                  subtitle="Virtual cash"
                />

                <StatCard
                  icon={<BriefcaseBusiness size={21} />}
                  title="Portfolio Value"
                  value={`₹${portfolioValue.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}`}
                  subtitle="Current holdings"
                />

                <StatCard
                  icon={<DollarSign size={21} />}
                  title="Total Account"
                  value={`₹${totalValue.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}`}
                  subtitle="Cash + investments"
                />

                <StatCard
                  icon={
                    profit >= 0 ? (
                      <ArrowUp size={21} />
                    ) : (
                      <ArrowDown size={21} />
                    )
                  }
                  title="Total Return"
                  value={`${profit >= 0 ? "+" : ""}₹${profit.toLocaleString(
                    "en-IN",
                    { maximumFractionDigits: 0 }
                  )}`}
                  subtitle={`${profitPercentage.toFixed(2)}% return`}
                  positive={profit >= 0}
                />
              </div>

              <div className="dashboard-grid">
                <section className="panel chart-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">MARKET OVERVIEW</p>
                      <h2>{selected?.symbol}</h2>
                    </div>

                    <select
                      value={selectedStock}
                      onChange={(e) => setSelectedStock(e.target.value)}
                    >
                      {stocks.map((stock) => (
                        <option key={stock.symbol} value={stock.symbol}>
                          {stock.symbol}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="selected-price">
                    <strong>
                      ₹
                      {selected?.price.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </strong>

                    <span
                      className={
                        getChange(selected) >= 0 ? "gain" : "loss"
                      }
                    >
                      {getChange(selected) >= 0 ? "+" : ""}
                      {getChange(selected).toFixed(2)}%
                    </span>
                  </div>

                  <div className="chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="chartGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopOpacity={0.25} />
                            <stop offset="100%" stopOpacity={0} />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis dataKey="time" hide />

                        <YAxis
                          domain={["auto", "auto"]}
                          tickFormatter={(value) => `₹${value}`}
                          width={75}
                        />

                        <Tooltip />

                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="currentColor"
                          fill="url(#chartGradient)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="panel order-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">TRADE</p>
                      <h2>Place Order</h2>
                    </div>
                  </div>

                  <label>Stock</label>

                  <select
                    className="input"
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                  >
                    {stocks.map((stock) => (
                      <option key={stock.symbol} value={stock.symbol}>
                        {stock.symbol} — ₹{stock.price.toFixed(2)}
                      </option>
                    ))}
                  </select>

                  <label>Quantity</label>

                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />

                  <div className="order-summary">
                    <span>Estimated total</span>

                    <strong>
                      ₹{(selected.price * quantity).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="trade-buttons">
                    <button className="buy-button" onClick={buyStock}>
                      BUY
                    </button>

                    <button className="sell-button" onClick={sellStock}>
                      SELL
                    </button>
                  </div>

                  {message && <div className="message">{message}</div>}
                </section>
              </div>

              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">MARKET WATCH</p>
                    <h2>Popular Stocks</h2>
                  </div>

                  <button
                    className="text-button"
                    onClick={() => navigate("markets")}
                  >
                    View all →
                  </button>
                </div>

                <StockTable
                  stocks={stocks.slice(0, 5)}
                  selectStock={(symbol) => {
                    setSelectedStock(symbol);
                    navigate("dashboard");
                  }}
                />
              </section>
            </>
          )}

          {activePage === "markets" && (
            <MarketsPage
              stocks={stocks}
              selectedStock={selectedStock}
              setSelectedStock={setSelectedStock}
              quantity={quantity}
              setQuantity={setQuantity}
              buyStock={buyStock}
              sellStock={sellStock}
              message={message}
            />
          )}

          {activePage === "portfolio" && (
            <PortfolioPage
              stocks={stocks}
              portfolio={portfolio}
              balance={balance}
              portfolioValue={portfolioValue}
              transactions={transactions}
            />
          )}

          {activePage === "leaderboard" && (
            <LeaderboardPage
              totalValue={totalValue}
              profitPercentage={profitPercentage}
            />
          )}

          {activePage === "education" && <EducationPage />}
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, positive }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <span>{title}</span>
        <strong className={positive === true ? "gain" : ""}>{value}</strong>
        <small>{subtitle}</small>
      </div>
    </div>
  );
}

function StockTable({ stocks, selectStock }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Sector</th>
            <th>Price</th>
            <th>Change</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {stocks.map((stock) => {
            const change =
              ((stock.price - stock.previous) / stock.previous) * 100;

            return (
              <tr key={stock.symbol}>
                <td>
                  <div className="company">
                    <div className="stock-icon">{stock.symbol[0]}</div>

                    <div>
                      <strong>{stock.symbol}</strong>
                      <small>{stock.name}</small>
                    </div>
                  </div>
                </td>

                <td>{stock.sector}</td>

                <td>
                  ₹
                  {stock.price.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </td>

                <td className={change >= 0 ? "gain" : "loss"}>
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)}%
                </td>

                <td>
                  <button
                    className="small-button"
                    onClick={() => selectStock(stock.symbol)}
                  >
                    Trade
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MarketsPage({
  stocks,
  selectedStock,
  setSelectedStock,
  quantity,
  setQuantity,
  buyStock,
  sellStock,
  message,
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MARKETPLACE</p>
          <h1>Markets</h1>
          <p>Monitor simulated market prices and place virtual trades.</p>
        </div>
      </div>

      <section className="panel">
        <StockTable
          stocks={stocks}
          selectStock={(symbol) => setSelectedStock(symbol)}
        />
      </section>

      <section className="panel trade-market">
        <div>
          <p className="eyebrow">ORDER TERMINAL</p>
          <h2>Trade {selectedStock}</h2>
          <p>Select the quantity and execute a simulated market order.</p>
        </div>

        <div className="market-order-controls">
          <input
            className="input"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <button className="buy-button" onClick={buyStock}>
            BUY
          </button>

          <button className="sell-button" onClick={sellStock}>
            SELL
          </button>
        </div>

        {message && <div className="message">{message}</div>}
      </section>
    </>
  );
}

function PortfolioPage({
  stocks,
  portfolio,
  balance,
  portfolioValue,
  transactions,
}) {
  const holdings = stocks.filter((stock) => portfolio[stock.symbol] > 0);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR INVESTMENTS</p>
          <h1>Portfolio</h1>
          <p>Track your simulated investments and trading activity.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<Wallet size={21} />}
          title="Cash Balance"
          value={`₹${balance.toLocaleString("en-IN")}`}
          subtitle="Available to trade"
        />

        <StatCard
          icon={<BriefcaseBusiness size={21} />}
          title="Holdings"
          value={`₹${portfolioValue.toLocaleString("en-IN")}`}
          subtitle="Current market value"
        />
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">HOLDINGS</p>
            <h2>Your Stocks</h2>
          </div>
        </div>

        {holdings.length === 0 ? (
          <div className="empty">
            <BriefcaseBusiness size={40} />
            <h3>No stocks yet</h3>
            <p>Buy your first stock from the Markets page.</p>
          </div>
        ) : (
          <div className="holdings-grid">
            {holdings.map((stock) => {
              const shares = portfolio[stock.symbol];
              const value = shares * stock.price;

              return (
                <div className="holding-card" key={stock.symbol}>
                  <div className="holding-top">
                    <div className="stock-icon">{stock.symbol[0]}</div>

                    <div>
                      <strong>{stock.symbol}</strong>
                      <small>{stock.name}</small>
                    </div>
                  </div>

                  <div className="holding-number">
                    {shares} <span>shares</span>
                  </div>

                  <div className="holding-value">
                    ₹{value.toLocaleString("en-IN")}
                  </div>

                  <small>
                    Current price: ₹{stock.price.toLocaleString("en-IN")}
                  </small>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">ACTIVITY</p>
            <h2>Recent Transactions</h2>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="empty">
            <Activity size={35} />
            <p>No transactions yet.</p>
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.slice(0, 10).map((transaction, index) => (
              <div className="transaction" key={index}>
                <div
                  className={
                    transaction.type === "BUY"
                      ? "transaction-icon buy"
                      : "transaction-icon sell"
                  }
                >
                  {transaction.type === "BUY" ? (
                    <ArrowUp size={18} />
                  ) : (
                    <ArrowDown size={18} />
                  )}
                </div>

                <div>
                  <strong>
                    {transaction.type} {transaction.symbol}
                  </strong>

                  <small>
                    {transaction.quantity} share(s) at ₹
                    {transaction.price.toLocaleString("en-IN")}
                  </small>
                </div>

                <span>{transaction.time}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function LeaderboardPage({ totalValue, profitPercentage }) {
  const rows = [
    ...leaderboard.filter((user) => user.name !== "Pushpak"),
    {
      name: "Pushpak",
      value: totalValue,
      return: profitPercentage,
    },
  ]
    .sort((a, b) => b.value - a.value)
    .map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">COMPETE</p>
          <h1>Leaderboard</h1>
          <p>
            Compare your virtual investment performance with other traders.
          </p>
        </div>
      </div>

      <section className="leaderboard-hero">
        <Trophy size={42} />

        <div>
          <strong>Top Trader Challenge</strong>
          <p>Build the highest virtual portfolio value.</p>
        </div>
      </section>

      <section className="panel">
        <div className="leaderboard-list">
          {rows.map((user) => (
            <div
              className={`leaderboard-row ${
                user.name === "Pushpak" ? "current-user" : ""
              }`}
              key={user.name}
            >
              <div className="rank">#{user.rank}</div>

              <div className="leader-avatar">{user.name[0]}</div>

              <div className="leader-name">
                <strong>{user.name}</strong>

                {user.name === "Pushpak" && <span>You</span>}
              </div>

              <div className="leader-return">
                <strong>
                  {user.return >= 0 ? "+" : ""}
                  {user.return.toFixed(2)}%
                </strong>

                <small>Return</small>
              </div>

              <div className="leader-value">
                ₹{user.value.toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function EducationPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">LEARN</p>
          <h1>Financial Education</h1>
          <p>
            Understand the basics before putting your money into the market.
          </p>
        </div>
      </div>

      <div className="education-grid">
        {education.map((item, index) => (
          <article className="education-card" key={item.title}>
            <div className="education-number">0{index + 1}</div>

            <BookOpen size={24} />

            <h2>{item.title}</h2>

            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </>
  );
}

export default App;