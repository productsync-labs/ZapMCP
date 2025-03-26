import { EventEmitter } from "events";
import { StrictEventEmitter } from "strict-event-emitter-types";
import { ZapMCPEvents, ZapMCPSessionAuth, ZapMCPSessionEvents } from "./types.js";

export const ZapMCPSessionEventEmitterBase: {
  new (): StrictEventEmitter<EventEmitter, ZapMCPSessionEvents>;
} = EventEmitter;

export class ZapMCPSessionEventEmitter extends ZapMCPSessionEventEmitterBase {}

export const ZapMCPEventEmitterBase: {
  new (): StrictEventEmitter<EventEmitter, ZapMCPEvents<ZapMCPSessionAuth>>;
} = EventEmitter;

export class ZapMCPEventEmitter extends ZapMCPEventEmitterBase {}