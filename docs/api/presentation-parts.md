# Inspect rendered presentation parts

Use the selected backend adapter with `createUiTest(page, adapter)` or
`createUiDomTest(adapter)`. The returned driver's methods below take an
existing component locator or DOM element. A requested mapping must be
supplied by the adapter. Browser parts are Playwright locators. DOM parts
are elements, with `null` for an omitted part. The test owns actions and
assertions.

| Method | Browser return type | Rendered parts |
| --- | --- | --- |
| `fieldGroup(group)` | `UiFieldGroupTestParts` | `label` is the field’s own heading or legend and `controlArea` contains its editors. `required` maps explicit markers and hosts for generated markers on the heading. |
| `fieldFeedback(editor)` | `Promise<UiFieldFeedbackTestParts>` | `message` is the field’s associated error description, including a visually hidden description for a tooltip. `tooltip` is the corresponding rendered floating message. `invalidSurface` is the rendered part carrying error presentation. |
| `checkable(control)` | `Promise<UiCheckableTestParts>` | `text` is the checkbox, radio or switch's option text and `surface` is its painted indicator. |
| `inputFrame(frame)` | `UiInputFrameTestParts` | `surface` is the painted frame around the editors and supporting content. |
| `buttonFocus(button)` | `Promise<FocusPaint>` | Identifies the paint that changes when a semantic button receives keyboard focus. |
| `card(card)` | `UiCardTestParts` | `header`, `body`, `footer`, and `topEnd` identify the supplied card’s regions. |
| `tableBody(table)` | `UiTableBodyTestParts` | `body` is the row host or the native region that also owns empty content. `scrollSurface` identifies the active row scroll surface. `emptyState` and `errorState` identify the table’s empty and initial failure content. |
| `feedbackItem(item)` | `UiFeedbackItemTestParts` | `content` receives keyboard focus and `surface` paints the feedback item. They can be the same element. |
| `progressBar(bar)` | `UiProgressBarTestParts` | `track` is the painted track and `fill` is the active fill or moving segment. |
| `uploadRegion(region)` | `Promise<UiUploadRegionTestParts>` | `surface` is the upload region’s painted surface. `chooser` is the actual keyboard/pointer target. `chooserFocus` is a [FocusPaint](browser-presentation.md) descriptor for the current state. Resolve it again after a transition to recovery. |
| `temporalPicker(picker)` | `UiTemporalPickerTestParts` | `dateInput` and `timeInput` identify native date or time editors when present. `day(isoDate)` maps one rendered calendar day by its ISO date. `timeSegment(unit)` maps an hour, minute or second editor when rendered separately. |
| `menuEntryIcon(entry)` | `UiMenuEntryIconTestParts` | `icon` is the rendered artwork. `column` is the part that reserves space even for a row without artwork. |

The DOM driver also exposes `field(editor)` for the label, control surface
and required parts, and `emptyState(scope)` for a collection’s rendered empty
view. DOM supports `fieldGroup`, `fieldFeedback`, `card`, `tableBody`,
`temporalPicker`, and `menuEntryIcon`. Pass the collection scope to the DOM
table-body mapping when the native table and its status surface are separate
elements. The card mapping also works on parsed server HTML. Computed paint,
actionability and browser-native picker behavior require a browser.

```ts
const card = page.getByTestId('retained-attachment')
const { header, body, footer, topEnd } = ui.card(card)
await expect(header).toHaveCount(0)
await expect(body).toHaveCount(1)
await expect(footer).toHaveCount(0)
await expect(topEnd.getByRole('button', { name: 'Remove invoice.pdf' }))
  .toBeVisible()
```

The example assumes a test fixture that assigns the card test ID, with
`page`, `expect`, and a configured `ui` in scope. Use the mapping from the
backend running that fixture. [Adapter responsibilities](../adapter-contract.md)
