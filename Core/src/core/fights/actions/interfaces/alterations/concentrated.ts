import {FightAlterationFunc} from "../../../../../data/FightAlteration";
import {FightAlterationState} from "../../../../../../../Lib/src/interfaces/FightAlterationResult";
import {FightActionController} from "../../FightActionController";
import {FightStatBuffed} from "../../../../../../../Lib/src/interfaces/FightActionResult";
import {FightStatModifierOperation} from "../../../../../../../Lib/src/interfaces/FightStatModifierOperation";
import {defaultFightAlterationResult, defaultHealFightAlterationResult} from "../../../FightController";

const use: FightAlterationFunc = (affected, fightAlteration) => {
	if (affected.alterationTurn > 1) { // This effect heals after one turn
		affected.removeAttackModifiers(fightAlteration);
		affected.removeSpeedModifiers(fightAlteration);
		return defaultHealFightAlterationResult(affected);
	}
	const result = defaultFightAlterationResult();
	if (!affected.hasAttackModifier(fightAlteration)) {
		FightActionController.applyBuff(result, {
			selfTarget: true,
			stat: FightStatBuffed.SPEED,
			operator: FightStatModifierOperation.MULTIPLIER,
			value: 2
		}, affected, fightAlteration);
		FightActionController.applyBuff(result, {
			selfTarget: true,
			stat: FightStatBuffed.ATTACK,
			operator: FightStatModifierOperation.MULTIPLIER,
			value: 2
		}, affected, fightAlteration);
		result.state = FightAlterationState.NEW;
	}
	return result;
};

export default use;