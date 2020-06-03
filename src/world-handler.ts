import { Message, MessageEmbed, PartialMessage } from "discord.js";
import fetch from "node-fetch";
import { METAVERSE_URL } from "./utils";

interface Domain {
	id: string;
	label: string;
	author: string;
	description: string;
	restriction: "open" | "hifi" | "acl";
	online: boolean;
	numUsers: number;
	likes: number;
	url: string;
}

export async function worldHandler(message: Message | PartialMessage) {
	const domainIds = [
		// uuidv4
		...(message.content.match(
			/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
		) || []),
		// uuidv4 without dashes as base62
		...(message.content.match(/[a-zA-Z0-9]{21,22}/g) || []),
	];

	for (const domainId of domainIds) {
		try {
			const res = await fetch(METAVERSE_URL + "/api/domain/" + domainId);
			if (res.ok == false) return;

			const domain: Domain = await res.json();

			const userImage =
				METAVERSE_URL + "/api/user/" + domain.author + "/image";
			const domainImage =
				METAVERSE_URL + "/api/domain/" + domainId + "/image";

			message.channel.send(
				new MessageEmbed({
					title: domain.label,
					description: domain.description,
					url: domain.url,
					color: 0xe91e63,
					fields: [
						{
							name: "Shareable world link",
							value: domain.url,
						},
					],
					author: {
						iconURL: userImage,
						name: domain.author,
					},
					thumbnail: {
						url: domainImage,
					},
				}),
			);
		} catch (err) {}
	}
}
