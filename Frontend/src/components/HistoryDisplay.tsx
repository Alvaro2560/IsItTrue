import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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
  onClearHistory: () => void;
}

export default function HistoryDisplay({ history, onSelectHistoryItem, onClearHistory }: HistoryDisplayProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="history-display">
      <div className="history-header">
        <h3>Upload History</h3>
        <Button onClick={onClearHistory} className="clear-history-button">
          <Trash2 size={16} />
          Clear history
        </Button>
      </div>
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