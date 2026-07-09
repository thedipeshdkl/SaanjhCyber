import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageSquare, Send, Shield, ArrowLeft, Clock, CheckCheck, User
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function Messages() {
  const { user, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [searchParams] = useSearchParams();
  const reportFromUrl = searchParams.get("report");
  const [selectedReportId, setSelectedReportId] = useState<number | null>(
    reportFromUrl ? Number(reportFromUrl) : null
  );
  const [newMessage, setNewMessage] = useState("");
  const [initSent, setInitSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const isStaff = user && ["admin", "superadmin", "moderator"].includes(user.role);

  const { data: conversations, refetch: refetchConversations } = isStaff
    ? trpc.message.listConversations.useQuery({ page: 1, limit: 50 })
    : trpc.message.myConversations.useQuery();

  const { data: chatMessages, refetch: refetchMessages } = trpc.message.getByReport.useQuery(
    { reportId: selectedReportId! },
    { enabled: !!selectedReportId, refetchInterval: 5000 }
  );

  const sendMessage = trpc.message.send.useMutation({
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
      refetchConversations();
      utils.message.unreadCount.invalidate();
    },
  });

  const prevMsgCount = useRef(0);

  useEffect(() => {
    // Only scroll when NEW messages arrive (not on initial load or polling same count)
    const currentCount = chatMessages?.length || 0;
    if (currentCount > prevMsgCount.current && prevMsgCount.current > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMsgCount.current = currentCount;
  }, [chatMessages]);

  // Auto-send initial message when coming from "Message Team" button on a report
  useEffect(() => {
    if (reportFromUrl && selectedReportId && user && !initSent && !isStaff) {
      // Check if there are already messages for this report
      if (chatMessages !== undefined && chatMessages.length === 0) {
        sendMessage.mutate({
          reportId: selectedReportId,
          content: "Hi, I'd like to get an update on my case. Please review and let me know if you need any additional information.",
        });
        setInitSent(true);
      }
    }
  }, [reportFromUrl, selectedReportId, user, chatMessages, initSent, isStaff]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--pashmina-white)]">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--prayer-crimson)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const conversationList = (conversations as any[]) || [];

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[var(--pashmina-white)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--lattice-wood)]">Messages</h1>
              <p className="text-sm text-gray-500">
                {isStaff ? "Respond to citizen inquiries about their cases" : "Contact the team about your reports"}
              </p>
            </div>
          </div>

          <div className="card overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
            <div className="flex h-full">
              {/* Conversation List */}
              <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${selectedReportId ? "hidden md:flex" : "flex"}`}>
                <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {isStaff ? "Citizen Messages" : "Your Cases"}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {conversationList.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                      <p className="text-sm">
                        {selectedReportId ? "Starting conversation..." : "No messages yet"}
                      </p>
                      {!isStaff && !selectedReportId && (
                        <p className="text-xs mt-1">Go to a report and click "Message Team" to start</p>
                      )}
                    </div>
                  ) : (
                    conversationList.map((conv: any) => (
                      <button
                        key={conv.reportId}
                        onClick={() => setSelectedReportId(conv.reportId)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          selectedReportId === conv.reportId ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-mono text-gray-400">{conv.caseNumber}</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{conv.reportTitle}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                          </div>
                          {Number(conv.unreadCount) > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`flex-1 flex flex-col ${!selectedReportId ? "hidden md:flex" : "flex"}`}>
                {selectedReportId ? (
                  <>
                    {/* Chat Header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                      <button
                        onClick={() => setSelectedReportId(null)}
                        className="md:hidden p-1 hover:bg-gray-200 rounded"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {conversationList.find((c: any) => c.reportId === selectedReportId)?.caseNumber || "Case"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conversationList.find((c: any) => c.reportId === selectedReportId)?.reportTitle}
                        </p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {(chatMessages || []).map((msg: any) => {
                        const isMine = msg.senderId === user.id;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] ${isMine ? "order-1" : ""}`}>
                              <div className={`px-3 py-2 rounded-xl text-sm ${
                                isMine
                                  ? "bg-blue-500 text-white rounded-br-sm"
                                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
                              }`}>
                                {!isMine && (
                                  <p className={`text-xs font-medium mb-0.5 ${isMine ? "text-blue-100" : "text-gray-500"}`}>
                                    {msg.isFromAdmin ? "🛡️ " : ""}{msg.senderName || "User"} · {msg.senderRole}
                                  </p>
                                )}
                                <p>{msg.content}</p>
                              </div>
                              <p className={`text-[10px] text-gray-400 mt-0.5 ${isMine ? "text-right" : ""}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                {isMine && msg.isRead && <CheckCheck className="w-3 h-3 inline ml-1 text-blue-400" />}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-100 bg-white">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey && newMessage.trim()) {
                              e.preventDefault();
                              sendMessage.mutate({ reportId: selectedReportId, content: newMessage.trim() });
                            }
                          }}
                          placeholder={isStaff ? "Reply to citizen..." : "Message the team..."}
                          className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                          disabled={sendMessage.isPending}
                        />
                        <button
                          onClick={() => {
                            if (newMessage.trim()) {
                              sendMessage.mutate({ reportId: selectedReportId, content: newMessage.trim() });
                            }
                          }}
                          disabled={!newMessage.trim() || sendMessage.isPending}
                          className="p-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center p-8">
                    <div>
                      <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">
                        {conversationList.length > 0
                          ? "Select a conversation to start messaging"
                          : "Click 'Message Team' on any of your reports to start a conversation"
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
