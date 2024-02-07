import {FightPetActionFunc} from "../../../data/FightPetAction";
import {InventorySlots} from "../../database/game/models/InventorySlot";
import {RandomUtils} from "../../utils/RandomUtils";
import {SmallEventConstants} from "../../constants/SmallEventConstants";

export const fightPetAction: FightPetActionFunc = async (player, pet) => RandomUtils.draftbotRandom.bool(
	Math.max(
		player.getCumulativeDefense(await InventorySlots.getPlayerActiveObjects(player.id)) / SmallEventConstants.FIGHT_PET.PROTECT_DEFENSE_NEEDED * pet.rarity,
		SmallEventConstants.FIGHT_PET.MAXIMUM_STATS_BASED_ACTIONS_CHANCES
	)
);