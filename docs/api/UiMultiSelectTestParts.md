# UiMultiSelectTestParts

Import from `@uninterface/testing/playwright`.

Extends UiSelectTestParts with `clear: Locator`. The backend maps the native/composite interaction and the native or integrated clear action; mappings do not mutate controls. Native listbox adapters reuse native select parts; popup adapters identify their trigger and listbox. The shared clear operation focuses and hovers the editor before using its clear affordance. Verify mappings against rendered controls and modal-owned popups.
