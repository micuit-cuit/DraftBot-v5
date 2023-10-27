import {Fighter} from "../../../fighter/Fighter";
import {FightActionController} from "../../FightActionController";
import {attackInfo, statsInfo} from "../../FightAction";
import {MathUtils} from "../../../../utils/MathUtils";
import {FightConstants} from "../../../../constants/FightConstants";
import {FightAlterationFunc} from "@Core/src/data/FightAlteration";
import {defaultFightAlterationResult, defaultHealFightAlterationResult} from "@Lib/src/interfaces/FightAlterationResult";

const use: FightAlterationFunc = (affected, _fightAlteration, opponent, turn) => {
	// 50 % chance to be healed from the cursed (except for the first two turn) and 100 % after 5 turns of being cursed
	if (Math.random() < 0.25 && affected.alterationTurn > 2 || affected.alterationTurn > 4) {
		const result = defaultHealFightAlterationResult(affected);
		let damageDealt = FightActionController.getAttackDamage(getStatsInfo(affected, opponent), affected, getAttackInfo(), true);
		damageDealt += MathUtils.getIntervalValue(0, damageDealt * 2, (affected.alterationTurn - 2) / 3);
		damageDealt += MathUtils.getIntervalValue(0, damageDealt, Math.min(turn, FightConstants.MAX_TURNS) / FightConstants.MAX_TURNS);
		result.damages = Math.round(damageDealt);
		return result;
	}
	return defaultFightAlterationResult();
};

export default use;

function getAttackInfo(): attackInfo {
	return {
		minDamage: 60,
		averageDamage: 95,
		maxDamage: 135
	};
}

function getStatsInfo(victim: Fighter, sender: Fighter): statsInfo {
	return {
		attackerStats: [
			sender.getAttack()
		],
		defenderStats: [
			victim.getDefense()
		],
		statsEffect: [
			1
		]
	};
}