// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { CallHttpRequestActionRequest } from "./CallHttpRequestActionRequest";
import type { CallTemplateFunctionRequest } from "./CallTemplateFunctionRequest";
import type { CallTemplateFunctionResponse } from "./CallTemplateFunctionResponse";
import type { CopyTextRequest } from "./CopyTextRequest";
import type { EmptyResponse } from "./EmptyResponse";
import type { ExportHttpRequestRequest } from "./ExportHttpRequestRequest";
import type { ExportHttpRequestResponse } from "./ExportHttpRequestResponse";
import type { FilterRequest } from "./FilterRequest";
import type { FilterResponse } from "./FilterResponse";
import type { FindHttpResponsesRequest } from "./FindHttpResponsesRequest";
import type { FindHttpResponsesResponse } from "./FindHttpResponsesResponse";
import type { GetHttpRequestActionsRequest } from "./GetHttpRequestActionsRequest";
import type { GetHttpRequestActionsResponse } from "./GetHttpRequestActionsResponse";
import type { GetHttpRequestByIdRequest } from "./GetHttpRequestByIdRequest";
import type { GetHttpRequestByIdResponse } from "./GetHttpRequestByIdResponse";
import type { GetTemplateFunctionsResponse } from "./GetTemplateFunctionsResponse";
import type { ImportRequest } from "./ImportRequest";
import type { ImportResponse } from "./ImportResponse";
import type { PluginBootRequest } from "./PluginBootRequest";
import type { PluginBootResponse } from "./PluginBootResponse";
import type { PluginReloadRequest } from "./PluginReloadRequest";
import type { PluginReloadResponse } from "./PluginReloadResponse";
import type { RenderHttpRequestRequest } from "./RenderHttpRequestRequest";
import type { RenderHttpRequestResponse } from "./RenderHttpRequestResponse";
import type { SendHttpRequestRequest } from "./SendHttpRequestRequest";
import type { SendHttpRequestResponse } from "./SendHttpRequestResponse";
import type { ShowToastRequest } from "./ShowToastRequest";

export type InternalEventPayload = { "type": "boot_request" } & PluginBootRequest | { "type": "boot_response" } & PluginBootResponse | { "type": "reload_request" } & PluginReloadRequest | { "type": "reload_response" } & PluginReloadResponse | { "type": "import_request" } & ImportRequest | { "type": "import_response" } & ImportResponse | { "type": "filter_request" } & FilterRequest | { "type": "filter_response" } & FilterResponse | { "type": "export_http_request_request" } & ExportHttpRequestRequest | { "type": "export_http_request_response" } & ExportHttpRequestResponse | { "type": "send_http_request_request" } & SendHttpRequestRequest | { "type": "send_http_request_response" } & SendHttpRequestResponse | { "type": "get_http_request_actions_request" } & GetHttpRequestActionsRequest | { "type": "get_http_request_actions_response" } & GetHttpRequestActionsResponse | { "type": "call_http_request_action_request" } & CallHttpRequestActionRequest | { "type": "get_template_functions_request" } | { "type": "get_template_functions_response" } & GetTemplateFunctionsResponse | { "type": "call_template_function_request" } & CallTemplateFunctionRequest | { "type": "call_template_function_response" } & CallTemplateFunctionResponse | { "type": "copy_text_request" } & CopyTextRequest | { "type": "render_http_request_request" } & RenderHttpRequestRequest | { "type": "render_http_request_response" } & RenderHttpRequestResponse | { "type": "show_toast_request" } & ShowToastRequest | { "type": "get_http_request_by_id_request" } & GetHttpRequestByIdRequest | { "type": "get_http_request_by_id_response" } & GetHttpRequestByIdResponse | { "type": "find_http_responses_request" } & FindHttpResponsesRequest | { "type": "find_http_responses_response" } & FindHttpResponsesResponse | { "type": "empty_response" } & EmptyResponse;
