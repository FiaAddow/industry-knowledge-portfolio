import { SanityClient } from "sanity";
import { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";

export function getImageUrlBuilder(client: SanityClient): ImageUrlBuilder {
  return new ImageUrlBuilder(client);
}

 