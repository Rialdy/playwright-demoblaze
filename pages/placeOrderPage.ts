import { Locator, Page } from 'playwright';
import { BasePage } from './basePage';
import { placeOrderLocators } from '../locators/placeOrderLocators';

export class PlaceOrderPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    get thankYouMessage(): Locator {
        return this.page.locator(placeOrderLocators.thankYouMessage);
    }

    async inputName(name: string): Promise<void> {
        await this.type(placeOrderLocators.placeOrderNameInput, name);
    }

    async creditCardNumber(cardNumber: string): Promise<void> {
        await this.type(placeOrderLocators.placeOrderCreditCardInput, cardNumber);
    }

    async clickPurchaseButton(): Promise<void> {
        await this.click(placeOrderLocators.purchaseButton);
    }

    async clickOkButton(): Promise<void> {
        await this.click(placeOrderLocators.okButton);
    }
}