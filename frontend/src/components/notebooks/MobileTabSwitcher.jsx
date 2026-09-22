import { BookOpen, MessageSquare } from 'lucide-react';
import React from 'react'

const MobileTabSwitcher = ({ setMobileTab, mobileTab }) => {

    return (

        <div className="md:hidden flex items-center gap-0.5 p-2 border-b border-lines-divider bg-surface-default shrink-0">

            <div className="flex-1 flex items-center gap-0.5 rounded-lg bg-surface-emphasized p-0.5">

                <button
                    type="button"
                    onClick={() => setMobileTab("sources")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 ${mobileTab === "sources"
                        ? "bg-surface-default text-content-default shadow-sm"
                        : "text-content-deemphasized"
                        }`}
                >
                    <BookOpen className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Sources
                </button>

                <button
                    type="button"
                    onClick={() => setMobileTab("chat")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 ${mobileTab === "chat"
                        ? "bg-surface-default text-content-default shadow-sm"
                        : "text-content-deemphasized"
                        }`}
                >
                    <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Chat
                </button>

            </div>

        </div>

    )

}

export default MobileTabSwitcher;