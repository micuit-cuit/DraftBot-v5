import {WitchActionFuncs} from "../../../data/WitchAction";
import {ItemNature, ItemRarity} from "../../constants/ItemConstants";

export const witchSmallEvent: WitchActionFuncs = {
	generatePotion: () => ({
		minRarity: ItemRarity.COMMON,
		maxRarity: ItemRarity.SPECIAL,
		nature: ItemNature.ENERGY
	})
};
