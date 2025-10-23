import { getPageTreePeers } from "fumadocs-core/page-tree";
import { source } from "@/lib/source";
import { Card } from "fumadocs-ui/components/card";
import { Cards } from "fumadocs-ui/components/card";

export function FurtherReadings({ slug }: { slug: string }) {
  return (
    <Cards>
      {getPageTreePeers(source.pageTree, `/${slug}`).map((peer) => (
        <Card key={peer.url} title={peer.name} href={peer.url}>
          {peer.description}
        </Card>
      ))}
    </Cards>
  );
}
