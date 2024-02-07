import {FightAlterationFunc} from "../../../../../data/FightAlteration";
import {FightAlterationState} from "../../../../../../../Lib/src/interfaces/FightAlterationResult";
import {FightActionController} from "../../FightActionController";
import {FightStatBuffed} from "../../../../../../../Lib/src/interfaces/FightActionResult";
import {FightActionDataController} from "../../../../../data/FightAction";
import {FightStatModifierOperation} from "../../../../../../../Lib/src/interfaces/FightStatModifierOperation";
import {defaultFightAlterationResult, defaultHealFightAlterationResult} from "../../../FightController";

const use: FightAlterationFunc = (affected, fightAction) => {
	if (affected.alterationTurn > 2) { // This effect heals after two turns
		affected.removeDefenseModifiers(fightAction);
		return defaultHealFightAlterationResult(affected);
	}

	const result = defaultFightAlterationResult();
	result.state = FightAlterationState.NO_ACTION;

	if (!affected.hasDefenseModifier(fightAction)) {
		result.state = FightAlterationState.NEW;
		FightActionController.applyBuff(result, {
			selfTarget: true,
			stat: FightStatBuffed.DEFENSE,
			operator: FightStatModifierOperation.MULTIPLIER,
			value: 2
		}, affected, fightAction);
	}
	affected.nextFightAction = FightActionDataController.instance.getNone();
	return result;
};

export default use;