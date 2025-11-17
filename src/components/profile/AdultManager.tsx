"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Plus } from "lucide-react";

import { useRelationships } from "@/hooks/useRelationships";
import AdultForm, {
  adultSchema,
  type AdultFormData,
} from "@/components/form/AdultForm";
import AdultCard from "@/components/profile/AdultCard";

// import SimpleBar for custom scroll
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

function toAdultPayload(data: AdultFormData) {
  return data;
}

type AdultManagerProps = {
  className?: string;
};

export default function AdultManager({ className }: AdultManagerProps) {
  const { toast } = useToast();
  const [isAdultDialogOpen, setIsAdultDialogOpen] = useState(false);

  const adultForm = useForm<AdultFormData>({
    resolver: zodResolver(adultSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      relationship: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });

  const {
    adultData = [],
    isLoading: adultDataLoading,
    createAdult,
  } = useRelationships();

  const createAdultMutation = useMutation({
    mutationFn: async (data: AdultFormData) => createAdult(toAdultPayload(data)),
    onSuccess: () => {
      setIsAdultDialogOpen(false);
      adultForm.reset();
      toast({
        title: "Adult added",
        description: "Adult information has been saved successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
        title: "Error",
        description: "Failed to save adult information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateAdult = (data: AdultFormData) => {
    createAdultMutation.mutate(data);
  };

    return (
  <Card className={cn("shadow flex h-full  min-h-0 flex-col", className)}>
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Adult Relationships
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsAdultDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>

            <AdultForm
              form={adultForm}
              isOpen={isAdultDialogOpen}
              onOpenChange={(open) => {
                setIsAdultDialogOpen(open);
                if (!open) adultForm.reset();
              }}
              onSubmit={handleCreateAdult}
              onCancel={() => {
                setIsAdultDialogOpen(false);
                adultForm.reset();
              }}
              editing={false}
              isSubmitting={createAdultMutation.isPending}
            />
          </div>
        </CardTitle>
      </CardHeader>

        <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
        {adultDataLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Loading adults...</p>
          </div>
        ) : adultData.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No adults added yet</p>
            <p className="text-sm text-gray-400 mb-4">
              Add important adults and contacts for AI context
            </p>
            <Button type="button" onClick={() => setIsAdultDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add your first adult
            </Button>
          </div>
        ) : (
           <SimpleBar className="h-full">
            <div className="divide-y">
              {adultData.map((adult) => (
                <AdultCard key={adult.id} adult={adult} />
              ))}
            </div>
          </SimpleBar>
        )}
      </CardContent>
    </Card>
  )
}