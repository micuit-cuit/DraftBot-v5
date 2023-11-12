import {format} from "../../../../core/utils/StringFormatter";
import {Constants} from "../../../../core/Constants";
import {ITestCommand} from "../../../../core/CommandsTest";
import {Players} from "../../../../core/database/game/models/Player";
import {draftBotInstance} from "../../../../core/bot";
import Class from "../../../../core/database/game/models/Class";
import {DraftbotInteraction} from "../../../../core/messages/DraftbotInteraction";

export const commandInfo: ITestCommand = {
	name: "changeClass",
	commandFormat: "<classId>",
	typeWaited: {
		classId: Constants.TEST_VAR_TYPES.INTEGER
	},
	messageWhenExecuted: "Vous avez maintenant la classe d'id : {classId} !",
	description: "Change votre classe pour la classe d'id donnée.",
	commandTestShouldReply: true,
	execute: null // Defined later
};

/**
 * Add money to the player
 * @param {("fr"|"en")} language - Language to use in the response
 * @param interaction
 * @param args {String[]=[]} - Additional arguments sent with the command
 * @return {String} - The successful message formatted
 */
const changeClassTestCommand = async (language: string, interaction: DraftbotInteraction, args: string[]): Promise<string> => {
	const [player] = await Players.getOrRegister(interaction.user.id);
	const newClassId = parseInt(args[0], 10);
	const classAmount = (await Class.findAll()).length - 1;
	if (newClassId <= 0 || newClassId > classAmount) {
		throw new Error("Erreur class : choisissez une classe qui existe !");
	}
	player.class = newClassId;
	draftBotInstance.logsDatabase.logPlayerClassChange(player.discordUserId, newClassId).then();
	await player.save();
	return format(commandInfo.messageWhenExecuted, {classId: newClassId});
};

commandInfo.execute = changeClassTestCommand;