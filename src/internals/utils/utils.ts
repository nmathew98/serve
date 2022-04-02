export interface Utils {
	sleep: (duration: number) => Promise<void>;
	getListenerPath: (directory: string, listenerFolder: string) => string;
	getRoutePath: (directory: string, routeFolder: string) => string;
}

export const Utils: Utils = {
	sleep: (duration: number) =>
		new Promise((resolve: (...args: any[]) => void) =>
			setTimeout(resolve, duration),
		),
	getListenerPath: (directory: string, listenerFolder: string) => {
		return `${directory}/${listenerFolder}/${listenerFolder}.ts`;
	},
	getRoutePath: (directory: string, routeFolder: string) => {
		return `${directory}/${routeFolder}/${routeFolder}.ts`;
	},
};
