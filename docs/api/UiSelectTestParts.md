# UiSelectTestParts

Public type from `@uninterface/testing/playwright`.

The rendered select mapping has `kind: "native" | "composite"`, `trigger: Locator`, `selection: Locator`, and `popup(): Promise<Locator>`. Selection locates displayed label text. Popup resolves the instance-owned surface containing status and candidates, which can enclose the accessible listbox. A native mapping returns the select itself for DOM option inspection. The browser harness exposes the owned surface for open composite pickers through `popupSurface()`. Verify mapping when upgrading a toolkit.
