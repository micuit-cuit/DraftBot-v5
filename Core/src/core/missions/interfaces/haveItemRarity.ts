import {IMission} from "../IMission";
import {haveRarityOrMore} from "../../utils/ItemUtils";
import Player from "../../database/game/models/Player";
import {InventorySlots} from "../../database/game/models/InventorySlot";

export const missionInterface: IMission = {
	generateRandomVariant: () => Promise.resolve(0),

	areParamsMatchingVariantAndSave: (variant: number, params: { [key: string]: unknown }) => (params.rarity as number) >= variant,

	async initialNumberDone(player: Player, variant: number) {
		return haveRarityOrMore(await InventorySlots.getOfPlayer(player.id), variant) ? 1 : 0;
	},

	updateSaveBlob(): Promise<Buffer> {
		return Promise.resolve(null);
	}
};