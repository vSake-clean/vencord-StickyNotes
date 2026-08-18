/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { deleteNote, getNote, initStickyNotes, useStickyNotes } from "./data";
import { openStickyNoteModal, parseFormattedText } from "./components/StickyNoteModal";
import { Menu } from "@webpack/common";
import definePlugin, { StartAt } from "@utils/types";
import { useState, useEffect } from "@webpack/common";
import ErrorBoundary from "@components/ErrorBoundary";
import "./styles.css";

// Context menu for user right-click
const UserContext: NavContextMenuPatchCallback = (children, props) => {
    const user = props.user;
    if (!user?.id) return;

    const container = findGroupChildrenByChildId("close-dm", children);
    if (!container) return;

    const idx = container.findIndex(c => c?.props?.id === "close-dm");
    if (idx === -1) return;

    container.splice(idx, 0,
        <Menu.MenuItem
            key="stickynotes-group"
            id="stickynotes-group"
            label="Sticky Notes"
        >
            <Menu.MenuItem
                key="stickynotes-add"
                id="stickynotes-add"
                label="Add / Edit Note"
                action={() => {
                    getNote(user.id).then(note => {
                        openStickyNoteModal(user.id, note);
                    });
                }}
            />
            <Menu.MenuItem
                key="stickynotes-delete"
                id="stickynotes-delete"
                label="Delete Note"
                action={async () => {
                    await deleteNote(user.id);
                }}
            />
        </Menu.MenuItem>
    );
};

// Sticky note component shown in profile popout and sidebar
function StickyNoteCard({ userId }: { userId: string }) {
    const [note, setNoteState] = useState<any>(undefined);
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            const n = await getNote(userId);
            if (mounted) setNoteState(n);
        };
        load();
        return () => { mounted = false; };
    }, [userId]);

    useStickyNotes();

    if (!note) return null;

    return (
        <div
            className="vc-stickynotes-popout"
            style={{
                backgroundColor: `${note.color}20`,
                borderLeftColor: note.color,
                color: "#fff",
            }}
        >
            <div className="vc-stickynotes-popout-header">
                <span className="vc-stickynotes-popout-label">Sticky Note</span>
                <div className="vc-stickynotes-popout-actions">
                    <button
                        className="vc-stickynotes-popout-btn"
                        onClick={() => openStickyNoteModal(userId, note, async () => {
                            const updated = await getNote(userId);
                            setNoteState(updated);
                            forceUpdate(n => n + 1);
                        })}
                        title="Edit"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                    </button>
                    <button
                        className="vc-stickynotes-popout-btn"
                        onClick={async () => {
                            await deleteNote(userId);
                            setNoteState(undefined);
                            forceUpdate(n => n + 1);
                        }}
                        title="Delete"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="vc-stickynotes-popout-text">
                {parseFormattedText(note.text)}
            </div>
            <div className="vc-stickynotes-popout-date">
                Added: {new Date(note.createdAt).toLocaleDateString()}
                {note.updatedAt !== note.createdAt && (
                    <> • Edited: {new Date(note.updatedAt).toLocaleDateString()}</>
                )}
            </div>
        </div>
    );
}

export default definePlugin({
    name: "StickyNotes",
    authors: [{ name: "CipherOS", id: 0n }],
    description: "Add sticky notes to users. Notes visible in profile popout and sidebar.",
    tags: ["notes", "sticky", "users", "personal"],

    contextMenus: {
        "user-context": UserContext,
    },

    patches: [
        {
            // User Popout
            find: '"UserProfilePopout");',
            replacement: {
                match: /user:(\i),widgets:.{0,100}?\}\),/,
                replace: "$&$self.renderStickyNote({user:$1}),"
            }
        },
        {
            // DM Profile Sidebar
            find: ".SIDEBAR,disableToolbar:",
            replacement: {
                match: /user:(\i),widgets:.{0,100}?\}\),(?=.{0,100}unownedWishlistItems:)/,
                replace: "$&$self.renderStickyNote({user:$1,isSideBar:true}),"
            }
        }
    ],

    renderStickyNote: ErrorBoundary.wrap(({ user, isSideBar }: { user?: any; isSideBar?: boolean }) => {
        if (!user?.id) return null;
        return <StickyNoteCard userId={user.id} />;
    }, { noop: true }),

    useStickyNotes,

    startAt: StartAt.WebpackReady,
    start() {
        initStickyNotes();
        console.log("[StickyNotes] Plugin started!");
    },

    stop() {
        console.log("[StickyNotes] Plugin stopped!");
    },
});
