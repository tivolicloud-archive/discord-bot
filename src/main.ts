import { Client } from "discord.js";
import * as dotenv from "dotenv";
import { reloadStats } from "./reload-stats";
import { worldHandler } from "./world-handler";

dotenv.config();

const client = new Client();

let reloadStatsInterval: NodeJS.Timeout;

client.on("ready", () => {
	console.log("Logged in as " + client.user.tag);

	try {
		reloadStats(client);
	} catch (err) {}
	reloadStatsInterval = setInterval(() => {
		try {
			reloadStats(client);
		} catch (err) {}
	}, 1000 * 60 * 5);

	client.on("message", message => {
		try {
			worldHandler(message);
		} catch (err) {}
	});
});

client.on("disconnect", () => {
	clearInterval(reloadStatsInterval);
});

if (process.env.DISCORD_TOKEN) {
	client.login(process.env.DISCORD_TOKEN);
} else {
	throw new Error("DISCORD_TOKEN not provided");
}
