import { Client, Presence, Role } from "discord.js";

function isInWorld(presence: Presence, client: Client) {
	return presence.activities.some(
		activity => activity.applicationID == client.user.id,
	);
}

const findInWorldRole = (role: Role) => role.name.toLowerCase() == "in-world";

export function inWorldRole(presence: Presence, client: Client) {
	const member = presence.member;
	const guild = presence.guild;

	const inWorld = isInWorld(presence, client);
	const role = guild.roles.cache.find(findInWorldRole);
	const hasRole = member.roles.cache.find(findInWorldRole) != null;

	if (inWorld != hasRole) {
		// console.log(member.displayName, inWorld ? "in world" : "not in world");
		if (inWorld) {
			member.roles.add(role);
		} else {
			member.roles.remove(role);
		}
	}
}

export function verifyInWorldRole(client: Client) {
	client.guilds.cache.forEach(guild => {
		guild.members.cache.forEach(member => {
			inWorldRole(member.presence, client);
		});
	});
}
