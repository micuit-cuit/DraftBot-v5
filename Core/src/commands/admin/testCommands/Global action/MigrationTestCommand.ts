import {ExecuteTestCommandLike, ITestCommand, TypeKey} from "../../../../core/CommandsTest";
import {LogsDatabase} from "../../../../core/database/logs/LogsDatabase";
import {GameDatabase} from "../../../../core/database/game/GameDatabase";
import {draftBotInstance} from "../../../../index";

export const commandInfo: ITestCommand = {
	name: "migration",
	commandFormat: "<database> <number>",
	typeWaited: {
		database: TypeKey.STRING,
		number: TypeKey.INTEGER
	},
	description: "Effectue une migration down de la base de données puis up à nouveau"
};

function getDatabaseFromName(databaseName: string): LogsDatabase | GameDatabase {
	if (databaseName === "logs") {
		return draftBotInstance.logsDatabase;
	}
	else if (databaseName === "game") {
		return draftBotInstance.gameDatabase;
	}
	throw new Error(`Unknown database name "${databaseName}"`);
}

/**
 * Execute the migration test command
 */
const migrationTestCommand: ExecuteTestCommandLike = async (player, args) => {
	if (player.keycloakId !== "330030648456642562") { // TODO : replace the random ID by the bot owner ID
		throw new Error("You must be the bot owner to perform this action");
	}
	const migrationNumber = parseInt(args[1], 10);

	const database = getDatabaseFromName(args[0]);

	const maxMigration = (await database.umzug.executed()).length;
	if (migrationNumber <= 0 || migrationNumber > maxMigration) {
		throw new Error(`Migration number must be between 1 and ${maxMigration}`);
	}

	await database.umzug.down({step: maxMigration - migrationNumber + 1});
	await database.umzug.up();

	return "Migration down puis up effectuée";
};

commandInfo.execute = migrationTestCommand;