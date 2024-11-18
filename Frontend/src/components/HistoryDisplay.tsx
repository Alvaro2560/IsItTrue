import './HistoryDisplay.css';

export type HistoryItem = {
  id: string;
  image: string;
  percentage: number;
  timestamp: string;
}

interface HistoryDisplayProps {
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
}

export default function HistoryDisplay({ history, onSelectHistoryItem }: HistoryDisplayProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  }

  return (
    <div className="history-display">
      <h3 className="history-title">Upload History</h3>
      <div className="history-list">
        {history.map((item) => (
          <div
            key={item.id}
            className="history-item"
            onClick={() => onSelectHistoryItem(item)}
          >
            <img src={item.image} alt="History item" className="history-image" />
            <div className="history-details">
              <div className="history-timestamp">{formatDate(item.timestamp)}</div>
              <div className="history-percentage">{item.percentage}% real</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}