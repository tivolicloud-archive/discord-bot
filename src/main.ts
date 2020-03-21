import { CategoryChannel, Client } from "discord.js";
import * as dotenv from "dotenv";
import fetch from "node-fetch";
import * as moment from "moment";

dotenv.config();

const client = new Client();

const displayPlural = (n: number, singular: string, plural?: string) =>
	n + " " + (n == 1 ? singular : plural != null ? plural : singular + "s");

const reloadStats = async () => {
	// find category
	const statsCategory: CategoryChannel = client.channels.cache.find(
		channel =>
			channel.type == "category" &&
			((channel as any).name as string).toLowerCase() == "tivoli stats",
	) as CategoryChannel;
	if (statsCategory == null) throw new Error("Stats category not found");

	const channels = statsCategory.children
		.array()
		.sort((a, b) => a.position - b.position);

	// get data
	const res = await fetch("https://alpha.tivolicloud.com/api/domains/stats");
	const data: {
		onlineUsers: number;
		onlineDomains: number;
	} = await res.json();

	const stats = [
		"Current Tivoli stats (" +
			moment()
				.utc()
				.format("HH:mm") +
			" UTC)",

		"👪 " + displayPlural(data.onlineUsers, "user") + " online",
		"🌎 " + displayPlural(data.onlineDomains, "world") + " online",
	];

	// delete channels more than stats array length
	channels.forEach((channel, i) => {
		if (i > stats.length - 1) channel.delete();
	});

	// update channels in correct order
	stats.forEach((name, i) => {
		if (channels[i] != null) {
			channels[i].edit({
				name,
				userLimit: 0,
				position: i,
			});
		} else {
			statsCategory.guild.channels.create(name, {
				type: "voice",
				parent: statsCategory,
				userLimit: 0,
				position: i,
			});
		}
	});
};

let reloadStatsInterval: NodeJS.Timeout;

client.on("ready", () => {
	console.log("Logged in as " + client.user.tag);

	reloadStats();
	reloadStatsInterval = setInterval(reloadStats, 1000 * 60 * 5);
});

client.on("disconnect", () => {
	clearInterval(reloadStatsInterval);
});

if (process.env.DISCORD_TOKEN) {
	client.login(process.env.DISCORD_TOKEN);
} else {
	throw new Error("DISCORD_TOKEN not provided");
}
