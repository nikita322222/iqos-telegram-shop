import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import './BonusPage.css';

function BonusPage() {
  const navigate = useNavigate();
  const [bonusInfo, setBonusInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBonusData();
  }, []);

  const loadBonusData = async () => {
    try {
      console.log('Loading bonus data...');
      
      // Загружаем информацию о бонусах
      const bonusResponse = await api.getBonusInfo();
      console.log('Bonus info:', bonusResponse.data);
      setBonusInfo(bonusResponse.data);

      // Загружаем историю транзакций
      const transactionsResponse = await api.getBonusTransactions();
      console.log('Transactions:', transactionsResponse.data);
      setTransactions(transactionsResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      console.error('Error details:', error.response?.data);
      setLoading(false);
    }
  };

  const getLevelIcon = (level) => {
    switch(level) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      default: return '🥉';
    }
  };

  const getLevelName = (level) => {
    switch(level) {
      case 'bronze': return 'Bronze';
      case 'silver': return 'Silver';
      case 'gold': return 'Gold';
      default: return 'Bronze';
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      default: return '#CD7F32';
    }
  };

  const getNextLevelInfo = () => {
    if (!bonusInfo) return null;
    
    const { loyalty_level, total_orders_count } = bonusInfo;
    
    if (loyalty_level === 'bronze') {
      return {
        nextLevel: 'Silver',
        ordersNeeded: 6 - total_orders_count,
        nextCashback: '3%'
      };
    } else if (loyalty_level === 'silver') {
      return {
        nextLevel: 'Gold',
        ordersNeeded: 16 - total_orders_count,
        nextCashback: '5%'
      };
    } else {
      return null; // Максимальный уровень
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bonus-page">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (!bonusInfo) {
    return (
      <div className="bonus-page">
        <div className="error">Ошибка загрузки данных</div>
      </div>
    );
  }

  const nextLevelInfo = getNextLevelInfo();

  return (
    <div className="bonus-page">
      {/* Шапка с балансом */}
      <div className="bonus-header">
        <div className="bonus-balance-card">
          <div className="balance-label">Ваш баланс</div>
          <div className="balance-amount">{bonusInfo.bonus_balance.toFixed(2)} BYN</div>
          <div className="balance-subtitle">1 бонус = 1 белорусский рубль</div>
        </div>
      </div>

      {/* Карточка уровня */}
      <div className="level-card" style={{ borderColor: getLevelColor(bonusInfo.loyalty_level) }}>
        <div className="level-header">
          <div className="level-icon">{getLevelIcon(bonusInfo.loyalty_level)}</div>
          <div className="level-info">
            <div className="level-name">{getLevelName(bonusInfo.loyalty_level)}</div>
            <div className="level-cashback">Кэшбэк {bonusInfo.cashback_percent}%</div>
          </div>
        </div>

        {/* Прогресс до следующего уровня */}
        {nextLevelInfo && (
          <div className="level-progress">
            <div className="progress-header">
              <span>До уровня {nextLevelInfo.nextLevel}</span>
              <span>{bonusInfo.total_orders_count} / {bonusInfo.next_level_orders} заказов</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${bonusInfo.progress_percent}%`,
                  backgroundColor: getLevelColor(bonusInfo.loyalty_level)
                }}
              ></div>
            </div>
            <div className="progress-info">
              Еще {nextLevelInfo.ordersNeeded} {nextLevelInfo.ordersNeeded === 1 ? 'заказ' : 'заказа'} до {nextLevelInfo.nextCashback} кэшбэка
            </div>
          </div>
        )}

        {bonusInfo.loyalty_level === 'gold' && (
          <div className="max-level-badge">
            🎉 Максимальный уровень достигнут!
          </div>
        )}
      </div>

      {/* Информация о системе */}
      <div className="bonus-info-section">
        <h3>Как работает бонусная система?</h3>
        
        <div className="info-card">
          <div className="info-icon">💰</div>
          <div className="info-content">
            <div className="info-title">Получайте бонусы</div>
            <div className="info-text">
              За каждый подтвержденный заказ вы получаете бонусы в размере от 1.5% до 5% от суммы заказа
            </div>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">🛍️</div>
          <div className="info-content">
            <div className="info-title">Оплачивайте бонусами</div>
            <div className="info-text">
              Используйте накопленные бонусы для оплаты следующих заказов. Можно оплатить до 30% от суммы заказа. 1 бонус = 1 белорусский рубль
            </div>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">⬆️</div>
          <div className="info-content">
            <div className="info-title">Повышайте уровень</div>
            <div className="info-text">
              Чем больше заказов, тем выше ваш уровень и процент кэшбэка
            </div>
          </div>
        </div>
      </div>

      {/* Уровни лояльности */}
      <div className="levels-section">
        <h3>Уровни лояльности</h3>
        
        <div className={`level-item ${bonusInfo.loyalty_level === 'bronze' ? 'active' : ''}`}>
          <div className="level-item-icon">🥉</div>
          <div className="level-item-info">
            <div className="level-item-name">Bronze</div>
            <div className="level-item-desc">0-5 заказов • Кэшбэк 1.5%</div>
          </div>
        </div>

        <div className={`level-item ${bonusInfo.loyalty_level === 'silver' ? 'active' : ''}`}>
          <div className="level-item-icon">🥈</div>
          <div className="level-item-info">
            <div className="level-item-name">Silver</div>
            <div className="level-item-desc">6-15 заказов • Кэшбэк 3%</div>
          </div>
        </div>

        <div className={`level-item ${bonusInfo.loyalty_level === 'gold' ? 'active' : ''}`}>
          <div className="level-item-icon">🥇</div>
          <div className="level-item-info">
            <div className="level-item-name">Gold</div>
            <div className="level-item-desc">16+ заказов • Кэшбэк 5%</div>
          </div>
        </div>
      </div>

      {/* История транзакций */}
      {transactions.length > 0 && (
        <div className="transactions-section">
          <h3>История бонусов</h3>
          {transactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-icon">
                {transaction.amount > 0 ? '➕' : '➖'}
              </div>
              <div className="transaction-info">
                <div className="transaction-desc">{transaction.description}</div>
                <div className="transaction-date">{formatDate(transaction.created_at)}</div>
              </div>
              <div className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} BYN
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BonusPage;
