import Player from "../models/Player";
import {IMission} from "./IMission";
import {TextChannel} from "discord.js";
import MissionSlot from "../models/MissionSlot";
import {DailyMissions} from "../models/DailyMission";
import Mission, {Missions} from "../models/Mission";
import {hoursToMilliseconds} from "../utils/TimeUtils";
import {DraftBotEmbed} from "../messages/DraftBotEmbed";
import {MissionDifficulty} from "./MissionDifficulty";
import {Data} from "../Data";
import {Campaign} from "./Campaign";
import {Entities} from "../models/Entity";
import {CompletedMission, CompletedMissionType} from "./CompletedMission";
import {DraftBotCompletedMissions} from "../messages/DraftBotCompletedMissions";
import {draftBotClient} from "../bot";

export class MissionsController {
	static getMissionInterface(missionId: string): IMission {
		try {
			return <IMission>(require("./interfaces/" + missionId).missionInterface);
		}
		catch {
			return require("./DefaultInterface").missionInterface;
		}
	}

	// eslint-disable-next-line max-params
	static async update(discordUserId: string, channel: TextChannel, language: string, missionId: string, count = 1, params: { [key: string]: any } = {}, set = false): Promise<void> {
		const [entity] = await Entities.getOrRegister(discordUserId);
		const completedDaily = await MissionsController.updateMissionsCounts(entity.Player, missionId, count, params, set);
		const completedMissions = await MissionsController.completeAndUpdateMissions(entity.Player, completedDaily, language);
		if (completedMissions.length !== 0) {
			await MissionsController.updatePlayerStats(entity.Player, completedMissions);
			await MissionsController.sendCompletedMissions(discordUserId, entity.Player, completedMissions, channel, language);
		}
	}

	/**
	 * @param player
	 * @param missionId
	 * @param count
	 * @param params
	 * @param set
	 * @private
	 * @return true if the daily mission is finished and needs to be said to the player
	 */
	private static async updateMissionsCounts(player: Player, missionId: string, count = 1, params: { [key: string]: any } = {}, set = false): Promise<boolean> {
		const missionInterface = this.getMissionInterface(missionId);
		for (const mission of player.MissionSlots) {
			if (mission.missionId === missionId && missionInterface.areParamsMatchingVariant(mission.missionVariant, params) && !mission.hasExpired() && !mission.isCompleted()) {
				if (set) {
					mission.numberDone = count;
				}
				else {
					mission.numberDone += count;
				}
				if (mission.numberDone > mission.missionObjective) {
					mission.numberDone = mission.missionObjective;
				}
				await mission.save();
			}
		}
		if (!player.PlayerMissionsInfo.hasCompletedDailyMission()) {
			const dailyMission = await DailyMissions.getOrGenerate();
			if (dailyMission.missionId === missionId) {
				if (missionInterface.areParamsMatchingVariant(dailyMission.variant, params)) {
					player.PlayerMissionsInfo.dailyMissionNumberDone += count;
					if (player.PlayerMissionsInfo.dailyMissionNumberDone > dailyMission.objective) {
						player.PlayerMissionsInfo.dailyMissionNumberDone = dailyMission.objective;
					}
					await player.PlayerMissionsInfo.save();
					if (player.PlayerMissionsInfo.dailyMissionNumberDone >= dailyMission.objective) {
						return true;
					}
				}
			}
		}
		return false;
	}

	static async completeAndUpdateMissions(player: Player, completedDailyMission: boolean, language: string): Promise<CompletedMission[]> {
		const completedMissions: CompletedMission[] = [];
		completedMissions.push(...await Campaign.updatePlayerCampaign(player, language));
		for (const mission of player.MissionSlots) {
			if (mission.isCompleted() && !mission.isCampaign()) {
				completedMissions.push(
					new CompletedMission(
						mission.xpToWin,
						mission.gemsToWin,
						await mission.Mission.formatDescription(mission.missionObjective, mission.missionVariant, language),
						CompletedMissionType.NORMAL
					)
				);
				await mission.destroy();
			}
		}
		if (completedDailyMission) {
			const dailyMission = await DailyMissions.getOrGenerate();
			completedMissions.push(new CompletedMission(
				dailyMission.xpToWin,
				dailyMission.gemsToWin,
				await dailyMission.Mission.formatDescription(dailyMission.objective, dailyMission.variant, language),
				CompletedMissionType.DAILY
			));
		}
		return completedMissions;
	}

	static async sendCompletedMissions(discordUserId: string, player: Player, completedMissions: CompletedMission[], channel: TextChannel, language: string) {
		await channel.send({
			embeds: [
				new DraftBotCompletedMissions(draftBotClient.users.cache.get(discordUserId), completedMissions, language)
			]
		});
	}

	static async updatePlayerStats(player: Player, completedMissions: CompletedMission[]) {
		for (const completedMission of completedMissions) {
			player.PlayerMissionsInfo.gems += completedMission.gemsToWin;
			player.experience += completedMission.xpToWin;
		}
		await player.PlayerMissionsInfo.save();
		await player.save();
	}

	public static async generateRandomDailyMissionProperties(): Promise<{ mission: Mission, index: number, variant: number }> {
		const mission = await Missions.getRandomDailyMission();
		return this.generateMissionProperties(mission.id, MissionDifficulty.EASY, mission, true);
	}

	public static async generateMissionProperties(missionId: string, difficulty: MissionDifficulty, mission: Mission = null, daily = false)
		: Promise<{ mission: Mission, index: number, variant: number } | null> {
		if (!mission) {
			mission = await Missions.getById(missionId);
			if (!mission) {
				return null;
			}
		}
		const missionData = Data.getModule("missions." + missionId);
		let index;
		if (!daily) {
			switch (difficulty) {
			case MissionDifficulty.EASY:
				if (!mission.canBeEasy) {
					return null;
				}
				index = missionData.getRandomNumberFromArray("difficulties.easy");
				break;
			case MissionDifficulty.MEDIUM:
				if (!mission.canBeMedium) {
					return null;
				}
				index = missionData.getRandomNumberFromArray("difficulties.medium");
				break;
			case MissionDifficulty.HARD:
				if (!mission.canBeHard) {
					return null;
				}
				index = missionData.getRandomNumberFromArray("difficulties.hard");
				break;
			default:
				return null;
			}
		}
		else {
			index = missionData.getRandomNumberFromArray("dailyIndexes");
		}
		return {
			mission: mission,
			index,
			variant: this.getMissionInterface(mission.id).generateRandomVariant(difficulty)
		};
	}

	public static async addMissionToPlayer(player: Player, missionId: string, difficulty: MissionDifficulty, mission: Mission = null): Promise<MissionSlot> {
		const prop = await this.generateMissionProperties(missionId, difficulty, mission);
		const missionData = Data.getModule("missions." + missionId);
		return await MissionSlot.create({
			playerId: player.id,
			missionId: prop.mission.id,
			missionVariant: prop.variant,
			missionObjective: missionData.getNumberFromArray("objectives", prop.index),
			expiresAt: new Date(Date.now() + hoursToMilliseconds(missionData.getNumberFromArray("expirations", prop.index))),
			numberDone: await this.getMissionInterface(missionId).initialNumberDone(player, prop.variant),
			gemsToWin: missionData.getNumberFromArray("gems", prop.index),
			xpToWin: missionData.getNumberFromArray("xp", prop.index)
		});
	}

	public static async addRandomMissionToPlayer(player: Player, difficulty: MissionDifficulty): Promise<MissionSlot> {
		const mission = await Missions.getRandomMission(difficulty);
		return await MissionsController.addMissionToPlayer(player, mission.id, difficulty, mission);
	}

	public static async getVariantFormatText(missionId: string, variant: number, objective: number, language: string) {
		return await this.getMissionInterface(missionId).getVariantFormatVariable(variant, objective, language);
	}
}