import { Client } from "discord.js";
import * as dotenv from "dotenv";
import { reloadStats } from "./reload-stats";
import { worldHandler } from "./world-handler";
import { tryIgnore } from "./utils";
import { inWorldRole, verifyInWorldRole } from "./in-world-role";

dotenv.config();

const client = new Client();

let interval: NodeJS.Timeout;

client.on("ready", () => {
	console.log("Logged in as " + client.user.tag);

	tryIgnore(() => reloadStats(client));
	tryIgnore(() => verifyInWorldRole(client));

	interval = setInterval(() => {
		tryIgnore(() => reloadStats(client));
		tryIgnore(() => verifyInWorldRole(client));
	}, 1000 * 60 * 5);

	// disabled since https://tivoli.link/... already gives metadata
	// client.on("message", message => {
	// 	tryIgnore(() => worldHandler(message));
	// });

	client.on("presenceUpdate", (oldPresence, newPresence) => {
		tryIgnore(() => inWorldRole(newPresence, client));
	});
});

client.on("disconnect", () => {
	clearInterval(interval);
});

if (process.env.DISCORD_TOKEN) {
	client.login(process.env.DISCORD_TOKEN);
} else {
	throw new Error("DISCORD_TOKEN not provided");
}
