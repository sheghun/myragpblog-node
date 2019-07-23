
declare function paystack(key: string): p.Paystack

declare namespace p {
	export class Paystack {
		customer: any;
		plan: any;
		transaction: any;
		subaccount: any;
		page: any;
		subscription: any;
		settlements: any;
		misc: any;
	}
}