import { Page } from '@playwright/test';
import { BasePage } from './basePage';
import { loginLocators } from '../locators/loginLocators';

export class LoginPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async openLoginModal(): Promise<void> {
        await this.click(loginLocators.loginModal);
    }

    async login(username: string, password: string): Promise<void> {
        await this.type(loginLocators.usernameInput, username);
        await this.type(loginLocators.passwordInput, password);
    }

    async clickLoginButton(): Promise<void> {
        await this.click(loginLocators.loginButton);
    }
}