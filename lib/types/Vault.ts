import Inventory, { DirectInventory } from "./Inventory";

export default class Vault {
  inventory: DirectInventory = new DirectInventory();
  level: number = 0;

  recalculateVaultSize() {
    this.inventory.maxWeight = vaultLevelling[this.level].maxWeight;
  }
}

export const vaultLevelling = [
  { maxWeight: 100, price: 0 },
  { maxWeight: 200, price: 150 },
  { maxWeight: 350, price: 500 },
];
