// src/components/Layout/Layout.state.ts
import { useState } from "react";
import { type LayoutState } from "./LayoutApp.vm";

export const useLayoutState = () => {
  return useState<LayoutState>({
    config: null,
    operator: null,
    loading: true,
  });
};
