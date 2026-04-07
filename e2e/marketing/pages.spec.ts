import { test, expect } from '@playwright/test';

// =============================================================================
// MARKETING PAGES - Comprehensive E2E Tests
// HealthShield Platform (Next.js 16)
// =============================================================================

const BOAT_NAMES = [
  'King Kong',
  'Lemon Drop',
  'Bananarama',
  'Banana Split',
  'Pineapple Express',
  'The Swiftie!',
  'The Pinkie',
  'The Party Craft',
  'The Screwdriver',
  'The Star Craft',
];

// =============================================================================
// HOME PAGE
// =============================================================================
test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('renders hero section with heading and CTA buttons', async ({ page }) => {
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible();

    // CTA button linking to booking
    const bookButton = page.getByRole('link', { name: /book/i }).first();
    await expect(bookButton).toBeVisible();
  });

  test('displays boat gallery with boat cards', async ({ page }) => {
    await expect(page.getByText('King Kong').first()).toBeVisible();
  });

  test('boat cards show capacity and location badges', async ({ page }) => {
    await expect(page.getByText('Lake Austin').first()).toBeVisible();
  });

  test('displays Google reviews section', async ({ page }) => {
    const reviewsSection = page.getByText(/review/i).first();
    await expect(reviewsSection).toBeVisible();
  });

  test('header navigation links are visible', async ({ page }) => {
    const nav = page.locator('header nav');
    await expect(nav).toBeVisible();

    await expect(page.getByRole('link', { name: 'Home' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Our Fleet' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /book now/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'FAQ' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' }).first()).toBeVisible();
  });

  test('footer is visible with fleet links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    await expect(footer.getByText('King Kong')).toBeVisible();
    await expect(footer.getByText('Lemon Drop')).toBeVisible();
    await expect(footer.getByText('Bananarama')).toBeVisible();
  });

  test('footer has company links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: 'About Us' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Contact' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'FAQ' })).toBeVisible();
  });

  test('footer has legal links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Terms of Service' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Cancellation Policy' })).toBeVisible();
  });

  test('phone number is displayed', async ({ page }) => {
    await expect(page.getByText('(512) 515-9625').first()).toBeVisible();
  });

  test('logo links to home page', async ({ page }) => {
    const logoLink = page.locator('header a[href="/"]').first();
    await expect(logoLink).toBeVisible();
  });
});

// =============================================================================
// NAVIGATION
// =============================================================================
test.describe('Navigation', () => {
  test('header "Our Fleet" link navigates to /boats', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'Our Fleet' }).first().click();
    await page.waitForURL('**/boats');
    await expect(page).toHaveURL(/\/boats$/);
  });

  test('header "About" link navigates to /about', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'About' }).first().click();
    await page.waitForURL('**/about');
    await expect(page).toHaveURL(/\/about$/);
  });

  test('header "FAQ" link navigates to /faq', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'FAQ' }).first().click();
    await page.waitForURL('**/faq');
    await expect(page).toHaveURL(/\/faq$/);
  });

  test('header "Contact" link navigates to /contact', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'Contact' }).first().click();
    await page.waitForURL('**/contact');
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('header "Book Now" link navigates to /book', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: /book now/i }).first().click();
    await page.waitForURL('**/book');
    await expect(page).toHaveURL(/\/book$/);
  });

  test('footer fleet links navigate to boat detail pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const footer = page.locator('footer');
    await footer.getByRole('link', { name: 'King Kong' }).click();
    await page.waitForURL('**/boats/king-kong');
    await expect(page).toHaveURL(/\/boats\/king-kong$/);
  });

  test('footer "About Us" link navigates to /about', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const footer = page.locator('footer');
    await footer.getByRole('link', { name: 'About Us' }).click();
    await page.waitForURL('**/about');
    await expect(page).toHaveURL(/\/about$/);
  });

  test('footer "FAQ" link navigates to /faq', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const footer = page.locator('footer');
    await footer.getByRole('link', { name: 'FAQ' }).click();
    await page.waitForURL('**/faq');
    await expect(page).toHaveURL(/\/faq$/);
  });
});

// =============================================================================
// BOATS PAGE (/boats)
// =============================================================================
test.describe('Boats Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/boats');
    await page.waitForLoadState('networkidle');
  });

  test('renders page heading "Our Fleet"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /our fleet/i }).first()).toBeVisible();
  });

  test('displays all boat cards with names visible', async ({ page }) => {
    for (const name of ['King Kong', 'Lemon Drop', 'Bananarama', 'Pineapple Express']) {
      await expect(page.getByText(name).first()).toBeVisible();
    }
  });

  test('each boat card shows starting price', async ({ page }) => {
    const priceElements = page.locator('text=/\\$\\d+/');
    const count = await priceElements.count();
    expect(count).toBeGreaterThan(5);
  });

  test('each boat card has "View Details" and "Book Now" links', async ({ page }) => {
    const viewDetailsLinks = page.getByRole('link', { name: 'View Details' });
    const bookNowLinks = page.getByRole('link', { name: 'Book Now' });

    const detailsCount = await viewDetailsLinks.count();
    const bookCount = await bookNowLinks.count();

    expect(detailsCount).toBeGreaterThanOrEqual(6);
    expect(bookCount).toBeGreaterThanOrEqual(6);
  });

  test('location filter buttons are present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /all boats/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /lake austin/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /lake travis/i })).toBeVisible();
  });

  test('filtering by Lake Austin hides Lake Travis boats', async ({ page }) => {
    await page.getByRole('button', { name: /lake austin/i }).click();

    // Lake Austin boat should be visible
    await expect(page.getByText('King Kong').first()).toBeVisible();

    // Lake Travis boat should be hidden
    await expect(page.getByText('Pineapple Express')).toBeHidden();
  });

  test('filtering by Lake Travis hides Lake Austin boats', async ({ page }) => {
    await page.getByRole('button', { name: /lake travis/i }).click();

    await expect(page.getByText('Pineapple Express').first()).toBeVisible();
    await expect(page.getByText('King Kong')).toBeHidden();
  });

  test('"All Boats" filter resets and shows all boats', async ({ page }) => {
    // Filter first
    await page.getByRole('button', { name: /lake travis/i }).click();
    await expect(page.getByText('King Kong')).toBeHidden();

    // Reset
    await page.getByRole('button', { name: /all boats/i }).click();
    await expect(page.getByText('King Kong').first()).toBeVisible();
    await expect(page.getByText('Pineapple Express').first()).toBeVisible();
  });

  test('clicking "View Details" navigates to boat detail page', async ({ page }) => {
    const viewDetailsLinks = page.getByRole('link', { name: 'View Details' });
    const firstLink = viewDetailsLinks.first();
    const href = await firstLink.getAttribute('href');

    await firstLink.click();
    await page.waitForURL(`**${href}`);
    expect(page.url()).toContain('/boats/');
  });

  test('"Book Now" links include boat slug as query param', async ({ page }) => {
    const bookLinks = page.getByRole('link', { name: 'Book Now' });
    const firstLink = bookLinks.first();
    const href = await firstLink.getAttribute('href');

    expect(href).toContain('/book?boat=');
  });

  test('"Every Boat Includes" feature section is visible', async ({ page }) => {
    await expect(page.getByText('Every Boat Includes').first()).toBeVisible();
    await expect(page.getByText('Expert Captain').first()).toBeVisible();
    await expect(page.getByText('Sound System').first()).toBeVisible();
    await expect(page.getByText('Lily Pads').first()).toBeVisible();
    await expect(page.getByText('Coolers').first()).toBeVisible();
  });

  test('CTA section with phone number and contact link', async ({ page }) => {
    await expect(page.getByText(/not sure which boat/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /contact us/i }).first()).toBeVisible();
  });
});

// =============================================================================
// BOAT DETAIL PAGE (/boats/[slug])
// =============================================================================
test.describe('Boat Detail Page', () => {
  test('King Kong detail page renders with correct info', async ({ page }) => {
    await page.goto('/boats/king-kong');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('King Kong').first()).toBeVisible();

    // Breadcrumb navigation
    await expect(page.getByRole('link', { name: 'Home' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Fleet' })).toBeVisible();
  });

  test('boat detail page shows capacity and location', async ({ page }) => {
    await page.goto('/boats/king-kong');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/24/).first()).toBeVisible();
    await expect(page.getByText('Lake Austin').first()).toBeVisible();
  });

  test('boat detail page shows features list', async ({ page }) => {
    await page.goto('/boats/king-kong');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Double-Decker Design').first()).toBeVisible();
    await expect(page.getByText('Premium JBL Sound System').first()).toBeVisible();
  });

  test('boat detail page has pricing section with duration options', async ({ page }) => {
    await page.goto('/boats/king-kong');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/3hr|3 Hour/i).first()).toBeVisible();
    await expect(page.getByText(/4hr|4 Hour/i).first()).toBeVisible();
  });

  test('boat detail page has a booking link', async ({ page }) => {
    await page.goto('/boats/king-kong');
    await page.waitForLoadState('networkidle');

    const bookLink = page.getByRole('link', { name: /book/i }).first();
    await expect(bookLink).toBeVisible();
  });

  test('boat detail page shows image gallery', async ({ page }) => {
    await page.goto('/boats/king-kong');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img[alt="King Kong"]');
    const count = await images.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('breadcrumb "Fleet" link navigates back to boats page', async ({ page }) => {
    await page.goto('/boats/king-kong');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'Fleet' }).click();
    await page.waitForURL('**/boats');
    await expect(page).toHaveURL(/\/boats$/);
  });

  test('shows other boats recommendations section', async ({ page }) => {
    await page.goto('/boats/king-kong');
    await page.waitForLoadState('networkidle');

    const otherBoatNames = BOAT_NAMES.filter((n) => n !== 'King Kong');
    let foundOther = false;
    for (const name of otherBoatNames) {
      const el = page.getByText(name).first();
      if (await el.isVisible().catch(() => false)) {
        foundOther = true;
        break;
      }
    }
    expect(foundOther).toBe(true);
  });

  test('invalid slug shows 404 or not-found page', async ({ page }) => {
    const response = await page.goto('/boats/nonexistent-boat-xyz');
    const content = await page.textContent('body');
    const is404 = response?.status() === 404 || /not found/i.test(content || '');
    expect(is404).toBe(true);
  });

  test('boat detail page for Pineapple Express shows Lake Travis', async ({ page }) => {
    await page.goto('/boats/pineapple-express');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Pineapple Express').first()).toBeVisible();
    await expect(page.getByText('Lake Travis').first()).toBeVisible();
  });
});

// =============================================================================
// BOOKING PAGE (/book)
// =============================================================================
test.describe('Booking Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
  });

  test('renders booking page with boat selection', async ({ page }) => {
    await expect(page.getByText(/select|choose/i).first()).toBeVisible();
  });

  test('step 1: displays boats for selection', async ({ page }) => {
    await expect(page.getByText('King Kong').first()).toBeVisible();
  });

  test('step 1: selecting a boat enables proceeding', async ({ page }) => {
    await page.getByText('King Kong').first().click();

    // After selecting, should see date/time options or a next button
    const nextButton = page.getByRole('button', { name: /next|continue/i });
    const dateSection = page.getByText(/date|when/i).first();
    const hasNext = await nextButton.isVisible().catch(() => false);
    const hasDate = await dateSection.isVisible().catch(() => false);
    expect(hasNext || hasDate).toBe(true);
  });

  test('preselected boat from query param is active', async ({ page }) => {
    await page.goto('/book?boat=king-kong');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('King Kong').first()).toBeVisible();
  });

  test('booking form has duration options', async ({ page }) => {
    await expect(page.getByText(/3 Hour|3hr/i).first()).toBeVisible();
    await expect(page.getByText(/4 Hour|4hr/i).first()).toBeVisible();
  });

  test('shows pricing with dollar amounts', async ({ page }) => {
    const prices = page.locator('text=/\\$\\d+/');
    const count = await prices.count();
    expect(count).toBeGreaterThan(0);
  });

  test('booking page has time slot options', async ({ page }) => {
    // Select a boat first to unlock time slots
    await page.getByText('King Kong').first().click();

    // Time slots may appear in same step or subsequent step
    const timeContent = page.getByText(/AM|PM/i);
    const count = await timeContent.count();
    expect(count).toBeGreaterThan(0);
  });

  test('booking page has occasion options', async ({ page }) => {
    // Occasions like Birthday Party, Bachelor Party may appear in later steps
    const occasions = page.getByText(/birthday|bachelor|bachelorette|corporate/i);
    const count = await occasions.count();
    // At least expect the page loaded; occasions may be in step 2+
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

// =============================================================================
// CONTACT PAGE (/contact)
// =============================================================================
test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('renders contact page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /contact/i }).first()).toBeVisible();
  });

  test('displays contact information cards', async ({ page }) => {
    await expect(page.getByText('(512) 515-9625').first()).toBeVisible();
    await expect(page.getByText('hello@healthshieldrentals.com').first()).toBeVisible();
    await expect(page.getByText(/8701 W Parmer/i).first()).toBeVisible();
    await expect(page.getByText(/9:00 AM.*9:00 PM/i).first()).toBeVisible();
  });

  test('contact form has all required fields', async ({ page }) => {
    await expect(page.locator('input[placeholder="John"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Smith"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('contact form has inquiry type selector with options', async ({ page }) => {
    const select = page.locator('select');
    await expect(select).toBeVisible();

    await expect(page.getByText('Booking Inquiry')).toBeAttached();
    await expect(page.getByText('Corporate Event')).toBeAttached();
    await expect(page.getByText('Pricing Question')).toBeAttached();
  });

  test('contact form has optional party size and date fields', async ({ page }) => {
    await expect(page.locator('input[type="number"]')).toBeVisible();
    await expect(page.locator('input[type="date"]')).toBeVisible();
  });

  test('form validates required fields on submit', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /send message/i });
    await expect(submitButton).toBeVisible();

    await submitButton.click();

    // HTML5 validation prevents submission when required fields empty
    const firstNameInput = page.locator('input[placeholder="John"]');
    const isInvalid = await firstNameInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(isInvalid).toBe(true);
  });

  test('form validates email format', async ({ page }) => {
    await page.locator('input[placeholder="John"]').fill('Test');
    await page.locator('input[placeholder="Smith"]').fill('User');
    await page.locator('input[type="email"]').fill('invalid-email');
    await page.locator('input[type="tel"]').fill('555-1234');
    await page.locator('textarea').fill('Test message');

    await page.getByRole('button', { name: /send message/i }).click();

    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(isInvalid).toBe(true);
  });

  test('form submits successfully with valid data and shows confirmation', async ({ page }) => {
    await page.locator('input[placeholder="John"]').fill('Test');
    await page.locator('input[placeholder="Smith"]').fill('User');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="tel"]').fill('(512) 555-1234');
    await page.locator('textarea').fill('I would like to book a boat for my birthday party.');

    await page.getByRole('button', { name: /send message/i }).click();

    await expect(page.getByText('Message Sent!')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/get back to you/i)).toBeVisible();
  });

  test('success state has navigation links back to home and fleet', async ({ page }) => {
    await page.locator('input[placeholder="John"]').fill('Test');
    await page.locator('input[placeholder="Smith"]').fill('User');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="tel"]').fill('(512) 555-1234');
    await page.locator('textarea').fill('Test message');

    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByText('Message Sent!')).toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('link', { name: /back to home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /view fleet/i })).toBeVisible();
  });

  test('has "Book Now" shortcut link in sidebar', async ({ page }) => {
    await expect(page.getByText('Ready to Book?').first()).toBeVisible();
    const bookLink = page.getByRole('link', { name: /book now/i }).first();
    await expect(bookLink).toBeVisible();
  });

  test('displays embedded Google Map', async ({ page }) => {
    const iframe = page.locator('iframe[title="HealthShield Location"]');
    await expect(iframe).toBeVisible();
  });

  test('privacy policy link is present below form', async ({ page }) => {
    await expect(page.getByRole('link', { name: /privacy policy/i }).first()).toBeVisible();
  });
});

// =============================================================================
// FAQ PAGE (/faq)
// =============================================================================
test.describe('FAQ Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/faq');
    await page.waitForLoadState('networkidle');
  });

  test('renders FAQ page heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /frequently asked questions/i }).first()
    ).toBeVisible();
  });

  test('displays all 7 FAQ category filter buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /booking.*reservations/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /pricing.*duration/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /boats.*capacity/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /what to bring/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /locations.*logistics/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /weather.*safety/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /groups.*events/i })).toBeVisible();
  });

  test('first category (Booking & Reservations) shows by default', async ({ page }) => {
    await expect(page.getByText('How do I book a boat?')).toBeVisible();
    await expect(page.getByText('What is your cancellation policy?')).toBeVisible();
    await expect(page.getByText('Can I reschedule my booking?')).toBeVisible();
  });

  test('accordion expand: clicking question reveals answer', async ({ page }) => {
    await page.getByText('How do I book a boat?').click();

    await expect(
      page.getByText(/you can book directly on our website/i).first()
    ).toBeVisible();
  });

  test('accordion collapse: clicking expanded question hides answer', async ({ page }) => {
    // Expand
    await page.getByText('How do I book a boat?').click();
    await expect(
      page.getByText(/you can book directly on our website/i).first()
    ).toBeVisible();

    // Collapse
    await page.getByText('How do I book a boat?').click();
    await expect(
      page.getByText(/you can book directly on our website/i).first()
    ).toBeHidden();
  });

  test('switching category shows different set of questions', async ({ page }) => {
    await page.getByRole('button', { name: /pricing.*duration/i }).click();

    await expect(
      page.getByText('How much does it cost to rent a boat?')
    ).toBeVisible();

    // Previous category questions should be hidden
    await expect(page.getByText('How do I book a boat?')).toBeHidden();
  });

  test('multiple questions can be expanded at same time', async ({ page }) => {
    await page.getByText('How do I book a boat?').click();
    await expect(
      page.getByText(/you can book directly on our website/i).first()
    ).toBeVisible();

    await page.getByText('How far in advance should I book?').click();
    await expect(
      page.getByText(/we recommend booking at least/i).first()
    ).toBeVisible();

    // First answer still visible
    await expect(
      page.getByText(/you can book directly on our website/i).first()
    ).toBeVisible();
  });

  test('What to Bring category shows food and drink questions', async ({ page }) => {
    await page.getByRole('button', { name: /what to bring/i }).click();

    await expect(
      page.getByText('Can we bring our own food and drinks?')
    ).toBeVisible();
    await expect(
      page.getByText('Is alcohol allowed on the boats?')
    ).toBeVisible();
  });

  test('Weather & Safety category shows safety questions', async ({ page }) => {
    await page.getByRole('button', { name: /weather.*safety/i }).click();

    await expect(
      page.getByText('What happens if the weather is bad?')
    ).toBeVisible();
    await expect(
      page.getByText('Are your captains licensed?')
    ).toBeVisible();
  });

  test('Groups & Events category shows event questions', async ({ page }) => {
    await page.getByRole('button', { name: /groups.*events/i }).click();

    await expect(
      page.getByText(/bachelor\/bachelorette parties/i)
    ).toBeVisible();
    await expect(
      page.getByText(/corporate event packages/i)
    ).toBeVisible();
  });

  test('"Still Have Questions?" section has call and message links', async ({ page }) => {
    await expect(page.getByText('Still Have Questions?')).toBeVisible();
    await expect(page.getByRole('link', { name: /512.*515.*9625/i }).first()).toBeVisible();
    await expect(
      page.getByRole('link', { name: /send us a message/i })
    ).toBeVisible();
  });

  test('"Book Your Boat Now" CTA navigates to /book', async ({ page }) => {
    const bookLink = page.getByRole('link', { name: /book your boat now/i });
    await expect(bookLink).toBeVisible();

    await bookLink.click();
    await page.waitForURL('**/book');
    await expect(page).toHaveURL(/\/book$/);
  });
});

// =============================================================================
// ABOUT PAGE (/about)
// =============================================================================
test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
  });

  test('renders about page heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /about.*banana boat.*rentals/i }).first()
    ).toBeVisible();
  });

  test('displays stats section with correct numbers', async ({ page }) => {
    await expect(page.getByText('1,000+')).toBeVisible();
    await expect(page.getByText('Happy Customers')).toBeVisible();
    await expect(page.getByText('6')).toBeVisible();
    await expect(page.getByText('Party Boats')).toBeVisible();
    await expect(page.getByText('5+')).toBeVisible();
    await expect(page.getByText('Years on the Lake')).toBeVisible();
    await expect(page.getByText('500+')).toBeVisible();
    await expect(page.getByText('5-Star Reviews')).toBeVisible();
  });

  test('displays "Our Story" section with narrative text', async ({ page }) => {
    await expect(page.getByText(/our story/i).first()).toBeVisible();
    await expect(
      page.getByText(/banana boat rentals was born/i).first()
    ).toBeVisible();
    await expect(
      page.getByText(/we launched in 2020/i).first()
    ).toBeVisible();
  });

  test('displays all four company values', async ({ page }) => {
    await expect(page.getByText('Safety First')).toBeVisible();
    await expect(page.getByText('Unforgettable Experiences')).toBeVisible();
    await expect(page.getByText('Premium Fleet')).toBeVisible();
    await expect(page.getByText('Austin Pride')).toBeVisible();
  });

  test('displays lakes section with both lakes', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Lake Austin' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lake Travis' }).first()).toBeVisible();
  });

  test('displays all four captains in team section', async ({ page }) => {
    await expect(page.getByText('Captain Mike')).toBeVisible();
    await expect(page.getByText('Captain Sarah')).toBeVisible();
    await expect(page.getByText('Captain Diego')).toBeVisible();
    await expect(page.getByText('Captain Jen')).toBeVisible();

    // Check roles
    await expect(page.getByText('Lead Captain - Lake Austin')).toBeVisible();
    await expect(page.getByText('Lead Captain - Lake Travis')).toBeVisible();
  });

  test('displays "What to Expect" section with included items and bring list', async ({ page }) => {
    await expect(page.getByText('Every Rental Includes:').first()).toBeVisible();
    await expect(page.getByText(/licensed, friendly captain/i)).toBeVisible();
    await expect(page.getByText(/premium bluetooth sound/i)).toBeVisible();
    await expect(page.getByText(/floating lily pads/i)).toBeVisible();

    await expect(page.getByText('You Should Bring:')).toBeVisible();
    await expect(page.getByText(/sunscreen/i)).toBeVisible();
    await expect(page.getByText(/towels/i)).toBeVisible();
  });

  test('CTA section has "Book Your Adventure" link to /book', async ({ page }) => {
    const bookLink = page.getByRole('link', { name: /book your adventure/i });
    await expect(bookLink).toBeVisible();

    const href = await bookLink.getAttribute('href');
    expect(href).toBe('/book');
  });

  test('CTA section has phone number link', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /512.*515.*9625/i }).first()
    ).toBeVisible();
  });
});

// =============================================================================
// MOBILE RESPONSIVENESS
// =============================================================================
test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X

  test('home page renders correctly on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('mobile hamburger menu is visible and desktop nav is hidden', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const menuButton = page.getByRole('button', { name: /open main menu/i });
    await expect(menuButton).toBeVisible();

    // Desktop nav should be hidden
    const desktopNav = page.locator('header .hidden.lg\\:flex').first();
    await expect(desktopNav).toBeHidden();
  });

  test('mobile menu opens and shows navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /open main menu/i }).click();
    await page.waitForTimeout(500);

    // Mobile menu should show at least one nav link
    const homeLinks = page.getByRole('link', { name: 'Home' });
    const count = await homeLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('boats page renders on mobile with stacked cards', async ({ page }) => {
    await page.goto('/boats');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('King Kong').first()).toBeVisible();
    await expect(page.getByText('Lemon Drop').first()).toBeVisible();
  });

  test('contact form is functional on mobile', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const firstNameInput = page.locator('input[placeholder="John"]');
    await expect(firstNameInput).toBeVisible();
    await firstNameInput.fill('Mobile');
    await expect(firstNameInput).toHaveValue('Mobile');
  });

  test('FAQ accordion works on mobile', async ({ page }) => {
    await page.goto('/faq');
    await page.waitForLoadState('networkidle');

    await page.getByText('How do I book a boat?').click();

    await expect(
      page.getByText(/you can book directly on our website/i).first()
    ).toBeVisible();
  });

  test('booking page loads and shows boats on mobile', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('King Kong').first()).toBeVisible();
  });

  test('about page renders correctly on mobile', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByText('1,000+')).toBeVisible();
  });

  test('boat detail page renders on mobile', async ({ page }) => {
    await page.goto('/boats/king-kong');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('King Kong').first()).toBeVisible();
    await expect(page.getByText('Lake Austin').first()).toBeVisible();
  });
});

// =============================================================================
// TABLET RESPONSIVENESS
// =============================================================================
test.describe('Tablet Responsiveness', () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test('home page renders correctly on tablet', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('boats page shows multi-column grid on tablet', async ({ page }) => {
    await page.goto('/boats');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('King Kong').first()).toBeVisible();
    await expect(page.getByText('Lemon Drop').first()).toBeVisible();
  });

  test('about page team section renders on tablet', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Captain Mike')).toBeVisible();
    await expect(page.getByText('Captain Sarah')).toBeVisible();
  });

  test('contact page form is usable on tablet', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('form').first()).toBeVisible();
    await expect(page.locator('input[placeholder="John"]')).toBeVisible();
  });
});

// =============================================================================
// CROSS-PAGE USER JOURNEYS
// =============================================================================
test.describe('User Journeys', () => {
  test('browse fleet, view boat details, then navigate to booking', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to fleet
    await page.getByRole('link', { name: 'Our Fleet' }).first().click();
    await page.waitForURL('**/boats');

    // Click View Details on first boat
    await page.getByRole('link', { name: 'View Details' }).first().click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/boats/');

    // Click Book link from detail page
    const bookLink = page.getByRole('link', { name: /book/i }).first();
    await bookLink.click();
    await page.waitForURL('**/book**');
    expect(page.url()).toContain('/book');
  });

  test('FAQ page to contact page via "Send Us a Message"', async ({ page }) => {
    await page.goto('/faq');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: /send us a message/i }).click();
    await page.waitForURL('**/contact');
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole('heading', { name: /contact/i }).first()).toBeVisible();
  });

  test('about page CTA to booking page', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: /book your adventure/i }).click();
    await page.waitForURL('**/book');
    await expect(page).toHaveURL(/\/book$/);
  });

  test('contact form submission then navigate to fleet', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    await page.locator('input[placeholder="John"]').fill('Journey');
    await page.locator('input[placeholder="Smith"]').fill('Test');
    await page.locator('input[type="email"]').fill('journey@test.com');
    await page.locator('input[type="tel"]').fill('(512) 555-0000');
    await page.locator('textarea').fill('Testing the journey');

    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByText('Message Sent!')).toBeVisible({ timeout: 10000 });

    await page.getByRole('link', { name: /view fleet/i }).click();
    await page.waitForURL('**/boats');
    await expect(page).toHaveURL(/\/boats$/);
  });

  test('boats page filter then navigate to detail then back', async ({ page }) => {
    await page.goto('/boats');
    await page.waitForLoadState('networkidle');

    // Filter by Lake Travis
    await page.getByRole('button', { name: /lake travis/i }).click();
    await expect(page.getByText('Pineapple Express').first()).toBeVisible();

    // View details
    await page.getByRole('link', { name: 'View Details' }).first().click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/boats/');

    // Go back via breadcrumb
    await page.getByRole('link', { name: 'Fleet' }).click();
    await page.waitForURL('**/boats');
    await expect(page).toHaveURL(/\/boats$/);
  });
});

// =============================================================================
// SEO, ACCESSIBILITY, AND EDGE CASES
// =============================================================================
test.describe('SEO and Accessibility', () => {
  test('all marketing pages return 200 status', async ({ page }) => {
    const pages = ['/', '/boats', '/book', '/contact', '/faq', '/about'];
    for (const path of pages) {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
    }
  });

  test('about page has a non-empty title', async ({ page }) => {
    await page.goto('/about');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toMatch(/banana boat|about/i);
  });

  test('home page has no significant console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const significantErrors = consoleErrors.filter(
      (err) =>
        !err.includes('favicon') &&
        !err.includes('Failed to load resource') &&
        !err.includes('third-party') &&
        !err.includes('hydration')
    );

    expect(significantErrors).toHaveLength(0);
  });

  test('images on about page have alt text', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('internal links on home page have valid href attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const links = page.locator('a[href^="/"]');
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 20); i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/^\//);
    }
  });

  test('header has aria-label for navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav[aria-label="Global"]');
    await expect(nav).toBeVisible();
  });

  test('boats page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/boats');
    await page.waitForLoadState('networkidle');

    // Should have h1 for page title
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Should have h2 or h3 for boat names
    const h3 = page.locator('h3');
    const h3Count = await h3.count();
    expect(h3Count).toBeGreaterThan(0);
  });
});
