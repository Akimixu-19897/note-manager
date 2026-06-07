import { ref } from "vue";
import type { NoteDraftState } from "../types";

const createIdleState = (): NoteDraftState => ({
  status: "idle",
  errorMessage: "",
  lastSavedAt: "",
});

export function createNoteDraftState() {
  const value = ref<NoteDraftState>(createIdleState());

  const markDirty = () => {
    value.value = {
      ...value.value,
      status: "dirty",
      errorMessage: "",
    };
  };

  const markSaving = () => {
    value.value = {
      ...value.value,
      status: "saving",
      errorMessage: "",
    };
  };

  const markSaved = (lastSavedAt: string) => {
    value.value = {
      status: "saved",
      errorMessage: "",
      lastSavedAt,
    };
  };

  const markFailed = (message: string) => {
    value.value = {
      ...value.value,
      status: "failed",
      errorMessage: message,
    };
  };

  return {
    value,
    markDirty,
    markSaving,
    markSaved,
    markFailed,
  };
}
