import {DataTypes, QueryInterface} from "sequelize";
import {classesAttributes001, itemAttributes001, missionsAttributes001, petAttributes001} from "./001-initial-database";
import {leaguesAttributes008} from "./008-gloryandleague";
import {monsterLocationsAttributes011} from "./011-pve";

export async function up({context}: { context: QueryInterface }): Promise<void> {
	await context.dropTable("armors");
	await context.dropTable("classes");
	await context.dropTable("leagues");
	await context.dropTable("map_links");
	await context.dropTable("map_locations");
	await context.dropTable("missions");
	await context.dropTable("monsters");
	await context.dropTable("monster_attacks");
	await context.dropTable("monster_locations");
	await context.dropTable("objects");
	await context.dropTable("pets");
	await context.dropTable("potions");
	await context.dropTable("weapons");
}

export async function down({context}: { context: QueryInterface }): Promise<void> {
	await context.createTable("armors", itemAttributes001);
	await context.createTable("classes", classesAttributes001);
	await context.createTable("leagues", leaguesAttributes008);
	await context.createTable("map_links", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		startMap: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		endMap: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		tripDuration: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		forcedImage: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		updatedAt: DataTypes.DATE,
		createdAt: DataTypes.DATE
	});
	await context.createTable("map_locations", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		type: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		nameFr: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		nameEn: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		descFr: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		descEn: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		particleFr: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		particleEn: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		canBeGoToPlaceMissionDestination: {
			type: DataTypes.BOOLEAN,
			allowNull: false
		},
		attribute: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		forcedImage: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		updatedAt: DataTypes.DATE,
		createdAt: DataTypes.DATE
	});
	await context.createTable("missions", missionsAttributes001);
	await context.createTable("monsters", {
		id: {
			// eslint-disable-next-line new-cap
			type: DataTypes.STRING(64),
			primaryKey: true
		},
		fr: {
			// eslint-disable-next-line new-cap
			type: DataTypes.STRING(64),
			allowNull: false
		},
		en: {
			// eslint-disable-next-line new-cap
			type: DataTypes.STRING(64),
			allowNull: false
		},
		fightPointsRatio: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		attackRatio: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		defenseRatio: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		speedRatio: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		breath: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		maxBreath: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		breathRegen: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		updatedAt: DataTypes.DATE,
		createdAt: DataTypes.DATE
	});
	await context.createTable("monster_attacks", {
		monsterId: {
			// eslint-disable-next-line new-cap
			type: DataTypes.STRING(64),
			allowNull: false
		},
		attackId: {
			// eslint-disable-next-line new-cap
			type: DataTypes.STRING(64),
			allowNull: false
		},
		minLevel: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		weight: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1
		},
		updatedAt: DataTypes.DATE,
		createdAt: DataTypes.DATE
	});
	await context.createTable("monster_locations", monsterLocationsAttributes011);
	await context.createTable("objects", itemAttributes001);
	await context.createTable("pets", petAttributes001);
	await context.createTable("potions", itemAttributes001);
	await context.createTable("weapons", itemAttributes001);
}