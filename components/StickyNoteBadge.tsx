/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getNote, StickyNote } from "../data";
import { useEffect, useState } from "@webpack/common";

interface StickyNoteBadgeProps {
    userId: string;
    size?: number;
}

function StickyNoteIcon({ size = 12 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M19 3H4.99C3.88 3 3.01 3.89 3.01 5L3 19C3 20.1 3.88 21 4.99 21H19C20.1 21 21 20.1 21 19V5C21 3.89 20.1 3 19 3ZM19 15H15C15 16.66 13.65 18 12 18C10.35 18 9 16.66 9 15H4.99V5H19V15Z" />
        </svg>
    );
}

export function StickyNoteBadge({ userId, size = 12 }: StickyNoteBadgeProps) {
    const [note, setNoteState] = useState<StickyNote | undefined>(undefined);

    useEffect(() => {
        getNote(userId).then(setNoteState);
    }, [userId]);

    if (!note) return null;

    return (
        <span
            className="vc-stickynotes-badge"
            style={{ backgroundColor: note.color }}
            title={note.text}
        >
            <StickyNoteIcon size={size} />
        </span>
    );
}

export { StickyNoteIcon };
