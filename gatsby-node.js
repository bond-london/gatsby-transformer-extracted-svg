"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchemaCustomization = exports.createResolvers = void 0;
const fs_1 = __importDefault(require("fs"));
const mini_svg_data_uri_1 = __importDefault(require("mini-svg-data-uri"));
const svgo_1 = require("svgo");
async function parseSVG(path) {
    try {
        const svg = await fs_1.default.promises.readFile(path, "utf8");
        const result = (0, svgo_1.optimize)(svg, { multipass: true });
        const encoded = (0, mini_svg_data_uri_1.default)(result.data);
        return { content: result.data, encoded, path };
    }
    catch (ex) {
        console.error("error in parse svg", path, ex);
        throw ex;
    }
}
function createResolvers(args) {
    const { createResolvers, reporter } = args;
    reporter.verbose("Creating resolvers for svg");
    const resolvers = {
        File: {
            svg: {
                type: "ExtractedSvg",
                async resolve(parent) {
                    const name = parent.absolutePath.toLowerCase();
                    reporter.verbose(`Looking at ${name}`);
                    if (name.endsWith(".svg") || name.endsWith(".svg.xml")) {
                        return await parseSVG(parent.absolutePath);
                    }
                    else {
                        return null;
                    }
                },
            },
        },
    };
    createResolvers(resolvers);
}
exports.createResolvers = createResolvers;
function createSchemaCustomization(args) {
    const { reporter, actions: { createTypes }, } = args;
    reporter.verbose("Create SVG customization");
    const typeDefs = `
    type ExtractedSvg implements Node {
      content: String!
      encoded: String!
      path: String!
    }
  `;
    createTypes(typeDefs);
}
exports.createSchemaCustomization = createSchemaCustomization;
//# sourceMappingURL=gatsby-node.js.map