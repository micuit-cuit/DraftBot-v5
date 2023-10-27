import {GenericItem} from "./GenericItem";
import {InventoryConstants} from "../core/constants/InventoryConstants";

export abstract class MainItem extends GenericItem {

	public readonly rawAttack?: number;

	public readonly rawDefense?: number;

	public readonly rawSpeed?: number;

	public readonly attack?: number;

	public readonly defense?: number;

	public readonly speed?: number;


	public getSpeed(): number {
		let before = 0;
		if (this.rawSpeed > 0) {
			before = 1.15053 * Math.pow(this.multiplier(), 2.3617) * Math.pow(1.0569 + 0.1448 / this.multiplier(), this.rawSpeed);
		}
		return Math.round(before * 0.5) + this.speed;
	}

	/**
	 * Get the multiplier for the item depending on its rarity
	 * @protected
	 */
	protected multiplier(): number {
		return InventoryConstants.ITEMS_MAPPER[this.rarity];
	}
}