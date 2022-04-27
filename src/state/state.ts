import { buildMakeContext } from "../context/context";
import makeRef, { Ref } from "../ref/ref";

const makeContext = buildMakeContext();

const states = makeContext();

export default function useState<T = any>(
	key: string,
	initializor: (...args: T[]) => T,
): Ref<T> {
	if (!states.has(key)) states.set(key, makeRef(initializor()));

	return states.get(key);
}
