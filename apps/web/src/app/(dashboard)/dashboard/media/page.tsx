"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImages,
  faCircleNotch,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
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
      toast({ title: "تم حذف الملف بنجاح" });
    },
  });

  const media = data?.media ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">Media Library</h1>
        <p className="text-[13px] text-[#86868b] mt-0.5">{media.length} files stored</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <FontAwesomeIcon icon={faCircleNotch} className="w-8 h-8 animate-spin text-[#0066cc] dark:text-[#2997ff]" />
        </div>
      ) : media.length === 0 ? (
        <div className="apple-card flex flex-col items-center justify-center h-64 gap-3 text-[#86868b]">
          <FontAwesomeIcon icon={faImages} className="w-10 h-10 opacity-30" />
          <p className="text-[14px]">No media files uploaded yet</p>
          <p className="text-xs text-[#86868b]">Upload images when creating or editing products</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((file: { id: string; url: string; filename: string; size: number }) => (
            <div
              key={file.id}
              className="group relative rounded-2xl overflow-hidden bg-[#f5f5f7] dark:bg-[#272729] aspect-square border border-black/[0.04] dark:border-white/[0.06]"
            >
              <Image
                src={file.url}
                alt={file.filename}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => deleteMutation.mutate(file.id)}
                  className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-[11px] truncate font-medium">{file.filename}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
