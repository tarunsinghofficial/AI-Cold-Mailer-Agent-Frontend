import { useState, useEffect } from "react";
import EmailForm from "./components/EmailForm";
import { useRecoilState, atom } from "recoil";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import ChatPage from "./components/ChatPage";
import ChatCard from "./components/ChatCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "sonner";
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
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Menu, ChevronLeft, Plus } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

// Recoil atoms
export const emailHistoryState = atom({
  key: "emailHistoryState",
  default: [],
});

function Home() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [emailHistory, setEmailHistory] = useRecoilState(emailHistoryState);
  const [showNewChatButton, setShowNewChatButton] = useState(false);
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  // Fetch email history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:8000/history/");
        if (response.ok) {
          const data = await response.json();
          setEmailHistory(data);
        }
      } catch (err) {
        console.error("History fetch error:", err);
      }
    };
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (formData) => {
    setStatus("Generating email...");
    setError("");
    setGeneratedEmail("");
    setShowNewChatButton(false);

    try {
      const response = await fetch("http://localhost:8000/generate-email/", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to generate email from server."
        );
      }
      const data = await response.json();
      setGeneratedEmail(data.email);
      setStatus("Email generated successfully!");
      setShowNewChatButton(true);

      // Refresh history
      const histRes = await fetch("http://localhost:8000/history/");
      if (histRes.ok) {
        setEmailHistory(await histRes.json());
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatus("");
      console.error("Fetch error:", err);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Email copied to clipboard!");
  };

  const handleHistoryItemClick = (conversationId) => {
    navigate(`/chat/${conversationId}`);
  };

  const handleDeleteHistoryItem = (conversationId) => {
    setPendingDeleteId(conversationId);
  };
  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    try {
      const response = await fetch(
        `http://localhost:8000/conversation/${pendingDeleteId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        // Refresh history
        const histRes = await fetch("http://localhost:8000/history/");
        if (histRes.ok) {
          setEmailHistory(await histRes.json());
        }
        toast.success("Conversation deleted.");
      } else {
        toast.error("Failed to delete conversation.");
      }
    } catch (err) {
      toast.error("Error deleting conversation.");
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  const handleNewChat = () => {
    setGeneratedEmail("");
    setStatus("");
    setError("");
    setShowNewChatButton(false);
    // Reset the form by refreshing the page or clearing form state
    window.location.reload();
  };

  return (
    <>
      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletingId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingId !== null ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Navbar */}
      <nav className="w-full bg-white border-b shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden mr-2 p-2 rounded hover:bg-gray-100"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <span className="font-bold text-xl text-blue-700 tracking-tight select-none">
              AI Cold Email Agent
            </span>
          </div>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/"
                  className="px-3 py-2 text-gray-700 hover:text-blue-700 font-medium"
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/"
                  className="px-3 py-2 text-gray-700 hover:text-blue-700 font-medium"
                >
                  New Email
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>
      <div className="bg-[#F5F5F5] flex h-[calc(100vh-4rem)]">
        {" "}
        {/* 4rem = 64px navbar */}
        {/* Collapsible Sidebar */}
        <Collapsible open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <CollapsibleTrigger asChild>
            <button
              className="lg:hidden absolute top-4 left-4 z-20 bg-white border rounded-full p-2 shadow hover:bg-gray-50"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent
            forceMount
            className={`fixed lg:static z-10 top-0 left-0 h-full w-full max-w-xs bg-white border-r shadow-sm flex flex-col transition-transform duration-300 ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }`}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-lg font-bold text-gray-800">
                Email History
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-500 hover:text-gray-700 cursor-pointer">
                    ⋮
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.reload()}>
                    Refresh
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col justify-between h-full overflow-y-auto p-4">
              <div>
                {emailHistory.length === 0 ? (
                  <div className="text-gray-500 text-center mt-8">
                    No emails yet.
                  </div>
                ) : (
                  emailHistory.map((item) => (
                    <ChatCard
                      key={item.id}
                      item={item}
                      onClick={() => handleHistoryItemClick(item.id)}
                      onDelete={() => handleDeleteHistoryItem(item.id)}
                      deleting={deletingId === item.id}
                    />
                  ))
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleNewChat}
                className="mb-4"
              >
                <Plus className="w-4 h-4 mr-1" /> Start New Email
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center min-h-0 h-full overflow-y-scroll">
          <div className="w-full max-w-2xl h-full p-4">
            <EmailForm
              onSubmit={handleSubmit}
              status={status}
              error={error}
              generatedEmail={generatedEmail}
              onCopy={handleCopy}
            />
            {showNewChatButton && (
              <div className="flex justify-center mt-6">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow transition-colors"
                  onClick={handleNewChat}
                >
                  Start New Email
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
