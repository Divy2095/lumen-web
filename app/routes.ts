import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";
import { documents } from "../site.config";

export default [index("routes/home.tsx"), layout("layouts/docs.tsx", documents.map(doc => route(doc.path, doc.file)))] satisfies RouteConfig;
