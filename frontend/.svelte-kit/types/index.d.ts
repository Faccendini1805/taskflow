type DynamicRoutes = {
	"/tasks/[id]": { id: string }
};

type Layouts = {
	"/": { id?: string };
	"/login": undefined;
	"/tasks": { id?: string };
	"/tasks/[id]": { id: string }
};

export type RouteId = "/" | "/login" | "/tasks" | "/tasks/[id]";

export type RouteParams<T extends RouteId> = T extends keyof DynamicRoutes ? DynamicRoutes[T] : Record<string, never>;

export type LayoutParams<T extends RouteId> = Layouts[T] | Record<string, never>;

export type Pathname = "/" | "/login" | "/tasks" | `/tasks/${string}` & {};

export type ResolvedPathname = `${"" | `/${string}`}${Pathname}`;

export type Asset = "/favicon.ico";