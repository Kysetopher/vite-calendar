import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, FileImage, FileText, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const documentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  fileUrl: z.string().min(1, "File is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().min(1, "File size is required"),
  documentType: z.string().optional(),
});

export type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentUploadFormProps {
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function DocumentUploadForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: DocumentUploadFormProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: "",
      fileUrl: "",
      fileType: "",
      fileSize: 0,
      documentType: "general",
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);

      const fileReference = `document_${Date.now()}_${file.name}`;

      form.setValue("name", file.name);
      form.setValue("fileUrl", fileReference);
      form.setValue("fileType", file.type);
      form.setValue("fileSize", file.size);
      form.setValue("documentType", "general");
    }
  };

  const handleSubmit = (data: DocumentFormData) => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", data.name);
    formData.append("documentType", data.documentType || "general");

    onSubmit(formData);
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) {
      return <File className="w-6 h-6 text-gray-600" />;
    }
    if (fileType.includes("image")) {
      return <FileImage className="w-6 h-6 text-blue-600" />;
    } else if (fileType.includes("pdf")) {
      return <FileText className="w-6 h-6 text-red-600" />;
    } else {
      return <File className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
            Choose File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
            </label>
          </div>
        </div>

        {selectedFile && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter document name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedFile(null);
              form.reset();
              onCancel();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedFile || isSubmitting} className="bg-green-600 hover:bg-green-700">
            {isSubmitting ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
