import { expect, type Locator } from '@playwright/test'

/** Ancestor transforms also affect a surface's measured browser geometry. */
export async function waitForPresentation(surface: Locator) {
  await expect(surface).toBeVisible()
  await expect
    .poll(() =>
      surface.evaluate((element) => {
        for (
          let node: Element | null = element;
          node;
          node = node.parentElement
        )
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
}

/** Backend-owned anatomy for a shared visible, contained focus requirement. */
export interface FocusPaint {
  target: Locator
  kind: 'outline' | 'inset-shadow' | 'underline' | 'background' | 'border'
  pseudo?: '::before' | '::after'
  inset?: boolean
}

export function readContainedFocusPaint(
  element: Element,
  { kind, pseudo, inset }: Omit<FocusPaint, 'target'>,
) {
  const view = element.ownerDocument.defaultView!
  const css = view.getComputedStyle(element, pseudo)
  // Object methods keep the function self-contained when a TS loader preserves names
  // and Playwright serializes it for evaluation in the browser.
  const { transparent, clips } = {
    transparent(color: string) {
      if (color === 'transparent') return true
      const body = color.slice(color.indexOf('(') + 1, color.lastIndexOf(')'))
      const alpha = body.includes('/')
        ? body.split('/')[1]
        : body.split(',').length === 4
          ? body.split(',')[3]
          : undefined
      return alpha !== undefined && parseFloat(alpha) === 0
    },
    clips(overflow: string) {
      return ['auto', 'scroll', 'hidden', 'clip'].includes(overflow)
    },
  }
  let visible =
    css.display !== 'none' &&
    css.visibility !== 'hidden' &&
    Number(css.opacity) > 0 &&
    (!pseudo || !['none', 'normal'].includes(css.content))
  let outset = 0
  if (kind === 'outline') {
    visible &&=
      !['none', 'hidden'].includes(css.outlineStyle) &&
      parseFloat(css.outlineWidth) > 0 &&
      !transparent(css.outlineColor)
    outset = Math.max(
      0,
      parseFloat(css.outlineWidth) + parseFloat(css.outlineOffset),
    )
    if (inset && outset > 0)
      return { fits: false, reason: 'Focus outline extends outside the target' }
  } else if (kind === 'inset-shadow') {
    const shadows = css.boxShadow
      .split(/,(?![^(]*\))/)
      .filter((s) => s !== 'none')
    visible &&= shadows.some((shadow) => {
      const color =
        shadow.match(/[a-z][a-z0-9-]*\([^)]*\)|transparent/i)?.[0] ?? ''
      return (
        shadow.includes('inset') &&
        !transparent(color) &&
        [...shadow.matchAll(/(-?\d+(?:\.\d+)?)px/g)].some(
          (v) => Number(v[1]) !== 0,
        )
      )
    })
    // An outward shadow needs a separate footprint calculation, not silent acceptance.
    if (shadows.some((shadow) => !shadow.includes('inset')))
      return {
        fits: false,
        reason: 'Unexpected outward shadow',
        shadow: css.boxShadow,
      }
  } else if (kind === 'background') {
    visible &&= !transparent(css.backgroundColor)
  } else if (kind === 'border') {
    visible &&= ['Top', 'Right', 'Bottom', 'Left'].some((side) => {
      const edge = side.toLowerCase()
      return (
        !['none', 'hidden'].includes(
          css.getPropertyValue(`border-${edge}-style`),
        ) &&
        parseFloat(css.getPropertyValue(`border-${edge}-width`)) > 0 &&
        !transparent(css.getPropertyValue(`border-${edge}-color`))
      )
    })
  } else {
    visible &&=
      !['none', 'normal'].includes(css.content) &&
      !['none', 'hidden'].includes(css.borderBottomStyle) &&
      parseFloat(css.borderBottomWidth) > 0 &&
      !transparent(css.borderBottomColor) &&
      (css.transform === 'none' || new DOMMatrixReadOnly(css.transform).a > 0)
  }
  if (!visible) return { fits: false, reason: 'No visible focus paint', kind }
  const rect = element.getBoundingClientRect()
  for (
    let parent = element.parentElement;
    parent;
    parent = parent.parentElement
  ) {
    const style = view.getComputedStyle(parent)
    const box = parent.getBoundingClientRect()
    const left = box.left + parent.clientLeft
    const top = box.top + parent.clientTop
    if (
      (clips(style.overflowX) &&
        (rect.left - outset < left - 1 ||
          rect.right + outset > left + parent.clientWidth + 1)) ||
      (clips(style.overflowY) &&
        (rect.top - outset < top - 1 ||
          rect.bottom + outset > top + parent.clientHeight + 1))
    )
      return {
        fits: false,
        reason: 'Focus paint clipped',
        ancestor: parent.className,
      }
  }
  return { fits: true }
}

export async function expectContainedFocusPaint({
  target,
  ...paint
}: FocusPaint) {
  await waitForPresentation(target)
  await expect
    .poll(() => target.evaluate(readContainedFocusPaint, paint))
    .toEqual({ fits: true })
}
