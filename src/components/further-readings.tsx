import type { Node } from "fumadocs-core/page-tree";
import { source } from "@/lib/source";
import { Card } from "fumadocs-ui/components/card";
import { Cards } from "fumadocs-ui/components/card";
import type { ReactNode } from "react";

interface TopicInfo {
  url: string;
  name: ReactNode;
  description?: ReactNode;
}

// Helper function to find a node in the page tree by its full path
const findNodeByPath = (children: Node[], slug: string): Node | null => {
  for (const child of children) {
    // Check if this child's $id matches our slug
    if (child.$id === slug) {
      return child;
    }

    // If this is a folder, recursively search its children
    if (child.type === "folder") {
      const found = findNodeByPath(child.children, slug);
      if (found) return found;
    }
  }

  return null;
};

// Get all topics (pages and folders) under a given parent node
const getTopicsUnderNode = (node: Node): TopicInfo[] => {
  if (node.type !== "folder") return [];

  // Get the index URL to exclude it from the list
  const indexUrl = node.index?.url;
  const topics: TopicInfo[] = node.children
    .map((child): TopicInfo | null => {
      if (child.type === "page") {
        // Skip if this is the index page (either by URL match or by checking if $id ends with /index.mdx)
        if (child.url === indexUrl || child.$id?.endsWith("/index.mdx")) {
          return null;
        }

        return {
          url: child.url,
          name: child.name,
          description: child.description,
        };
      }
      if (child.type === "folder") {
        // For folders, use the index page if it exists
        const firstChild = child.children[0];
        const url =
          child.index?.url ||
          (firstChild && firstChild.type === "page" ? firstChild.url : "");
        if (!url) return null;

        return {
          url,
          name: child.name || child.index?.name || "",
          description: child.index?.description,
        };
      }
      return null;
    })
    .filter((topic): topic is TopicInfo => topic !== null);

  return topics;
};

export function FurtherReadings({ slug }: { slug: string }) {
  // Find the node in the page tree by its full path
  const node = findNodeByPath(source.pageTree.children, slug);

  if (!node || node.type !== "folder") return null;

  const topics = getTopicsUnderNode(node);

  if (topics.length === 0) return null;

  return (
    <Cards>
      {topics.map((topic) => (
        <Card key={topic.url} title={topic.name} href={topic.url}>
          {topic.description}
        </Card>
      ))}
    </Cards>
  );
}
