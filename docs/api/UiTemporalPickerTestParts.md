# UiTemporalPickerTestParts

Returned by `ui.temporalPicker(picker)` for one picker or its native input
scope. **dateInput** and **timeInput** locate applicable native controls.
`day(isoDate)` takes a full ISO calendar date and locates its rendered day
only while it is present. `timeSegment(unit)` takes `hour`, `minute`, or
`second` and locates the rendered part for that unit. The caller opens the
picker and navigates it, then performs the appropriate input or selection
and checks the application value.

See [presentation mappings](presentation-parts.md).
