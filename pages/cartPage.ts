import { Locator, Page } from 'playwright';
import { BasePage } from './basePage';
import { cartLocators } from '../locators/cartLocators';

export class CartPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    get samsungGalaxyS6(): Locator {
        return this.page.locator(cartLocators.samsungGalaxyS6).first();
    }

    get nexus6(): Locator {
        return this.page.locator(cartLocators.nexus6).first();
    }

    get iphone632gb(): Locator {
        return this.page.locator(cartLocators.iphone632gb).first();
    }

    get totalPrice(): Locator {
        return this.page.locator(cartLocators.totalPrice);
    }

    get placeOrderButton(): Locator {
        return this.page.locator(cartLocators.placeOrderButton);
    }

    async clickPlaceOrderButton(): Promise<void> {
        await this.click(cartLocators.placeOrderButton);
    }

    async clearCart(username: string): Promise<void> {
        await this.page.request.post('https://api.demoblaze.com/deletecart', {
            data: { cookie: username },
        });
    }
}
