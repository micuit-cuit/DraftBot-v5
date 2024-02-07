import {DataControllerString} from "./DataController";
import {Data} from "./Data";
import {FightActionType} from "../../../Lib/src/interfaces/FightActionType";
import {Fighter} from "../core/fights/fighter/Fighter";
import {readdirSync} from "fs";
import {FightController} from "../core/fights/FightController";
import {FightActionResult} from "../../../Lib/src/interfaces/FightActionResult";

export class FightAction extends Data<string> {
	public readonly emote: string;

	public readonly breath: number;

	public readonly missionVariant: number;

	public readonly type: FightActionType;

	private _weightForRandomSelection: number;


	public use(sender: Fighter, receiver: Fighter, turn: number, fight: FightController): FightActionResult {
		const result = FightActionDataController.getFightActionFunction(this.id)(sender, receiver, this, turn, fight);
		receiver.damage(result.damages);
		return result;
	}

	/**
	 * Set the weight of the action for random selection
	 * @param weight
	 */
	public setWeightForRandomSelection(weight: number): void {
		this._weightForRandomSelection = weight;
	}


	public getWeightForRandomSelection(): number {
		return this._weightForRandomSelection;
	}
}

export type FightActionFunc = (sender: Fighter, receiver: Fighter, fightAction: FightAction, turn: number, fight: FightController) => FightActionResult;


export class FightActionDataController extends DataControllerString<FightAction> {
	static readonly instance: FightActionDataController = new FightActionDataController("fightActions");

	private static fightActionsFunctionsCache: Map<string, FightActionFunc>;

	public static getFightActionFunction(id: string): FightActionFunc {
		if (FightActionDataController.fightActionsFunctionsCache === null) {
			FightActionDataController.fightActionsFunctionsCache = new Map<string, FightActionFunc>();
			FightActionDataController.loadFightActionsFromFolder("dist/src/Core/fights/actions/interfaces/players", "TODO replace with the right one");
			FightActionDataController.loadFightActionsFromFolder("dist/src/Core/fights/actions/interfaces/monsters", "TODO replace with the right one");
		}

		return FightActionDataController.fightActionsFunctionsCache.get(id);
	}

	private static loadFightActionsFromFolder(path: string, relativePath: string): void {
		const files = readdirSync(path);
		for (const file of files) {
			if (file.endsWith(".js")) {
				const defaultFunc = require(`${relativePath}/${file.substring(0, file.length - 3)}`).default;
				const fightActionName = file.substring(0, file.length - 3);
				FightActionDataController.fightActionsFunctionsCache.set(fightActionName, defaultFunc);
			}
		}
	}

	newInstance(): FightAction {
		return new FightAction();
	}

	getNone(): FightAction {
		return this.getById("none");
	}

	getAllKeys(): string[] {
		return Object.keys(this.data);
	}

	getListById(fightActionsIds: string[]): FightAction[] {
		const fightActions: FightAction[] = [];
		for (const fightActionId of fightActionsIds) {
			fightActions.push(this.getById(fightActionId));
		}
		return fightActions;
	}
}