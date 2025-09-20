"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { getAssets, uploadAsset, deleteAsset } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Trash2, Upload } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function FileManager() {
  const [assets, setAssets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, startUploading] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const { toast } = useToast();

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const assetList = await getAssets();
      setAssets(assetList);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching assets",
        description: "Could not load the asset list.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    startUploading(async () => {
      try {
        await uploadAsset(formData);
        toast({
          title: "Success!",
          description: "Your file has been uploaded.",
        });
        fetchAssets(); // Refresh asset list
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: error.message,
        });
      }
    });
  };
  
  const handleDelete = (assetPath: string) => {
    const filename = assetPath.split("/").pop()!;
     startDeleting(async () => {
      try {
        await deleteAsset(filename);
        toast({
          title: "Success!",
          description: "Asset has been deleted.",
        });
        fetchAssets(); // Refresh asset list
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: error.message,
        });
      }
    });
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Path copied to clipboard.",
    });
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex gap-2">
        <label htmlFor="file-upload" className="flex-1">
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Button asChild disabled={isUploading}>
            <span className="cursor-pointer">
              <Upload className="mr-2" />
              {isUploading ? "Uploading..." : "Upload Asset"}
            </span>
          </Button>
        </label>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))
          ) : assets.length > 0 ? (
            assets.map((asset) => (
              <div key={asset} className="relative group border rounded-md overflow-hidden">
                <Image
                  src={asset}
                  alt={asset}
                  width={150}
                  height={150}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(asset)}>
                    <Copy className="text-white" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="ghost" size="icon">
                        <Trash2 className="text-white" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the asset.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(asset)} disabled={isDeleting}>
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          ) : (
             <div className="col-span-full text-center text-muted-foreground py-10">
                No assets found. Upload one to get started.
             </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
