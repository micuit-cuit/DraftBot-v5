import {DataControllerString} from "./DataController";
import {Data} from "./Data";
import Player from "../core/database/game/models/Player";
import {readdirSync} from "fs";
import {RandomUtils} from "../core/utils/RandomUtils";
import {Pet} from "./Pet";

/**
 * The base class for the different events that can happen after the player encounters a feral pet
 */
export class FightPetAction extends Data<string> {
	public readonly emoji: string;

	public applyOutcomeFightPetAction(player: Player, pet: Pet, isFemale: boolean): boolean | Promise<boolean> {
		return FightPetActionDataController.getFightPetActionFunction(this.id)(player, pet, isFemale);
	}
}

export type FightPetActionFunc = (player: Player, pet: Pet, isFemale: boolean) => boolean | Promise<boolean>;

export class FightPetActionDataController extends DataControllerString<FightPetAction> {

	static readonly instance = new FightPetActionDataController("fightPetActions");

	private static fightPetActionsFunctionsCache: Map<string, FightPetActionFunc>;

	public static getFightPetActionFunction(id: string): FightPetActionFunc {
		if (FightPetActionDataController.fightPetActionsFunctionsCache === null) {
			FightPetActionDataController.fightPetActionsFunctionsCache = new Map<string, FightPetActionFunc>();
			FightPetActionDataController.loadFightPetActionsFromFolder("dist/src/Core/smallEvents/fightPet", "TODO replace with the right one");
		}
		return FightPetActionDataController.fightPetActionsFunctionsCache.get(id);
	}

	private static loadFightPetActionsFromFolder(path: string, relativePath: string): void {
		const files = readdirSync(path);
		for (const file of files) {
			if (file.endsWith(".js")) {
				const defaultFunc = require(`${relativePath}/${file.substring(0, file.length - 3)}`).default;
				const fightPetActionName = file.substring(0, file.length - 3);
				FightPetActionDataController.fightPetActionsFunctionsCache.set(fightPetActionName, defaultFunc);
			}
		}
	}

	public getRandomFightPetAction(excludedFightPetActions: FightPetAction[]): FightPetAction {
		return RandomUtils.draftbotRandom.pick(Array.from(this.data.values()).filter((fightPetAction) => !excludedFightPetActions.includes(fightPetAction)));
	}

	public getFightPetActionByEmoji(emoji: string): FightPetAction {
		return Array.from(this.data.values()).find((fightPetAction) => fightPetAction.emoji === emoji);
	}

	newInstance(): FightPetAction {
		return new FightPetAction();
	}

	getNothing(): FightPetAction {
		return this.getById("doNothing");
	}
}