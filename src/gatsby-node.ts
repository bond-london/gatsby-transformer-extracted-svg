import { CreateResolversArgs, CreateSchemaCustomizationArgs } from "gatsby";
import { readFile } from "fs/promises";
import svgToTinyDataUri from "mini-svg-data-uri";
import { optimize } from "svgo";
import { FileSystemNode } from "gatsby-source-filesystem";

async function parseSVG(path: string) {
  try {
    const svg = await readFile(path, "utf8");
    const result = optimize(svg, { multipass: true });
    const encoded = svgToTinyDataUri(result.data);
    return { content: result.data, encoded, path };
  } catch (ex) {
    console.error("error in parse svg", path, ex);
    throw ex;
  }
}

export function createResolvers(args: CreateResolversArgs) {
  const { createResolvers, reporter } = args;
  reporter.verbose("Creating resolvers for svg");
  const resolvers = {
    File: {
      svg: {
        type: "ExtractedSvg",
        async resolve(parent: FileSystemNode) {
          const name = parent.absolutePath.toLowerCase();
          reporter.verbose(`Looking at ${name}`);
          if (name.endsWith(".svg") || name.endsWith(".svg.xml")) {
            return await parseSVG(parent.absolutePath);
          } else {
            return null;
          }
        },
      },
    },
  };
  createResolvers(resolvers);
}

export function createSchemaCustomization(args: CreateSchemaCustomizationArgs) {
  const {
    reporter,
    actions: { createTypes },
  } = args;
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
