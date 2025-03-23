import { EventEmitter } from "events";
import { StrictEventEmitter } from "strict-event-emitter-types";
import { FastMCPEvents, FastMCPSessionAuth, FastMCPSessionEvents } from "./types.js";

export const FastMCPSessionEventEmitterBase: {
  new (): StrictEventEmitter<EventEmitter, FastMCPSessionEvents>;
} = EventEmitter;

export class FastMCPSessionEventEmitter extends FastMCPSessionEventEmitterBase {}

export const FastMCPEventEmitterBase: {
  new (): StrictEventEmitter<EventEmitter, FastMCPEvents<FastMCPSessionAuth>>;
} = EventEmitter;

export class FastMCPEventEmitter extends FastMCPEventEmitterBase {}