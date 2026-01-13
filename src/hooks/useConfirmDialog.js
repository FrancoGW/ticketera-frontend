import { useState, useCallback } from "react";

const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    confirmColor: "red",
    onConfirm: null,
  });

  const openDialog = useCallback((options) => {
    setDialogState({
      isOpen: true,
      title: options.title || "Confirmar acción",
      message: options.message || "",
      confirmText: options.confirmText || "Confirmar",
      cancelText: options.cancelText || "Cancelar",
      confirmColor: options.confirmColor || "red",
      onConfirm: options.onConfirm || null,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (dialogState.onConfirm) {
      await dialogState.onConfirm();
    }
    closeDialog();
  }, [dialogState.onConfirm, closeDialog]);

  return {
    isOpen: dialogState.isOpen,
    title: dialogState.title,
    message: dialogState.message,
    confirmText: dialogState.confirmText,
    cancelText: dialogState.cancelText,
    confirmColor: dialogState.confirmColor,
    openDialog,
    closeDialog,
    handleConfirm,
  };
};

export default useConfirmDialog;
