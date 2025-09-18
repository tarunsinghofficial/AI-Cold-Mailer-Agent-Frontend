import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trash2,
  Mail,
  Briefcase,
  Users,
  Copy,
  Loader2,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const categoryMap = {
  "Sales / Lead Generation": {
    label: "Sales",
    color: "bg-blue-100 text-blue-800",
  },
  "Job Application": { label: "Job", color: "bg-green-100 text-green-800" },
  "Networking / Relationship Building": {
    label: "Networking",
    color: "bg-purple-100 text-purple-800",
  },
};

const iconMap = {
  "Sales / Lead Generation": Mail,
  "Job Application": Briefcase,
  "Networking / Relationship Building": Users,
};

const StreamingText = ({ text, loading }) => {
  // Simple streaming animation: shows text char by char if loading, else full text
  const [displayed, setDisplayed] = useState(loading ? "" : text);
  useEffect(() => {
    if (!loading) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 12);
    return () => clearInterval(interval);
  }, [text, loading]);
  return (
    <span>
      {displayed}
      {loading && <span className="animate-pulse">|</span>}
    </span>
  );
};

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch conversation details
  useEffect(() => {
    const fetchConversation = async () => {
      setStreaming(false);
      try {
        const response = await fetch(
          `https://ai-cold-mailer-agent-backend.onrender.com/conversation/${conversationId}`
        );
        if (response.ok) {
          const data = await response.json();
          setConversation(data);
        } else {
          setError("Failed to load conversation");
        }
      } catch (err) {
        setError("Error loading conversation");
      }
    };

    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    setIsLoading(true);
    setStreaming(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("conversation_id", conversationId);
      formData.append("user_message", userMessage);

      const response = await fetch(
        "https://ai-cold-mailer-agent-backend.onrender.com/chat-continue/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConversation((prev) => ({
          ...prev,
          generated_email: data.response,
          follow_up_messages: [...(prev.follow_up_messages || []), userMessage],
        }));
        setUserMessage("");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to send message");
      }
    } catch (err) {
      setError("Error sending message");
    } finally {
      setIsLoading(false);
      setTimeout(() => setStreaming(false), 500); // let the animation finish
    }
  };

  const handleCopyEmail = () => {
    const textToCopy = conversation.generated_email;
    navigator.clipboard.writeText(textToCopy);
    toast.success("Email copied to clipboard!");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleStartNewChat = () => {
    navigate("/");
  };

  const handleDeleteChat = async () => {
    setShowDeleteDialog(true);
  };
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(
        `https://ai-cold-mailer-agent-backend.onrender.com/${conversationId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        toast.success("Conversation deleted.");
        navigate("/");
      } else {
        toast.error("Failed to delete conversation.");
      }
    } catch (err) {
      toast.error("Error deleting conversation.");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-xl mx-auto p-8">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-5/6 mb-2" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-10 w-1/3" />
        </Card>
      </div>
    );
  }

  const category = categoryMap[conversation.purpose] || {
    label: conversation.purpose,
    color: "bg-gray-100 text-gray-800",
  };
  const Icon = iconMap[conversation.purpose] || Mail;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={handleBackToHome}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Icon className="w-7 h-7 text-gray-500" />
              <h1 className="text-xl font-bold text-gray-900">
                Email Conversation
              </h1>
              <Badge className={category.color + " text-xs px-2 py-0.5 ml-2"}>
                {category.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleStartNewChat}>
                <Plus className="w-4 h-4 mr-1" /> Start New Email
              </Button>
              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteChat}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-1" />
                    )}{" "}
                    Delete Chat
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this conversation? This
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={confirmDelete}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            {/* Original Email */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-500" /> Original Email
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>To:</strong>{" "}
                    {conversation.recipient_name || "Recipient"} |
                    <strong> From:</strong> {conversation.sender_name} (
                    {conversation.sender_title} at{" "}
                    {conversation.sender_company_name})
                  </div>
                  <div className="whitespace-pre-wrap text-gray-800">
                    <StreamingText
                      text={conversation.generated_email}
                      loading={streaming}
                    />
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleCopyEmail}
                  className="flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" /> Copy Email
                </Button>
              </CardContent>
            </Card>

            {/* Follow-up Messages History */}
            {conversation.follow_up_messages &&
              conversation.follow_up_messages.length > 0 && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-500" /> Conversation
                      History
                    </h3>
                    <div className="space-y-4">
                      {conversation.follow_up_messages.map((message, index) => (
                        <div key={index} className="bg-blue-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                            <Mail className="w-4 h-4 text-blue-400" />{" "}
                            <strong>You:</strong>
                          </div>
                          <div className="text-gray-800">{message}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Chat Input */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-500" /> Ask for
                  modifications or follow-up:
                </h3>
                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-2 items-end"
                >
                  <Input
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="e.g., 'Make it more casual', 'Add pricing information', 'Create a follow-up email'"
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !userMessage.trim()}
                    className="flex items-center gap-1"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}{" "}
                    Send
                  </Button>
                </form>
                {error && <p className="text-red-600 mt-2">{error}</p>}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-500" /> Conversation
                  Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Purpose
                    </label>
                    <p className="text-gray-900">{conversation.purpose}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sender
                    </label>
                    <p className="text-gray-900">
                      {conversation.sender_name}
                      <br />
                      {conversation.sender_title} at{" "}
                      {conversation.sender_company_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Recipient
                    </label>
                    <p className="text-gray-900">
                      {conversation.recipient_name || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Call to Action
                    </label>
                    <p className="text-gray-900">
                      {conversation.call_to_action}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Created
                    </label>
                    <p className="text-gray-900">
                      {new Date(conversation.created_at).toLocaleString()}
                    </p>
                  </div>
                  {conversation.follow_up_messages && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Messages
                      </label>
                      <p className="text-gray-900">
                        {conversation.follow_up_messages.length} follow-up
                        messages
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
