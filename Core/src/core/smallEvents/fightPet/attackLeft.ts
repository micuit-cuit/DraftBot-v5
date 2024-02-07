import Player from "../../database/game/models/Player";
import {RandomUtils} from "../../utils/RandomUtils";
import {SmallEventConstants} from "../../constants/SmallEventConstants";
import {FightPetActionFunc} from "../../../data/FightPetAction";

export const fightPetAction: FightPetActionFunc = (player: Player): boolean => RandomUtils.draftbotRandom.bool(
	player.id % 10 !== SmallEventConstants.FIGHT_PET.LAST_DIGIT_LEFT_HANDED
		? SmallEventConstants.FIGHT_PET.LEFT_RIGHT_GOOD_SIDE_CHANCES
		: SmallEventConstants.FIGHT_PET.LEFT_RIGHT_WRONG_SIDE_CHANCES
);