type DynamicRoutes = {
	
};

type Layouts = {
	"/": undefined;
	"/tasks": undefined
};

export type RouteId = "/" | "/tasks";

export type RouteParams<T extends RouteId> = T extends keyof DynamicRoutes ? DynamicRoutes[T] : Record<string, never>;

export type LayoutParams<T extends RouteId> = Layouts[T] | Record<string, never>;

export type Pathname = "/" | "/tasks";

export type ResolvedPathname = `${"" | `/${string}`}${Pathname}`;

export type Asset = "/robots.txt";