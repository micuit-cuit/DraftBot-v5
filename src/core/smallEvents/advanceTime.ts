import {SmallEventFuncs} from "../../data/SmallEvent";
import {SmallEventConstants} from "../constants/SmallEventConstants";
import {makePacket} from "../../../../Lib/src/packets/DraftBotPacket";
import {RandomUtils} from "../utils/RandomUtils";
import {TravelTime} from "../maps/TravelTime";
import {NumberChangeReason} from "../constants/LogsConstants";
import {SmallEventAdvanceTimePacket} from "../../../../Lib/src/packets/smallEvents/SmallEventAdvanceTimePacket";

export const smallEventFuncs: SmallEventFuncs = {
	canBeExecuted: SmallEventConstants.DEFAULT_FUNCTIONS.CAN_BE_EXECUTED.CONTINENT,
	executeSmallEvent: async (response, player): Promise<void> => {
		const timeAdvanced = RandomUtils.draftbotRandom.integer(10, 50);
		await TravelTime.timeTravel(player, timeAdvanced, NumberChangeReason.SMALL_EVENT);
		await player.save();
		response.push(makePacket<SmallEventAdvanceTimePacket>({time: timeAdvanced}));
	}
};