export const displayPlural = (n: number, singular: string, plural?: string) =>
	n + " " + (n == 1 ? singular : plural != null ? plural : singular + "s");

export const METAVERSE_URL = "https://tivolicloud.com";
