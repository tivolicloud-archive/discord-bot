import { CategoryChannel, Client } from "discord.js";
import * as moment from "moment";
import fetch from "node-fetch";
import { displayPlural, METAVERSE_URL } from "./utils";

export const reloadStats = async (client: Client) => {
	// find category
	const statsCategory: CategoryChannel = client.channels.cache.find(
		channel =>
			channel.type == "category" &&
			((channel as any).name as string)
				.toLowerCase()
				.startsWith("tivoli stats"),
	) as CategoryChannel;
	if (statsCategory == null) throw new Error("Stats category not found");

	const channels = statsCategory.children
		.array()
		.sort((a, b) => a.position - b.position);

	// get data
	const res = await fetch(METAVERSE_URL + "/api/domains/stats");
	const data: {
		onlineUsers: number;
		onlineDomains: number;
	} = await res.json();

	const stats = [
		"👪 " + displayPlural(data.onlineUsers, "user") + " online",
		"🌎 " + displayPlural(data.onlineDomains, "world") + " online",
	];

	// update channel name
	statsCategory.setName(
		"Tivoli Stats (" + moment().utc().format("HH:mm") + " UTC)",
	);

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
