// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { EnvironmentVariable } from "./EnvironmentVariable";

export type Workspace = { id: string, model: "workspace", createdAt: string, updatedAt: string, name: string, description: string, variables: Array<EnvironmentVariable>, settingValidateCertificates: boolean, settingFollowRedirects: boolean, settingRequestTimeout: number, };
