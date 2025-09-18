import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  FileText,
  User,
  Building2,
  Mail,
  Briefcase,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const EmailForm = ({ onSubmit, status, error, generatedEmail, onCopy }) => {
  const [purpose, setPurpose] = useState("Job Application");
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescText, setJobDescText] = useState("");
  const [jobDescUrl, setJobDescUrl] = useState("");
  const [recipientName, setRecipientName] = useState(""); // New: for specific recipient
  const [senderName, setSenderName] = useState("");
  const [senderTitle, setSenderTitle] = useState("");
  const [senderCompanyName, setSenderCompanyName] = useState(""); // Changed from companyName
  const [callToAction, setCallToAction] = useState(
    "Would you be open to a brief 15-minute chat next week?"
  );

  // Sales Specific
  const [recipientCompanyInfo, setRecipientCompanyInfo] = useState("");
  const [productServiceDescription, setProductServiceDescription] =
    useState("");
  const [painPointsText, setPainPointsText] = useState("");

  // Networking Specific
  const [personInfo, setPersonInfo] = useState("");
  const [commonGroundText, setCommonGroundText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("purpose", purpose);
    formData.append("sender_name", senderName);
    formData.append("sender_title", senderTitle);
    formData.append("sender_company_name", senderCompanyName);
    formData.append("call_to_action", callToAction);
    if (recipientName) formData.append("recipient_name", recipientName);

    if (purpose === "Job Application") {
      if (!resumeFile) {
        toast.error("Please upload a resume for Job Application.");
        return;
      }
      if (!jobDescText && !jobDescUrl) {
        toast.error(
          "Please provide either job description text or a URL for Job Application."
        );
        return;
      }
      if (jobDescText && jobDescUrl) {
        toast.error(
          "Please provide EITHER job description text OR a URL, not both."
        );
        return;
      }
      formData.append("resume_file", resumeFile);
      if (jobDescText) formData.append("job_desc_text", jobDescText);
      if (jobDescUrl) formData.append("job_desc_url", jobDescUrl);
    } else if (purpose === "Sales / Lead Generation") {
      if (!recipientCompanyInfo || !productServiceDescription) {
        toast.error(
          "Recipient company info and product/service description are required for Sales."
        );
        return;
      }
      formData.append("recipient_company_info", recipientCompanyInfo);
      formData.append("product_service_description", productServiceDescription);
      if (painPointsText) formData.append("pain_points_text", painPointsText);
    } else if (purpose === "Networking / Relationship Building") {
      if (!personInfo) {
        toast.error("Person's info is required for Networking.");
        return;
      }
      formData.append("person_info", personInfo);
      if (commonGroundText)
        formData.append("common_ground_text", commonGroundText);
    }

    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center gap-2">
        <Mail className="w-7 h-7 text-blue-500" /> AI Cold Email Generator
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Purpose Selection */}
        <div>
          <label
            htmlFor="purpose"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Purpose of Email:
          </label>
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Job Application">
                Job Application / Recruiting
              </SelectItem>
              <SelectItem value="Sales / Lead Generation">
                Sales / Lead Generation
              </SelectItem>
              <SelectItem value="Networking / Relationship Building">
                Networking / Relationship Building
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Common Fields for all Purposes */}
        <div>
          <label
            htmlFor="recipientName"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Recipient Name (Optional, e.g., "John Doe" or "Hiring Team"):
          </label>
          <Input
            type="text"
            id="recipientName"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="e.g., Jane Smith, or Recruiting Team"
          />
        </div>

        <div>
          <label
            htmlFor="cta"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Call to Action:
          </label>
          <Input
            type="text"
            id="cta"
            value={callToAction}
            onChange={(e) => setCallToAction(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="senderName"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              Your Name:
            </label>
            <Input
              type="text"
              id="senderName"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="senderTitle"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              Your Title:
            </label>
            <Input
              type="text"
              id="senderTitle"
              value={senderTitle}
              onChange={(e) => setSenderTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="senderCompanyName"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              Your Company/University Name:
            </label>
            <Input
              type="text"
              id="senderCompanyName"
              value={senderCompanyName}
              onChange={(e) => setSenderCompanyName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Conditional Fields based on Purpose */}
        {purpose === "Job Application" && (
          <>
            <div>
              <label
                htmlFor="resume"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Resume (PDF/DOCX):
              </label>
              <Input
                type="file"
                id="resume"
                name="resume_file"
                accept=".pdf,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
                required
              />
            </div>
            <div>
              <label
                htmlFor="jobDescText"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Job Description Text:
              </label>
              <Textarea
                id="jobDescText"
                rows={8}
                value={jobDescText}
                onChange={(e) => setJobDescText(e.target.value)}
                placeholder="Paste job description text here..."
              />
            </div>
            <div className="text-center text-gray-600 font-semibold">
              - OR -
            </div>
            <div>
              <label
                htmlFor="jobDescUrl"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Job Description URL:
              </label>
              <Input
                type="url"
                id="jobDescUrl"
                value={jobDescUrl}
                onChange={(e) => setJobDescUrl(e.target.value)}
              />
            </div>
          </>
        )}
        {purpose === "Sales / Lead Generation" && (
          <>
            <div>
              <label
                htmlFor="recipientCompanyInfo"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Recipient Company Info:
              </label>
              <Input
                type="text"
                id="recipientCompanyInfo"
                value={recipientCompanyInfo}
                onChange={(e) => setRecipientCompanyInfo(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="productServiceDescription"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Product/Service Description:
              </label>
              <Input
                type="text"
                id="productServiceDescription"
                value={productServiceDescription}
                onChange={(e) => setProductServiceDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="painPointsText"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Key Pain Points Addressed or Great Features (optional,
                comma-separated):
                <span className="block text-sm text-gray-500">
                  E.g. "Automates reporting, Reduces manual work, Integrates
                  with Slack" or features you/sender have built or worked on
                </span>
              </label>
              <Input
                type="text"
                id="painPointsText"
                value={painPointsText}
                onChange={(e) => setPainPointsText(e.target.value)}
                placeholder="e.g. Automates reporting, Reduces manual work, Integrates with Slack"
              />
            </div>
          </>
        )}
        {purpose === "Networking / Relationship Building" && (
          <>
            <div>
              <label
                htmlFor="personInfo"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Person's Info (e.g., LinkedIn, achievements):
              </label>
              <Textarea
                id="personInfo"
                rows={4}
                value={personInfo}
                onChange={(e) => setPersonInfo(e.target.value)}
                placeholder="Paste LinkedIn profile, bio, or achievements here..."
                required
              />
            </div>
            <div>
              <label
                htmlFor="commonGroundText"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Common Ground (optional):
              </label>
              <Input
                type="text"
                id="commonGroundText"
                value={commonGroundText}
                onChange={(e) => setCommonGroundText(e.target.value)}
                placeholder="e.g., mutual connection, shared interest, event, etc."
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            className="flex items-center gap-2"
            disabled={status === "Generating email..."}
          >
            {status === "Generating email..." ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            {status === "Generating email..."
              ? "Generating..."
              : "Generate Email"}
          </Button>
          {error && <span className="text-red-600">{error}</span>}
        </div>
      </form>

      {/* Generated Email Output */}
      {generatedEmail && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-green-800">
            <Mail className="w-5 h-5" /> Generated Email
          </h2>
          <pre className="whitespace-pre-wrap text-gray-900 mb-4">
            {generatedEmail}
          </pre>
          <Button
            variant="secondary"
            onClick={() => onCopy(generatedEmail)}
            className="flex items-center gap-1"
          >
            <Mail className="w-4 h-4" /> Copy Email
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmailForm;
