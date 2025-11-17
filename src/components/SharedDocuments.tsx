import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileImage, File, Upload, Download, Share2 } from "lucide-react";
import { Link } from "wouter";
import type { Document } from "@/utils/schema/document";

export default function SharedDocuments() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/documents"],
    retry: false,
  });

  const getFileIcon = (fileType?: string) => {
    if (!fileType) {
      return <File className="w-6 h-6 text-gray-600" />;
    }
    if (fileType.includes('image')) {
      return <FileImage className="w-6 h-6 text-[#275559]" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="w-6 h-6 text-[#275559]" />;
    } else {
      return <File className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif font-semibold text-gray-900">
            Shared Documents
          </CardTitle>
          <Link href="/documents">
            <Button size="sm" className="transition-colors">
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !documents || (documents as any)?.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No documents yet</p>
            <p className="text-sm text-gray-400 mb-4">Upload and share important documents</p>
            <Link href="/documents">
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(documents as any)?.slice(0, 4).map((document: Document) => (
              <div
                key={document.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getFileIcon(document.fileType ?? '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {document.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(document.fileSize)} • {formatDate(document.uploaded_at!)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Share2 className="w-3 h-3 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            ))}

            {/* Upload drop zone placeholder */}
            <Link href="/documents">
              <a className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors min-h-[120px]">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Upload files</p>
                </div>
              </a>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
