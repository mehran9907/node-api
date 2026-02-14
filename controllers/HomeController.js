import BaseController from "../core/BaseController.js";

export default class HomeController extends BaseController {
    constructor() {
        super();
        this.model = null;
    }

    async getIndex(req, res) {
        try {
            const data = {

            };
            return res.json(data);
        } catch (e) {
            return super.toError(e, req, res);
        }
    }
}