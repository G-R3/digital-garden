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

const findNodeByPath = (children: Node[], slug: string): Node | null => {
  for (const child of children) {
    if (child.$id === slug) {
      return child;
    }

    if (child.type === "folder") {
      const found = findNodeByPath(child.children, slug);
      if (found) return found;
    }
  }

  return null;
};

const getTopicsUnderNode = (node: Node): TopicInfo[] => {
  if (node.type !== "folder") return [];

  const topics: TopicInfo[] = node.children
    .map((child): TopicInfo | null => {
      if (child.type === "page") {
        if (child.$id?.endsWith("/index.mdx")) {
          return null;
        }

        return {
          url: child.url,
          name: child.name,
          description: child.description,
        };
      }
      if (child.type === "folder") {
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
