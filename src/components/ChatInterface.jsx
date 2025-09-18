import { useState, useEffect } from "react";
import { toast } from "sonner";

const ChatInterface = ({ conversationId, onClose }) => {
  const [conversation, setConversation] = useState(null);
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch conversation details
  useEffect(() => {
    const fetchConversation = async () => {
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
        // Add the follow-up response to the conversation
        setConversation((prev) => ({
          ...prev,
          followUpResponse: data.response,
          followUpId: data.conversation_id,
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
    }
  };

  if (!conversation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Loading conversation...</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Email Conversation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Original Email */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">
            Original Email ({conversation.purpose})
          </h3>
          <div className="text-sm text-gray-600 mb-2">
            <strong>To:</strong> {conversation.recipient_name || "Recipient"} |
            <strong> From:</strong> {conversation.sender_name} (
            {conversation.sender_title} at {conversation.sender_company_name})
          </div>
          <div className="whitespace-pre-wrap text-gray-800">
            {conversation.generated_email}
          </div>
        </div>

        {/* Follow-up Response (if exists) */}
        {conversation.followUpResponse && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Follow-up Response</h3>
            <div className="whitespace-pre-wrap text-gray-800">
              {conversation.followUpResponse}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">
            Ask for modifications or follow-up:
          </h3>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="e.g., 'Make it more casual', 'Add pricing information', 'Create a follow-up email'"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !userMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => {
              const textToCopy =
                conversation.followUpResponse || conversation.generated_email;
              navigator.clipboard.writeText(textToCopy);
              toast.success("Email copied to clipboard!");
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Copy Email
          </button>
          <button
            onClick={() => {
              // TODO: Implement new chat functionality
              onClose();
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Start New Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
