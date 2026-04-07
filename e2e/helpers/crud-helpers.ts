/**
 * CRUD Test Helpers
 *
 * Shared utilities for testing Create, Read, Update, Delete operations
 * across all dashboard modules.
 */
import { Page, Locator } from '@playwright/test';

/** Modal selector - matches the app's Modal component which uses role="dialog" and .fixed.inset-0.z-50 */
const MODAL_SELECTOR = '[role="dialog"], .fixed.inset-0.z-50';

/** Wait for page to be fully loaded (hydrated) */
export async function waitForPageReady(page: Page, timeout = 10_000) {
  // Wait for DOM to be ready first
  await page.waitForLoadState('domcontentloaded', { timeout }).catch(() => {});
  // Try networkidle but don't block on it (Firebase streams never fully settle)
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  // Wait for any loading spinners to disappear
  const spinner = page.locator('.animate-spin, .animate-pulse, [role="progressbar"]').first();
  await spinner.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  // Small buffer for client-side hydration
  await page.waitForTimeout(1500);
}

/** Click a button by its text content, with retry logic */
export async function clickButton(page: Page, text: string, options?: { timeout?: number; exact?: boolean }) {
  const timeout = options?.timeout ?? 10_000;
  const btn = options?.exact
    ? page.getByRole('button', { name: text, exact: true }).first()
    : page.locator(`button:has-text("${text}"), a:has-text("${text}")`).first();
  await btn.waitFor({ state: 'visible', timeout });
  await btn.click();
  await page.waitForTimeout(500);
}

/** Find and click a create/add button - tries multiple common patterns */
export async function clickCreateButton(page: Page, labels: string[]) {
  // First pass: prefer <button> elements (avoid <a> links that may navigate away)
  for (const label of labels) {
    const btn = page.locator(`main button:has-text("${label}"), [role="main"] button:has-text("${label}")`).first();
    if (await btn.isVisible().catch(() => false)) {
      if (await btn.isDisabled().catch(() => false)) continue;
      await btn.click();
      await page.waitForTimeout(1000);
      return true;
    }
  }
  // Second pass: any button on the page
  for (const label of labels) {
    const btn = page.locator(`button:has-text("${label}")`).first();
    if (await btn.isVisible().catch(() => false)) {
      if (await btn.isDisabled().catch(() => false)) continue;
      await btn.click();
      await page.waitForTimeout(1000);
      return true;
    }
  }
  // Third pass: anchor tags (last resort)
  for (const label of labels) {
    const btn = page.locator(`a:has-text("${label}")`).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1000);
      return true;
    }
  }
  return false;
}

/** Wait for modal to appear */
export async function waitForModal(page: Page, timeout = 5000): Promise<Locator> {
  // App Modal component renders with role="dialog" and .fixed.inset-0.z-50
  // Use role="dialog" first to avoid false-matching the sidebar (.fixed.inset-0 without z-50)
  const dialog = page.locator('[role="dialog"]').first();
  const fixedModal = page.locator('.fixed.inset-0.z-50').first();

  try {
    await dialog.waitFor({ state: 'visible', timeout });
    return dialog;
  } catch {
    try {
      await fixedModal.waitFor({ state: 'visible', timeout });
      return fixedModal;
    } catch {
      return dialog;
    }
  }
}

/** Check if modal is currently visible */
export async function isModalOpen(page: Page): Promise<boolean> {
  // Only match real modals (role="dialog" or .fixed.inset-0.z-50), not the sidebar
  const dialog = page.locator('[role="dialog"]').first();
  const fixedModal = page.locator('.fixed.inset-0.z-50').first();
  return (await dialog.isVisible().catch(() => false)) ||
         (await fixedModal.isVisible().catch(() => false));
}

/** Close modal via ESC key, Cancel button, X button */
export async function closeModal(page: Page) {
  // Try ESC key first (most reliable — works regardless of viewport/z-index issues)
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  if (!(await isModalOpen(page))) return;

  // Try Cancel button with force click (handles viewport/overlay issues)
  const cancelBtn = page.locator(`${MODAL_SELECTOR} button:has-text("Cancel")`).first();
  if (await cancelBtn.isVisible().catch(() => false)) {
    await cancelBtn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
    if (!(await isModalOpen(page))) return;
  }
  // Try close button with aria-label
  const closeBtn = page.locator(`${MODAL_SELECTOR} button[aria-label*="close" i], ${MODAL_SELECTOR} button[aria-label*="Close"]`).first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
    if (!(await isModalOpen(page))) return;
  }
  // Try X button with SVG (lucide X icon) inside modal
  const xBtn = page.locator(`${MODAL_SELECTOR} button:has(svg)`).first();
  if (await xBtn.isVisible().catch(() => false)) {
    await xBtn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
    if (!(await isModalOpen(page))) return;
  }
  // Last resort — ESC again
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

/** Fill a text input by name, placeholder, or label */
export async function fillInput(page: Page, identifier: string, value: string, scope?: Locator) {
  const container = scope || page;
  // Try by name attribute
  let input = container.locator(`input[name="${identifier}"]`).first();
  if (await input.isVisible().catch(() => false)) {
    await input.clear();
    await input.fill(value);
    return true;
  }
  // Try by placeholder (case-insensitive)
  input = container.locator(`input[placeholder*="${identifier}" i]`).first();
  if (await input.isVisible().catch(() => false)) {
    await input.clear();
    await input.fill(value);
    return true;
  }
  // Try by label
  input = container.getByLabel(identifier, { exact: false }).first();
  if (await input.isVisible().catch(() => false)) {
    await input.clear();
    await input.fill(value);
    return true;
  }
  return false;
}

/** Fill a textarea */
export async function fillTextarea(page: Page, identifier: string, value: string, scope?: Locator) {
  const container = scope || page;
  let ta = container.locator(`textarea[name="${identifier}"]`).first();
  if (await ta.isVisible().catch(() => false)) {
    await ta.clear();
    await ta.fill(value);
    return true;
  }
  ta = container.locator(`textarea[placeholder*="${identifier}" i]`).first();
  if (await ta.isVisible().catch(() => false)) {
    await ta.clear();
    await ta.fill(value);
    return true;
  }
  return false;
}

/** Select a dropdown option */
export async function selectOption(page: Page, identifier: string, value: string, scope?: Locator) {
  const container = scope || page;
  let select = container.locator(`select[name="${identifier}"]`).first();
  if (await select.isVisible().catch(() => false)) {
    await select.selectOption(value);
    return true;
  }
  select = container.locator(`select[aria-label*="${identifier}" i]`).first();
  if (await select.isVisible().catch(() => false)) {
    await select.selectOption(value);
    return true;
  }
  return false;
}

/** Click a button safely — handles viewport overflow with JS click fallback */
async function safeClick(btn: Locator, page: Page): Promise<boolean> {
  try {
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    return true;
  } catch {
    // Button outside viewport or covered — use JS click as fallback
    try {
      await btn.evaluate((el: HTMLElement) => el.click());
      await page.waitForTimeout(2000);
      return true;
    } catch {
      return false;
    }
  }
}

/** Click submit button in modal or form */
export async function submitForm(page: Page, buttonText?: string) {
  if (buttonText) {
    const btn = page.locator(`[role="dialog"] button:has-text("${buttonText}"), .fixed.inset-0.z-50 button:has-text("${buttonText}")`).first();
    if (await btn.isVisible().catch(() => false)) {
      const disabled = await btn.isDisabled();
      if (!disabled) return safeClick(btn, page);
    }
  }
  // Fallback to type="submit"
  const submit = page.locator('[role="dialog"] button[type="submit"], .fixed.inset-0.z-50 button[type="submit"]').first();
  if (await submit.isVisible().catch(() => false)) {
    const disabled = await submit.isDisabled();
    if (!disabled) return safeClick(submit, page);
  }
  return false;
}

/** Check for success toast notification */
export async function expectSuccessToast(page: Page, timeout = 5000) {
  const toast = page.locator('[role="status"]:has-text("success"), [class*="toast"]:has-text("success"), div:has-text("successfully")').first();
  try {
    await toast.waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/** Check for any toast notification (success or error) */
export async function getToastMessage(page: Page, timeout = 5000): Promise<string | null> {
  const toast = page.locator('[role="status"], [class*="toast"], [class*="Toaster"] div').first();
  try {
    await toast.waitFor({ state: 'visible', timeout });
    return await toast.textContent();
  } catch {
    return null;
  }
}

/** Click a row action (three-dot menu) for a specific item */
export async function clickRowAction(page: Page, rowText: string, actionText: string) {
  // Find the row containing the text
  const row = page.locator(`tr:has-text("${rowText}"), [class*="card"]:has-text("${rowText}")`).first();
  if (!(await row.isVisible().catch(() => false))) return false;

  // Click three-dot menu in that row
  const moreBtn = row.locator('button[aria-label*="option" i], button[aria-label*="action" i], button[aria-label*="menu" i]').first();
  if (!(await moreBtn.isVisible().catch(() => false))) {
    // Try generic icon button (MoreVertical pattern)
    const iconBtn = row.locator('button:has(svg)').last();
    if (await iconBtn.isVisible().catch(() => false)) {
      await iconBtn.click();
    } else {
      return false;
    }
  } else {
    await moreBtn.click();
  }

  await page.waitForTimeout(500);

  // Click the action in the dropdown
  const action = page.locator(`button:has-text("${actionText}"), a:has-text("${actionText}")`).first();
  if (await action.isVisible().catch(() => false)) {
    await action.click();
    await page.waitForTimeout(1000);
    return true;
  }
  return false;
}

/** Search in a search input */
export async function searchFor(page: Page, query: string) {
  const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').first();
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.clear();
    await searchInput.fill(query);
    await page.waitForTimeout(1500);
    return true;
  }
  return false;
}

/** Count visible items in a list/table */
export async function countListItems(page: Page): Promise<number> {
  // Try table rows first
  const tableRows = page.locator('table tbody tr');
  const rowCount = await tableRows.count().catch(() => 0);
  if (rowCount > 0) return rowCount;

  // Try card items
  const cards = page.locator('[class*="card"][class*="border"]');
  return await cards.count().catch(() => 0);
}

/** Test that filter buttons work */
export async function testFilterButtons(page: Page, filterTexts: string[]): Promise<{ label: string; clicked: boolean }[]> {
  const results: { label: string; clicked: boolean }[] = [];
  for (const text of filterTexts) {
    const btn = page.locator(`button:has-text("${text}")`).first();
    const visible = await btn.isVisible().catch(() => false);
    if (visible) {
      await btn.click();
      await page.waitForTimeout(1000);
      results.push({ label: text, clicked: true });
    } else {
      results.push({ label: text, clicked: false });
    }
  }
  return results;
}

/** Handle browser confirm dialog (for delete confirmations) */
export function setupDialogHandler(page: Page, accept = true) {
  page.on('dialog', async dialog => {
    if (accept) {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  });
}

/** Navigate to dashboard page and wait for ready */
export async function goToDashboardPage(page: Page, path: string) {
  await page.goto(`/dashboard/${path}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await waitForPageReady(page);
}

/** Collect all visible buttons on the page */
export async function getAllButtons(page: Page): Promise<string[]> {
  const buttons = page.locator('button:visible, a[role="button"]:visible');
  const count = await buttons.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    const text = await buttons.nth(i).textContent().catch(() => '');
    if (text && text.trim()) texts.push(text.trim());
  }
  return texts;
}

/** Test all toggle/switch elements on page */
export async function testToggles(page: Page): Promise<{ label: string; toggled: boolean }[]> {
  const toggles = page.locator('input[type="checkbox"][role="switch"], button[role="switch"], [class*="toggle"]');
  const count = await toggles.count();
  const results: { label: string; toggled: boolean }[] = [];

  for (let i = 0; i < count; i++) {
    const toggle = toggles.nth(i);
    const label = await toggle.getAttribute('aria-label') || await toggle.getAttribute('name') || `toggle-${i}`;
    try {
      await toggle.click();
      await page.waitForTimeout(500);
      results.push({ label, toggled: true });
      // Toggle back
      await toggle.click();
      await page.waitForTimeout(300);
    } catch {
      results.push({ label, toggled: false });
    }
  }
  return results;
}

/** Test pagination controls */
export async function testPagination(page: Page): Promise<boolean> {
  const nextBtn = page.locator('button:has-text("Next"), button[aria-label="Next page"]').first();
  if (await nextBtn.isVisible().catch(() => false)) {
    const isDisabled = await nextBtn.isDisabled();
    if (!isDisabled) {
      await nextBtn.click();
      await page.waitForTimeout(1500);
      // Go back
      const prevBtn = page.locator('button:has-text("Previous"), button:has-text("Prev"), button[aria-label="Previous page"]').first();
      if (await prevBtn.isVisible().catch(() => false)) {
        await prevBtn.click();
        await page.waitForTimeout(1000);
      }
      return true;
    }
  }
  return false;
}

/** Unique test data generator */
export function testId(): string {
  return `E2E-${Date.now().toString(36)}`;
}
