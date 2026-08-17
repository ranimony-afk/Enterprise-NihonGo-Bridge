import { test, expect } from "@playwright/test";

test.describe("Nihongo Bridge Enterprise End-to-End User Journeys", () => {
  
  // 1. Dictionary Lookup User Journey
  test("User can search dictionary and trigger speech synthesis", async ({ page }) => {
    // Go to Dictionary page
    await page.goto("/dictionary");
    await expect(page).toHaveTitle(/Dictionary/i);

    // Search for '桜' (Sakura)
    const searchInput = page.locator("input[placeholder*='Search']");
    await searchInput.fill("桜");
    await searchInput.press("Enter");

    // Word should appear in list
    const wordHeader = page.locator("text=桜");
    await expect(wordHeader).toBeVisible();

    // Trigger Speech Speech synthesis
    const playSpeechButton = page.locator("button:has-text('Play Speech')");
    await expect(playSpeechButton).toBeEnabled();
    await playSpeechButton.click();
  });

  // 2. Interactive Suffix Conjugation Engine Journey
  test("User can conjugate verbs dynamically on the grammar platform", async ({ page }) => {
    await page.goto("/grammar");
    await expect(page).toHaveTitle(/Grammar/i);

    // Select '飲む' (Nomu) verb from select list
    const verbSelect = page.locator("select").first();
    await verbSelect.selectOption({ label: "飲む (Group: GODAN)" });

    // Select Potential form
    const conjugationSelect = page.locator("select").nth(1);
    await conjugationSelect.selectOption("potential");

    // Output box should calculate '飲める'
    const outputBox = page.locator("text=飲める");
    await expect(outputBox).toBeVisible();
  });

  // 3. Claude AI Tutor Situational Role Play
  test("User can start a role play with Claude-sensei and receive live corrections", async ({ page }) => {
    await page.goto("/conversation");
    await expect(page).toHaveTitle(/Conversation/i);

    // Toggle to Claude AI Tutor tab
    const aiTutorTabButton = page.locator("button:has-text('Claude AI Tutor')");
    await aiTutorTabButton.click();

    // Check if Claude-sensei chat box loaded
    const aiTutorHeader = page.locator("text=Claude-sensei");
    await expect(aiTutorHeader).toBeVisible();

    // Enter grammatically incorrect text: '食べるたい'
    const chatInput = page.locator("input[placeholder*='Type in Japanese']");
    await chatInput.fill("私はすしを食べるたい");
    await page.locator("button:has-text('Send')").click();

    // Correction warning panel should appear instantly
    const correctionPanel = page.locator("text=Real-Time Grammar & Vocab Correction");
    await expect(correctionPanel).toBeVisible();

    // It should suggest the correct form '食べたいです'
    const correctedFormText = page.locator("text=食べたいです");
    await expect(correctedFormText).toBeVisible();
  });

  // 4. Timed Adaptive CAT Practice Exam Simulator
  test("User can start a mock test, answer questions, and monitor sections timers", async ({ page }) => {
    await page.goto("/jlpt/mock-exam");
    await expect(page).toHaveTitle(/Exam/i);

    // Start exam
    const startExamButton = page.locator("button:has-text('Start Exam')");
    await startExamButton.click();

    // Questions should be displayed
    const questionCard = page.locator("text=Question");
    await expect(questionCard).toBeVisible();

    // Section timer should be actively counting down
    const sectionTimer = page.locator("text=Timer");
    await expect(sectionTimer).toBeVisible();
  });
});
