import {Translations} from "../../core/Translations";
import {ICommand} from "../ICommand";
import {Constants} from "../../core/Constants";
import {SlashCommandBuilderGenerator} from "../SlashCommandBuilderGenerator";
import Player from "../../core/database/game/models/Player";
import {confirmationCallback} from "../../core/smallEvents/goToPVEIslandSmallEvent";
import {Maps} from "../../core/maps/Maps";
import {replyErrorMessage} from "../../core/utils/ErrorUtils";
import {DraftBotValidateReactionMessage} from "../../core/messages/DraftBotValidateReactionMessage";
import {format} from "../../core/utils/StringFormatter";
import {BlockingUtils, sendBlockedError} from "../../core/utils/BlockingUtils";
import {BlockingConstants} from "../../core/constants/BlockingConstants";
import {EffectsConstants} from "../../core/constants/EffectsConstants";
import {PVEConstants} from "../../core/constants/PVEConstants";
import {LogsReadRequests} from "../../core/database/logs/LogsReadRequests";
import {DraftBotEmbed} from "../../core/messages/DraftBotEmbed";
import {MissionsController} from "../../core/missions/MissionsController";
import {DraftbotInteraction} from "../../core/messages/DraftbotInteraction";

/**
 * Displays information about the profile of the player who sent the command
 * @param interaction
 * @param {("fr"|"en")} language - Language to use in the response
 * @param player
 */
async function executeCommand(interaction: DraftbotInteraction, language: string, player: Player): Promise<void> {
	if (await sendBlockedError(interaction, language)) {
		return;
	}

	const tr = Translations.getModule("commands.joinBoat", language);

	if (await LogsReadRequests.getCountPVEIslandThisWeek(player.discordUserId, player.guildId) >= PVEConstants.TRAVEL_COST.length) {
		await replyErrorMessage(interaction, language, tr.get("tooManyBoatInWeek"));
		return;
	}

	const guildOnBoat = await Maps.getGuildMembersOnBoat(player);
	if (guildOnBoat.length === 0) {
		await replyErrorMessage(interaction, language, tr.get("noMemberOnBoat"));
		return;
	}

	if (!await player.hasEnoughEnergyToJoinTheIsland()) {
		await replyErrorMessage(interaction, language, tr.get("noEnoughEnergy"));
		return;
	}

	const price = await player.getTravelCostThisWeek();
	const confirmEmbed = new DraftBotValidateReactionMessage(
		interaction.user,
		(confirmMessage: DraftBotValidateReactionMessage) => {
			confirmationCallback(player, {
				reactionMessage: confirmMessage,
				embed: new DraftBotEmbed().formatAuthor(tr.get("confirmedTitle"), interaction.user),
				tr,
				interaction
			}, ":ferry:", price, guildOnBoat[0]).then(async (hasJoinedBoat) => {
				if (hasJoinedBoat) {
					await MissionsController.update(player, interaction.channel, language, {
						missionId: "joinMemberOnBoat"
					});
				}
			});
		}
	);
	await interaction.deferReply();

	const boatTr = Translations.getModule("smallEvents.goToPVEIsland", language);
	confirmEmbed.formatAuthor(tr.get("confirmationTitle"), interaction.user);
	confirmEmbed.setDescription(`${
		format(tr.get("joinMember"), {
			priceText: price === 0 ? boatTr.get("priceFree") : boatTr.format("priceMoney", {price})
		})}\n\n${
		boatTr.format("confirm", {
			fightPoints: await player.getCumulativeFightPoint(),
			fightPointsMax: await player.getMaxCumulativeFightPoint()
		})}
	`);

	await confirmEmbed.editReply(interaction, (collector) => BlockingUtils.blockPlayerWithCollector(player.discordUserId, BlockingConstants.REASONS.PVE_ISLAND, collector));
}

const currentCommandFrenchTranslations = Translations.getModule("commands.joinBoat", Constants.LANGUAGE.FRENCH);
const currentCommandEnglishTranslations = Translations.getModule("commands.joinBoat", Constants.LANGUAGE.ENGLISH);
export const commandInfo: ICommand = {
	slashCommandBuilder: SlashCommandBuilderGenerator.generateBaseCommand(currentCommandFrenchTranslations, currentCommandEnglishTranslations),
	executeCommand,
	requirements: {
		requiredLevel: PVEConstants.MIN_LEVEL,
		guildRequired: true,
		allowEffects: [EffectsConstants.EMOJI_TEXT.SMILEY]
	},
	mainGuildCommand: false
};