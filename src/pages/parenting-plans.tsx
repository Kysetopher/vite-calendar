import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CreatePlanForm, { createPlanSchema } from "@/components/form/CreatePlanForm";
import AgreementForm, { agreementSchema } from "@/components/form/AgreementForm";
import CommentForm, { commentSchema } from "@/components/form/CommentForm";
import { 
  Plus, 
  FileText, 
  Users, 
  Calendar, 
  DollarSign, 
  Heart, 
  GraduationCap, 
  Car, 
  AlertTriangle, 
  Gavel,
  Settings,
  MessageSquare,
  CheckCircle,
  Clock,
  Edit
} from "lucide-react";
import { format } from "date-fns";

// Plan section schemas
const custodyScheduleSchema = z.object({
  regularSchedule: z.string(),
  holidaySchedule: z.string().optional(),
  summerSchedule: z.string().optional(),
  specialArrangements: z.string().optional(),
});

const childrenInfoSchema = z.object({
  children: z.array(z.object({
    name: z.string(),
    birthday: z.string().optional(),
    school: z.string().optional(),
    grade: z.string().optional(),
    medicalInfo: z.string().optional(),
    specialNeeds: z.string().optional(),
  })),
});

const communicationGuidelinesSchema = z.object({
  primaryMethod: z.string(),
  responseTime: z.string(),
  emergencyContact: z.string(),
  guidelines: z.string(),
});

type ParentingPlan = {
  id: number;
  title: string;
  description?: string;
  status: string;
  createdBy: string;
  coParent?: string;
  custodySchedule?: any;
  childrenInfo?: any;
  communicationGuidelines?: any;
  decisionMaking?: any;
  financialArrangements?: any;
  medicalCare?: any;
  educationProvisions?: any;
  transportationPlan?: any;
  emergencyProtocols?: any;
  disputeResolution?: any;
  specialProvisions?: any;
  created_at: string;
  updated_at: string;
  agreed_at?: string;
  finalized_at?: string;
};

type Comment = {
  id: number;
  content: string;
  section?: string;
  user_id: number;
  created_at: string;
};

type Agreement = {
  id: number;
  user_id: number;
  signature: string;
  agreed_at: string;
  ip_address?: string;
};

export default function ParentingPlans() {
  const [selectedPlan, setSelectedPlan] = useState<ParentingPlan | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAgreementDialog, setShowAgreementDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch parenting plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["/api/parenting-plans"],
  });

  // Fetch plan details
  const { data: planDetails } = useQuery({
    queryKey: ["/api/parenting-plans", selectedPlan?.id],
    enabled: !!selectedPlan?.id,
  });

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: ["/api/parenting-plans", selectedPlan?.id, "comments"],
    enabled: !!selectedPlan?.id,
  });

  // Fetch agreements
  const { data: agreements = [] } = useQuery({
    queryKey: ["/api/parenting-plans", selectedPlan?.id, "agreements"],
    enabled: !!selectedPlan?.id,
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("POST", "/api/parenting-plans", {
        title: data.title,
        description: data.description,
        co_parent: data.coParent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parenting-plans"] });
      setShowCreateDialog(false);
      toast({ title: "Parenting plan created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create parenting plan", variant: "destructive" });
    },
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/parenting-plans/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parenting-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parenting-plans", selectedPlan?.id] });
      toast({ title: "Parenting plan updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update parenting plan", variant: "destructive" });
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("POST", `/api/parenting-plans/${selectedPlan?.id}/comments`, {
        content: data.content,
        section: data.section,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parenting-plans", selectedPlan?.id, "comments"] });
      toast({ title: "Comment added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" });
    },
  });

  // Create agreement mutation
  const createAgreementMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("POST", `/api/parenting-plans/${selectedPlan?.id}/agree`, {
        signature: data.signature,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parenting-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parenting-plans", selectedPlan?.id, "agreements"] });
      setShowAgreementDialog(false);
      toast({ title: "Agreement recorded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to record agreement", variant: "destructive" });
    },
  });

  // Forms
  const createForm = useForm({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      title: "",
      description: "",
      coParent: "",
    },
  });

  const commentForm = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
      section: activeSection,
    },
  });

  const agreementForm = useForm({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      signature: "",
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
      pending_review: { label: "Pending Review", className: "bg-yellow-100 text-yellow-800" },
      under_revision: { label: "Under Revision", className: "bg-blue-100 text-blue-800" },
      agreed: { label: "Agreed", className: "bg-green-100 text-green-800" },
      finalized: { label: "Finalized", className: "bg-[#275559] bg-opacity-10 text-[#275559]" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const planSections = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "custody", label: "Custody Schedule", icon: Calendar },
    { id: "children", label: "Children Information", icon: Users },
    { id: "communication", label: "Communication", icon: MessageSquare },
    { id: "decisions", label: "Decision Making", icon: Gavel },
    { id: "financial", label: "Financial Arrangements", icon: DollarSign },
    { id: "medical", label: "Medical Care", icon: Heart },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "transportation", label: "Transportation", icon: Car },
    { id: "emergency", label: "Emergency Protocols", icon: AlertTriangle },
    { id: "dispute", label: "Dispute Resolution", icon: Settings },
    { id: "special", label: "Special Provisions", icon: Plus },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading parenting plans...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Parenting Plans</h1>
        <p className="text-gray-600">Create, collaborate on, and agree upon comprehensive parenting plans</p>
      </div>

      {!selectedPlan ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Your Plans</h2>
            <CreatePlanForm
              form={createForm}
              isOpen={showCreateDialog}
              onOpenChange={setShowCreateDialog}
              onSubmit={(data) => createPlanMutation.mutate(data)}
              isSubmitting={createPlanMutation.isPending}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.length === 0 ? (
              <Card className="col-span-full text-center py-12">
                <CardContent>
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Parenting Plans Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first parenting plan to start collaborating with your co-parent
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Plan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              plans.map((plan: ParentingPlan) => (
                <Card 
                  key={plan.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow shadow"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      {getStatusBadge(plan.status)}
                    </div>
                    {plan.description && (
                      <CardDescription>{plan.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Created {format(new Date(plan.created_at), "MMM d, yyyy")}
                      </div>
                      {plan.agreed_at && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Agreed {format(new Date(plan.agreed_at), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        <PlanDetailView 
          plan={selectedPlan}
          planDetails={planDetails}
          comments={comments}
          agreements={agreements}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          updatePlanMutation={updatePlanMutation}
          createCommentMutation={createCommentMutation}
          createAgreementMutation={createAgreementMutation}
          commentForm={commentForm}
          agreementForm={agreementForm}
          showAgreementDialog={showAgreementDialog}
          setShowAgreementDialog={setShowAgreementDialog}
          onBack={() => setSelectedPlan(null)}
          planSections={planSections}
        />
      )}
    </div>
  );
}

// Plan Detail View Component
function PlanDetailView({ 
  plan, 
  planDetails, 
  comments, 
  agreements, 
  activeSection, 
  setActiveSection,
  updatePlanMutation,
  createCommentMutation,
  createAgreementMutation,
  commentForm,
  agreementForm,
  showAgreementDialog,
  setShowAgreementDialog,
  onBack,
  planSections
}: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [sectionData, setSectionData] = useState<any>({});

  const currentPlan = planDetails || plan;

  const handleSectionSave = (section: string, data: any) => {
    updatePlanMutation.mutate({
      id: plan.id,
      data: { [section]: data }
    });
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
      pending_review: { label: "Pending Review", className: "bg-yellow-100 text-yellow-800" },
      under_revision: { label: "Under Revision", className: "bg-blue-100 text-blue-800" },
      agreed: { label: "Agreed", className: "bg-green-100 text-green-800" },
      finalized: { label: "Finalized", className: "bg-[#275559] bg-opacity-10 text-[#275559]" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            ← Back to Plans
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentPlan.title}</h1>
            <div className="flex items-center space-x-4 mt-1">
              {getStatusBadge(currentPlan.status)}
              <span className="text-sm text-gray-600">
                Last updated {format(new Date(currentPlan.updated_at), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {currentPlan.status !== 'agreed' && currentPlan.status !== 'finalized' && (
            <AgreementForm
              form={agreementForm}
              isOpen={showAgreementDialog}
              onOpenChange={setShowAgreementDialog}
              onSubmit={(data) =>
                createAgreementMutation.mutate({
                  ...data,
                  ip_address: "127.0.0.1",
                })
              }
              isSubmitting={createAgreementMutation.isPending}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="shadow">
            <CardHeader>
              <CardTitle className="text-lg">Plan Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {planSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      variant="ghost"
                      className={`w-full justify-start px-4 py-3 hover:bg-gray-50 transition-colors ${
                        activeSection === section.id
                          ? 'bg-[#275559] bg-opacity-10 text-[#275559] border-r-2 border-[#275559]'
                          : 'text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </Button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Agreements Status */}
          {agreements.length > 0 && (
            <Card className="mt-4 shadow">
              <CardHeader>
                <CardTitle className="text-lg">Agreements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agreements.map((agreement: Agreement) => (
                    <div key={agreement.id} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">{agreement.signature}</p>
                        <p className="text-xs text-gray-600">
                          {format(new Date(agreement.agreed_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <PlanSectionContent 
            activeSection={activeSection}
            currentPlan={currentPlan}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            sectionData={sectionData}
            setSectionData={setSectionData}
            onSave={handleSectionSave}
            comments={comments}
            commentForm={commentForm}
            createCommentMutation={createCommentMutation}
          />
        </div>
      </div>
    </div>
  );
}

// Plan Section Content Component
function PlanSectionContent({ 
  activeSection, 
  currentPlan, 
  isEditing, 
  setIsEditing, 
  sectionData, 
  setSectionData, 
  onSave, 
  comments, 
  commentForm, 
  createCommentMutation 
}: any) {
  const sectionComments = comments.filter((c: Comment) => c.section === activeSection);

  const renderSectionEditor = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Description
              </label>
              <Textarea
                value={sectionData.description || currentPlan.description || ""}
                onChange={(e) => setSectionData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide an overview of this parenting plan..."
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Goals
              </label>
              <Textarea
                value={sectionData.goals || ""}
                onChange={(e) => setSectionData(prev => ({ ...prev, goals: e.target.value }))}
                placeholder="What are the main goals of this parenting plan?"
                rows={3}
              />
            </div>
          </div>
        );

      case "custody":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regular Schedule
              </label>
              <Textarea
                value={sectionData.regularSchedule || currentPlan.custodySchedule?.regularSchedule || ""}
                onChange={(e) => setSectionData(prev => ({ ...prev, regularSchedule: e.target.value }))}
                placeholder="Describe the regular custody schedule (e.g., alternating weeks, specific days)"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Holiday Schedule
              </label>
              <Textarea
                value={sectionData.holidaySchedule || currentPlan.custodySchedule?.holidaySchedule || ""}
                onChange={(e) => setSectionData(prev => ({ ...prev, holidaySchedule: e.target.value }))}
                placeholder="How will holidays be handled?"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summer Schedule
              </label>
              <Textarea
                value={sectionData.summerSchedule || currentPlan.custodySchedule?.summerSchedule || ""}
                onChange={(e) => setSectionData(prev => ({ ...prev, summerSchedule: e.target.value }))}
                placeholder="Summer vacation arrangements"
                rows={3}
              />
            </div>
          </div>
        );

      case "communication":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Communication Method
              </label>
              <Select
                value={sectionData.primaryMethod || currentPlan.communicationGuidelines?.primaryMethod || ""}
                onValueChange={(value) => setSectionData(prev => ({ ...prev, primaryMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select communication method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="text">Text Messages</SelectItem>
                  <SelectItem value="app">Co-Parenting App</SelectItem>
                  <SelectItem value="phone">Phone Calls</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Time Expectations
              </label>
              <Input
                value={sectionData.responseTime || currentPlan.communicationGuidelines?.responseTime || ""}
                onChange={(e) => setSectionData(prev => ({ ...prev, responseTime: e.target.value }))}
                placeholder="e.g., 24 hours for non-urgent, 2 hours for urgent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Guidelines
              </label>
              <Textarea
                value={sectionData.guidelines || currentPlan.communicationGuidelines?.guidelines || ""}
                onChange={(e) => setSectionData(prev => ({ ...prev, guidelines: e.target.value }))}
                placeholder="Guidelines for respectful and effective communication"
                rows={4}
              />
            </div>
          </div>
        );

      case "financial":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child Support Arrangements
              </label>
              <Textarea
                value={sectionData.childSupport || currentPlan.financialArrangements?.childSupport || ""}
                onChange={(e) => setSectionData(prev => ({ ...prev, childSupport: e.target.value }))}
                placeholder="Details about child support payments"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Sharing
              </label>
              <Textarea
                value={sectionData.expenseSharing || currentPlan.financialArrangements?.expenseSharing || ""}
                onChange={(e) => setSectionData(prev => ({ ...prev, expenseSharing: e.target.value }))}
                placeholder="How will medical, educational, and extracurricular expenses be shared?"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Textarea
              value={sectionData.content || ""}
              onChange={(e) => setSectionData(prev => ({ ...prev, content: e.target.value }))}
              placeholder={`Add content for ${activeSection} section...`}
              rows={6}
            />
          </div>
        );
    }
  };

  const renderSectionDisplay = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Plan Description</h3>
              <p className="text-gray-700">{currentPlan.description || "No description provided"}</p>
            </div>
            {currentPlan.goals && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Plan Goals</h3>
                <p className="text-gray-700">{currentPlan.goals}</p>
              </div>
            )}
          </div>
        );

      case "custody":
        const custodyData = currentPlan.custodySchedule || {};
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Regular Schedule</h3>
              <p className="text-gray-700">{custodyData.regularSchedule || "No regular schedule defined"}</p>
            </div>
            {custodyData.holidaySchedule && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Holiday Schedule</h3>
                <p className="text-gray-700">{custodyData.holidaySchedule}</p>
              </div>
            )}
            {custodyData.summerSchedule && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Summer Schedule</h3>
                <p className="text-gray-700">{custodyData.summerSchedule}</p>
              </div>
            )}
          </div>
        );

      case "communication":
        const commData = currentPlan.communicationGuidelines || {};
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Primary Communication Method</h3>
              <p className="text-gray-700">{commData.primaryMethod || "No method specified"}</p>
            </div>
            {commData.responseTime && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Response Time Expectations</h3>
                <p className="text-gray-700">{commData.responseTime}</p>
              </div>
            )}
            {commData.guidelines && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Communication Guidelines</h3>
                <p className="text-gray-700">{commData.guidelines}</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              This section is not yet configured
            </div>
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </div>
        );
    }
  };

  return (
    <Card className="shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            {planSections.find(s => s.id === activeSection)?.label || activeSection}
          </CardTitle>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {renderSectionEditor()}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setSectionData({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => onSave(activeSection, sectionData)}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          renderSectionDisplay()
        )}

        <Separator className="my-6" />

        {/* Comments Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Comments & Discussion</h3>
          
          {sectionComments.map((comment: Comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-700">{comment.content}</p>
                </div>
                <span className="text-xs text-gray-500 ml-4">
                  {format(new Date(comment.created_at), "MMM d 'at' h:mm a")}
                </span>
              </div>
            </div>
          ))}

          <CommentForm
            form={commentForm}
            onSubmit={(data) => {
              createCommentMutation.mutate({ ...data, section: activeSection });
              commentForm.reset();
            }}
            isSubmitting={createCommentMutation.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}

const planSections = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "custody", label: "Custody Schedule", icon: Calendar },
  { id: "children", label: "Children Information", icon: Users },
  { id: "communication", label: "Communication", icon: MessageSquare },
  { id: "decisions", label: "Decision Making", icon: Gavel },
  { id: "financial", label: "Financial Arrangements", icon: DollarSign },
  { id: "medical", label: "Medical Care", icon: Heart },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "transportation", label: "Transportation", icon: Car },
  { id: "emergency", label: "Emergency Protocols", icon: AlertTriangle },
  { id: "dispute", label: "Dispute Resolution", icon: Settings },
  { id: "special", label: "Special Provisions", icon: Plus },
];