export interface Utils {
	sleep: (duration: number) => Promise<void>;
	getListenerPath: (directory: string, listenerFolder: string) => string;
	getRoutePath: (directory: string, routeFolder: string) => string;
}

export const Utils: Utils = {
	sleep: duration =>
		new Promise((resolve: (...args: any[]) => void) =>
			setTimeout(resolve, duration),
		),
	getListenerPath: (directory, listenerFolder) => {
		return `${directory}/${listenerFolder}/${listenerFolder}.ts`;
	},
	getRoutePath: (directory, routeFolder) => {
		return `${directory}/${routeFolder}/${routeFolder}.ts`;
	},
};
