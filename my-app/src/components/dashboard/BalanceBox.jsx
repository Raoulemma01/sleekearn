const BalanceBox = ({ title, amount, trend = "+0%" }) => {
  // Ensure trend is always a string and has a default value
  const trendClass = typeof trend === 'string' 
    ? (trend.includes('+') ? 'positive' : 'negative')
    : 'positive'; // Default to positive if trend is invalid

  return (
    <div className={`balance-box ${trendClass}`}>
      <h3>{title}</h3>
      <p className="amount">{amount}</p>
      {trend && <p className="trend">{trend}</p>}
    </div>
  );
};

export default BalanceBox;