import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { Notebook, Note } from "../types/notebook";

interface NotebookState {
  notebooks: Notebook[];
  addNotebook: (notebook: Omit<Notebook, "id" | "createdAt" | "notes">) => void;
  updateNotebook: (id: string, updates: Partial<Notebook>) => void;
  deleteNotebook: (id: string) => void;
  addNote: (notebookId: string, noteText: string) => void;
  updateNote: (notebookId: string, noteId: string, text: string) => void;
  deleteNote: (notebookId: string, noteId: string) => void;
  getNotebook: (id: string) => Notebook | undefined;
}

export const useNotebookStore = create<NotebookState>()(
  persist(
    (set, get) => ({
      notebooks: [],

      addNotebook: (notebook) =>
        set((state) => ({
          notebooks: [
            ...state.notebooks,
            {
              ...notebook,
              id: uuidv4(),
              notes: [],
              createdAt: Date.now(),
            },
          ],
        })),

      updateNotebook: (id, updates) =>
        set((state) => ({
          notebooks: state.notebooks.map((nb) =>
            nb.id === id ? { ...nb, ...updates } : nb
          ),
        })),

      deleteNotebook: (id) =>
        set((state) => ({
          notebooks: state.notebooks.filter((nb) => nb.id !== id),
        })),

      addNote: (notebookId, noteText) =>
        set((state) => ({
          notebooks: state.notebooks.map((nb) =>
            nb.id === notebookId
              ? {
                  ...nb,
                  notes: [
                    {
                      id: uuidv4(),
                      text: noteText,
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    },
                    ...nb.notes,
                  ],
                }
              : nb
          ),
        })),

      updateNote: (notebookId, noteId, text) =>
        set((state) => ({
          notebooks: state.notebooks.map((nb) =>
            nb.id === notebookId
              ? {
                  ...nb,
                  notes: nb.notes.map((note) =>
                    note.id === noteId
                      ? { ...note, text, updatedAt: Date.now() }
                      : note
                  ),
                }
              : nb
          ),
        })),

      deleteNote: (notebookId, noteId) =>
        set((state) => ({
          notebooks: state.notebooks.map((nb) =>
            nb.id === notebookId
              ? {
                  ...nb,
                  notes: nb.notes.filter((note) => note.id !== noteId),
                }
              : nb
          ),
        })),

      getNotebook: (id) => {
        return get().notebooks.find((nb) => nb.id === id);
      },
    }),
    {
      name: "notebook-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
