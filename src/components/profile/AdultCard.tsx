"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MapPin, Phone, Trash2, Edit } from "lucide-react";

import type { Adult } from "@/utils/schema/relationship";
import AdultForm, {
  adultSchema,
  type AdultFormData,
} from "@/components/form/AdultForm";
import { useRelationships } from "@/hooks/useRelationships";

function toAdultPayload(data: AdultFormData) {
  return data;
}

interface AdultCardProps {
  adult: Adult;
}

export default function AdultCard({ adult }: AdultCardProps) {
  const { toast } = useToast();
  const { updateAdult, deleteAdult} = useRelationships();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<AdultFormData>({
    resolver: zodResolver(adultSchema),
    defaultValues: {
      first_name: adult.first_name,
      last_name: adult.last_name,
      relationship: adult.relationship,
      phone: adult.phone || "",
      email: adult.email || "",
      address: adult.address || "",
      notes: adult.notes || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: AdultFormData) =>
      updateAdult(adult.id, toAdultPayload(data)),
    onSuccess: () => {
      setIsDialogOpen(false);
      toast({ title: "Adult updated", description: "Saved successfully." });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => (window.location.href = "/api/login"), 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => deleteAdult(adult.id),
    onSuccess: () => {
      toast({ title: "Adult removed", description: "Deleted successfully." });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => (window.location.href = "/api/login"), 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEditOpen = () => {
    // refresh defaults before open in case parent data changed
    form.reset({
      first_name: adult.first_name,
      last_name: adult.last_name,
      relationship: adult.relationship,
      phone: adult.phone || "",
      email: adult.email || "",
      address: adult.address || "",
      notes: adult.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to remove this adult's information? This action cannot be undone."
      )
    ) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-medium text-lg">{adult.first_name}</h3>
            <Badge className="text-xs">{adult.relationship}</Badge>
          </div>


          <div className="space-y-1 text-sm text-gray-500">
            {adult.phone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {adult.phone}
              </div>
            )}
            {adult.email && (
              <div className="flex items-center">
                <span className="w-4 h-4 mr-2">@</span>
                {adult.email}
              </div>
            )}
            {adult.address && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {adult.address}
              </div>
            )}
          </div>

          {adult.notes && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <strong>Notes:</strong> {adult.notes}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant='ghost' type="button" onClick={handleEditOpen}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant='ghost'
            type="button"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <AdultForm
        form={form}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={(data) => updateMutation.mutate(data)}
        onCancel={() => setIsDialogOpen(false)}
        editing
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
