interface SaveShortcutOptions {
  onSave: () => void | Promise<void>;
}

type SaveShortcutEvent = Pick<
  KeyboardEvent,
  "altKey" | "ctrlKey" | "key" | "metaKey" | "preventDefault" | "stopPropagation"
> & {
  stopImmediatePropagation?: () => void;
};

export function isSaveShortcut(event: Pick<SaveShortcutEvent, "altKey" | "ctrlKey" | "key" | "metaKey">) {
  return (
    event.key.toLowerCase() === "s" &&
    (event.metaKey || event.ctrlKey) &&
    !event.altKey
  );
}

export function useSaveShortcut({ onSave }: SaveShortcutOptions) {
  const handleSaveShortcut = (event: SaveShortcutEvent) => {
    if (!isSaveShortcut(event)) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    void onSave();
    return true;
  };

  return { handleSaveShortcut };
}
