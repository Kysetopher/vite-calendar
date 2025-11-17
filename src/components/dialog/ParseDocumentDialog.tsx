import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface ParsedChild {
  name: string;
  birthday?: string;
  school?: string;
  grade?: string;
  allergies?: string;
  documentName?: string;
  color?: string;
}

interface ParseDocumentDialogProps {
  documents: any[];
  parsedChildren: ParsedChild[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPopulateFromParsedChild: (child: ParsedChild) => void;
}

export default function ParseDocumentDialog({
  documents,
  parsedChildren,
  open,
  onOpenChange,
  onPopulateFromParsedChild,
}: ParseDocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Parse Document Information</DialogTitle>
          <p className="text-sm text-gray-600">
            Extract information from your uploaded documents to populate profile and add children
          </p>
        </DialogHeader>
        <div className="space-y-6">
          {/* Available Documents */}
          <div>
            <h3 className="text-lg font-medium mb-3">Available Documents</h3>
            {!Array.isArray(documents) || documents.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No documents uploaded yet</p>
                <p className="text-sm text-gray-400">Upload documents first to extract information</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{doc.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              doc.parseStatus === "completed"
                                ? "bg-green-100 text-green-700"
                                : doc.parseStatus === "processing"
                                ? "bg-yellow-100 text-yellow-700"
                                : doc.parseStatus === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {doc.parseStatus === "completed"
                              ? "Parsed"
                              : doc.parseStatus === "processing"
                              ? "Processing"
                              : doc.parseStatus === "failed"
                              ? "Parse Failed"
                              : "Not Parsed"}
                          </span>
                        </div>
                      </div>
                      {doc.parseStatus === "completed" && (
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            onClick={() =>
                              window.open(`/api/documents/file/${doc.fileUrl}`, "_blank")
                            }
                          >
                            View Original
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extracted Children */}
          {parsedChildren.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Extracted Children Information</h3>
              <div className="space-y-3">
                {parsedChildren.map((child, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 bg-[#275559] bg-opacity-5 border-[#275559] border-opacity-20"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-[#275559]">{child.name}</h4>
                        <p className="text-sm text-[#275559] text-opacity-80 mb-2">
                          From: {child.documentName}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {child.birthday && (
                            <p>
                              <strong>Birthday:</strong> {child.birthday}
                            </p>
                          )}
                          {child.school && (
                            <p>
                              <strong>School:</strong> {child.school}
                            </p>
                          )}
                          {child.grade && (
                            <p>
                              <strong>Grade:</strong> {child.grade}
                            </p>
                          )}
                          {child.allergies && (
                            <p>
                              <strong>Allergies:</strong> {child.allergies}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button onClick={() => onPopulateFromParsedChild(child)}>
                        Add This Child
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">How to Parse Documents</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>
                1. Upload documents (parenting plans, court orders, etc.) in the Documents section
              </li>
              <li>2. Wait for AI processing to complete (happens automatically)</li>
              <li>3. Return here to extract information from parsed documents</li>
              <li>4. Use extracted data to populate your profile or add children</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

