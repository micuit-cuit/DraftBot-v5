import {SmallEventConstants} from "../../constants/SmallEventConstants";
import {RandomUtils} from "../../utils/RandomUtils";
import {FightPetActionFunc} from "../../../data/FightPetAction";

/**
 *  The player does nothing and hopes for the best
 */

export const fightPetAction: FightPetActionFunc = (): boolean => RandomUtils.draftbotRandom.bool(SmallEventConstants.FIGHT_PET.DO_NOTHING_VERY_LUCKY_THRESHOLD);