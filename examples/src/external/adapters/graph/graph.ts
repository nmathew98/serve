import { Graph as SudokuGraph } from "../../../entities/sudoku/sudoku";
import Graphology from "graphology";

const Graph: SudokuGraph = {
	create: options => {
		return new Graphology(options);
	},
	size: (graph: Graphology) => {
		return graph.size;
	},
	addEdge: (x, y, graph: Graphology) => {
		graph.addEdge(x, y);
	},
	addNode: (node, attributes, graph: Graphology) => {
		graph.addNode(~node, attributes);
	},
	setNodeAttribute: (node, attribute, value, graph: Graphology) => {
		graph.setNodeAttribute(node, attribute, value);
	},
	getNodeAttribute: (node, attribute, graph: Graphology) => {
		return graph.getNodeAttribute(node, attribute);
	},
	clearEdges: (graph: Graphology) => {
		graph.clearEdges();
	},
	neighbors: (node, graph: Graphology) => {
		return graph.neighbors(node).map(node => ~node);
	},
	mapNodes: (callback, graph: Graphology) => {
		return graph.mapNodes(callback);
	},
};

export default Graph;
