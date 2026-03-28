import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ContentType,
  type GeneratedContent,
  Language,
  Length,
  type RewriteRequest,
  Tone,
} from "../backend";
import { useActor } from "./useActor";

export { ContentType, Tone, Length, Language };
export type { GeneratedContent, RewriteRequest };

export function useGetHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<GeneratedContent[]>({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllTemplates() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, string]>>({
    queryKey: ["templates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTemplates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      contentType,
      tone,
      length,
      language,
      prompt,
    }: {
      contentType: ContentType;
      tone: Tone;
      length: Length;
      language: Language;
      prompt: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.generateContent(contentType, tone, length, language, prompt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

export function useRewriteText() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (request: RewriteRequest) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.rewriteText(request);
    },
  });
}
