import { Sparkles, ArrowDown, EllipsisVertical } from "lucide-react";
import { Fab, IconButton } from "@mui/material";
import ChatEmptyState from "./ChatEmptyState.jsx";
import ChatBubble from "./ChatBubble.jsx";
import DropdownMenu from "../common/DropdownMenu.jsx";
import { deleteIcon, editIcon, pinIcon } from "../common/Icons.jsx";
import DocumentSummary from "./DocumentSummary.jsx";
import { deleteChat } from "../../apis/notebookApi.js";
import ConfirmDialog from "../common/ConfirmModal.jsx";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ChatMessageList({
    notebook_id,
    onClearMessages,
    messages,
    doc,
    onSuggestionClick,
    onExplain,
    isTyping,
    onCitationClick,
    pendingTextRef,
    chatBoxRef,
    handleChatScroll,
    showScrollButton,
    scrollToBottom,
}) {


    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const menuItems = [
        {
            id: "delete",
            label: "Delete Chat History",
            type: "danger",
            icon: deleteIcon,
            onClick: () => setShowDeleteDialog(true) // Click karne par dialog open hoga
        },
    ];


    const handleConfirmDelete = async () => {

        if (!notebook_id) return;

        setIsDeleting(true);

        try {

            await deleteChat(notebook_id);
            toast.success("Chat history cleared");

            // Backend se delete hone ke baad UI se bhi clear kar do
            if (onClearMessages) {
                onClearMessages();
            }

            setShowDeleteDialog(false); // Modal close karo


        } catch (err) {
            console.error(err);
            toast.error("Failed to clear chat history");
        } finally {
            setIsDeleting(false);
        }

    }


    return (

        <div className="relative flex-1 overflow-hidden">

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                open={showDeleteDialog}
                title="Clear Chat History?"
                message="Are you sure you want to permanently delete all messages in this notebook? This action cannot be undone."
                confirmText="Delete History"
                cancelText="Cancel"
                danger={true}
                loading={isDeleting}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleConfirmDelete}
            />

            <div ref={chatBoxRef} onScroll={handleChatScroll} className="h-full overflow-y-auto">

                {
                    messages.length > 0 && (

                        <DropdownMenu
                            align="left"
                            width={220}
                            items={menuItems}
                            trigger={(toggleProps) => (
                                <IconButton {...toggleProps} className="absolute! top-3! right-4!" >
                                    <EllipsisVertical className="size-4" />
                                </IconButton>
                            )}
                        />
                        
                    )
                }

                <div className="max-w-250 mx-auto px-4 sm:px-6 py-6 space-y-4">

                    {/* {messages.length === 0 ? (
                        <ChatEmptyState doc={doc} onSuggestionClick={onSuggestionClick} />
                    ) : (

                        messages.map((m, i) => (
                            <ChatBubble
                                key={m.id}
                                index={i}
                                message={m}
                                onSuggestionClick={onSuggestionClick}
                                onExplain={onExplain}
                                onCitationClick={onCitationClick}
                            />
                        ))

                    )} */}

                    {/* <ChatEmptyState
                        doc={doc}
                        onSuggestionClick={onSuggestionClick}
                        showSuggestions={messages.length === 0}
                    /> */}
                    <DocumentSummary
                        doc={doc}
                        onSuggestionClick={onSuggestionClick}
                        showSuggestions={messages.length === 0}
                    />

                    {messages.map((m, i) => (
                        <ChatBubble
                            key={m.id}
                            index={i}
                            message={m}
                            onExplain={onExplain}
                            onCitationClick={onCitationClick}
                        />
                    ))}

                    {isTyping && !pendingTextRef.current && (

                        <div className="flex gap-3">

                            <div className="w-7 h-7 rounded-lg bg-surface-emphasized flex items-center justify-center shrink-0 mt-0.5">
                                <Sparkles className="w-3.5 h-3.5 text-content-deemphasized" strokeWidth={1.75} />
                            </div>

                            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface-emphasized flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-content-deemphasized animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-content-deemphasized animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-content-deemphasized animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>

                        </div>

                    )}

                </div>

            </div>

            {showScrollButton && messages.length > 0 && (

                <Fab
                    size="small"
                    onClick={() => scrollToBottom("smooth")}
                    aria-label="Scroll to latest message"
                    className="animate-fade-in-up"
                    sx={{
                        position: "absolute",
                        bottom: 10,
                        right: "50%",
                        translate: "-50% 0",
                        bgcolor: "var(--color-surface-emphasized)",
                        color: "var(--color-content-default)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                        border: "1px solid var(--color-lines-divider)",
                        "&:hover": { bgcolor: "var(--color-surface-emphasized)" },
                    }}
                >
                    <ArrowDown className="w-4 h-4" />
                </Fab>

            )}

        </div>

    );

}