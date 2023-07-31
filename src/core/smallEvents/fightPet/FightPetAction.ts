import {Translations} from "../../Translations";
import {Data} from "../../Data";
import Player from "../../database/game/models/Player";
import {FeralPet} from "../../database/game/models/FeralPet";

/**
 * The base class for the different events that can happen after the player encounters a feral pet
 */
export abstract class FightPetAction {
	public readonly name: string;

	public tags: string[] = []; // tags for mission completion

	public linkedPetId: number[] = []; // all the pet ids that have this action as one of their actions

	private emojiCache: string;

	protected constructor(name: string) {
		this.name = name;
	}

	/**
	 * return the name of the attack as it will appear in the list of actions
	 * @param language
	 * @param forceEndOfStringEmojiPlacement
	 */
	public toString(language: string, forceEndOfStringEmojiPlacement: boolean): string {
		return forceEndOfStringEmojiPlacement ?
			`${Translations.getModule("smallEvents.fightPet", language).get(`fightPetActions.${this.name}.name`)} ${this.getEmoji()}`
			: `${this.getEmoji()} ${Translations.getModule("smallEvents.fightPet", language).get(`fightPetActions.${this.name}.name`)}`;
	}

	/**
	 * return the emoji that is used to represent the action
	 */
	public getEmoji(): string {
		this.emojiCache = this.emojiCache ?? Data.getModule("smallEvents.fightPet").getString(`fightPetActionEmotes.${this.name}`);
		return this.emojiCache;
	}

	/**
	 * return the array of all the ids of pet that have this action as one of their actions
	 */
	public getPetIds(): number[] {
		return this.linkedPetId;
	}


	/**
	 * Apply the outcome of the action
	 * @param player
	 * @param feralPet
	 * @return true if the action was successful, false otherwise
	 */
	public abstract applyOutcome(player: Player, feralPet: FeralPet): Promise<boolean> | boolean;
}