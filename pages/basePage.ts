import { Page } from '@playwright/test';

export class BasePage {
    protected page: Page;
    
    constructor(page: Page) {
        this.page = page;
    }

    async navigateTo(url: string): Promise<void> {
        await this.page.goto(url);
    }

    async click(locator: string): Promise<void> {
        await this.page.click(locator);
    }

    async type(locator: string, text: string): Promise<void> {
        await this.page.fill(locator, text);
    }

    async getText(locator: string): Promise<string> {
        return await this.page.textContent(locator) || '';
    }

    async isElementVisible(locator: string): Promise<boolean> {
        return await this.page.locator(locator).isVisible();
    }

    async handleAlert(): Promise<string> {
        const dialogPromise = this.page.waitForEvent('dialog');
        const dialog = await dialogPromise;
        const message = dialog.message();
        await dialog.accept();
        return message;
    }
}
