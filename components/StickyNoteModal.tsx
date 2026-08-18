/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { deleteNote, getRandomColor, setNote, StickyNote } from "../data";
import { Forms, Modal, openModal, TextInput, useState, useRef, useCallback } from "@webpack/common";
import ErrorBoundary from "@components/ErrorBoundary";

interface ModalProps {
    modalProps: {
        onClose: () => void;
    };
    userId: string;
    existingNote?: StickyNote;
    onSave: () => void;
}

const COLORS = [
    "#ffeb3b", // yellow
    "#ff9800", // orange
    "#4caf50", // green
    "#2196f3", // blue
    "#e91e63", // pink
    "#9c27b0", // purple
    "#00bcd4", // cyan
    "#ff5722", // deep orange
    "#8bc34a", // light green
    "#ff4081", // pink accent
];

function isValidHex(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
}

// Parser for formatted text: **bold** and [color:#hex]text[/color]
export function parseFormattedText(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|\[color:(#[0-9A-Fa-f]{6})\](.+?)\[\/color\])/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        if (match[2]) {
            parts.push(
                <span key={key++} className="vc-stickynotes-bold">
                    {match[2]}
                </span>
            );
        } else if (match[3] && match[4]) {
            parts.push(
                <span key={key++} className="vc-stickynotes-colored" style={{ color: match[3] }}>
                    {match[4]}
                </span>
            );
        }

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
}

// Bold icon SVG
function BoldIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
        </svg>
    );
}

// Color icon SVG
function ColorIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 2L5.5 16h2.25l1.12-3h6.25l1.12 3h2.25L13 2h-2zm-1.38 9L12 4.67 14.38 11H9.62z" />
            <path d="M5 20h14v2H5z" />
        </svg>
    );
}

function StickyNoteModalInner({ modalProps, userId, existingNote, onSave }: ModalProps) {
    const [text, setText] = useState(existingNote?.text ?? "");
    const [color, setColor] = useState(existingNote?.color ?? getRandomColor());
    const [customColorInput, setCustomColorInput] = useState(
        existingNote?.color && !COLORS.includes(existingNote.color) ? existingNote.color : ""
    );
    const [formatColor, setFormatColor] = useState("#ffeb3b");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isEditing = existingNote !== undefined;

    const handleColorSelect = useCallback((c: string) => {
        setColor(c);
        setCustomColorInput("");
    }, []);

    const handleCustomColorInput = useCallback((value: string) => {
        let v = value.trim();
        if (v && !v.startsWith("#")) {
            v = "#" + v;
        }
        setCustomColorInput(v);
        if (isValidHex(v)) {
            setColor(v);
        }
    }, []);

    const wrapSelection = useCallback((prefix: string, suffix: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = text.slice(start, end);

        if (!selectedText) return;

        const before = text.slice(0, start);
        const after = text.slice(end);
        const newText = `${before}${prefix}${selectedText}${suffix}${after}`;

        setText(newText);
        setTimeout(() => {
            textarea.selectionStart = start + prefix.length;
            textarea.selectionEnd = end + prefix.length;
            textarea.focus();
        }, 0);
    }, [text]);

    const handleBold = useCallback(() => {
        wrapSelection("**", "**");
    }, [wrapSelection]);

    const handleColor = useCallback(() => {
        wrapSelection(`[color:${formatColor}]`, "[/color]");
    }, [wrapSelection, formatColor]);

    const handleSave = useCallback(async () => {
        const now = Date.now();
        const finalColor = isValidHex(customColorInput) ? customColorInput : color;
        const note: StickyNote = {
            text,
            color: finalColor,
            createdAt: existingNote?.createdAt ?? now,
            updatedAt: now,
        };
        await setNote(userId, note);
        onSave();
        modalProps.onClose();
    }, [text, color, customColorInput, existingNote, userId, onSave, modalProps]);

    const handleDelete = useCallback(async () => {
        await deleteNote(userId);
        onSave();
        modalProps.onClose();
    }, [userId, onSave, modalProps]);

    const previewText = text.trim() ? (
        <div className="vc-stickynotes-preview">
            {parseFormattedText(text)}
        </div>
    ) : null;

    return (
        <Modal
            {...modalProps}
            title={isEditing ? "Edit Sticky Note" : "New Sticky Note"}
            actions={[
                isEditing
                    ? {
                        text: "Delete",
                        variant: "danger",
                        onClick: handleDelete,
                    }
                    : {
                        text: "Cancel",
                        variant: "secondary",
                        onClick: modalProps.onClose,
                    },
                {
                    text: "Save",
                    variant: "primary",
                    onClick: handleSave,
                    disabled: !text.trim(),
                },
            ]}
        >
            {/* Note Text Area */}
            <div className="vc-stickynotes-input-section">
                <Forms.FormTitle tag="h5">Note</Forms.FormTitle>
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Write your note here..."
                    autoFocus
                    className="vc-stickynotes-textarea"
                />
            </div>

            {/* Formatting Toolbar - Separate Section */}
            <div className="vc-stickynotes-format-section">
                <Forms.FormTitle tag="h5">Formatting</Forms.FormTitle>
                <div className="vc-stickynotes-toolbar">
                    <button
                        className="vc-stickynotes-toolbar-btn"
                        onClick={handleBold}
                        title="Bold: Select text first, then click"
                    >
                        <BoldIcon />
                        <span>Bold</span>
                    </button>
                    <div className="vc-stickynotes-toolbar-sep" />
                    <button
                        className="vc-stickynotes-toolbar-btn"
                        onClick={handleColor}
                        title="Color: Select text first, then click"
                    >
                        <ColorIcon />
                        <span>Color</span>
                    </button>
                    <input
                        type="color"
                        value={formatColor}
                        onChange={e => setFormatColor(e.target.value)}
                        className="vc-stickynotes-toolbar-color"
                        title="Pick color"
                    />
                </div>
                <div className="vc-stickynotes-format-hint">
                    Select text in the note above, then click Bold or Color
                </div>
            </div>

            {/* Preview */}
            {text.trim() && (
                <div className="vc-stickynotes-preview-section">
                    <Forms.FormTitle tag="h5">Preview</Forms.FormTitle>
                    <div
                        className="vc-stickynotes-popout"
                        style={{
                            backgroundColor: `${isValidHex(customColorInput) ? customColorInput : color}20`,
                            borderLeftColor: isValidHex(customColorInput) ? customColorInput : color,
                            color: "#fff",
                        }}
                    >
                        {previewText}
                    </div>
                </div>
            )}

            {/* Background Color */}
            <div className="vc-stickynotes-color-section">
                <Forms.FormTitle tag="h5">Background Color</Forms.FormTitle>
                <div className="vc-stickynotes-color-picker">
                    {COLORS.map(c => (
                        <div
                            key={c}
                            className={`vc-stickynotes-color-swatch ${color === c && !customColorInput ? "selected" : ""}`}
                            style={{ backgroundColor: c }}
                            onClick={() => handleColorSelect(c)}
                        />
                    ))}
                </div>
                <div className="vc-stickynotes-custom-color">
                    <input
                        type="color"
                        value={isValidHex(customColorInput) ? customColorInput : color}
                        onChange={e => handleCustomColorInput(e.target.value)}
                        style={{ width: 40, height: 32, border: "none", cursor: "pointer", borderRadius: 4 }}
                    />
                    <TextInput
                        value={customColorInput}
                        onChange={handleCustomColorInput}
                        placeholder="#ff0000"
                        style={{ flex: 1 }}
                    />
                </div>
            </div>
        </Modal>
    );
}

export function openStickyNoteModal(userId: string, existingNote?: StickyNote, onSave?: () => void) {
    openModal((modalProps) => (
        <StickyNoteModalInner
            modalProps={modalProps}
            userId={userId}
            existingNote={existingNote}
            onSave={onSave ?? (() => {})}
        />
    ));
}
