import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Mail, Briefcase, Users } from "lucide-react";

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

export default function ChatCard({ item, onClick, onDelete, deleting }) {
  const category = categoryMap[item.purpose] || {
    label: item.purpose,
    color: "bg-gray-100 text-gray-800",
  };
  const Icon =
    item.purpose === "Sales / Lead Generation"
      ? Mail
      : item.purpose === "Job Application"
      ? Briefcase
      : item.purpose === "Networking / Relationship Building"
      ? Users
      : Mail;

  return (
    <Card
      className="mb-4 py-3 cursor-pointer hover:shadow-lg transition-shadow group relative"
      onClick={onClick}
    >
      <CardContent className="flex flex-col gap-3 px-3">
        <div>
          <Badge className={category.color + " text-xs px-2 py-0.5"}>
            {category.label}
          </Badge>
        </div>
        <div className="flex gap-2 min-w-0">
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
              <Icon className="w-6 h-6 text-gray-500" />
            </span>
          </div>
          <div className="flex flex-col gap-2 mb-1">
            <span className="font-semibold text-gray-900 line-clamp-1">
              {item.purpose}
            </span>
            <div className="text-xs text-gray-500">
              {new Date(item.created_at).toLocaleString()}
            </div>
            <div className="truncate text-gray-700 mt-1 text-sm">
              {item.generated_email.slice(0, 30)}...
            </div>
          </div>
        </div>
        <button
          className="absolute right-3 top-3 cursor-pointer ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete chat"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={deleting}
        >
          {deleting ? (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"></span>
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      </CardContent>
    </Card>
  );
}
