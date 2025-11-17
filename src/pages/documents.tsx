import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Upload, 
  FileText, 
  FileImage, 
  File, 
  Download, 
  Trash2,
  Users,
  ArrowRight,
  Plus
} from "lucide-react";

import Layout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { fetchWithAuthRefresh } from "@/lib/queryClient";
import type { Document } from "@/utils/schema/document";
import Loading from "@/components/Loading.tsx";
import DocumentUploadDialog from "@/components/dialog/DocumentUploadDialog";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Documents() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents"],
    enabled: isAuthenticated,
    retry: false,
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Use fetch directly for FormData uploads
      const response = await fetchWithAuthRefresh(`${API_BASE_URL}/api/documents`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsDialogOpen(false);
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("Unauthorized") || message.includes("401")) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Upload failed",
        description: message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await fetchWithAuthRefresh(`${API_BASE_URL}/api/documents/${documentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully.",
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("Unauthorized") || message.includes("401")) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Delete failed",
        description: message || "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteDocument = (documentId: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocumentMutation.mutate(documentId);
    }
  };




  const getFileIcon = (fileType?: string) => {
    if (!fileType) {
      return <File className="w-6 h-6 text-gray-600" />;
    }
    if (fileType.includes('image')) {
      return <FileImage className="w-6 h-6 text-blue-600" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="w-6 h-6 text-red-600" />;
    } else {
      return <File className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading || !isAuthenticated) {
    return <Loading message="Preparing your documents" />;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 w-full sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-gray-900 mb-2">Documents</h1>
              <p className="text-gray-600">Safely store and share important documents.</p>
            </div>
            <DocumentUploadDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              onSubmit={(formData) => createDocumentMutation.mutate(formData)}
              isSubmitting={createDocumentMutation.isPending}
            />
          </div>
        </div>

        {/* Parenting Plans Feature Highlight */}
        <Card className="mb-8 shadow border-[#275559] border-opacity-20 bg-gradient-to-r from-[#275559] from-opacity-5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#275559] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#275559]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Create & Agree on Parenting Plans
                  </h3>
                  <p className="text-gray-600">
                    Collaborate with your co-parent to build comprehensive parenting plans with digital agreements
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => window.location.href = '/parenting-plans'}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan
                </Button>
                <Button 
                  onClick={() => window.location.href = '/parenting-plans'}
                  variant="outline"
                  className="border-[#275559] text-[#275559] hover:bg-[#275559] hover:text-white"
                >
                  View Plans
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Documents</span>
                <span className="text-sm font-normal text-gray-500">
                  {Array.isArray(documents) ? documents.length : 0} documents
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div
                        className="w-8 h-8 border-4 border-t-[#275559] border-gray-300 rounded-full animate-spin "
                    ></div>
                    <div className='flex flex-col mt-2 items-center justify-center text-gray-400'>Loading documents...</div>
                  </div>
              ) : !Array.isArray(documents) || documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                  <p className="text-gray-500 mb-6">Upload your first document to get started.</p>
                  <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((document: Document) => (
                    <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(document.fileType ?? '')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {document.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(document.fileSize)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(document.uploaded_at!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`/api/documents/file/${document.fileUrl}`, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            View Original
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteDocument(document.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}