import {readdirSync} from "fs";
import {WitchEvent} from "./WitchEvent";
import {RandomUtils} from "../utils/RandomUtils";

export class WitchEvents {
	static witchEvents: Map<string, WitchEvent> = null;

	/**
	 * populate a map will all the witchEvents and their ids
	 */
	static initWitchEventsMap(): void {
		const files = readdirSync("dist/src/core/witch/interfaces");
		WitchEvents.witchEvents = new Map();
		for (const file of files) {
			if (file.endsWith(".js")) {
				const DefaultClass = require(`./interfaces/${file}`).default;
				if (!DefaultClass) {
					console.warn(`${file} doesn't have a default export`);
					return;
				}
				const fightActionName = file.substring(0, file.length - 3);
				const witchEventInstance = new DefaultClass(fightActionName);
				if (!(witchEventInstance instanceof WitchEvent)) {
					console.warn(`${file} initialized instance is incorrect`);
					return;
				}
				WitchEvents.witchEvents.set(fightActionName, witchEventInstance);
			}
		}
	}

	/**
	 * allow to get a specific witch event
	 * @param id
	 */
	static getWitchEventById(id: string): WitchEvent | null {
		if (!WitchEvents.witchEvents) {
			WitchEvents.initWitchEventsMap();
		}
		return WitchEvents.witchEvents.get(id);
	}

	/**
	 * Get a random witchEvent from all the possible one given a type of witchEvent (ingredient or actions)
	 * @param type
	 */
	static getRandomWitchEventByType(type: number): WitchEvent | null {
		if (!WitchEvents.witchEvents) {
			WitchEvents.initWitchEventsMap();
		}
		const possibleWitchEvents = Array.from(WitchEvents.witchEvents.values()).filter((witchEvent) => witchEvent.type === type);

		return RandomUtils.draftbotRandom.pick(possibleWitchEvents);
	}


}