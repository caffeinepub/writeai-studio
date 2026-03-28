import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface RewriteOptions {
    simplify: boolean;
    translate: boolean;
    makeProfessional: boolean;
    targetLanguage?: Language;
    makeEmotional: boolean;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface GeneratedContent {
    id: string;
    contentType: ContentType;
    tone: Tone;
    language: Language;
    length: Length;
    timestamp: bigint;
    generatedText: string;
    originalPrompt: string;
}
export interface RewriteRequest {
    originalText: string;
    tone: Tone;
    language: Language;
    options: RewriteOptions;
}
export interface http_header {
    value: string;
    name: string;
}
export enum ContentType {
    resume = "resume",
    tamilContent = "tamilContent",
    blog = "blog",
    script = "script",
    email = "email",
    story = "story",
    template = "template",
    socialMedia = "socialMedia"
}
export enum Language {
    tamil = "tamil",
    hinglish = "hinglish",
    english = "english"
}
export enum Length {
    long_ = "long",
    short_ = "short",
    medium = "medium"
}
export enum Tone {
    funny = "funny",
    casual = "casual",
    emotional = "emotional",
    formal = "formal"
}
export interface backendInterface {
    generateContent(contentType: ContentType, tone: Tone, length: Length, language: Language, prompt: string): Promise<string>;
    getAllTemplates(): Promise<Array<[string, string]>>;
    getHistory(): Promise<Array<GeneratedContent>>;
    getTemplate(templateName: string): Promise<string>;
    rewriteText(rewriteRequest: RewriteRequest): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
