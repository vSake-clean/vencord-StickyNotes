/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as DataStore from "@api/DataStore";
import { useForceUpdater } from "@utils/react";

export const DS_KEY = "StickyNotes_data";

export interface StickyNote {
    text: string;
    color: string;
    createdAt: number;
    updatedAt: number;
}

export type StickyNotesData = Record<string, StickyNote>;

const DEFAULT_COLORS = [
    "#ffeb3b", // yellow
    "#ff9800", // orange
    "#4caf50", // green
    "#2196f3", // blue
    "#e91e63", // pink
    "#9c27b0", // purple
    "#00bcd4", // cyan
    "#795548", // brown
];

export function getRandomColor(): string {
    return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
}

let cachedNotes: StickyNotesData = {};
let forceUpdateNotes: (() => void) | undefined;

export async function loadNotes(): Promise<StickyNotesData> {
    cachedNotes = (await DataStore.get<StickyNotesData>(DS_KEY)) ?? {};
    return cachedNotes;
}

export async function saveNotes(notes: StickyNotesData): Promise<void> {
    cachedNotes = notes;
    await DataStore.set(DS_KEY, notes);
    forceUpdateNotes?.();
}

export function useStickyNotes() {
    forceUpdateNotes = useForceUpdater();
}

export function initStickyNotes() {
    loadNotes().then(() => forceUpdateNotes?.());
}

export function getNotes(): StickyNotesData {
    return cachedNotes;
}

export async function getNote(userId: string): Promise<StickyNote | undefined> {
    return cachedNotes[userId];
}

export async function setNote(userId: string, note: StickyNote): Promise<void> {
    cachedNotes[userId] = note;
    await saveNotes(cachedNotes);
}

export async function deleteNote(userId: string): Promise<void> {
    delete cachedNotes[userId];
    await saveNotes(cachedNotes);
}

export async function hasNote(userId: string): Promise<boolean> {
    return cachedNotes[userId] !== undefined;
}
