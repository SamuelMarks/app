// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { GrpcEventType } from "./GrpcEventType";

export type GrpcEvent = { id: string, model: "grpc_event", workspaceId: string, requestId: string, connectionId: string, createdAt: string, updatedAt: string, content: string, eventType: GrpcEventType, metadata: { [key: string]: string }, status: number | null, error: string | null, };
