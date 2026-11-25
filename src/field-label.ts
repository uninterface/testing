import { expect } from '@playwright/test'
import type { UiFieldTestParts } from './playwright.js'

/** Click where the label is painted, through the backend's actual hit target. */
export async function clickUiFieldLabel(parts: UiFieldTestParts) {
  await parts.label.scrollIntoViewIfNeeded()
  await expect(parts.label).toBeVisible()
  await expect
    .poll(() =>
      parts.label.evaluate((label) => {
        for (let node: Element | null = label; node; node = node.parentElement)
          if (
            node
              .getAnimations()
              .some(
                (animation) =>
                  animation.pending || animation.playState === 'running',
              )
          )
            return false
        return true
      }),
    )
    .toBe(true)
  const label = await parts.label.boundingBox()
  if (!label || label.width <= 0 || label.height <= 0)
    throw new Error('Label activation requires a visible label area.')
  const target = await parts.labelTarget.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    return {
      x: rect.x,
      y: rect.y,
      left: parseFloat(style.borderLeftWidth),
      top: parseFloat(style.borderTopWidth),
      width: rect.width,
      height: rect.height,
    }
  })
  // Playwright adds position to its viewport bounding box plus computed borders.
  // Keep viewport distances: dividing by a CSS scale would shift the click.
  const position = {
    x: label.x + label.width / 2 - target.x - target.left,
    y: label.y + label.height / 2 - target.y - target.top,
  }
  expect(position.x).toBeGreaterThanOrEqual(0)
  expect(position.y).toBeGreaterThanOrEqual(0)
  expect(position.x).toBeLessThanOrEqual(target.width)
  expect(position.y).toBeLessThanOrEqual(target.height)
  // Normal hit testing still rejects an unrelated overlay; no forced click or
  // programmatic focus. The scenario separately verifies the correct editor.
  await parts.labelTarget.click({ position })
}
