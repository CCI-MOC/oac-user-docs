import { escape as url_escape } from "node:querystring";
import { HtmlBasePlugin } from "@11ty/eleventy";

function passthroughCopyExtension(eleventyConfig, ext) {
	[ext, ext.toUpperCase()].forEach((item, _) => {
		eleventyConfig.addPassthroughCopy(`content/**/*.${item}`);
	});
}

// Define files that should be copied into the rendered content directory.
function setupPassthroughCopy(eleventyConfig) {
	["kmz", "kml", "png", "jpg", "pdf", "txt", "gpx", "css", "js"].forEach(
		(item, _) => {
			passthroughCopyExtension(eleventyConfig, item);
		},
	);
}

// Expose current run mode as global runMode variable
function exposeRunMode(eleventyConfig) {
	let currentRunMode = "build";

	eleventyConfig.on("eleventy.before", ({ runMode }) => {
		currentRunMode = runMode;
	});

	// Make runMode available to templates
	eleventyConfig.addGlobalData("runMode", () => currentRunMode);
}

// Configure filters
function setupFilters(eleventyConfig) {
	eleventyConfig.addFilter(
		"replaceNewlines",
		(value, replacement = "<br/>") => {
			return value.replace(/(\r\n|\n|\r)/g, replacement);
		},
	);

	eleventyConfig.addFilter("lastModified", (filePath) => {
		const stats = fs.statSync(filePath);
		return stats.mtime;
	});

	// URL-escape the given string.
	eleventyConfig.addFilter("urlEscape", (url) => {
		return url_escape(url);
	});

	eleventyConfig.addFilter("pluralize", (count, singular, plural) => {
		return count === 1 ? singular : plural;
	});
}

export default function (eleventyConfig) {
	eleventyConfig.setFrontMatterParsingOptions({
		excerpt: false,
	});

	exposeRunMode(eleventyConfig);
	setupPassthroughCopy(eleventyConfig);
	setupFilters(eleventyConfig);

	// Permit setting base url from the environment.
	eleventyConfig.addPlugin(HtmlBasePlugin, {
		baseHref: process.env.ELEVENTY_HTML_BASE || "",
	});

	// This shortcode is used in the copyright notice to ensure it always shows
	// the current year.
	eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

	// Allow the use of YAML for data files
	eleventyConfig.addDataExtension("yaml", (contents) => YAML.parse(contents));

	return {
		dir: {
			input: "content",
		},
	};
}
