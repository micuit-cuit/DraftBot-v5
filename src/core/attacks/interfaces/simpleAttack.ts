import {IFightAction} from "../IFightAction";
import {Fighter} from "../../fights/Fighter";
import {Translations} from "../../Translations";
import {format} from "../../utils/StringFormatter";
import {Data} from "../../Data";
import {FightActionController} from "../FightActionController";
import {FightConstants} from "../../constants/FightConstants";
import {FighterAlteration} from "../../fights/FighterAlteration";

type attackInfo = { minDamage: number, averageDamage: number, maxDamage: number };
type statsInfo = { attackerStats: number[], defenderStats: number[], statsEffect: number[] }

export const fightActionInterface: IFightAction = {
	use(sender: Fighter, receiver: Fighter, language: string): string {
		const initialDamage = FightActionController.getAttackDamage(this.getStatsInfo(sender, receiver), sender.getPlayerLevel(), this.getAttackInfo());
		const damageDealt = FightActionController.applySecondaryEffects(initialDamage, 5, 10);
		receiver.stats.fightPoints -= damageDealt;
		const attackTranslationModule = Translations.getModule("commands.fight", language);
		receiver.newAlteration(FighterAlteration.POISONED);
		const attackStatus = this.getAttackStatus(damageDealt, initialDamage);
		const chosenString = attackTranslationModule.getRandom(`actions.attacksResults.${attackStatus}`);
		return format(chosenString, {
			attack: Translations.getModule("fightactions." + this.getName(), language)
				.get("name")
				.toLowerCase()
		}) + Translations.getModule("commands.fight", language).format("actions.damages", {
			damages: damageDealt
		});
	},

	toString(language: string): string {
		return Translations.getModule(`fightactions.${this.getName()}`, language).get("name");
	},

	getEmoji(): string {
		return Data.getModule(`fightactions.${this.getName()}`).getString("emote");
	},

	getName(): string {
		return "simpleAttack";
	},

	getAttackInfo(): attackInfo {
		return {minDamage: 50, averageDamage: 100, maxDamage: 150};
	},

	getStatsInfo(sender: Fighter, receiver: Fighter): statsInfo {
		return {
			attackerStats: [
				sender.stats.attack,
				sender.stats.agility,
				sender.stats.speed
			], defenderStats: [
				receiver.stats.defense,
				receiver.stats.agility,
				receiver.stats.speed
			], statsEffect: [
				0.8,
				0.1,
				0.1
			]
		};
	},

	getAttackStatus(damageDealt: number, initialDamage: number) {
		return damageDealt > initialDamage
			? FightConstants.ATTACK_STATUS.CRITICAL
			: damageDealt < initialDamage
				? FightConstants.ATTACK_STATUS.MISSED
				: FightConstants.ATTACK_STATUS.NORMAL;
	}
};