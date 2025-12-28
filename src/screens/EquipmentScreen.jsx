import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import '../styles/EquipmentScreen.css';

export default function EquipmentScreen({ gameState, setGameState }) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipment();
  }, []);

  async function loadEquipment() {
    try {
      const data = await api.getEquipment();
      setEquipment(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load equipment:', error);
      setLoading(false);
    }
  }

  async function handleEquip(itemId) {
    try {
      await api.equipItem(itemId);
      await loadEquipment();
      // Refresh game state
      const newState = await api.getGameState();
      setGameState(newState);
    } catch (error) {
      console.error('Failed to equip item:', error);
    }
  }

  if (loading) return <div>Loading...</div>;

  const equipmentSlots = ['weapon', 'armor', 'artifact'];
  const equipped = {};
  const unequipped = {};

  equipment.forEach(item => {
    if (item.equipped) {
      equipped[item.item_type] = item;
    } else {
      if (!unequipped[item.item_type]) {
        unequipped[item.item_type] = [];
      }
      unequipped[item.item_type].push(item);
    }
  });

  return (
    <div className="equipment-screen">
      <h1>Equipment</h1>

      <div className="equipped-section">
        <h3>Equipped</h3>
        <div className="equipment-slots">
          {equipmentSlots.map(slot => (
            <div key={slot} className="equipment-slot">
              <div className="slot-label">{slot.toUpperCase()}</div>
              {equipped[slot] ? (
                <div className={`item equipped rarity-${equipped[slot].rarity}`}>
                  <div className="item-name">{equipped[slot].name}</div>
                  <div className="item-stats">
                    {equipped[slot].atk_bonus > 0 && <span>+{equipped[slot].atk_bonus} ATK</span>}
                    {equipped[slot].def_bonus > 0 && <span>+{equipped[slot].def_bonus} DEF</span>}
                    {equipped[slot].hp_bonus > 0 && <span>+{equipped[slot].hp_bonus} HP</span>}
                  </div>
                </div>
              ) : (
                <div className="slot-empty">Empty</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="inventory-section">
        <h3>Inventory</h3>
        {Object.keys(unequipped).length === 0 ? (
          <div className="empty-inventory">No items available</div>
        ) : (
          <div className="inventory-list">
            {Object.entries(unequipped).map(([slotType, items]) => (
              <div key={slotType} className="inventory-group">
                <h4>{slotType.toUpperCase()}</h4>
                {items.map(item => (
                  <div key={item.id} className={`item-row rarity-${item.rarity}`}>
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-stats">
                        {item.atk_bonus > 0 && <span className="stat-atk">+{item.atk_bonus} ATK</span>}
                        {item.def_bonus > 0 && <span className="stat-def">+{item.def_bonus} DEF</span>}
                        {item.hp_bonus > 0 && <span className="stat-hp">+{item.hp_bonus} HP</span>}
                      </div>
                    </div>
                    <button className="equip-btn" onClick={() => handleEquip(item.id)}>
                      Equip
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
