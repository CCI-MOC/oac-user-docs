import { escape as url_escape } from "node:querystring";
import { HtmlBasePlugin } from "@11ty/eleventy";
import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import markdownItAnchor from "markdown-it-anchor";
import markdownItContainer from "markdown-it-container";
import pluginTOC from "eleventy-plugin-toc";

// Admonition types usable as fenced blocks in content markdown.
const ADMONITION_TYPES = ["note", "tip", "warning", "important", "caution"];

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

// Register an admonition block for each type in ADMONITION_TYPES. Blocks are
// written MyST-style and closed with a bare fence:
//
//     :::{tip}
//     Body text, parsed as markdown.
//     :::
//
// "::: tip" works too, and any text after the type becomes the heading in place
// of the capitalised type name:
//
//     :::{tip} Scale to zero
function setupAdmonitions(markdownLib) {
	ADMONITION_TYPES.forEach((type) => {
		// Matches "{tip}" or a bare "tip", then an optional custom heading.
		const opening = new RegExp(`^(?:\\{${type}\\}|${type}\\b)\\s*(.*)$`, "i");

		markdownLib.use(markdownItContainer, type, {
			validate: (params) => opening.test(params.trim()),

			render: (tokens, idx) => {
				if (tokens[idx].nesting !== 1) {
					return "</aside>\n";
				}

				// A bare ":::{tip}" reaches us with an empty info: markdown-it-attrs
				// reads the braces as a curly attribute and consumes them. Only the
				// custom heading needs info, so fall back to the type name.
				const heading = tokens[idx].info.trim().match(opening);
				const title =
					(heading && heading[1]) || type[0].toUpperCase() + type.slice(1);

				return [
					`<aside class="admonition admonition-${type}">`,
					`<p class="admonition-title">${markdownLib.renderInline(title)}</p>`,
					"",
				].join("\n");
			},
		});
	});
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

	const markdownLib = markdownIt().use(markdownItAnchor).use(markdownItAttrs);
	setupAdmonitions(markdownLib);
	eleventyConfig.setLibrary("md", markdownLib);

	// Add the TOC plugin
	eleventyConfig.addPlugin(pluginTOC, {
		tags: ["h2", "h3"], // Headings to include
		wrapper: "nav", // Wraps TOC in a <nav> element
	});

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
