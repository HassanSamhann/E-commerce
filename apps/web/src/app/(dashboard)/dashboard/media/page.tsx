"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function MediaPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["media"],
    queryFn: () => api.get("/api/media").then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast({ title: "File deleted" });
    },
  });

  const media = data?.media ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Media Library</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{media.length} files</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : media.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
          <ImageIcon className="w-12 h-12 opacity-30" />
          <p className="text-sm">No media files yet</p>
          <p className="text-xs text-slate-400">Upload images when adding products</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((file: { id: string; url: string; filename: string; size: number }) => (
            <div
              key={file.id}
              className="group relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-square"
            >
              <Image
                src={file.url}
                alt={file.filename}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => deleteMutation.mutate(file.id)}
                  className="p-1.5 rounded-lg bg-red-500 text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate">{file.filename}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
