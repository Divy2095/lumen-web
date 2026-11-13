import type { Config } from "@react-router/dev/config";
import { basePath } from "./site.config.ts";

export default {
  basename: basePath,
  ssr: false,
  prerender: true,
} satisfies Config;
