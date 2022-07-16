import {Entities, Entity} from "../../core/models/Entity";
import {DraftBotValidateReactionMessage} from "../../core/messages/DraftBotValidateReactionMessage";
import {DraftBotEmbed} from "../../core/messages/DraftBotEmbed";
import {Guild, Guilds} from "../../core/models/Guild";
import {MissionsController} from "../../core/missions/MissionsController";
import {BlockingUtils, sendBlockedError} from "../../core/utils/BlockingUtils";
import {ICommand} from "../ICommand";
import {Constants} from "../../core/Constants";
import {CommandInteraction} from "discord.js";
import {SlashCommandBuilder} from "@discordjs/builders";
import {replyErrorMessage, sendErrorMessage} from "../../core/utils/ErrorUtils";
import {TranslationModule, Translations} from "../../core/Translations";
import {BlockingConstants} from "../../core/constants/BlockingConstants";

type EntityInformation = { entity: Entity, guild: Guild }
type TextInformation = { interaction: CommandInteraction, guildKickModule: TranslationModule, language: string }

async function getValidationCallback(entityInformation: EntityInformation, textInformation: TextInformation) {
	const kickedEntity = await Entities.getByOptions(textInformation.interaction);
	return async (validateMessage: DraftBotValidateReactionMessage) => {
		BlockingUtils.unblockPlayer(entityInformation.entity.discordUserId, BlockingConstants.REASONS.GUILD_KICK);
		if (validateMessage.isValidated()) {
			let kickedGuild;
			try {
				kickedGuild = await Guilds.getById(kickedEntity.Player.guildId);
			}
			catch (error) {
				kickedGuild = null;
			}

			if (kickedGuild === null) {
				// not the same guild
				sendErrorMessage(
					textInformation.interaction.user,
					textInformation.interaction,
					textInformation.language,
					textInformation.guildKickModule.get("notInTheGuild")
				);
				return;
			}
			kickedEntity.Player.guildId = null;
			if (entityInformation.guild.elderId === kickedEntity.id) {
				entityInformation.guild.elderId = null;
			}

			await Promise.all([entityInformation.guild.save(), kickedEntity.save(), kickedEntity.Player.save()]);

			const embed = new DraftBotEmbed();
			embed.setAuthor(textInformation.guildKickModule.format("successTitle", {
				kickedPseudo: await kickedEntity.Player.getPseudo(textInformation.language),
				guildName: entityInformation.guild.name
			}))
				.setDescription(textInformation.guildKickModule.get("kickSuccess"));
			await MissionsController.update(kickedEntity, textInformation.interaction.channel, textInformation.language, {
				missionId: "guildLevel",
				count: 0,
				set: true
			});
			textInformation.interaction.followUp({embeds: [embed]});
			return;
		}

		// Cancel the kick
		sendErrorMessage(
			textInformation.interaction.user,
			textInformation.interaction,
			textInformation.language,
			textInformation.guildKickModule.format("kickCancelled", {kickedPseudo: await kickedEntity.Player.getPseudo(textInformation.language)}),
			true);
	};
}

async function isNotEligible(entityInformation: EntityInformation, textInformation: TextInformation, kickedEntity: Entity) {
	if (kickedEntity === null) {
		// no user provided
		replyErrorMessage(
			textInformation.interaction,
			textInformation.language,
			textInformation.guildKickModule.get("cannotGetKickedUser")
		);
		return true;
	}
	let kickedGuild;
	// search for a user's guild
	try {
		kickedGuild = await Guilds.getById(kickedEntity.Player.guildId);
	}
	catch (error) {
		kickedGuild = null;
	}

	if (kickedGuild === null || kickedGuild.id !== entityInformation.guild.id) {
		// not the same guild
		replyErrorMessage(
			textInformation.interaction,
			textInformation.language,
			textInformation.guildKickModule.get("notInTheGuild")
		);
		return true;
	}

	if (kickedEntity.id === entityInformation.entity.id) {
		sendErrorMessage(
			textInformation.interaction.user,
			textInformation.interaction,
			textInformation.language,
			textInformation.guildKickModule.get("excludeHimself")
		);
		return true;
	}
	return false;
}

/**
 * Allow to kick a member from a guild
 * @param interaction
 * @param {("fr"|"en")} language - Language to use in the response
 * @param entity
 */
async function executeCommand(interaction: CommandInteraction, language: string, entity: Entity): Promise<void> {
	if (await sendBlockedError(interaction, language)) {
		return;
	}
	const guildKickModule = Translations.getModule("commands.guildKick", language);
	const guild = await Guilds.getById(entity.Player.guildId);
	const kickedEntity = await Entities.getByOptions(interaction);

	if (await isNotEligible({entity, guild}, {interaction, guildKickModule, language}, kickedEntity)) {
		return;
	}

	await new DraftBotValidateReactionMessage(
		interaction.user,
		await getValidationCallback({entity, guild}, {interaction, guildKickModule, language})
	)
		.formatAuthor(guildKickModule.get("kickTitle"), interaction.user)
		.setDescription(guildKickModule.format("kick", {
			guildName: guild.name,
			kickedPseudo: await kickedEntity.Player.getPseudo(language)
		}))
		.reply(interaction, (collector) => BlockingUtils.blockPlayerWithCollector(entity.discordUserId, BlockingConstants.REASONS.GUILD_KICK, collector));
}

export const commandInfo: ICommand = {
	slashCommandBuilder: new SlashCommandBuilder()
		.setName("guildkick")
		.setDescription("Kick someone of your guild")
		.addUserOption(option => option.setName("user")
			.setDescription("The user you want to kick of your guild")
			.setRequired(false)
		)
		.addNumberOption(option => option.setName("rank")
			.setDescription("The rank of the player you want to kick of your guild")
			.setRequired(false)
		) as SlashCommandBuilder,
	executeCommand,
	requirements: {
		disallowEffects: [Constants.EFFECT.BABY, Constants.EFFECT.DEAD],
		guildRequired: true,
		guildPermissions: Constants.GUILD.PERMISSION_LEVEL.CHIEF
	},
	mainGuildCommand: false
};