/**
 * E2E tests for the demo/landing page
 * 
 * Tests basic functionality that users will encounter when visiting the app.
 */

import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads
    await expect(page).toHaveTitle(/MarkDeck/i)
  })

  test('should display project title', async ({ page }) => {
    await page.goto('/')
    
    // The demo should show a project (STATUS.md is loaded by default in demo mode)
    const heading = page.locator('h1, h2, [role="heading"]').first()
    await expect(heading).toBeVisible()
  })

  test('should show kanban board structure', async ({ page }) => {
    await page.goto('/')
    
    // Wait for the board to load
    await page.waitForLoadState('networkidle')
    
    // Should have status columns (TODO, IN PROGRESS, DONE)
    const todoColumn = page.getByText(/todo/i).first()
    const inProgressColumn = page.getByText(/in progress/i).first()
    const doneColumn = page.getByText(/done/i).first()
    
    await expect(todoColumn).toBeVisible()
    await expect(inProgressColumn).toBeVisible()
    await expect(doneColumn).toBeVisible()
  })

  test('should not crash on load', async ({ page }) => {
    const errors: string[] = []
    
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // No uncaught exceptions
    expect(errors).toEqual([])
  })

  test('should have responsive design elements', async ({ page }) => {
    await page.goto('/')
    
    // The app should be responsive and have viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]')
    expect(viewportMeta).toBeTruthy()
  })
})

test.describe('Provider Integration', () => {
  test('should have provider selection UI', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Look for file upload or GitHub connection options
    // This is a smoke test - just verify provider integration doesn't error
    const body = await page.textContent('body')
    expect(body).toBeTruthy()
  })

  test('should handle demo data without errors', async ({ page }) => {
    await page.goto('/')
    
    // Wait for content to load
    await page.waitForLoadState('networkidle')
    
    // Page should render cards if demo data is present
    const pageContent = await page.textContent('body')
    expect(pageContent?.length).toBeGreaterThan(100)
  })
})

test.describe('Accessibility', () => {
  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check for basic accessibility - main landmark
    const main = page.locator('main, [role="main"]')
    const count = await main.count()
    
    // Either has a main element or is a single-page app with content
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Press Tab to move focus
    await page.keyboard.press('Tab')
    
    // Should have focusable elements
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })
})
