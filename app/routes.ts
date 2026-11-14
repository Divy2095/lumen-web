import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";
import { documents } from "../site.config";

export default [index("routes/home.tsx"), route("auth-poc", "routes/auth-poc.tsx"), route("sign-in", "routes/sign-in.tsx"), route("sign-up", "routes/sign-up.tsx"), layout("layouts/docs.tsx", documents.map(doc => route(doc.path, doc.file)))] satisfies RouteConfig;
